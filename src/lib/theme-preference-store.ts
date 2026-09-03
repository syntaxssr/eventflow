"use client"

/**
 * จำธีมที่ผู้ใช้เลือกข้ามการรีเฟรช — ผู้ใช้ขอเอง (คู่กับ sidebar-open-store.ts)
 *
 * ปกติ prototype นี้จงใจไม่เก็บ UI state ข้าม refresh (ดูคอมเมนต์เดิมใน
 * ThemeProvider) แต่ผู้ใช้แจ้งว่ารำคาญที่ต้องสลับธีมใหม่ทุกครั้ง จึงเก็บ
 * ค่านี้ไว้ใน localStorage เหมือนที่ทำกับสถานะเปิด/หุบ Sidebar ไปแล้ว
 *
 * ใช้ useSyncExternalStore เพื่อกัน hydration mismatch — SSR เห็นค่า
 * เริ่มต้น ("system") เสมอ แล้วค่อยสลับตามที่จำไว้ทันทีหลัง hydrate
 * ส่วนการกันจอกระพริบตอน paint แรกอยู่ที่ `themeInitScript` แยกต่างหาก
 */

export type ThemePreference = "light" | "dark" | "system"

const STORAGE_KEY = "eventflow.theme"

let cached: ThemePreference | null = null
const listeners = new Set<() => void>()

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system"
}

function readStored(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isThemePreference(stored) ? stored : "system"
  } catch {
    return "system"
  }
}

export function subscribeThemePreference(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

export function getThemePreference(): ThemePreference {
  if (cached === null) cached = readStored()
  return cached
}

export function getThemePreferenceOnServer(): ThemePreference {
  return "system"
}

export function setThemePreference(theme: ThemePreference) {
  cached = theme
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* localStorage ถูกปิด — สลับได้ในหน้านี้ แต่จำข้าม refresh ไม่ได้ */
  }
  for (const listener of listeners) listener()
}
