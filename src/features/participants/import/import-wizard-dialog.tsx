"use client"

import * as React from "react"
import { CheckIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocale } from "@/i18n"
import type { SheetData } from "@/lib/excel"
import {
  buildConflicts,
  buildImportSummary,
  detectDuplicateEmails,
  guessColumnMapping,
  parseImportRows,
  resolveConflicts,
} from "@/lib/import"
import { cn } from "@/lib/utils"
import {
  REQUIRED_IMPORT_FIELDS,
  type ColumnMapping,
  type ConflictChoice,
  type ImportConflict,
  type ImportRow,
  type Participant,
} from "@/types/participant"
import { useParticipantActions } from "../use-participant-actions"
import { ImportStepConflict } from "./step-conflict"
import { ImportStepMapping } from "./step-mapping"
import { ImportStepPreview } from "./step-preview"
import { ImportStepSummary } from "./step-summary"
import { ImportStepUpload } from "./step-upload"

const STEP_KEYS = [
  "participant.stepUpload",
  "participant.stepMapping",
  "participant.stepPreview",
  "participant.stepConflict",
  "participant.stepSummary",
] as const

/**
 * Import Wizard 5 ขั้น: Upload → Mapping → Preview → Conflict → Summary
 * ถ้าไม่มีอีเมลซ้ำ ระบบข้ามขั้น Conflict ให้อัตโนมัติ
 */
export function ImportWizardDialog({
  open,
  onOpenChange,
  eventId,
  existingParticipants,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  existingParticipants: Participant[]
}) {
  const { t } = useLocale()
  const actions = useParticipantActions()

  const [step, setStep] = React.useState(0)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [sheet, setSheet] = React.useState<SheetData | null>(null)
  const [mapping, setMapping] = React.useState<ColumnMapping>({})
  const [rows, setRows] = React.useState<ImportRow[]>([])
  const [conflicts, setConflicts] = React.useState<ImportConflict[]>([])
  const [busy, setBusy] = React.useState(false)

  const reset = () => {
    setStep(0)
    setFileName(null)
    setSheet(null)
    setMapping({})
    setRows([])
    setConflicts([])
    setBusy(false)
  }

  const close = (nextOpen: boolean) => {
    if (busy) return
    onOpenChange(nextOpen)
    if (!nextOpen) reset()
  }

  const missingRequired = REQUIRED_IMPORT_FIELDS.filter(
    (field) => !mapping[field]
  )
  const unresolvedConflicts = conflicts.filter(
    (conflict) => conflict.choice === null
  ).length

  const onFileLoaded = (name: string, data: SheetData) => {
    setFileName(name)
    setSheet(data)
    setMapping(guessColumnMapping(data.headers))
  }

  /** คำนวณแถวและ conflict ใหม่จาก mapping ปัจจุบัน (เรียกตอนออกจากขั้น Mapping) */
  const computeRows = () => {
    if (!sheet) return
    const parsed = detectDuplicateEmails(
      parseImportRows(sheet.rows, mapping),
      existingParticipants
    )
    setRows(parsed)
    setConflicts(buildConflicts(parsed, existingParticipants))
  }

  const goNext = () => {
    if (step === 1) {
      computeRows()
      setStep(2)
      return
    }
    if (step === 2) {
      // ไม่มีอีเมลซ้ำ → ข้ามขั้น Conflict
      setStep(conflicts.length > 0 ? 3 : 4)
      return
    }
    setStep((current) => Math.min(current + 1, 4))
  }

  const goBack = () => {
    if (step === 4) {
      setStep(conflicts.length > 0 ? 3 : 2)
      return
    }
    setStep((current) => Math.max(current - 1, 0))
  }

  const setConflictChoice = (index: number, choice: ConflictChoice) => {
    setConflicts((current) =>
      current.map((conflict, i) =>
        i === index ? { ...conflict, choice } : conflict
      )
    )
  }

  const confirmImport = async () => {
    setBusy(true)
    const ok = await actions.importParticipants(
      eventId,
      resolveConflicts(rows, conflicts),
      conflicts
    )
    setBusy(false)
    if (ok) {
      onOpenChange(false)
      reset()
    }
  }

  const nextDisabled =
    (step === 0 && (!sheet || sheet.rows.length === 0)) ||
    (step === 1 && missingRequired.length > 0) ||
    (step === 2 && rows.length === 0) ||
    (step === 3 && unresolvedConflicts > 0)

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex max-h-[92dvh] flex-col gap-4 overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("participant.importTitle")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("participant.stepAnnounce", {
              current: step + 1,
              total: STEP_KEYS.length,
              step: t(STEP_KEYS[step]),
            })}
          </DialogDescription>
        </DialogHeader>

        <StepIndicator step={step} skippedConflict={step === 4 && conflicts.length === 0} />

        <p className="sr-only" aria-live="polite">
          {t("participant.stepAnnounce", {
            current: step + 1,
            total: STEP_KEYS.length,
            step: t(STEP_KEYS[step]),
          })}
        </p>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {step === 0 ? (
            <ImportStepUpload fileName={fileName} onFileLoaded={onFileLoaded} />
          ) : null}
          {step === 1 && sheet ? (
            <ImportStepMapping
              headers={sheet.headers}
              mapping={mapping}
              onChange={setMapping}
              missingRequired={missingRequired}
            />
          ) : null}
          {step === 2 ? (
            <ImportStepPreview rows={rows} conflictCount={conflicts.length} />
          ) : null}
          {step === 3 ? (
            <ImportStepConflict
              conflicts={conflicts}
              onChoice={setConflictChoice}
              onApplyToAll={(choice) =>
                setConflicts((current) =>
                  current.map((conflict) => ({ ...conflict, choice }))
                )
              }
            />
          ) : null}
          {step === 4 ? (
            <ImportStepSummary summary={buildImportSummary(rows, conflicts)} />
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t pt-3">
          <Button
            variant="outline"
            onClick={() => (step === 0 ? close(false) : goBack())}
            disabled={busy}
          >
            {step === 0 ? t("common.cancel") : t("common.back")}
          </Button>

          {step < 4 ? (
            <Button
              onClick={goNext}
              disabled={nextDisabled}
              data-testid="wizard-next"
            >
              {t("common.next")}
            </Button>
          ) : (
            <Button
              onClick={confirmImport}
              disabled={busy}
              data-testid="wizard-confirm"
            >
              {busy ? (
                <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckIcon className="size-4" aria-hidden="true" />
              )}
              {busy
                ? t("participant.importing")
                : t("participant.confirmImport")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** แถบแสดงขั้นตอน — ย่อเหลือตัวเลขบนจอเล็ก */
function StepIndicator({
  step,
  skippedConflict,
}: {
  step: number
  skippedConflict: boolean
}) {
  const { t } = useLocale()

  return (
    <ol className="flex items-center gap-1 overflow-x-auto text-xs sm:gap-2">
      {STEP_KEYS.map((key, index) => {
        const isCurrent = index === step
        const isDone =
          index < step || (skippedConflict && index === 3)
        return (
          <li
            key={key}
            aria-current={isCurrent ? "step" : undefined}
            className="flex shrink-0 items-center gap-1 sm:gap-2"
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border text-[0.6875rem] font-semibold",
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground"
                  : isDone
                    ? "border-brand-300 bg-brand-50 text-brand-900 dark:bg-brand-500/15 dark:text-brand-300"
                    : "text-muted-foreground"
              )}
              aria-hidden="true"
            >
              {isDone && !isCurrent ? <CheckIcon className="size-3" /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden whitespace-nowrap sm:inline",
                isCurrent ? "font-semibold" : "text-muted-foreground"
              )}
            >
              {t(key)}
            </span>
            {index < STEP_KEYS.length - 1 ? (
              <span className="bg-border h-px w-3 sm:w-6" aria-hidden="true" />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
