"use client"

import Link from "next/link"
import { CompassIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"

export default function NotFound() {
  const t = useT()

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div
        className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full"
        aria-hidden="true"
      >
        <CompassIcon className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("state.notFoundTitle")}</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          {t("state.notFoundDescription")}
        </p>
      </div>
      <Button asChild>
        <Link href={ROUTES.dashboard}>{t("state.backToDashboard")}</Link>
      </Button>
    </main>
  )
}
