import type { LucideIcon } from "lucide-react"
import { InboxIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * สถานะ "ยังไม่มีข้อมูล"
 * ต้องมีไอคอน คำอธิบาย และปุ่มที่กดใช้งานได้จริงเสมอ
 */
export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon?: LucideIcon
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <div
      data-testid="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        compact ? "py-8" : "py-14",
        className
      )}
    >
      <div
        className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full"
        aria-hidden="true"
      >
        <Icon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        {description ? (
          <p className="text-muted-foreground mx-auto max-w-sm text-sm text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
