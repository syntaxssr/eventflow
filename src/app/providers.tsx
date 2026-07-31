"use client"

import * as React from "react"

import { DemoProvider } from "@/components/dev/demo-provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LocaleProvider } from "@/i18n"
import { AppStoreProvider } from "@/store"

/** Provider ทั้งหมดของแอป — เรียงจากนอกเข้าใน: ธีม → ภาษา → ข้อมูล → เครื่องมือทดสอบ */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AppStoreProvider>
          <DemoProvider>
            <TooltipProvider delayDuration={200}>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </TooltipProvider>
          </DemoProvider>
        </AppStoreProvider>
      </LocaleProvider>
    </ThemeProvider>
  )
}
