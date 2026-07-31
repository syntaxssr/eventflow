"use client"

import * as React from "react"

import { useMediaQuery } from "@/hooks/use-media-query"

export type ThemePreference = "light" | "dark" | "system"
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
 * เขียนขึ้นเองแทน `next-themes` เพราะ Prototype นี้ห้ามใช้ `localStorage`
 * ธีมจึงอยู่ใน memory เท่านั้น และกลับไปเป็น "ตามระบบ" ทุกครั้งที่ refresh
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode
  defaultTheme?: ThemePreference
}) {
  const [theme, setTheme] = React.useState<ThemePreference>(defaultTheme)
  const prefersDark = useMediaQuery(DARK_QUERY)

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme

  React.useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", resolvedTheme === "dark")
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
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
 * เมื่อระบบปฏิบัติการของผู้ใช้ตั้งค่าเป็น Dark Mode
 *
 * อ่านค่าจาก `matchMedia` เท่านั้น — ไม่มีการอ่าน/เขียน storage ใด ๆ
 */
export const themeInitScript = `(function(){try{if(window.matchMedia('${DARK_QUERY}').matches){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`
