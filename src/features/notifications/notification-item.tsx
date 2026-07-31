"use client"

import Link from "next/link"

import { NOTIFICATION_META } from "@/constants/notification"
import { useLocale } from "@/i18n"
import { formatRelativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Notification } from "@/types/notification"

/**
 * การแจ้งเตือนหนึ่งรายการ — ใช้ทั้งใน dropdown และหน้า Notifications
 * คลิกแล้วทำเครื่องหมายว่าอ่าน และพาไปยังข้อมูลที่เกี่ยวข้อง
 */
export function NotificationItem({
  notification,
  onOpen,
  compact = false,
}: {
  notification: Notification
  onOpen: (notification: Notification) => void
  compact?: boolean
}) {
  const { t, tl, locale } = useLocale()
  const meta = NOTIFICATION_META[notification.type]
  const Icon = meta.icon

  return (
    <Link
      href={notification.href}
      onClick={() => onOpen(notification)}
      className={cn(
        "focus-visible:outline-ring flex w-full items-start gap-2.5 rounded-md px-2.5 text-left focus-visible:outline-2",
        compact ? "py-2" : "py-2.5",
        "hover:bg-muted/70",
        !notification.isRead && "bg-brand-50/50 dark:bg-brand-500/10"
      )}
      data-testid="notification-item"
      data-unread={!notification.isRead || undefined}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
          meta.tile
        )}
        aria-hidden="true"
      >
        <Icon className="size-3.5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span
            className={cn(
              "block truncate text-sm",
              notification.isRead ? "font-normal" : "font-semibold"
            )}
          >
            {tl(notification.title)}
          </span>
          {!notification.isRead ? (
            <span
              className="bg-brand-500 size-1.5 shrink-0 rounded-full"
              aria-hidden="true"
            />
          ) : null}
          <span className="sr-only">
            {notification.isRead
              ? t("notification.read")
              : t("notification.unread")}
          </span>
        </span>
        <span className="text-muted-foreground block truncate text-xs">
          {tl(notification.body)}
        </span>
        <span className="text-muted-foreground/80 mt-0.5 block text-[0.6875rem]">
          {t(meta.labelKey)} ·{" "}
          <time dateTime={notification.createdAt}>
            {formatRelativeTime(notification.createdAt, locale)}
          </time>
        </span>
      </span>
    </Link>
  )
}
