"use client"

import * as React from "react"

import {
  getLocalePreference,
  getLocalePreferenceOnServer,
  setLocalePreference,
  subscribeLocalePreference,
} from "@/lib/locale-preference-store"
import type { Locale, LocalizedText } from "@/types/common"
import { en } from "./dictionaries/en"
import { th } from "./dictionaries/th"
import type { Dictionary, TranslationKey } from "./types"

const DICTIONARIES: Record<Locale, Dictionary> = {
  th: th as unknown as Dictionary,
  en,
}

export const DEFAULT_LOCALE: Locale = "th"

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  /** แปลข้อความจาก key เช่น `t("auth.signIn")` รองรับตัวแปรแบบ `{name}` */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  /** อ่านข้อความจาก Mock Data ที่เก็บสองภาษา */
  tl: (text: LocalizedText | undefined | null) => string
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null)

function resolve(dictionary: Dictionary, key: string): string | undefined {
  const [section, entry] = key.split(".")
  if (!section || !entry) return undefined
  const group = dictionary[section as keyof Dictionary] as
    | Record<string, string>
    | undefined
  return group?.[entry]
}

function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  )
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = React.useSyncExternalStore(
    subscribeLocalePreference,
    getLocalePreference,
    getLocalePreferenceOnServer
  )

  // อัปเดต lang บน <html> เพื่อให้ screen reader อ่านออกเสียงถูกภาษา
  React.useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = React.useMemo<LocaleContextValue>(() => {
    const dictionary = DICTIONARIES[locale]
    return {
      locale,
      setLocale: setLocalePreference,
      toggleLocale: () =>
        setLocalePreference(locale === "th" ? "en" : "th"),
      t: (key, params) => {
        const template = resolve(dictionary, key)
        if (template === undefined) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[i18n] missing translation key: ${key}`)
          }
          return key
        }
        return interpolate(template, params)
      },
      tl: (text) => (text ? (text[locale] ?? text.th ?? "") : ""),
    }
  }, [locale])

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const context = React.useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within <LocaleProvider>")
  }
  return context
}

/** ทางลัดที่ใช้บ่อยที่สุด: `const t = useT()` */
export function useT() {
  return useLocale().t
}
