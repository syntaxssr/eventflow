"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react"

import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ROUTES } from "@/constants/app"
import { getToday } from "@/constants/mock-date"
import { EVENT_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import { daysBetween, fromDateKey } from "@/constants/mock-date"
import { getEventColor } from "@/lib/event"
import { formatDateRange, formatNumber } from "@/lib/format"
import type { EventItem, EventProgress } from "@/types/event"

export function FeaturedEventCard({
  event,
  progress,
  participantCount,
}: {
  event: EventItem
  progress: EventProgress
  participantCount: number
}) {
  const { t, tl, locale } = useLocale()
  const daysLeft = daysBetween(getToday(), fromDateKey(event.startDate))
  const eventColor = getEventColor(event.id)

  const countdown =
    daysLeft > 0
      ? t("dashboard.daysUntilEvent", { days: daysLeft })
      : daysLeft === 0
        ? t("dashboard.eventToday")
        : t("dashboard.eventPassed", { days: Math.abs(daysLeft) })

  return (
    <Card className="dashboard-featured-color-card overflow-hidden">
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            style={EVENT_STATUS_STYLE[event.status]}
          />
          <span className="bg-muted rounded-full px-2.5 py-1 text-xs font-semibold">
            {countdown}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: eventColor }}
            aria-hidden="true"
          >
            <CalendarDaysIcon className="size-5 text-black" />
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

        <ul className="text-muted-foreground grid gap-2 text-sm sm:grid-cols-2">
          <li className="flex items-center gap-2">
            <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
            <span>{formatDateRange(event.startDate, event.endDate, locale)}</span>
          </li>
          <li className="flex items-center gap-2">
            <ClockIcon className="size-4 shrink-0" aria-hidden="true" />
            <span>
              {event.startTime} – {event.endTime}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <MapPinIcon className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{tl(event.location)}</span>
          </li>
          <li className="flex items-center gap-2">
            <UsersIcon className="size-4 shrink-0" aria-hidden="true" />
            <span>
              {formatNumber(participantCount, locale)} {t("dashboard.unitPerson")}
            </span>
          </li>
        </ul>

        <div className="space-y-2">
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

        <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`${ROUTES.events}?event=${event.id}`}>
              {t("common.viewAll")}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
