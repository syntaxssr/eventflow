"use client"

import {
  CircleCheckIcon,
  PencilIcon,
  SkipForwardIcon,
  TriangleAlertIcon,
  UserPlusIcon,
  type LucideIcon,
} from "lucide-react"

import { useLocale } from "@/i18n"
import { cn } from "@/lib/utils"
import type { ImportSummary } from "@/types/participant"

/** ขั้นที่ 5 — สรุปผลก่อนยืนยันการนำเข้า */
export function ImportStepSummary({ summary }: { summary: ImportSummary }) {
  const { t } = useLocale()

  const items: {
    key: string
    label: string
    value: number
    icon: LucideIcon
    tone: string
  }[] = [
    {
      key: "total",
      label: t("participant.summaryTotalRows"),
      value: summary.totalRows,
      icon: CircleCheckIcon,
      tone: "bg-muted text-foreground",
    },
    {
      key: "create",
      label: t("participant.summaryCreate"),
      value: summary.toCreate,
      icon: UserPlusIcon,
      tone: "bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    },
    {
      key: "update",
      label: t("participant.summaryUpdate"),
      value: summary.toUpdate,
      icon: PencilIcon,
      tone: "bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    },
    {
      key: "skip",
      label: t("participant.summarySkip"),
      value: summary.toSkip,
      icon: SkipForwardIcon,
      tone: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    },
    {
      key: "error",
      label: t("participant.summaryError"),
      value: summary.errorRows,
      icon: TriangleAlertIcon,
      tone: "bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        {t("participant.summaryHint")}
      </p>

      <dl
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        data-testid="import-summary"
      >
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.key} className="rounded-lg border p-3">
              <dt className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-md",
                    item.tone
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="text-muted-foreground text-xs">
                  {item.label}
                </span>
              </dt>
              <dd
                className="mt-1.5 text-2xl font-bold tabular-nums"
                data-testid={`summary-${item.key}`}
              >
                {item.value}
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
