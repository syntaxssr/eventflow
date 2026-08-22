"use client"

import { Trash2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/i18n"

/** แถบเครื่องมือเมื่อเลือกหลายรายการ — ลบเป็นชุดหรือยกเลิกการเลือก */
export function EmployeeBulkBar({
  count,
  onDelete,
  onClear,
}: {
  count: number
  onDelete: () => void
  onClear: () => void
}) {
  const { t } = useLocale()
  if (count === 0) return null

  return (
    <div
      className="bg-brand-50 border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/30 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
      role="toolbar"
      aria-label={t("employee.selectedCount", { count })}
      data-testid="employee-bulk-bar"
    >
      <span className="text-sm font-medium">
        {t("employee.selectedCount", { count })}
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-foreground"
          onClick={onDelete}
          data-testid="bulk-delete-employees"
        >
          <Trash2Icon className="size-4" aria-hidden="true" />
          {t("employee.bulkDelete")}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          aria-label={t("employee.clearSelection")}
        >
          <XIcon className="size-4" aria-hidden="true" />
          {t("employee.clearSelection")}
        </Button>
      </div>
    </div>
  )
}
