"use client"

import * as React from "react"
import Link from "next/link"
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

  const data = TASK_STATUSES.map((status) => ({
    status,
    label: t(TASK_STATUS_STYLE[status].labelKey as TranslationKey),
    value: counts[status],
    percent: total === 0 ? 0 : Math.round((counts[status] / total) * 100),
    // วง "ยังไม่เริ่ม" ใช้สีตัวอักษร Gray เฉพาะในกราฟ เพื่อไม่กลืนกับพื้นการ์ด
    fill:
      status === "not_started"
        ? "var(--status-gray-foreground)"
        : TASK_STATUS_STYLE[status].chartColor,
  }))

  return (
    <Card className="dashboard-detail-card">
      <CardHeader>
        <CardTitle>{t("dashboard.taskStatusSummary")}</CardTitle>
        <CardDescription>
          {t("dashboard.totalTasks")}: {formatNumber(total, locale)}{" "}
          {t("dashboard.unitTask")}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid min-w-0 flex-1 content-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center">
        {/* วงแหวนแยกตามสถานะ อ่านสัดส่วนเทียบงานทั้งหมดได้โดยไม่ต้องเดาชิ้นโดนัท */}
        <div className="relative mx-auto aspect-square w-56 sm:w-60 lg:w-64">
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
              {formatNumber(total, locale)}
            </span>
            <span className="text-muted-foreground text-[0.6875rem]">
              {t("dashboard.unitTask")}
            </span>
          </div>
        </div>

        <ul className="w-full space-y-1.5">
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
                    className={cn(
                      "size-2.5 shrink-0 rounded-full",
                      status === "not_started"
                        ? "bg-status-gray-foreground"
                        : style.dot
                    )}
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
