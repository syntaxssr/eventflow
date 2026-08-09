"use client"

import Link from "next/link"
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from "lucide-react"

import { StatusBadge } from "@/components/common/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ROUTES } from "@/constants/app"
import { getToday } from "@/constants/mock-date"
import { EVENT_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import { daysBetween, fromDateKey } from "@/constants/mock-date"
import { formatDateRange, formatNumber } from "@/lib/format"
import type { EventItem, EventProgress } from "@/types/event"

export function FeaturedEventCard({
  event,
  progress,
  participantCount,
  children,
}: {
  event: EventItem
  progress: EventProgress
  participantCount: number
  children?: React.ReactNode
}) {
  const { t, tl, locale } = useLocale()
  const daysLeft = daysBetween(getToday(), fromDateKey(event.startDate))

  const countdown =
    daysLeft > 0
      ? t("dashboard.daysUntilEvent", { days: daysLeft })
      : daysLeft === 0
        ? t("dashboard.eventToday")
        : t("dashboard.eventPassed", { days: Math.abs(daysLeft) })

  return (
    <Card className="h-full min-h-0 flex-1 overflow-hidden">
      <CardContent className="flex h-full min-h-0 flex-col gap-4">
        <Link
          href={`${ROUTES.events}?event=${event.id}`}
          className="focus-visible:outline-ring block rounded-lg transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.95fr)] lg:items-center">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge style={EVENT_STATUS_STYLE[event.status]} />
              <span className="bg-muted rounded-full px-2.5 py-1 text-xs font-semibold">
                {countdown}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="flex size-11 shrink-0 items-center justify-center text-[2.2rem] leading-none"
                aria-hidden="true"
              >
                🎉
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-brand-text text-xs font-semibold">
                  {t("dashboard.mainEvent")}
                </p>
                <h2 className="text-xl font-bold tracking-tight text-balance">
                  {tl(event.title)}
                </h2>
              </div>
            </div>
          </div>

          <ul className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <li className="flex min-w-0 items-center gap-2">
              <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{formatDateRange(event.startDate, event.endDate, locale)}</span>
            </li>
            <li className="flex min-w-0 items-center gap-2">
              <ClockIcon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {event.startTime} – {event.endTime}
              </span>
            </li>
            <li className="flex min-w-0 items-center gap-2">
              <MapPinIcon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{tl(event.location)}</span>
            </li>
            <li className="flex min-w-0 items-center gap-2">
              <UsersIcon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {formatNumber(participantCount, locale)} {t("dashboard.unitPerson")}
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{t("dashboard.progress")}</span>
            <span className="font-bold tabular-nums">{progress.percent}%</span>
          </div>
          <Progress
            value={progress.percent}
            aria-label={t("dashboard.progress")}
          />
          <p className="text-muted-foreground text-xs">
            {t("dashboard.tasksCompletedOf", {
              done: progress.completedTasks,
              total: progress.totalTasks,
            })}
          </p>
        </div>

        </Link>
        {children ? (
          <div className="dashboard-featured-detail flex min-h-0 flex-1 flex-col">
            {children}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
