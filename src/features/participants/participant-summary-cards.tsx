"use client"

import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleXIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useLocale } from "@/i18n"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { RsvpSummary } from "@/types/participant"

/** การ์ดสรุปสถานะตอบรับ 4 ใบ: ทั้งหมด / เข้าร่วม / ไม่เข้าร่วม / ยังไม่ตอบรับ */
export function ParticipantSummaryCards({ summary }: { summary: RsvpSummary }) {
  const { t, locale } = useLocale()

  const cards: {
    key: string
    label: string
    value: number
    icon: LucideIcon
    tile: string
  }[] = [
    {
      key: "total",
      label: t("participant.summaryTotal"),
      value: summary.total,
      icon: UsersIcon,
      tile: "bg-brand-50 text-brand-900 dark:bg-brand-500/15 dark:text-brand-300",
    },
    {
      key: "attending",
      label: t("rsvp.attending"),
      value: summary.attending,
      icon: CircleCheckIcon,
      tile: "bg-success/20 text-foreground dark:bg-success/25",
    },
    {
      key: "notAttending",
      label: t("rsvp.notAttending"),
      value: summary.notAttending,
      icon: CircleXIcon,
      tile: "bg-danger/15 text-foreground dark:bg-danger/25",
    },
    {
      key: "pending",
      label: t("rsvp.pending"),
      value: summary.pending,
      icon: CircleHelpIcon,
      tile: "bg-warning/25 text-foreground dark:bg-warning/30",
    },
  ]

  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      data-testid="participant-summary"
    >
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.key}>
            <CardContent className="flex items-center gap-3 p-4">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  card.tile
                )}
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span
                  className="block text-xl font-bold tabular-nums"
                  data-testid={`participant-summary-${card.key}`}
                >
                  {formatNumber(card.value, locale)}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {card.label}
                </span>
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
