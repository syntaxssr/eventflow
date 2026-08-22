"use client"

import * as React from "react"
import { DownloadIcon, Loader2Icon } from "lucide-react"
import { appToast } from "@/lib/gif-toast"

import { useDemo } from "@/components/dev/demo-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  PARTICIPANT_TYPE_STYLE,
  RSVP_STATUS_STYLE,
} from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { buildParticipantsWorkbook, downloadWorkbook } from "@/lib/excel"
import {
  PARTICIPANT_TYPES,
  RSVP_STATUSES,
  type Participant,
} from "@/types/participant"

type ExportScope = "all" | "filtered"

/** กล่องส่งออกรายชื่อเป็นไฟล์ Excel จริง สร้างจากข้อมูลในระบบ */
export function ExportParticipantsDialog({
  open,
  onOpenChange,
  allParticipants,
  filteredParticipants,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  allParticipants: Participant[]
  filteredParticipants: Participant[]
}) {
  const { t, locale } = useLocale()
  const demo = useDemo()
  const [scope, setScope] = React.useState<ExportScope>("all")
  const [busy, setBusy] = React.useState(false)

  const handleOpenChange = (next: boolean) => {
    if (busy) return
    onOpenChange(next)
    if (!next) setScope("all")
  }

  const exportNow = async () => {
    setBusy(true)
    try {
      await demo.simulate()
    } catch {
      appToast.error(t("toast.genericError"))
      setBusy(false)
      return
    }

    const participants =
      scope === "all" ? allParticipants : filteredParticipants

    const rsvpLabels = Object.fromEntries(
      RSVP_STATUSES.map((status) => [
        status,
        t(RSVP_STATUS_STYLE[status].labelKey as TranslationKey),
      ])
    ) as Record<Participant["rsvpStatus"], string>
    const typeLabels = Object.fromEntries(
      PARTICIPANT_TYPES.map((type) => [
        type,
        t(PARTICIPANT_TYPE_STYLE[type].labelKey as TranslationKey),
      ])
    ) as Record<Participant["type"], string>

    const workbook = buildParticipantsWorkbook(participants, locale, {
      headers: {
        firstName: t("participant.firstName"),
        lastName: t("participant.lastName"),
        email: t("participant.email"),
        department: t("participant.department"),
        phone: t("participant.phone"),
        rsvpStatus: t("rsvp.label"),
        type: t("participantType.label"),
        note: t("participant.note"),
      },
      rsvp: rsvpLabels,
      type: typeLabels,
      sheetName: "Participants",
    })
    downloadWorkbook(workbook, "eventflow-participants.xlsx")

    setBusy(false)
    appToast.success(t("participant.exportDone"))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("participant.exportTitle")}</DialogTitle>
          <DialogDescription>
            {t("participant.exportDescription")}
          </DialogDescription>
        </DialogHeader>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            {t("participant.exportScope")}
          </legend>
          <RadioGroup
            value={scope}
            onValueChange={(value) => setScope(value as ExportScope)}
            className="gap-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="all" id="export-scope-all" />
              <Label htmlFor="export-scope-all" className="font-normal">
                {t("participant.exportScopeAll", {
                  count: allParticipants.length,
                })}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="filtered" id="export-scope-filtered" />
              <Label htmlFor="export-scope-filtered" className="font-normal">
                {t("participant.exportScopeFiltered", {
                  count: filteredParticipants.length,
                })}
              </Label>
            </div>
          </RadioGroup>
        </fieldset>

        <p className="text-muted-foreground text-xs">
          {t("participant.exportColumns")}
        </p>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={exportNow} disabled={busy} data-testid="confirm-export">
            {busy ? (
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <DownloadIcon className="size-4" aria-hidden="true" />
            )}
            {busy ? t("participant.exporting") : t("participant.export")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
