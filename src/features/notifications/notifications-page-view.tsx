"use client"

import * as React from "react"
import { BellOffIcon, CheckCheckIcon, FilterIcon } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { FilterChips, type FilterChip } from "@/components/common/filter-chips"
import { PageContainer, PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { NOTIFICATION_META } from "@/constants/notification"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import { useAppDispatch, useAppState, useCurrentUser } from "@/store"
import { selectNotificationsForUser, selectUnreadCount } from "@/store/selectors"
import {
  NOTIFICATION_TYPES,
  type Notification,
  type NotificationType,
} from "@/types/notification"
import { NotificationItem } from "./notification-item"

type ReadFilter = "all" | "unread" | "read"

export function NotificationsPageView() {
  const { t } = useLocale()
  const state = useAppState()
  const dispatch = useAppDispatch()
  const currentUser = useCurrentUser()

  const [typeFilter, setTypeFilter] = React.useState<NotificationType | "all">(
    "all"
  )
  const [readFilter, setReadFilter] = React.useState<ReadFilter>("all")

  const notifications = currentUser
    ? selectNotificationsForUser(state, currentUser.id)
    : []
  const unreadCount = currentUser
    ? selectUnreadCount(state, currentUser.id)
    : 0

  const filtered = notifications.filter((notification) => {
    if (typeFilter !== "all" && notification.type !== typeFilter) return false
    if (readFilter === "unread" && notification.isRead) return false
    if (readFilter === "read" && !notification.isRead) return false
    return true
  })

  const openItem = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch({ type: "notification/markRead", ids: [notification.id] })
    }
  }

  const markAll = () => {
    if (!currentUser) return
    dispatch({ type: "notification/markAllRead", userId: currentUser.id })
    toast.success(t("notification.markedAllRead"))
  }

  const clearAll = () => {
    setTypeFilter("all")
    setReadFilter("all")
  }

  const chips: FilterChip[] = [
    ...(typeFilter !== "all"
      ? [
          {
            key: "type",
            label: t(NOTIFICATION_META[typeFilter].labelKey),
            onRemove: () => setTypeFilter("all"),
          },
        ]
      : []),
    ...(readFilter !== "all"
      ? [
          {
            key: "read",
            label:
              readFilter === "unread"
                ? t("notification.unread")
                : t("notification.read"),
            onRemove: () => setReadFilter("all"),
          },
        ]
      : []),
  ]

  const { state: pageState, retry } = usePageState(notifications.length === 0)

  return (
    <PageContainer>
      <PageHeader
        title={t("nav.notifications")}
        description={t("notification.subtitle")}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={markAll}
            disabled={unreadCount === 0}
            data-testid="mark-all-read"
          >
            <CheckCheckIcon className="size-4" aria-hidden="true" />
            {t("notification.markAllRead")}
          </Button>
        }
      />

      {pageState === "error" ? (
        <ErrorState onRetry={retry} />
      ) : pageState === "loading" ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-full max-w-md" />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as NotificationType | "all")
              }
            >
              <SelectTrigger
                size="sm"
                className="w-56"
                aria-label={t("notification.filterType")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("notification.filterType")}: {t("common.all")}
                </SelectItem>
                {NOTIFICATION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(NOTIFICATION_META[type].labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={readFilter}
              onValueChange={(value) => setReadFilter(value as ReadFilter)}
            >
              <SelectTrigger
                size="sm"
                className="w-44"
                aria-label={t("notification.readStatus")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("notification.readStatus")}: {t("common.all")}
                </SelectItem>
                <SelectItem value="unread">{t("notification.unread")}</SelectItem>
                <SelectItem value="read">{t("notification.read")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FilterChips chips={chips} onClearAll={clearAll} />

          <p className="text-muted-foreground text-sm" aria-live="polite">
            {t("notification.resultCount", { count: filtered.length })}
          </p>

          {notifications.length === 0 ? (
            <EmptyState
              icon={BellOffIcon}
              title={t("notification.empty")}
              description={t("notification.emptyDescription")}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FilterIcon}
              title={t("notification.noMatch")}
              description={t("notification.noMatchDescription")}
              action={
                <Button variant="outline" onClick={clearAll}>
                  {t("common.clearAll")}
                </Button>
              }
            />
          ) : (
            <ul className="divide-y rounded-lg border" data-testid="notification-list">
              {filtered.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onOpen={openItem}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </PageContainer>
  )
}
