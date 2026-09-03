"use client"

import * as React from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import {
  getThemePreference,
  getThemePreferenceOnServer,
  setThemePreference,
  subscribeThemePreference,
  type ThemePreference,
} from "@/lib/theme-preference-store"

export type { ThemePreference }
export type ResolvedTheme = "light" | "dark"

interface ThemeContextValue {
  /** ค่าที่ผู้ใช้เลือก */
  theme: ThemePreference
  /** ธีมที่ใช้จริงหลังแปลง "system" แล้ว */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const DARK_QUERY = "(prefers-color-scheme: dark)"

/**
 * ThemeProvider ของ EventFlow
 *
 * ผู้ใช้ขอให้จำธีมข้าม refresh จึงเก็บไว้ใน localStorage ผ่าน
 * `theme-preference-store` (useSyncExternalStore กัน hydration mismatch —
 * SSR เห็น "system" เสมอ แล้วค่อยสลับเป็นค่าที่จำไว้ทันทีหลัง hydrate)
 * ส่วนการกันจอกระพริบตอน paint แรกอยู่ที่ `themeInitScript` ด้านล่าง
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(
    subscribeThemePreference,
    getThemePreference,
    getThemePreferenceOnServer
  )
  const prefersDark = useMediaQuery(DARK_QUERY)

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme

  React.useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", resolvedTheme === "dark")
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme: setThemePreference }),
    [theme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within <ThemeProvider>")
  }
  return context
}

/**
 * สคริปต์ที่รันก่อน paint แรก เพื่อไม่ให้เห็นการกระพริบ (FOUC)
 *
 * อ่านธีมที่จำไว้ใน localStorage ก่อน (คีย์ต้องตรงกับ `theme-preference-store`)
 * ถ้าไม่มีค่าจำไว้ค่อยถอยไปดู `matchMedia` ตามระบบ
 */
export const themeInitScript = `(function(){try{var s=window.localStorage.getItem('eventflow.theme');var d=(s==='light'||s==='dark')?s==='dark':window.matchMedia('${DARK_QUERY}').matches;if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`
