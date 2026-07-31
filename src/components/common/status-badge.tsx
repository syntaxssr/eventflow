"use client"

import type { StatusStyle } from "@/constants/status"
import { useT } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { cn } from "@/lib/utils"

/**
 * Badge แสดงสถานะ
 *
 * ใช้ทั้งไอคอนและข้อความเสมอ เพื่อไม่ให้สีเป็นตัวสื่อความหมายเพียงอย่างเดียว
 * (WCAG 1.4.1 Use of Color)
 */
export function StatusBadge({
  style,
  size = "default",
  showIcon = true,
  className,
}: {
  style: Pick<StatusStyle, "labelKey" | "icon" | "badge">
  size?: "sm" | "default"
  showIcon?: boolean
  className?: string
}) {
  const t = useT()
  const Icon = style.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[0.6875rem]" : "px-2.5 py-1 text-xs",
        style.badge,
        className
      )}
    >
      {showIcon ? (
        <Icon
          className={cn("shrink-0", size === "sm" ? "size-3" : "size-3.5")}
          aria-hidden="true"
        />
      ) : null}
      {t(style.labelKey as TranslationKey)}
    </span>
  )
}
