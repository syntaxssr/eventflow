"use client"

import * as React from "react"
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GitCompareIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  PARTICIPANT_TYPE_STYLE,
  RSVP_STATUS_STYLE,
} from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { cn } from "@/lib/utils"
import type {
  ConflictChoice,
  ImportConflict,
  ImportField,
  Participant,
} from "@/types/participant"
import { IMPORT_FIELDS } from "@/types/participant"

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

/** ขั้นที่ 4 — เทียบข้อมูลเดิม/ใหม่ทีละรายการ เลือกได้ทั้งชุดเท่านั้น */
export function ImportStepConflict({
  conflicts,
  onChoice,
  onApplyToAll,
}: {
  conflicts: ImportConflict[]
  onChoice: (index: number, choice: ConflictChoice) => void
  onApplyToAll: (choice: ConflictChoice) => void
}) {
  const { t } = useLocale()
  const [index, setIndex] = React.useState(0)

  const conflict = conflicts[Math.min(index, conflicts.length - 1)]
  if (!conflict) return null

  const remaining = conflicts.filter((entry) => entry.choice === null).length

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <GitCompareIcon className="size-4 shrink-0" aria-hidden="true" />
          {t("participant.conflictTitle")} ·{" "}
          <span data-testid="conflict-progress">
            {t("participant.conflictProgress", {
              current: index + 1,
              total: conflicts.length,
            })}
          </span>
        </p>
        <p className="text-muted-foreground text-xs">
          {t("participant.conflictHint")}
        </p>
        {remaining > 0 ? (
          <p className="text-foreground text-xs" aria-live="polite">
            {t("participant.conflictRemaining", { count: remaining })}
          </p>
        ) : null}
      </div>

      {/* ซ้าย–ขวาบนจอใหญ่ / บน–ล่างบนมือถือ พร้อม label กำกับชัดเจน */}
      <div className="grid gap-3 sm:grid-cols-2">
        <ConflictPanel
          titleKey="participant.existingData"
          choiceLabelKey="participant.keepExisting"
          data={conflict.existing}
          differentFields={conflict.differentFields}
          selected={conflict.choice === "keep_existing"}
          onSelect={() => onChoice(index, "keep_existing")}
          testId="choose-existing"
        />
        <ConflictPanel
          titleKey="participant.incomingData"
          choiceLabelKey="participant.useNew"
          data={conflict.incoming}
          differentFields={conflict.differentFields}
          selected={conflict.choice === "use_new"}
          onSelect={() => onChoice(index, "use_new")}
          testId="choose-new"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIndex((current) => Math.max(current - 1, 0))}
            disabled={index === 0}
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
            {t("common.previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setIndex((current) => Math.min(current + 1, conflicts.length - 1))
            }
            disabled={index >= conflicts.length - 1}
            data-testid="next-conflict"
          >
            {t("common.next")}
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {conflict.choice ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onApplyToAll(conflict.choice!)}
            data-testid="apply-to-all"
          >
            {t("participant.applyToAll")}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function ConflictPanel({
  titleKey,
  choiceLabelKey,
  data,
  differentFields,
  selected,
  onSelect,
  testId,
}: {
  titleKey: TranslationKey
  choiceLabelKey: TranslationKey
  data: Omit<Participant, "id" | "eventId"> | Participant
  differentFields: ImportField[]
  selected: boolean
  onSelect: () => void
  testId: string
}) {
  const { t, tl } = useLocale()

  const valueOf = (field: ImportField): string => {
    switch (field) {
      case "email":
        return data.email
      case "phone":
        return data.phone
      case "rsvpStatus":
        return t(RSVP_STATUS_STYLE[data.rsvpStatus].labelKey as TranslationKey)
      case "type":
        return t(PARTICIPANT_TYPE_STYLE[data.type].labelKey as TranslationKey)
      case "firstName":
        return tl(data.firstName)
      case "lastName":
        return tl(data.lastName)
      case "department":
        return tl(data.department)
      case "note":
        return tl(data.note)
    }
  }

  return (
    <section
      className={cn(
        "rounded-lg border p-3",
        selected && "border-brand-500 ring-brand-500/30 ring-2"
      )}
      aria-label={t(titleKey)}
    >
      <h3 className="mb-2 text-sm font-semibold">{t(titleKey)}</h3>

      <dl className="space-y-1.5">
        {IMPORT_FIELDS.map((field) => {
          const isDifferent = differentFields.includes(field)
          return (
            <div
              key={field}
              className={cn(
                "grid grid-cols-[7rem_1fr] gap-2 rounded px-1.5 py-0.5 text-sm",
                isDifferent && "bg-warning/20 dark:bg-warning/25"
              )}
            >
              <dt className="text-muted-foreground text-xs leading-5">
                {t(FIELD_LABEL_KEY[field])}
              </dt>
              <dd className="min-w-0 break-words">
                {valueOf(field) || "—"}
                {isDifferent ? (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-warning/30 px-1.5 py-0.5 text-[0.625rem] font-medium text-foreground dark:bg-warning/35">
                    <GitCompareIcon className="size-2.5" aria-hidden="true" />
                    {t("participant.differentBadge")}
                  </span>
                ) : null}
              </dd>
            </div>
          )
        })}
      </dl>

      <Button
        className="mt-3 w-full"
        variant={selected ? "default" : "outline"}
        onClick={onSelect}
        aria-pressed={selected}
        data-testid={testId}
      >
        {selected ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
        {t(choiceLabelKey)}
      </Button>
    </section>
  )
}
