"use client"

import * as React from "react"
import { ClockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLocale } from "@/i18n"
import { cn } from "@/lib/utils"

const STEP_MINUTES = 15

function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number)
  return (hour || 0) * 60 + (minute || 0)
}

function toTime(minutes: number): string {
  const hour = Math.floor(minutes / 60) % 24
  const minute = minutes % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

/**
 * รายการเวลาทุก 15 นาทีตลอดวัน + เวลาปัจจุบันของฟิลด์ถ้าไม่ลงล็อกกับช่วง 15 นาที
 * (ข้อมูลเดิมอาจเป็น 16:10) จะได้ไม่มีเวลาที่เลือกไว้แล้วแต่หาในรายการไม่เจอ
 */
function buildOptions(value: string): string[] {
  const options: string[] = []
  for (let minutes = 0; minutes < 24 * 60; minutes += STEP_MINUTES) {
    options.push(toTime(minutes))
  }
  if (value && !options.includes(value)) {
    options.push(value)
    options.sort((a, b) => toMinutes(a) - toMinutes(b))
  }
  return options
}

/** "1 ชม. 30 นาที" / "1 hr 30 min" — ใช้บอกความยาวจากเวลาเริ่ม */
function formatDuration(minutes: number, locale: "th" | "en"): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const hourLabel = locale === "th" ? "ชม." : "hr"
  const minuteLabel = locale === "th" ? "นาที" : "min"
  if (hours === 0) return `${rest} ${minuteLabel}`
  if (rest === 0) return `${hours} ${hourLabel}`
  return `${hours} ${hourLabel} ${rest} ${minuteLabel}`
}

/**
 * ตัวเลือกเวลามาตรฐาน ใช้คู่กับ `DatePickerField` ในฟอร์มเดียวกัน
 *
 * เป็นรายการเวลาให้เลือกแทน `input[type="time"]` ของเบราว์เซอร์ เพราะช่องนั้น
 * ต้องพิมพ์ทีละช่อง ชั่วโมง/นาที และหน้าตาต่างกันไปในแต่ละเบราว์เซอร์
 *
 * ส่ง `min` มาเมื่อเวลานี้ต้องมาหลังอีกเวลาหนึ่ง (เช่นเวลาสิ้นสุดของวันเดียวกัน)
 * รายการจะเหลือเฉพาะเวลาที่เลือกได้จริงพร้อมบอกความยาวของช่วงให้เห็นทันที
 */
export function TimePickerField({
  label,
  value,
  onChange,
  disabled = false,
  min,
  size = "default",
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** เวลาที่ต้องมาก่อนค่านี้ เช่นเวลาเริ่มของกิจกรรมวันเดียวกัน */
  min?: string
  size?: "default" | "sm"
  className?: string
}) {
  const { t, locale } = useLocale()
  const [open, setOpen] = React.useState(false)
  const selectedRef = React.useRef<HTMLButtonElement>(null)
  const listRef = React.useRef<HTMLDivElement | null>(null)

  const minMinutes = min ? toMinutes(min) : null
  const options = React.useMemo(() => {
    const all = buildOptions(value)
    if (minMinutes === null) return all
    // ค่าที่เลือกไว้เดิมอาจตกขอบไปแล้ว (ผู้ใช้เลื่อนเวลาเริ่มมาทีหลัง)
    // ตัดออกจากรายการเลย เหลือไว้ให้ zod เตือนตอนบันทึกแทน
    return all.filter((option) => toMinutes(option) > minMinutes)
  }, [value, minMinutes])

  /**
   * เลื่อนรายการด้วยล้อเมาส์เอง
   *
   * ป๊อปโอเวอร์นี้ใช้ในกล่องโต้ตอบเป็นหลัก ซึ่ง Radix ล็อก scroll ทั้งหน้าไว้
   * (react-remove-scroll) ล้อเมาส์เลยไม่มีผลกับรายการที่อยู่คนละ portal
   * จึงต้องขยับ `scrollTop` เอง และต้องผูก listener แบบ non-passive
   * เพราะ `onWheel` ของ React เป็น passive จะเรียก preventDefault ไม่ได้
   *
   * ผูกผ่าน ref callback ไม่ใช่ useEffect เพราะเนื้อในป๊อปโอเวอร์ mount ทีหลัง
   * ตอน effect ของ `open` ทำงาน ref ยังว่างอยู่
   */
  const setListRef = React.useCallback((node: HTMLDivElement | null) => {
    listRef.current = node
    if (!node) return

    const handleWheel = (event: WheelEvent) => {
      const before = node.scrollTop
      node.scrollTop += event.deltaY
      // กันไม่ให้เลื่อนซ้อนสองเท่าในหน้าที่ scroll ได้ตามปกติ
      if (node.scrollTop !== before) event.preventDefault()
    }

    node.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      listRef.current = null
      node.removeEventListener("wheel", handleWheel)
    }
  }, [])

  /** ลูกศรขึ้น–ลงเลื่อนทีละรายการ ไม่ต้องกด Tab ผ่านทีละ 96 ปุ่ม */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"]
    if (!keys.includes(event.key)) return
    const items = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ??
        []
    )
    if (items.length === 0) return
    event.preventDefault()

    const current = items.indexOf(document.activeElement as HTMLButtonElement)
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowDown"
            ? Math.min(current + 1, items.length - 1)
            : Math.max(current - 1, 0)

    // ยังไม่ได้โฟกัสรายการไหน ให้เริ่มจากเวลาที่เลือกไว้
    const fallback = items.indexOf(selectedRef.current as HTMLButtonElement)
    items[current === -1 ? Math.max(fallback, 0) : next]?.focus()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={size}
          className={cn(
            "w-full justify-start font-normal",
            !value &&
              "border-status-gray bg-status-default text-status-default-foreground",
            className
          )}
          disabled={disabled}
          aria-label={label}
        >
          <ClockIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {value ? `${value}${locale === "th" ? " น." : ""}` : label}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-40 gap-0 p-1"
        /* ปกติ Radix โฟกัสรายการแรก (00:00) ทำให้ลูกศรเริ่มนับจากเที่ยงคืน
           ที่นี่ย้ายโฟกัสไปที่เวลาที่เลือกไว้ ทั้งเห็นทันทีและกดลูกศรต่อได้เลย */
        onOpenAutoFocus={(event) => {
          const target = selectedRef.current ?? listRef.current
          if (!target) return
          event.preventDefault()
          target.focus({ preventScroll: true })
          selectedRef.current?.scrollIntoView({ block: "center" })
        }}
      >
        <div
          ref={setListRef}
          role="listbox"
          aria-label={label}
          onKeyDown={handleKeyDown}
          className="max-h-64 overflow-y-auto overscroll-contain"
        >
          {options.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-xs">
              {t("event.noTimeOption")}
            </p>
          ) : (
            options.map((option) => {
              const selected = option === value
              return (
                <button
                  key={option}
                  ref={selected ? selectedRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                  className={cn(
                    "hover:bg-accent focus-visible:outline-ring flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm tabular-nums focus-visible:outline-2 focus-visible:-outline-offset-2",
                    selected &&
                      "bg-primary text-primary-foreground hover:bg-primary font-semibold"
                  )}
                >
                  <span>{option}</span>
                  {minMinutes !== null &&
                  toMinutes(option) > minMinutes ? (
                    <span
                      className={cn(
                        "text-xs",
                        selected
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatDuration(toMinutes(option) - minMinutes, locale)}
                    </span>
                  ) : null}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
