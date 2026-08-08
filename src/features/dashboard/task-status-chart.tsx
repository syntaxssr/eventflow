"use client"

import * as React from "react"
import Link from "next/link"
import { Cell, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ROUTES } from "@/constants/app"
import { TASK_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { TASK_STATUSES, type TaskStatus } from "@/types/task"

/**
 * สรุปงานตามสถานะ
 *
 * ใช้โดนัทชาร์ตคู่กับรายการตัวเลขด้านข้าง เพื่อไม่ให้ต้องอาศัยสีเพียงอย่างเดียว
 * ในการอ่านค่า และมีตารางสำรองสำหรับ screen reader
 */
export function TaskStatusChart({
  counts,
  total,
}: {
  counts: Record<TaskStatus, number>
  total: number
}) {
  const { t, locale } = useLocale()

  const config = React.useMemo<ChartConfig>(() => {
    const entries = TASK_STATUSES.map((status) => [
      status,
      {
        label: t(TASK_STATUS_STYLE[status].labelKey as TranslationKey),
        color: TASK_STATUS_STYLE[status].chartColor,
      },
    ])
    return Object.fromEntries(entries) as ChartConfig
  }, [t])

  const data = TASK_STATUSES.filter((status) => counts[status] > 0).map(
    (status) => ({
      status,
      label: t(TASK_STATUS_STYLE[status].labelKey as TranslationKey),
      value: counts[status],
      fill: TASK_STATUS_STYLE[status].chartColor,
    })
  )

  return (
    <Card className="dashboard-detail-card dashboard-featured-color-card">
      <CardHeader>
        <CardTitle>{t("dashboard.taskStatusSummary")}</CardTitle>
        <CardDescription>
          {t("dashboard.totalTasks")}: {formatNumber(total, locale)}{" "}
          {t("dashboard.unitTask")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
        {/* ขนาดคงที่ + shrink-0 กันไม่ให้โดนบีบจนชาร์ตยุบเมื่อการ์ดแคบ */}
        <ChartContainer
          config={config}
          className="mx-auto aspect-square w-40 shrink-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="58%"
              outerRadius="90%"
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive
            >
              {data.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <ul className="flex-1 space-y-1.5">
          {TASK_STATUSES.map((status) => {
            const style = TASK_STATUS_STYLE[status]
            const Icon = style.icon
            return (
              <li key={status}>
                <Link
                  href={`${ROUTES.myTasks}?status=${status}`}
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
                    {formatNumber(counts[status], locale)}
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
