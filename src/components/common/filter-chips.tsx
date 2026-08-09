"use client"

import { XIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { useT } from "@/i18n"
import { cn } from "@/lib/utils"

export interface FilterChip {
  key: string
  label: string
  icon?: ReactNode
  className?: string
  onRemove: () => void
}

/**
 * แสดงตัวกรองที่กำลังใช้งานเป็น Chip พร้อมปุ่มล้างทั้งหมด
 * ทำให้ผู้ใช้รู้เสมอว่ารายการที่เห็นถูกกรองด้วยอะไรอยู่
 */
export function FilterChips({
  chips,
  onClearAll,
}: {
  chips: FilterChip[]
  onClearAll: () => void
}) {
  if (chips.length === 0) return null

  return <FilterChipList chips={chips} onClearAll={onClearAll} />
}

function FilterChipList({
  chips,
  onClearAll,
}: {
  chips: FilterChip[]
  onClearAll: () => void
}) {
  const t = useT()

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="filter-chips">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border py-1 pr-1 pl-2.5 text-xs font-medium",
            chip.className ?? "border-transparent bg-muted"
          )}
        >
          {chip.icon}
          {chip.label}
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-full"
            onClick={chip.onRemove}
            aria-label={`${t("common.remove")}: ${chip.label}`}
          >
            <XIcon className="size-3" aria-hidden="true" />
          </Button>
        </span>
      ))}

      <Button variant="ghost" size="xs" onClick={onClearAll}>
        {t("common.clearAll")}
      </Button>
    </div>
  )
}
