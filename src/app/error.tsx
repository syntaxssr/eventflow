"use client"

import * as React from "react"
import Link from "next/link"
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useT()

  React.useEffect(() => {
    // เก็บรายละเอียดไว้ใน console สำหรับผู้พัฒนา แต่ไม่แสดงให้ผู้ใช้ทั่วไปเห็น
    console.error(error)
  }, [error])

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div
        className="bg-destructive/10 text-destructive flex size-16 items-center justify-center rounded-full"
        aria-hidden="true"
      >
        <TriangleAlertIcon className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("state.errorTitle")}</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          {t("state.errorDescription")}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset}>
          <RotateCcwIcon className="size-4" aria-hidden="true" />
          {t("common.retry")}
        </Button>
        <Button variant="outline" asChild>
          <Link href={ROUTES.dashboard}>{t("state.backToDashboard")}</Link>
        </Button>
      </div>
    </main>
  )
}
