"use client"

import * as React from "react"
import Link from "next/link"
import { BellIcon, CheckCheckIcon, InboxIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ROUTES } from "@/constants/app"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLocale } from "@/i18n"
import { useAppDispatch, useAppState, useCurrentUser } from "@/store"
import { selectNotificationsForUser, selectUnreadCount } from "@/store/selectors"
import type { Notification } from "@/types/notification"
import { NotificationItem } from "./notification-item"

/**
 * กระดิ่งแจ้งเตือนบน Topbar
 * Desktop = popover dropdown · Mobile = sheet เต็มจอด้านล่าง
 */
export function NotificationBell() {
  const { t } = useLocale()
  const state = useAppState()
  const dispatch = useAppDispatch()
  const currentUser = useCurrentUser()
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  const notifications = currentUser
    ? selectNotificationsForUser(state, currentUser.id)
    : []
  const unreadCount = currentUser
    ? selectUnreadCount(state, currentUser.id)
    : 0
  const latest = notifications.slice(0, 10)

  const openItem = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch({ type: "notification/markRead", ids: [notification.id] })
    }
    setOpen(false)
  }

  const markAll = () => {
    if (currentUser)
      dispatch({ type: "notification/markAllRead", userId: currentUser.id })
  }

  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      data-testid="notification-bell"
      aria-label={
        unreadCount > 0
          ? t("shell.unreadNotifications", { count: unreadCount })
          : t("shell.noUnreadNotifications")
      }
    >
      <BellIcon className="size-4" aria-hidden="true" />
      {unreadCount > 0 ? (
        <span
          className="bg-notification-badge text-notification-badge-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[0.625rem] font-bold"
          aria-hidden="true"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Button>
  )

  const content = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 px-2.5 pb-2">
        <span className="text-sm font-semibold">{t("nav.notifications")}</span>
        {unreadCount > 0 ? (
          <Button
            variant="ghost"
            size="xs"
            onClick={markAll}
            data-testid="bell-mark-all"
          >
            <CheckCheckIcon className="size-3.5" aria-hidden="true" />
            {t("notification.markAllRead")}
          </Button>
        ) : null}
      </div>

      {latest.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-1.5 px-4 py-8 text-center text-sm">
          <InboxIcon className="size-6" aria-hidden="true" />
          {t("notification.empty")}
        </div>
      ) : (
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-1">
          {latest.map((notification) => (
            <li key={notification.id}>
              <NotificationItem
                notification={notification}
                onOpen={openItem}
                compact
              />
            </li>
          ))}
        </ul>
      )}

      <div className="border-t px-2.5 pt-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setOpen(false)}
        >
          <Link href={ROUTES.notifications} data-testid="bell-view-all">
            {t("common.viewAll")}
          </Link>
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="flex max-h-[85dvh] flex-col pb-4">
          <SheetHeader className="sr-only">
            <SheetTitle>{t("nav.notifications")}</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex max-h-[70dvh] w-96 flex-col p-2"
        data-testid="notification-dropdown"
      >
        {content}
      </PopoverContent>
    </Popover>
  )
}
