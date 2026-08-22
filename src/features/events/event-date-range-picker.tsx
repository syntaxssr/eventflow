"use client"

import { DatePickerField } from "@/components/common/date-picker-field"
import { FILTER_TRIGGER_CLASS } from "@/constants/status"
import { useLocale } from "@/i18n"
import { cn } from "@/lib/utils"

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
  const { t } = useLocale()

  const fields = [
    {
      key: "from" as const,
      label: t("event.startDate"),
      value: from,
      onChange: onFromChange,
      max: to || undefined,
    },
    {
      key: "to" as const,
      label: t("event.endDate"),
      value: to,
      onChange: onToChange,
      min: from || undefined,
    },
  ]

  return (
    <div className="flex items-end gap-2">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1">
          <span className="text-muted-foreground pl-1 text-xs font-medium">
            {field.label}
          </span>
          <DatePickerField
            label={field.label}
            value={field.value}
            onChange={field.onChange}
            min={"min" in field ? field.min : undefined}
            max={"max" in field ? field.max : undefined}
            size="sm"
            className={cn("w-44", FILTER_TRIGGER_CLASS)}
          />
        </div>
      ))}
    </div>
  )
}
