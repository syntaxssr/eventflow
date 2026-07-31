"use client"

import {
  CircleCheckIcon,
  MailWarningIcon,
  TriangleAlertIcon,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { cn } from "@/lib/utils"
import type { ImportField, ImportRow } from "@/types/participant"

const FIELD_LABEL_KEY: Record<ImportField, TranslationKey> = {
  firstName: "participant.firstName",
  lastName: "participant.lastName",
  email: "participant.email",
  department: "participant.department",
  phone: "participant.phone",
  rsvpStatus: "rsvp.label",
  type: "participantType.label",
  note: "participant.note",
}

/** ขั้นที่ 3 — สรุปความพร้อมของข้อมูล + error รายแถวพร้อมระบุฟิลด์ */
export function ImportStepPreview({
  rows,
  conflictCount,
}: {
  rows: ImportRow[]
  conflictCount: number
}) {
  const { t } = useLocale()
  const errorRows = rows.filter((row) => row.errors.length > 0)
  const validRows = rows.length - errorRows.length

  return (
    <div className="space-y-4">
      <div className="space-y-1.5 text-sm">
        <p className="flex items-center gap-1.5">
          <CircleCheckIcon
            className="size-4 shrink-0 text-green-600"
            aria-hidden="true"
          />
          {t("participant.previewValid", { count: validRows })}
        </p>
        {errorRows.length > 0 ? (
          <p className="text-danger flex items-center gap-1.5" role="alert">
            <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />
            {t("participant.previewErrors", { count: errorRows.length })}
          </p>
        ) : null}
        {conflictCount > 0 ? (
          <p className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
            <MailWarningIcon className="size-4 shrink-0" aria-hidden="true" />
            {t("participant.previewConflicts", { count: conflictCount })}
          </p>
        ) : null}
      </div>

      <div className="max-h-80 overflow-auto rounded-lg border">
        <Table>
          <caption className="sr-only">{t("participant.stepPreview")}</caption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>{t("participant.name")}</TableHead>
              <TableHead>{t("participant.email")}</TableHead>
              <TableHead>{t("participant.department")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.rowNumber}
                className={cn(
                  row.errors.length > 0 &&
                    "bg-red-50/60 hover:bg-red-50 dark:bg-red-500/10 dark:hover:bg-red-500/15"
                )}
                data-testid={
                  row.errors.length > 0 ? "preview-row-error" : "preview-row"
                }
              >
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {t("participant.rowNumber", { row: row.rowNumber })}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {`${row.values.firstName} ${row.values.lastName}`.trim() || "—"}
                </TableCell>
                <TableCell className="text-sm">
                  <span className="block">{row.values.email || "—"}</span>
                  {row.errors.length > 0 ? (
                    <span className="text-danger mt-0.5 block text-xs">
                      {row.errors
                        .map(
                          (error) =>
                            `${t(FIELD_LABEL_KEY[error.field])}: ${t(error.messageKey as TranslationKey)}`
                        )
                        .join(" · ")}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {row.values.department || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
