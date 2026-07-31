"use client"

import * as React from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useT } from "@/i18n"
import { AppSidebar } from "./app-sidebar"
import { BottomNav } from "./bottom-nav"
import { Topbar } from "./topbar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useT()

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only-focusable focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:font-medium"
      >
        {t("common.skipToContent")}
      </a>

      <AppSidebar />

      <SidebarInset className="min-w-0">
        <Topbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 pb-20 focus-visible:outline-none md:pb-0"
        >
          {children}
        </main>
      </SidebarInset>

      <BottomNav />
    </SidebarProvider>
  )
}
