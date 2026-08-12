"use client"

import * as React from "react"
import { CalendarDaysIcon } from "lucide-react"
import { th } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { fromDateKey, toDateKey } from "@/constants/mock-date"
import { useLocale } from "@/i18n"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Date picker มาตรฐานสำหรับวันที่เดี่ยว ใช้ร่วมกันทุกฟอร์มและตัวกรอง */
export function DatePickerField({
  label,
  value,
  onChange,
  disabled = false,
  min,
  max,
  size = "default",
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  min?: string
  max?: string
  size?: "default" | "sm"
  className?: string
}) {
  const { locale } = useLocale()
  const [open, setOpen] = React.useState(false)

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
          <CalendarDaysIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {value ? formatDate(value, locale) : label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value ? fromDateKey(value) : undefined}
          onSelect={(date) => {
            if (!date) return
            onChange(toDateKey(date))
            setOpen(false)
          }}
          disabled={(date) => {
            const key = toDateKey(date)
            return Boolean((min && key < min) || (max && key > max))
          }}
          locale={locale === "th" ? th : undefined}
          defaultMonth={value ? fromDateKey(value) : undefined}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  )
}
