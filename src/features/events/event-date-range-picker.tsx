"use client"

import * as React from "react"
import { CalendarDaysIcon } from "lucide-react"
import { th } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { fromDateKey, toDateKey } from "@/constants/mock-date"
import { useLocale } from "@/i18n"
import { formatDate } from "@/lib/format"

/** ตัวเลือกวันเริ่มและวันสิ้นสุดของหน้ากิจกรรม */
export function EventDateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}) {
  const { t, locale } = useLocale()
  const [openPicker, setOpenPicker] = React.useState<"from" | "to" | null>(
    null
  )

  const fields = [
    {
      key: "from" as const,
      label: t("event.startDate"),
      value: from,
      onChange: onFromChange,
    },
    {
      key: "to" as const,
      label: t("event.endDate"),
      value: to,
      onChange: onToChange,
    },
  ]

  return (
    <div className="flex items-end gap-2">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1">
          <span className="text-muted-foreground pl-1 text-xs font-medium">
            {field.label}
          </span>
          <Popover
            open={openPicker === field.key}
            onOpenChange={(open) => setOpenPicker(open ? field.key : null)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-44 justify-start font-normal"
                aria-label={field.label}
              >
                <CalendarDaysIcon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {field.value ? formatDate(field.value, locale) : field.label}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value ? fromDateKey(field.value) : undefined}
                onSelect={(date) => {
                  if (!date) return
                  field.onChange(toDateKey(date))
                  setOpenPicker(null)
                }}
                locale={locale === "th" ? th : undefined}
                defaultMonth={field.value ? fromDateKey(field.value) : undefined}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>
      ))}
    </div>
  )
}
