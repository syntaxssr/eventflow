"use client"

import { SearchIcon } from "lucide-react"

import { LanguageToggle } from "@/components/common/language-toggle"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationBell } from "@/features/notifications/notification-bell"
import { useLocale } from "@/i18n"
import { UserMenu } from "./user-menu"

export function Topbar() {
  const { t } = useLocale()

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-3 backdrop-blur sm:px-4">
      <SidebarTrigger className="hidden md:inline-flex" />

      {/* ช่องค้นหา — Global Search จะทำงานจริงใน Phase 9 */}
      <div className="relative hidden max-w-md flex-1 sm:block">
        <SearchIcon
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          type="search"
          className="pl-8"
          placeholder={t("shell.searchPlaceholder")}
          aria-label={t("common.search")}
        />
      </div>

      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-0.5">
        <NotificationBell />
        <LanguageToggle />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
