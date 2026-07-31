"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { DueBadge } from "@/components/common/due-badge"
import { Button } from "@/components/ui/button"
import { getToday, toDateKey } from "@/constants/mock-date"
import { PRIORITY_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import { isOverdue } from "@/lib/due-date"
import { cn } from "@/lib/utils"
import type { Task } from "@/types/task"

const WEEKDAY_LABELS: Record<"th" | "en", string[]> = {
  th: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
}

/** สร้างตารางเดือนแบบ 7 วันต่อแถว เริ่มจากวันอาทิตย์ */
function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())

  const days: Date[] = []
  for (let index = 0; index < 42; index += 1) {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    days.push(day)
  }
  return days
}

/**
 * มุมมองปฏิทิน — วางงานตามวันครบกำหนด
 * ใช้สีตามระดับความสำคัญคู่กับป้ายข้อความ ไม่พึ่งสีอย่างเดียว
 */
export function TaskCalendar({
  tasks,
  onOpenTask,
}: {
  tasks: Task[]
  onOpenTask: (task: Task) => void
}) {
  const { t, tl, locale } = useLocale()
  const today = React.useMemo(() => getToday(), [])
  const todayKey = toDateKey(today)

  const [cursor, setCursor] = React.useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const days = React.useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  )

  const byDate = React.useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const task of tasks) {
      if (!task.dueDate) continue
      const list = map.get(task.dueDate) ?? []
      list.push(task)
      map.set(task.dueDate, list)
    }
    return map
  }, [tasks])

  const monthLabel = new Intl.DateTimeFormat(
    locale === "th" ? "th-TH" : "en-GB",
    { month: "long", year: "numeric" }
  ).format(cursor)

  const shiftMonth = (delta: number) =>
    setCursor(
      (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1)
    )

  return (
    <div className="space-y-3" data-testid="task-calendar">
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
              const dayTasks = byDate.get(key) ?? []

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
                    {dayTasks.length > 2 ? (
                      <span className="text-muted-foreground text-[0.625rem]">
                        {dayTasks.length}
                      </span>
                    ) : null}
                  </div>

                  <ul className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <li key={task.id}>
                        <button
                          type="button"
                          onClick={() => onOpenTask(task)}
                          className={cn(
                            "focus-visible:outline-ring block w-full truncate rounded border px-1 py-0.5 text-left text-[0.6875rem] focus-visible:outline-2",
                            PRIORITY_STYLE[task.priority].badge,
                            isOverdue(task, today) && "font-bold underline"
                          )}
                          title={tl(task.title)}
                        >
                          {tl(task.title)}
                        </button>
                      </li>
                    ))}
                    {dayTasks.length > 3 ? (
                      <li className="text-muted-foreground px-1 text-[0.625rem]">
                        +{dayTasks.length - 3}
                      </li>
                    ) : null}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* รายการงานเกินกำหนดของเดือนที่กำลังดู เพื่อไม่ให้พลาดแม้ช่องปฏิทินจะเล็ก */}
      <OverdueList tasks={tasks} today={today} onOpenTask={onOpenTask} />
    </div>
  )
}

function OverdueList({
  tasks,
  today,
  onOpenTask,
}: {
  tasks: Task[]
  today: Date
  onOpenTask: (task: Task) => void
}) {
  const { t, tl } = useLocale()
  const overdue = tasks.filter((task) => isOverdue(task, today))

  if (overdue.length === 0) return null

  return (
    <section className="rounded-lg border border-red-200 bg-red-50/60 p-3 dark:border-red-500/30 dark:bg-red-500/10">
      <h3 className="mb-2 text-sm font-semibold">{t("task.overdue")}</h3>
      <ul className="flex flex-wrap gap-2">
        {overdue.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              onClick={() => onOpenTask(task)}
              className="bg-background hover:border-brand-300 focus-visible:outline-ring flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs focus-visible:outline-2"
            >
              {tl(task.title)}
              <DueBadge task={task} today={today} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
