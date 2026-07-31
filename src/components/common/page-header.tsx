import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** หัวหน้าเพจมาตรฐาน — ใช้ทุกหน้าในระบบเพื่อให้จังหวะเลย์เอาต์สม่ำเสมอ */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b pb-4",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted-foreground text-sm text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

/** กรอบเนื้อหาหลักของแต่ละหน้า */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-6 p-4 sm:p-6 lg:p-8", className)}>
      {children}
    </div>
  )
}
