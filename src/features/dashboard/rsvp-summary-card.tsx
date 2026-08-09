"use client"

import * as React from "react"
import Link from "next/link"
import { UsersIcon } from "lucide-react"
import { Cell, PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { ROUTES } from "@/constants/app"
import { RSVP_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { RSVP_STATUSES, type RsvpStatus, type RsvpSummary } from "@/types/participant"

const SUMMARY_KEY: Record<RsvpStatus, keyof RsvpSummary> = {
  pending: "pending",
  attending: "attending",
  not_attending: "notAttending",
}

/**
 * สรุปสถานะตอบรับ
 *
 * ใช้กราฟวงแหวนซ้อนในสัดส่วนเดียวกับสรุปงานตามสถานะ เพื่อเปรียบเทียบ
 * สัดส่วนผู้เข้าร่วมแต่ละกลุ่มได้ทันที พร้อมรายการตัวเลขและลิงก์ที่อ่านค่าได้ชัดเจน
 */
export function RsvpSummaryCard({ summary }: { summary: RsvpSummary }) {
  const { t, locale } = useLocale()

  const config = React.useMemo<ChartConfig>(() => {
    const entries = RSVP_STATUSES.map((status) => [
      status,
      {
        label: t(RSVP_STATUS_STYLE[status].labelKey as TranslationKey),
        color: RSVP_STATUS_STYLE[status].chartColor,
      },
    ])
    return Object.fromEntries(entries) as ChartConfig
  }, [t])

  const data = RSVP_STATUSES.map((status) => {
    const key = SUMMARY_KEY[status]
    const value = summary[key] as number

    return {
      status,
      label: t(RSVP_STATUS_STYLE[status].labelKey as TranslationKey),
      value,
      percent: summary.total === 0 ? 0 : Math.round((value / summary.total) * 100),
      fill: RSVP_STATUS_STYLE[status].chartColor,
    }
  })

  return (
    <Card className="dashboard-detail-card">
      <CardHeader>
        <CardTitle>{t("dashboard.rsvpSummary")}</CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <UsersIcon className="size-4" aria-hidden="true" />
          {t("dashboard.participantSummary")}: {formatNumber(summary.total, locale)}{" "}
          {t("dashboard.unitPerson")}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid min-w-0 flex-1 content-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center">
        <div className="relative mx-auto aspect-square w-64 sm:w-72 lg:w-80">
          <ChartContainer config={config} className="size-full">
            <RadialBarChart
              data={data}
              innerRadius="24%"
              outerRadius="92%"
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                dataKey="percent"
                background={{ fill: "var(--muted)" }}
                cornerRadius={6}
                isAnimationActive
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </RadialBar>
            </RadialBarChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold tabular-nums">
              {formatNumber(summary.total, locale)}
            </span>
            <span className="text-muted-foreground text-[0.6875rem]">
              {t("dashboard.unitPerson")}
            </span>
          </div>
        </div>

        <ul className="w-full space-y-1.5">
          {RSVP_STATUSES.map((status) => {
            const style = RSVP_STATUS_STYLE[status]
            const Icon = style.icon
            const key = SUMMARY_KEY[status]

            return (
              <li key={status}>
                <Link
                  href={`${ROUTES.participants}?rsvp=${status}`}
                  className="hover:bg-muted focus-visible:outline-ring flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors focus-visible:outline-2"
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
