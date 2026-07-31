"use client"

import Link from "next/link"
import { UsersIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ROUTES } from "@/constants/app"
import { RSVP_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { RsvpStatus, RsvpSummary } from "@/types/participant"

const ROWS: { status: RsvpStatus; key: keyof RsvpSummary }[] = [
  { status: "attending", key: "attending" },
  { status: "not_attending", key: "notAttending" },
  { status: "pending", key: "pending" },
]

export function RsvpSummaryCard({ summary }: { summary: RsvpSummary }) {
  const { t, locale } = useLocale()
  const attendingPercent =
    summary.total === 0
      ? 0
      : Math.round((summary.attending / summary.total) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.rsvpSummary")}</CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <UsersIcon className="size-4" aria-hidden="true" />
          {t("dashboard.participantSummary")}: {formatNumber(summary.total, locale)}{" "}
          {t("dashboard.unitPerson")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {t(RSVP_STATUS_STYLE.attending.labelKey as TranslationKey)}
            </span>
            <span className="font-bold tabular-nums">{attendingPercent}%</span>
          </div>
          <Progress
            value={attendingPercent}
            aria-label={t(RSVP_STATUS_STYLE.attending.labelKey as TranslationKey)}
          />
        </div>

        <ul className="space-y-1.5">
          {ROWS.map(({ status, key }) => {
            const style = RSVP_STATUS_STYLE[status]
            const Icon = style.icon
            return (
              <li key={status}>
                <Link
                  href={`${ROUTES.participants}?rsvp=${status}`}
                  className="hover:bg-muted focus-visible:outline-ring flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:outline-2"
                >
                  <span
                    className={cn("size-2.5 shrink-0 rounded-full", style.dot)}
                    aria-hidden="true"
                  />
                  <Icon
                    className="text-muted-foreground size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {t(style.labelKey as TranslationKey)}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatNumber(summary[key] as number, locale)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
