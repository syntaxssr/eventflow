"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { fromDateKey, getToday, toDateKey } from "@/constants/mock-date"
import { READINESS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import { sortTimeline } from "@/lib/timeline"
import { cn } from "@/lib/utils"
import type { TimelineItem } from "@/types/timeline"

const WEEKDAY_LABELS: Record<"th" | "en", string[]> = {
  th: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
}

function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

/** มุมมองปฏิทินของไทม์ไลน์ — เริ่มที่เดือนของรายการแรกเสมอ */
export function TimelineCalendar({
  items,
  onEdit,
}: {
  items: TimelineItem[]
  onEdit: (item: TimelineItem) => void
}) {
  const { t, tl, locale } = useLocale()
  const today = React.useMemo(() => getToday(), [])
  const todayKey = toDateKey(today)

  const sorted = React.useMemo(() => sortTimeline(items), [items])
  const [cursor, setCursor] = React.useState(() => {
    const anchor = sorted[0] ? fromDateKey(sorted[0].date) : today
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  })

  const days = React.useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  )

  const byDate = React.useMemo(() => {
    const map = new Map<string, TimelineItem[]>()
    for (const item of sorted) {
      const list = map.get(item.date) ?? []
      list.push(item)
      map.set(item.date, list)
    }
    return map
  }, [sorted])

  const monthLabel = new Intl.DateTimeFormat(
    locale === "th" ? "th-TH" : "en-GB",
    { month: "long", year: "numeric" }
  ).format(cursor)

  const shiftMonth = (delta: number) =>
    setCursor(
      (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1)
    )

  return (
    <div className="space-y-3" data-testid="timeline-calendar">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => shiftMonth(-1)}
          aria-label={t("common.previous")}
        >
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
        </Button>
        <h3 className="min-w-40 text-center text-sm font-semibold" aria-live="polite">
          {monthLabel}
        </h3>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => shiftMonth(1)}
          aria-label={t("common.next")}
        >
          <ChevronRightIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[44rem]">
          <div className="text-muted-foreground grid grid-cols-7 gap-1 pb-1 text-center text-xs font-medium">
            {WEEKDAY_LABELS[locale].map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = toDateKey(day)
              const inMonth = day.getMonth() === cursor.getMonth()
              const dayItems = byDate.get(key) ?? []

              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-24 rounded-md border p-1.5",
                    !inMonth && "bg-muted/30 opacity-60",
                    key === todayKey && "border-brand-400 bg-brand-50/50"
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <time
                      dateTime={key}
                      className={cn(
                        "text-xs font-medium tabular-nums",
                        key === todayKey && "text-brand-900 font-bold"
                      )}
                    >
                      {day.getDate()}
                    </time>
                    {dayItems.length > 2 ? (
                      <span className="text-muted-foreground text-[0.625rem]">
                        {dayItems.length}
                      </span>
                    ) : null}
                  </div>

                  <ul className="space-y-1">
                    {dayItems.slice(0, 3).map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className={cn(
                            "focus-visible:outline-ring block w-full truncate rounded border px-1 py-0.5 text-left text-[0.6875rem] focus-visible:outline-2",
                            READINESS_STYLE[item.readiness].badge
                          )}
                          title={`${item.startTime} ${tl(item.title)}`}
                        >
                          {item.startTime} {tl(item.title)}
                        </button>
                      </li>
                    ))}
                    {dayItems.length > 3 ? (
                      <li className="text-muted-foreground px-1 text-[0.625rem]">
                        +{dayItems.length - 3}
                      </li>
                    ) : null}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
