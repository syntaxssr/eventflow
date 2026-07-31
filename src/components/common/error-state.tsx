"use client"

import Link from "next/link"
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * สถานะผิดพลาด — ใช้ข้อความที่ผู้ใช้ทั่วไปเข้าใจ
 * ไม่แสดงรายละเอียดทางเทคนิค และมีทั้งปุ่มลองใหม่กับทางออกกลับหน้าหลัก
 */
export function ErrorState({
  onRetry,
  className,
  compact = false,
}: {
  onRetry?: () => void
  className?: string
  compact?: boolean
}) {
  const t = useT()

  return (
    <div
      role="alert"
      data-testid="error-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        compact ? "py-8" : "py-14",
        className
      )}
    >
      <div
        className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full"
        aria-hidden="true"
      >
        <TriangleAlertIcon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">{t("state.errorTitle")}</p>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm text-pretty">
          {t("state.errorDescription")}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button onClick={onRetry}>
            <RotateCcwIcon className="size-4" aria-hidden="true" />
            {t("common.retry")}
          </Button>
        ) : null}
        <Button variant="outline" asChild>
          <Link href={ROUTES.dashboard}>{t("state.backToDashboard")}</Link>
        </Button>
      </div>
    </div>
  )
}
