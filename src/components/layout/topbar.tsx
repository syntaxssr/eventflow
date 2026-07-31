"use client"

import Link from "next/link"
import { BellIcon, SearchIcon } from "lucide-react"

import { LanguageToggle } from "@/components/common/language-toggle"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ROUTES } from "@/constants/app"
import { useLocale } from "@/i18n"
import { useAppState, useCurrentUser } from "@/store"
import { UserMenu } from "./user-menu"

export function Topbar() {
  const { t } = useLocale()
  const currentUser = useCurrentUser()
  const notifications = useAppState().notifications

  const unreadCount = currentUser
    ? notifications.filter(
        (item) => item.userId === currentUser.id && !item.isRead
      ).length
    : 0

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
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount > 0
              ? t("shell.unreadNotifications", { count: unreadCount })
              : t("shell.noUnreadNotifications")
          }
        >
          <Link href={ROUTES.notifications}>
            <BellIcon className="size-4" aria-hidden="true" />
            {unreadCount > 0 ? (
              <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[0.625rem] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </Link>
        </Button>

        <LanguageToggle />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
