"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ROUTES } from "@/constants/app"
import { EVENT_COLOR_OPTIONS } from "@/constants/event-colors"
import { fromDateKey, getToday, toDateKey } from "@/constants/mock-date"
import { useLocale } from "@/i18n"
import { getReadableTextColor } from "@/lib/color"
import { getEventColor } from "@/lib/event"
import { cn } from "@/lib/utils"
import type { EventItem } from "@/types/event"
import type { Task } from "@/types/task"

const WEEKDAY_LABELS: Record<"th" | "en", string[]> = {
  th: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
  en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
}

/** สีตัวอย่างในคำอธิบาย — สื่อว่าจุดกิจกรรมเปลี่ยนสีตามโปรเจกต์ */
const LEGEND_EVENT_COLORS = EVENT_COLOR_OPTIONS.slice(0, 3).map(
  (option) => option.value
)

/** เดือนที่กินพื้นที่มากสุดใช้ 6 แถว (เช่น พฤษภาคม/สิงหาคม 2569) */
const MAX_CALENDAR_WEEKS = 6

const MONTHS_IN_YEAR = 12
/** ช่วงปีที่เลือกได้จากปุ่มปี — กว้างพอสำหรับงานย้อนหลังและงานที่วางแผนล่วงหน้า */
const YEAR_RANGE = 10

function intlLocale(locale: "th" | "en"): string {
  return locale === "th" ? "th-TH" : "en-GB"
}

/**
 * ปีในรูปแบบของภาษานั้น (ไทยเป็น พ.ศ. อังกฤษเป็น ค.ศ.)
 *
 * ดึงเฉพาะส่วนปีออกจาก formatToParts แทนการ format ตรง ๆ
 * เพราะ th-TH จะเติม "พ.ศ." นำหน้าเมื่อขอปีอย่างเดียว
 */
function formatYear(year: number, locale: "th" | "en"): string {
  const parts = new Intl.DateTimeFormat(intlLocale(locale), {
    year: "numeric",
  }).formatToParts(new Date(year, 0, 1))
  return parts.find((part) => part.type === "year")?.value ?? `${year}`
}

function formatMonthShort(month: number, locale: "th" | "en"): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: "short",
  }).format(new Date(2000, month, 1))
}
const ENTRIES_PER_PAGE = 3

function weeksInMonth(year: number, month: number): number {
  const leading = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  return Math.ceil((leading + days) / 7)
}

function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())

  // ใช้จำนวนแถวสูงสุดเสมอ เพื่อไม่ให้ความสูง Dashboard เปลี่ยนเมื่อสลับเดือน
  const totalWeeks = Math.max(weeksInMonth(year, month), MAX_CALENDAR_WEEKS)

  return Array.from({ length: totalWeeks * 7 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

/**
 * รายการที่ผูกกับวันหนึ่ง ๆ — แยกชนิดไว้เพื่อเลือกสีจุดและปลายทางลิงก์
 * กิจกรรมพก `color` ประจำโปรเจกต์มาด้วย ส่วนงานใช้สีกลางเสมอ
 */
type DayEntry =
  | { kind: "event"; id: string; label: string; color: string }
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
  const [selectedPage, setSelectedPage] = React.useState(0)

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
          color: getEventColor(event),
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

  const monthLabel = new Intl.DateTimeFormat(intlLocale(locale), {
    month: "long",
    year: "numeric",
  }).format(cursor)

  const shiftMonth = (delta: number) =>
    setCursor(
      (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1)
    )

  // ปีที่แผงกำลังโชว์ แยกจาก cursor เพื่อให้พลิกดูปีอื่นได้ก่อนตัดสินใจเลือกเดือน
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [pickerYear, setPickerYear] = React.useState(() => cursor.getFullYear())

  const openPicker = (open: boolean) => {
    // เปิดใหม่ทุกครั้งให้เริ่มที่ปีของเดือนที่ดูอยู่ ไม่ค้างปีที่เผลอเลื่อนไว้รอบก่อน
    if (open) setPickerYear(cursor.getFullYear())
    setPickerOpen(open)
  }

  const pickMonth = (month: number) => {
    setCursor(new Date(pickerYear, month, 1))
    setPickerOpen(false)
  }

  const todayYear = today.getFullYear()
  const minYear = todayYear - YEAR_RANGE
  const maxYear = todayYear + YEAR_RANGE

  const selectedEntries = byDate.get(selectedKey) ?? []
  const totalPages = Math.max(
    1,
    Math.ceil(selectedEntries.length / ENTRIES_PER_PAGE)
  )
  const currentPage = Math.min(selectedPage, totalPages - 1)
  const pagedEntries = selectedEntries.slice(
    currentPage * ENTRIES_PER_PAGE,
    (currentPage + 1) * ENTRIES_PER_PAGE
  )
  const selectedLabel = new Intl.DateTimeFormat(
    locale === "th" ? "th-TH" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  ).format(fromDateKey(selectedKey))

  return (
    <Card
      className="dashboard-calendar-card h-full"
      data-testid="dashboard-calendar"
    >
      <CardHeader>
        <Popover open={pickerOpen} onOpenChange={openPicker}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={t("dashboard.calendarPickPeriod")}
              className="focus-visible:outline-ring -mx-1 flex items-center gap-1 rounded-md px-1 transition-colors hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-1"
            >
              <CardTitle aria-live="polite">{monthLabel}</CardTitle>
              <ChevronDownIcon
                className="size-4 shrink-0"
                aria-hidden="true"
              />
            </button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-60 p-3">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                className="rounded-full"
                onClick={() => setPickerYear((year) => year - 1)}
                disabled={pickerYear <= minYear}
                aria-label={t("dashboard.calendarPreviousYear")}
              >
                <ChevronLeftIcon className="size-4" aria-hidden="true" />
              </Button>
              <span
                aria-live="polite"
                className="text-sm font-bold tabular-nums"
              >
                {formatYear(pickerYear, locale)}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                className="rounded-full"
                onClick={() => setPickerYear((year) => year + 1)}
                disabled={pickerYear >= maxYear}
                aria-label={t("dashboard.calendarNextYear")}
              >
                <ChevronRightIcon className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-3">
              {Array.from({ length: MONTHS_IN_YEAR }, (_, month) => {
                const isViewing =
                  pickerYear === cursor.getFullYear() &&
                  month === cursor.getMonth()
                const isCurrentMonth =
                  pickerYear === todayYear && month === today.getMonth()

                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => pickMonth(month)}
                    aria-current={isViewing ? "true" : undefined}
                    className={cn(
                      "focus-visible:outline-ring rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1",
                      // เดือนที่ดูอยู่ใช้สลับขาว-ดำตามกติกา active state ของระบบ
                      isViewing && "bg-primary text-primary-foreground font-bold",
                      // เดือนปัจจุบันใช้แดงชุดเดียวกับ "วันนี้" ในตารางวัน
                      !isViewing &&
                        isCurrentMonth &&
                        "bg-status-red text-status-red-foreground font-bold",
                      !isViewing && !isCurrentMonth && "hover:bg-muted"
                    )}
                  >
                    {formatMonthShort(month, locale)}
                  </button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                setCursor(new Date(todayYear, today.getMonth(), 1))
                setPickerOpen(false)
              }}
            >
              {t("dashboard.calendarBackToToday")}
            </Button>
          </PopoverContent>
        </Popover>

        <CardAction className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            className="dashboard-featured-color-control rounded-full border-0 hover:opacity-85"
            onClick={() => shiftMonth(-1)}
            aria-label={t("common.previous")}
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="dashboard-featured-color-control rounded-full border-0 hover:opacity-85"
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
              const eventColors = [
                ...new Set(
                  entries
                    .filter((entry) => entry.kind === "event")
                    .map((entry) => entry.color)
                ),
              ]
              // วันที่มีกิจกรรมย้อมทั้งวงด้วยสีโปรเจกต์ ถ้าซ้อนกันหลายงานใช้สีแรก
              const eventColor = eventColors[0]
              const hasEvent = eventColors.length > 0
              const hasTask = entries.some((entry) => entry.kind === "task")
              const selected = key === selectedKey
              const isToday = key === todayKey
              // วันนี้ย้อมแดงทับสีโปรเจกต์ จึงไม่ต้องคำนวณสีตัวอักษรของกิจกรรม
              // ทุกสีในพาเลตผ่าน AA กับสีที่ getReadableTextColor เลือกให้
              //
              // วันที่เลือกยังคงสีโปรเจกต์ไว้ การเลือกเพิ่มแค่เส้นประทับลงไป
              // ไม่ใช่แทนที่สี ไม่งั้นพอกดแล้วจะดูเหมือนวันนั้นไม่มีกิจกรรม
              const eventTextColor =
                hasEvent && !isToday ? getReadableTextColor(eventColor) : null

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedKey(key)
                    setSelectedPage(0)
                  }}
                  aria-pressed={selected}
                  aria-label={[
                    key,
                    hasEvent ? t("dashboard.calendarEventDay") : null,
                    hasTask ? t("dashboard.calendarTaskDue") : null,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  className={cn(
                    // เส้นขอบโปร่งใสติดไว้ทุกวัน วันที่มีเส้นประจึงไม่ดันขนาดวง
                    "focus-visible:outline-ring flex aspect-square flex-col items-center justify-center gap-1 rounded-full border-2 border-transparent text-xs tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1",
                    !inMonth && !hasEvent && "text-muted-foreground/50",
                    !selected && !hasEvent && !isToday && "hover:bg-muted",
                    // วันที่เลือกที่ไม่มีกิจกรรม: วงแดงเส้นประ ตัวหนังสือแดง ไม่ถมพื้น
                    // สลับเฉดตามธีม เพราะแดงพาสเทลบนพื้นสว่างได้แค่ 1.28:1 มองไม่เห็น
                    selected &&
                      !isToday &&
                      !hasEvent &&
                      "border-status-red-foreground text-status-red-foreground dark:border-status-red dark:text-status-red border-dashed font-bold",
                    // วันที่เลือกที่มีกิจกรรม: คงพื้นสีโปรเจกต์ไว้ แล้วล้อมเส้นประแดง
                    // พื้นกิจกรรมเป็นเฉดอ่อนเหมือนกันทั้งสองธีม เส้นจึงใช้แดงเข้มค่าเดียว
                    selected &&
                      !isToday &&
                      hasEvent &&
                      "border-status-red-foreground border-dashed font-bold",
                    hasEvent && !isToday && "font-bold",
                    // วันนี้ใช้แดงเสมอ (คู่สี status red ผ่าน AA ทั้งสองธีม)
                    // ย้อมทับทั้งสีโปรเจกต์และวันที่เลือก เพื่อให้หาวันนี้เจอทันที
                    isToday &&
                      "bg-status-red text-status-red-foreground font-bold",
                    // วันนี้ที่ถูกเลือกอยู่ เติมเส้นประทับบนวงแดง
                    // พื้นเป็นแดงพาสเทลทั้งสองธีม เส้นจึงใช้แดงเข้มค่าเดียวได้เลย
                    isToday &&
                      selected &&
                      "border-status-red-foreground border-dashed"
                  )}
                  style={
                    eventTextColor
                      ? { backgroundColor: eventColor, color: eventTextColor }
                      : undefined
                  }
                >
                  <span>{day.getDate()}</span>
                  <span className="flex h-1 items-center gap-0.5">
                    {hasTask ? (
                      // บนวงสีโปรเจกต์ใช้ currentColor จุดจึงคอนทราสต์เท่าตัวเลข
                      <span
                        className={cn(
                          "size-1 rounded-full",
                          // วันนี้/วันที่เลือก ตัวเลขเป็นแดงอยู่แล้ว จุดจึงตามสีตัวเลข
                          (isToday || selected) && "bg-current",
                          !isToday &&
                            !selected &&
                            !hasEvent &&
                            "bg-foreground/70",
                          !isToday && !selected && hasEvent && "bg-current"
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

        {/* จุดต่างกันด้วยสีอย่างเดียวไม่พอ จึงมีคำกำกับเสมอ
            ฝั่งกิจกรรมโชว์หลายสีเพื่อสื่อว่าสีเปลี่ยนตามโปรเจกต์ ไม่ใช่สีตายตัว */}
        <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <li className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5" aria-hidden="true">
              {LEGEND_EVENT_COLORS.map((color) => (
                <span
                  key={color}
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </span>
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

        <div className="flex flex-col gap-2 border-t pt-3">
          <p className="text-sm font-semibold">{selectedLabel}</p>

          <div className="min-h-[8.25rem]">
            {selectedEntries.length === 0 ? (
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
                {t("dashboard.calendarNoItems")}
              </p>
            ) : (
              <ul className="divide-border divide-y overflow-x-hidden">
                {pagedEntries.map((entry) => (
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
                          entry.kind === "task" && "bg-foreground/70"
                        )}
                        style={
                          entry.kind === "event"
                            ? { backgroundColor: entry.color }
                            : undefined
                        }
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

          <div className="flex h-8 items-center justify-center gap-2">
            {totalPages > 1 ? (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSelectedPage((page) => Math.max(0, page - 1))}
                  disabled={currentPage === 0}
                  aria-label={t("dashboard.calendarPreviousPage")}
                >
                  <ChevronLeftIcon className="size-4" aria-hidden="true" />
                </Button>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {t("dashboard.calendarPage", {
                    current: currentPage + 1,
                    total: totalPages,
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setSelectedPage((page) => Math.min(totalPages - 1, page + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                  aria-label={t("dashboard.calendarNextPage")}
                >
                  <ChevronRightIcon className="size-4" aria-hidden="true" />
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
