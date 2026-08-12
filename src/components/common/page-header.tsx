import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** หัวหน้าเพจมาตรฐาน — ใช้ทุกหน้าในระบบเพื่อให้จังหวะเลย์เอาต์สม่ำเสมอ */
export function PageHeader({
  visual,
  title,
  description,
  actions,
  className,
}: {
  visual?: ReactNode
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
      <div
        className={cn(
          "min-w-0",
          visual
            ? "grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1"
            : "space-y-1"
        )}
      >
        {visual ? (
          <span className="row-span-2 flex aspect-square min-h-14 items-center justify-center self-stretch">
            {visual}
          </span>
        ) : null}
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
    <div
      className={cn(
        "space-y-6 px-4 pt-5 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8",
        className
      )}
    >
      {children}
    </div>
  )
}
