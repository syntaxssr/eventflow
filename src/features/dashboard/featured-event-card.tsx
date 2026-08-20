"use client"

import { createElement } from "react"
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
import { getReadableTextColor } from "@/lib/color"
import { getEventColor, getEventIcon } from "@/lib/event"
import {
  formatDateRange,
  formatNumber,
  formatTimeRange,
} from "@/lib/format"
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
  const eventColor = getEventColor(event)
  const eventIcon = getEventIcon(event)

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
          className="focus-visible:outline-ring block rounded-lg p-2 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2"
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
                className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: eventColor,
                  color: getReadableTextColor(eventColor),
                }}
                aria-hidden="true"
              >
                {createElement(eventIcon, {
                  className: "size-5.5",
                  strokeWidth: 2.25,
                })}
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

          {/* วัน/เวลา/จำนวนคน กว้างตามเนื้อหา ไม่ใช่คอลัมน์ตายตัว
              ไม่งั้นช่วงเวลาจะโดนตัดเหลือ "17:00 – 2…" ส่วนสถานที่ยาวไม่จำกัด
              จึงกินบรรทัดของตัวเองและเป็นตัวเดียวที่ยอมให้ตัดท้าย */}
          <ul className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
            <li className="flex items-center gap-2 whitespace-nowrap">
              <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
              <span>{formatDateRange(event.startDate, event.endDate, locale)}</span>
            </li>
            <li className="flex items-center gap-2 whitespace-nowrap">
              <ClockIcon className="size-4 shrink-0" aria-hidden="true" />
              <span>
                {formatTimeRange(event.startTime, event.endTime, locale)}
              </span>
            </li>
            <li className="flex items-center gap-2 whitespace-nowrap">
              <UsersIcon className="size-4 shrink-0" aria-hidden="true" />
              <span>
                {formatNumber(participantCount, locale)} {t("dashboard.unitPerson")}
              </span>
            </li>
            <li className="flex min-w-0 basis-full items-center gap-2">
              <MapPinIcon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{tl(event.location)}</span>
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
            tone="completion"
            className="h-2"
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
