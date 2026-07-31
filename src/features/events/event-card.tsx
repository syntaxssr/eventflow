"use client"

import Image from "next/image"
import Link from "next/link"
import { CalendarIcon, ImageOffIcon, MapPinIcon, UsersIcon } from "lucide-react"

import { StatusBadge } from "@/components/common/status-badge"
import { UserAvatar } from "@/components/common/user-avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ROUTES } from "@/constants/app"
import { EVENT_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import { formatDateRange, formatNumber } from "@/lib/format"
import { getFullName } from "@/lib/user"
import type { EventItem, EventProgress } from "@/types/event"
import type { User } from "@/types/user"

export function EventCard({
  event,
  progress,
  owner,
  participantCount,
}: {
  event: EventItem
  progress: EventProgress
  owner: User | undefined
  participantCount: number
}) {
  const { t, tl, locale } = useLocale()

  return (
    <Card className="hover:border-brand-300 overflow-hidden pt-0 transition-colors">
      <Link
        href={ROUTES.eventDetail(event.id)}
        className="focus-visible:outline-ring block focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        <div className="bg-muted relative h-32 w-full">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span
              className="text-muted-foreground flex h-full items-center justify-center"
              aria-hidden="true"
            >
              <ImageOffIcon className="size-6" />
            </span>
          )}
          <span className="absolute top-2 left-2">
            <StatusBadge
              size="sm"
              style={EVENT_STATUS_STYLE[event.status]}
              className="shadow-sm"
            />
          </span>
        </div>

        <CardContent className="space-y-3 pt-4">
          <h3 className="line-clamp-2 leading-snug font-semibold text-balance">
            {tl(event.title)}
          </h3>

          <ul className="text-muted-foreground space-y-1 text-xs">
            <li className="flex items-center gap-1.5">
              <CalendarIcon className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{formatDateRange(event.startDate, event.endDate, locale)}</span>
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

          {owner ? (
            <div className="flex items-center gap-2 border-t pt-3">
              <UserAvatar user={owner} size="xs" />
              <span className="text-muted-foreground truncate text-xs">
                {getFullName(owner, locale)}
              </span>
            </div>
          ) : null}
        </CardContent>
      </Link>
    </Card>
  )
}
