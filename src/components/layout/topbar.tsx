"use client"

import { LanguageToggle } from "@/components/common/language-toggle"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationBell } from "@/features/notifications/notification-bell"
import { GlobalSearch } from "@/features/search/global-search"
import { UserMenu } from "./user-menu"

export function Topbar() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-3 backdrop-blur sm:px-4">
      <SidebarTrigger className="hidden md:inline-flex" />

      <GlobalSearch />

      {/* ดันกลุ่มไอคอนให้ชิดขวาสุดของจอเสมอ แม้ช่องค้นหาถูกจำกัดความกว้าง */}
      <div className="ml-auto flex items-center gap-0.5">
        <NotificationBell />
        <LanguageToggle />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
