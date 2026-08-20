"use client"

import Link from "next/link"

import { AvatarGroup } from "@/components/common/avatar-group"
import { StatusBadge } from "@/components/common/status-badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ROUTES } from "@/constants/app"
import { EVENT_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import { getEventColor, getEventIconColor } from "@/lib/event"
import { formatDateRange, formatNumber } from "@/lib/format"
import type { EventItem, EventProgress } from "@/types/event"
import type { User } from "@/types/user"

export interface EventRow {
  event: EventItem
  progress: EventProgress
  owner: User | undefined
  members: User[]
  participantCount: number
}

/** มุมมองตาราง — บนมือถือจะเลื่อนแนวนอนแทนการบีบคอลัมน์จนอ่านไม่ออก */
export function EventTable({ rows }: { rows: EventRow[] }) {
  const { t, tl, locale } = useLocale()

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-56">{t("event.name")}</TableHead>
            <TableHead className="min-w-24">
              {t("designSystem.eventStatuses")}
            </TableHead>
            <TableHead className="min-w-40">{t("event.startDate")}</TableHead>
            <TableHead className="min-w-40">{t("event.assignees")}</TableHead>
            <TableHead className="min-w-20 text-right">
              {t("dashboard.participantSummary")}
            </TableHead>
            <TableHead className="min-w-40">{t("dashboard.progress")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ event, progress, members, participantCount }) => {
            const eventColor = getEventColor(event)

            return (
              <TableRow key={event.id}>
              <TableCell>
                <Link
                  href={ROUTES.eventDetail(event.id)}
                  className="hover:text-brand-text focus-visible:outline-ring font-medium focus-visible:outline-2"
                >
                  {tl(event.title)}
                </Link>
              </TableCell>
              <TableCell>
                <StatusBadge size="sm" style={EVENT_STATUS_STYLE[event.status]} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                {formatDateRange(event.startDate, event.endDate, locale)}
              </TableCell>
              <TableCell>
                <AvatarGroup
                  users={members}
                  max={10}
                  overflowStyle={{
                    backgroundColor: eventColor,
                    color: getEventIconColor(eventColor),
                  }}
                />
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums">
                {formatNumber(participantCount, locale)}
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <Progress
                    value={progress.percent}
                    tone="completion"
                    className="w-24"
                    aria-label={t("dashboard.progress")}
                  />
                  <span className="text-sm font-medium tabular-nums">
                    {progress.percent}%
                  </span>
                </span>
              </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
