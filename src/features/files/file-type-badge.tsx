import { FILE_TYPE_STYLE } from "@/constants/file-type"
import { cn } from "@/lib/utils"
import type { FileType } from "@/types/file"

/**
 * ป้ายประเภทไฟล์ในคอลัมน์ "ประเภทไฟล์" (หน้าไฟล์แบบรายการ และถังขยะ)
 *
 * ใช้คู่สีเดียวกับช่องไอคอนของประเภทนั้น (เฉด Version 3) คอลัมน์นี้จึงกวาดตาหา
 * ชนิดไฟล์ได้เร็วเท่ากับมุมมองแบบการ์ด
 */
export function FileTypeBadge({
  type,
  className,
}: {
  type: FileType
  className?: string
}) {
  const style = FILE_TYPE_STYLE[type]
  const Icon = style.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        style.tile,
        className
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {style.label}
    </span>
  )
}
