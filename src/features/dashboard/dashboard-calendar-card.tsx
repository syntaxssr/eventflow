"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ROUTES } from "@/constants/app"
import { fromDateKey, getToday, toDateKey } from "@/constants/mock-date"
import { useLocale } from "@/i18n"
import { cn } from "@/lib/utils"
import type { EventItem } from "@/types/event"
import type { Task } from "@/types/task"

const WEEKDAY_LABELS: Record<"th" | "en", string[]> = {
  th: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
  en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
}

/**
 * จำนวนสัปดาห์ที่เดือนนั้นต้องใช้จริง (4–6)
 * ตรึงไว้ 6 แถวเสมอจะทำให้บางเดือนมีแถวว่างเปล่าเกินมา
 */
function weeksInMonth(year: number, month: number): number {
  const leading = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  return Math.ceil((leading + days) / 7)
}

function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())

  return Array.from({ length: weeksInMonth(year, month) * 7 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

/** รายการที่ผูกกับวันหนึ่ง ๆ — แยกชนิดไว้เพื่อเลือกสีจุดและปลายทางลิงก์ */
type DayEntry =
  | { kind: "event"; id: string; label: string }
  | { kind: "task"; id: string; label: string }

/**
 * ปฏิทินย่อบน Dashboard — จุดใต้เลขวันบอกว่ามีอะไรในวันนั้น
 *
 * ตัวนี้แยกจาก `TaskCalendar` ของหน้างานโดยตั้งใจ เพราะตัวนั้นตรึง `min-w-[44rem]`
 * ไว้เพื่อให้ช่องวันใส่ชื่องานได้ ซึ่งกว้างเกินคอลัมน์ 1/3 ของ Dashboard
 */
export function DashboardCalendarCard({
  events,
  tasks,
}: {
  events: EventItem[]
  tasks: Task[]
}) {
  const { t, tl, locale } = useLocale()
  const today = React.useMemo(() => getToday(), [])
  const todayKey = toDateKey(today)

  const [cursor, setCursor] = React.useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedKey, setSelectedKey] = React.useState(todayKey)

  const days = React.useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  )

  // วันจัดกิจกรรมนับทุกวันตั้งแต่วันเริ่มถึงวันสิ้นสุด ไม่ใช่เฉพาะวันเริ่ม
  const byDate = React.useMemo(() => {
    const map = new Map<string, DayEntry[]>()
    const push = (key: string, entry: DayEntry) => {
      const list = map.get(key) ?? []
      list.push(entry)
      map.set(key, list)
    }

    for (const event of events) {
      const cursorDay = fromDateKey(event.startDate)
      const end = fromDateKey(event.endDate)
      while (cursorDay <= end) {
        push(toDateKey(cursorDay), {
          kind: "event",
          id: event.id,
          label: tl(event.title),
        })
        cursorDay.setDate(cursorDay.getDate() + 1)
      }
    }

    for (const task of tasks) {
      if (!task.dueDate) continue
      push(task.dueDate, { kind: "task", id: task.id, label: tl(task.title) })
    }

    return map
  }, [events, tasks, tl])

  const monthLabel = new Intl.DateTimeFormat(
    locale === "th" ? "th-TH" : "en-GB",
    { month: "long", year: "numeric" }
  ).format(cursor)

  const shiftMonth = (delta: number) =>
    setCursor(
      (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1)
    )

  const selectedEntries = byDate.get(selectedKey) ?? []
  const selectedLabel = new Intl.DateTimeFormat(
    locale === "th" ? "th-TH" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  ).format(fromDateKey(selectedKey))

  return (
    <Card className="h-full" data-testid="dashboard-calendar">
      <CardHeader>
        <CardTitle aria-live="polite">{monthLabel}</CardTitle>
        <CardAction className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => shiftMonth(-1)}
            aria-label={t("common.previous")}
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => shiftMonth(1)}
            aria-label={t("common.next")}
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div>
          <div className="text-muted-foreground grid grid-cols-7 pb-1 text-center text-xs font-medium">
            {WEEKDAY_LABELS[locale].map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day) => {
              const key = toDateKey(day)
              const inMonth = day.getMonth() === cursor.getMonth()
              const entries = byDate.get(key) ?? []
              const hasEvent = entries.some((entry) => entry.kind === "event")
              const hasTask = entries.some((entry) => entry.kind === "task")
              const selected = key === selectedKey

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  aria-pressed={selected}
                  aria-label={[
                    key,
                    hasEvent ? t("dashboard.calendarEventDay") : null,
                    hasTask ? t("dashboard.calendarTaskDue") : null,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  className={cn(
                    "focus-visible:outline-ring flex aspect-square flex-col items-center justify-center gap-1 rounded-md text-xs tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1",
                    !inMonth && "text-muted-foreground/50",
                    !selected && "hover:bg-muted",
                    // วันที่เลือกใช้สลับขาว-ดำตามกติกา active state ของระบบ
                    selected && "bg-primary text-primary-foreground font-bold",
                    !selected && key === todayKey && "ring-foreground/40 ring-1"
                  )}
                >
                  <span>{day.getDate()}</span>
                  <span className="flex h-1 items-center gap-0.5">
                    {hasEvent ? (
                      <span
                        className={cn(
                          "size-1 rounded-full",
                          selected ? "bg-primary-foreground" : "bg-info"
                        )}
                        aria-hidden="true"
                      />
                    ) : null}
                    {hasTask ? (
                      <span
                        className={cn(
                          "size-1 rounded-full",
                          selected ? "bg-primary-foreground" : "bg-foreground/70"
                        )}
                        aria-hidden="true"
                      />
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* จุดสองสีต่างกันด้วยสีอย่างเดียวไม่พอ จึงมีคำกำกับเสมอ */}
        <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <li className="flex items-center gap-1.5">
            <span className="bg-info size-1.5 rounded-full" aria-hidden="true" />
            {t("dashboard.calendarEventDay")}
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="bg-foreground/70 size-1.5 rounded-full"
              aria-hidden="true"
            />
            {t("dashboard.calendarTaskDue")}
          </li>
        </ul>

        <div className="flex min-h-0 flex-1 flex-col gap-2 border-t pt-3">
          <p className="text-sm font-semibold">{selectedLabel}</p>

          {selectedEntries.length === 0 ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
              {t("dashboard.calendarNoItems")}
            </p>
          ) : (
            <ul className="divide-border min-h-0 flex-1 divide-y overflow-y-auto">
              {selectedEntries.map((entry) => (
                <li key={`${entry.kind}-${entry.id}`}>
                  <Link
                    href={
                      entry.kind === "event"
                        ? `${ROUTES.events}?event=${entry.id}`
                        : `${ROUTES.myTasks}?task=${entry.id}`
                    }
                    className="hover:bg-muted/60 focus-visible:outline-ring -mx-2 flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors focus-visible:outline-2"
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        entry.kind === "event" ? "bg-info" : "bg-foreground/70"
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {entry.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
