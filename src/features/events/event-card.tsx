"use client"

import Link from "next/link"
import { CalendarIcon, Clock3Icon, MapPinIcon, UsersIcon } from "lucide-react"

import { StatusBadge } from "@/components/common/status-badge"
import { AvatarGroup } from "@/components/common/avatar-group"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ROUTES } from "@/constants/app"
import { EVENT_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import { getReadableTextColor } from "@/lib/color"
import { getEventColor, getEventEmoji } from "@/lib/event"
import { formatDateRange, formatNumber } from "@/lib/format"
import type { EventItem, EventProgress } from "@/types/event"
import type { User } from "@/types/user"

export function EventCard({
  event,
  progress,
  members,
  participantCount,
}: {
  event: EventItem
  progress: EventProgress
  members: User[]
  participantCount: number
}) {
  const { t, tl, locale } = useLocale()
  const eventEmoji = getEventEmoji(event)
  const eventColor = getEventColor(event)

  return (
    <Card className="hover:border-brand-300 overflow-hidden transition-colors">
      <Link
        href={ROUTES.eventDetail(event.id)}
        className="focus-visible:outline-ring block focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        <CardContent className="space-y-3">
          <StatusBadge size="sm" style={EVENT_STATUS_STYLE[event.status]} />
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center text-[2.2rem] leading-none"
              aria-hidden="true"
            >
              {eventEmoji}
            </span>
            <h3 className="line-clamp-2 leading-snug font-semibold text-balance">
              {tl(event.title)}
            </h3>
          </div>

          <ul className="text-muted-foreground space-y-1 text-xs">
            <li className="flex items-center gap-1.5">
              <CalendarIcon className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{formatDateRange(event.startDate, event.endDate, locale)}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Clock3Icon className="size-3.5 shrink-0" aria-hidden="true" />
              <span>
                {event.startTime} – {event.endTime}
              </span>
            </li>
            <li className="flex items-center gap-1.5">
              <MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{tl(event.location)}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <UsersIcon className="size-3.5 shrink-0" aria-hidden="true" />
              <span>
                {formatNumber(participantCount, locale)} {t("dashboard.unitPerson")}
              </span>
            </li>
          </ul>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t("dashboard.progress")}
              </span>
              <span className="font-semibold tabular-nums">
                {progress.percent}%
              </span>
            </div>
            <Progress value={progress.percent} aria-label={t("dashboard.progress")} />
            <p className="text-muted-foreground text-xs">
              {t("dashboard.tasksCompletedOf", {
                done: progress.completedTasks,
                total: progress.totalTasks,
              })}
            </p>
          </div>

          <div className="flex min-h-6 items-center justify-between gap-2 border-t pt-3">
            <span className="text-muted-foreground text-xs">
              {t("event.assignees")}
            </span>
            <AvatarGroup
              users={members}
              max={10}
              overflowStyle={{
                backgroundColor: eventColor,
                color: getReadableTextColor(eventColor),
              }}
            />
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
