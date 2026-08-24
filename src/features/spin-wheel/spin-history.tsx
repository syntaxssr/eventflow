"use client"

import { HistoryIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DESTRUCTIVE_ACTION_CLASS } from "@/constants/status"
import { useLocale } from "@/i18n"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { SpinRecord } from "./winner-dialog"
import styles from "./spin-wheel.module.css"

/** ประวัติการหมุน — รอบล่าสุดอยู่บนสุด */
export function SpinHistory({
  records,
  onClear,
  disabled = false,
}: {
  records: SpinRecord[]
  onClear: () => void
  disabled?: boolean
}) {
  const { t, locale } = useLocale()
  const latestFirst = [...records].reverse()

  return (
    <Card
      size="sm"
      className={cn(styles.controlCard, "border-0 text-white ring-0")}
    >
      <CardHeader>
        <CardTitle className="text-white">{t("spinWheel.history")}</CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={disabled || records.length === 0}
            className={cn(
              DESTRUCTIVE_ACTION_CLASS,
              "text-rose-300 hover:bg-rose-400/15 hover:text-rose-200"
            )}
            data-testid="clear-history"
          >
            <Trash2Icon className="size-3.5" aria-hidden="true" />
            {t("spinWheel.clearHistory")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-violet-100/65">
            <HistoryIcon className="size-4 shrink-0" aria-hidden="true" />
            {t("spinWheel.historyEmpty")}
          </p>
        ) : (
          <ol
            aria-label={t("spinWheel.history")}
            className="max-h-72 space-y-1 overflow-y-auto"
            data-testid="spin-history"
          >
            {latestFirst.map((record) => (
              <li
                key={record.round}
                className="flex items-start gap-3 rounded-lg border border-white/12 bg-white/7 px-3 py-2"
              >
                <span className="shrink-0 rounded-full bg-cyan-300/15 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-cyan-100">
                  {t("spinWheel.round", { round: record.round })}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{record.label}</p>
                  {record.prize ? (
                    <p className="truncate text-xs text-violet-100/65">
                      {t("spinWheel.winnerPrize", { prize: record.prize })}
                    </p>
                  ) : null}
                  <p className="text-xs text-violet-100/55">
                    {formatDateTime(record.at, locale)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
