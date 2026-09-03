"use client"

import type { Locale } from "@/types/common"

/**
 * จำภาษาที่ผู้ใช้เลือกข้ามการรีเฟรช — ผู้ใช้ขอเอง (คู่กับ theme-preference-store.ts)
 *
 * ใช้ useSyncExternalStore เพื่อกัน hydration mismatch — SSR เห็นค่า
 * เริ่มต้น ("th") เสมอ แล้วค่อยสลับตามที่จำไว้ทันทีหลัง hydrate
 */

const STORAGE_KEY = "eventflow.locale"

let cached: Locale | null = null
const listeners = new Set<() => void>()

function isLocale(value: string | null): value is Locale {
  return value === "th" || value === "en"
}

function readStored(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isLocale(stored) ? stored : "th"
  } catch {
    return "th"
  }
}

export function subscribeLocalePreference(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

export function getLocalePreference(): Locale {
  if (cached === null) cached = readStored()
  return cached
}

export function getLocalePreferenceOnServer(): Locale {
  return "th"
}

export function setLocalePreference(locale: Locale) {
  cached = locale
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* localStorage ถูกปิด — สลับได้ในหน้านี้ แต่จำข้าม refresh ไม่ได้ */
  }
  for (const listener of listeners) listener()
}
