"use client"

import { TriangleAlertIcon } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import {
  IMPORT_FIELDS,
  REQUIRED_IMPORT_FIELDS,
  type ColumnMapping,
  type ImportField,
} from "@/types/participant"

const IGNORE = "__ignore__"

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

/** ขั้นที่ 2 — จับคู่คอลัมน์ในไฟล์กับฟิลด์ของระบบ */
export function ImportStepMapping({
  headers,
  mapping,
  onChange,
  missingRequired,
}: {
  headers: string[]
  mapping: ColumnMapping
  onChange: (mapping: ColumnMapping) => void
  missingRequired: ImportField[]
}) {
  const { t } = useLocale()

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        {t("participant.mappingHint")}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {IMPORT_FIELDS.map((field) => {
          const required = REQUIRED_IMPORT_FIELDS.includes(field)
          const id = `mapping-${field}`
          return (
            <div key={field} className="grid gap-1.5">
              <Label htmlFor={id}>
                {t(FIELD_LABEL_KEY[field])}
                {required ? (
                  <span className="text-danger" aria-hidden="true">
                    {" "}
                    *
                  </span>
                ) : null}
              </Label>
              <Select
                value={mapping[field] ?? IGNORE}
                onValueChange={(value) =>
                  onChange({
                    ...mapping,
                    [field]: value === IGNORE ? undefined : value,
                  })
                }
              >
                <SelectTrigger
                  id={id}
                  className="w-full"
                  data-testid={`mapping-${field}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={IGNORE}>
                    {t("participant.mappingIgnore")}
                  </SelectItem>
                  {headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        })}
      </div>

      {missingRequired.length > 0 ? (
        <p
          className="text-danger flex items-center gap-1.5 text-sm"
          role="alert"
        >
          <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />
          {t("participant.mappingMissingRequired", {
            fields: missingRequired
              .map((field) => t(FIELD_LABEL_KEY[field]))
              .join(", "),
          })}
        </p>
      ) : null}
    </div>
  )
}
