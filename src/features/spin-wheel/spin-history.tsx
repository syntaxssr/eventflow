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
import type { SpinRecord } from "./winner-dialog"

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
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("spinWheel.history")}</CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={disabled || records.length === 0}
            className={DESTRUCTIVE_ACTION_CLASS}
            data-testid="clear-history"
          >
            <Trash2Icon className="size-3.5" aria-hidden="true" />
            {t("spinWheel.clearHistory")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
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
                className="flex items-start gap-3 rounded-md border px-3 py-2"
              >
                <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                  {t("spinWheel.round", { round: record.round })}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{record.label}</p>
                  {record.prize ? (
                    <p className="text-muted-foreground truncate text-xs">
                      {t("spinWheel.winnerPrize", { prize: record.prize })}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground text-xs">
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
