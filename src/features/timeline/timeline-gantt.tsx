"use client"

import * as React from "react"

import { StatusBadge } from "@/components/common/status-badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getToday, toDateKey } from "@/constants/mock-date"
import { READINESS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import { formatDate } from "@/lib/format"
import { buildGanttLayout } from "@/lib/timeline"
import { cn } from "@/lib/utils"
import type { Task } from "@/types/task"
import type { TimelineItem } from "@/types/timeline"

const DAY_WIDTH = 48
const ROW_HEIGHT = 36
/** ความกว้างขั้นต่ำของแถบ เพื่อให้รายการสั้น ๆ ยังกดได้และมองเห็น */
const MIN_BAR_WIDTH = 10

/**
 * Gantt Chart ของไทม์ไลน์
 *
 * สเกลเป็นระดับวัน แต่วางตำแหน่งย่อยตามเวลาในวันนั้น รายการในวันจัดงาน
 * จึงยังเรียงตามลำดับพิธีการได้ถูกต้อง เส้นประเชื่อมความสัมพันธ์มาจาก
 * dependency ของงานที่ผูกไว้กับแต่ละรายการ
 *
 * มีตารางข้อมูลสำรองสำหรับ screen reader เพราะกราฟอ่านด้วยเสียงไม่ได้
 */
export function TimelineGantt({
  items,
  tasks,
  onEdit,
}: {
  items: TimelineItem[]
  tasks: Task[]
  onEdit: (item: TimelineItem) => void
}) {
  const { t, tl, locale } = useLocale()
  const layout = React.useMemo(
    () => buildGanttLayout(items, tasks),
    [items, tasks]
  )
  const todayKey = toDateKey(getToday())
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const chartWidth = layout.days.length * DAY_WIDTH
  const firstBarLeft = layout.bars[0]
    ? layout.bars[0].left * chartWidth
    : 0

  /**
   * เลื่อนไปยังแถบแรกตั้งแต่เปิดหน้า
   * ไม่อย่างนั้นผู้ใช้จะเห็นแต่พื้นที่ว่างเมื่อกำหนดการกินเวลาหลายสัปดาห์
   */
  React.useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.scrollLeft = Math.max(0, firstBarLeft - DAY_WIDTH)
  }, [firstBarLeft])

  if (layout.bars.length === 0) return null

  const rowIndexById = new Map(
    layout.bars.map((bar, index) => [bar.item.id, index])
  )

  return (
    <div className="space-y-3" data-testid="timeline-gantt">
      <div ref={scrollRef} className="overflow-x-auto rounded-lg border">
        <div className="flex min-w-fit">
          {/* คอลัมน์ชื่อรายการ ตรึงไว้ด้านซ้าย */}
          <div className="bg-background sticky left-0 z-10 shrink-0 border-r">
            <div
              className="text-muted-foreground border-b px-3 text-xs font-medium"
              style={{ height: ROW_HEIGHT, lineHeight: `${ROW_HEIGHT}px` }}
            >
              {t("timeline.name")}
            </div>
            {layout.bars.map((bar) => (
              <div
                key={bar.item.id}
                className="w-48 truncate border-b px-3 text-xs sm:w-64"
                style={{ height: ROW_HEIGHT, lineHeight: `${ROW_HEIGHT}px` }}
                title={tl(bar.item.title)}
              >
                {tl(bar.item.title)}
              </div>
            ))}
          </div>

          {/* พื้นที่กราฟ */}
          <div className="relative" style={{ width: chartWidth }}>
            <div className="flex border-b" style={{ height: ROW_HEIGHT }}>
              {layout.days.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "text-muted-foreground shrink-0 border-r text-center text-[0.625rem] leading-9",
                    day === todayKey && "bg-brand-50 text-brand-900 font-bold"
                  )}
                  style={{ width: DAY_WIDTH }}
                >
                  {day.slice(8)}/{day.slice(5, 7)}
                </div>
              ))}
            </div>

            <div className="relative">
              {/* เส้นแบ่งวัน */}
              <div className="pointer-events-none absolute inset-0 flex">
                {layout.days.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      "border-border/60 shrink-0 border-r",
                      day === todayKey && "bg-brand-50/40"
                    )}
                    style={{ width: DAY_WIDTH }}
                  />
                ))}
              </div>

              {/* เส้นเชื่อมความสัมพันธ์ */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {layout.links.map(([fromId, toId]) => {
                  const fromBar = layout.bars.find(
                    (bar) => bar.item.id === fromId
                  )
                  const toBar = layout.bars.find((bar) => bar.item.id === toId)
                  if (!fromBar || !toBar) return null

                  const fromRow = rowIndexById.get(fromId) ?? 0
                  const toRow = rowIndexById.get(toId) ?? 0
                  const x1 = (fromBar.left + fromBar.width) * chartWidth
                  const y1 = fromRow * ROW_HEIGHT + ROW_HEIGHT / 2
                  const x2 = toBar.left * chartWidth
                  const y2 = toRow * ROW_HEIGHT + ROW_HEIGHT / 2

                  return (
                    <path
                      key={`${fromId}-${toId}`}
                      d={`M ${x1} ${y1} L ${x1 + 8} ${y1} L ${x1 + 8} ${y2} L ${x2} ${y2}`}
                      fill="none"
                      stroke="var(--brand-500)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )
                })}
              </svg>

              {layout.bars.map((bar) => (
                <div
                  key={bar.item.id}
                  className="relative"
                  style={{ height: ROW_HEIGHT }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onEdit(bar.item)}
                        className="bg-brand-500 hover:bg-brand-600 focus-visible:outline-ring absolute top-1/2 h-4 -translate-y-1/2 rounded-sm focus-visible:outline-2"
                        style={{
                          left: bar.left * chartWidth,
                          width: Math.max(bar.width * chartWidth, MIN_BAR_WIDTH),
                        }}
                        aria-label={`${tl(bar.item.title)} ${formatDate(bar.item.date, locale)} ${bar.item.startTime}–${bar.item.endTime}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{tl(bar.item.title)}</p>
                      <p>
                        {formatDate(bar.item.date, locale)} · {bar.item.startTime}
                        –{bar.item.endTime}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ตารางข้อมูลสำรองสำหรับ screen reader */}
      <table className="sr-only">
        <caption>{t("timeline.ganttView")}</caption>
        <thead>
          <tr>
            <th scope="col">{t("timeline.name")}</th>
            <th scope="col">{t("timeline.date")}</th>
            <th scope="col">{t("timeline.startTime")}</th>
            <th scope="col">{t("timeline.endTime")}</th>
            <th scope="col">{t("timeline.readiness")}</th>
          </tr>
        </thead>
        <tbody>
          {layout.bars.map((bar) => (
            <tr key={bar.item.id}>
              <th scope="row">{tl(bar.item.title)}</th>
              <td>{formatDate(bar.item.date, locale)}</td>
              <td>{bar.item.startTime}</td>
              <td>{bar.item.endTime}</td>
              <td>
                <StatusBadge
                  size="sm"
                  style={READINESS_STYLE[bar.item.readiness]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
