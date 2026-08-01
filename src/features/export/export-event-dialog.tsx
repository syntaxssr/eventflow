"use client"

import * as React from "react"
import { DownloadIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { useDemo } from "@/components/dev/demo-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { downloadWorkbook } from "@/lib/excel"
import {
  collectEventExportData,
  EXPORT_SECTIONS,
  type ExportSection,
} from "@/lib/export"
import { useAppState } from "@/store"
import { buildEventPdf, buildEventWorkbook } from "./build-event-export"

type ExportFormat = "pdf" | "excel"

const SECTION_LABEL: Record<ExportSection, TranslationKey> = {
  overview: "export.sectionOverview",
  tasks: "export.sectionTasks",
  timeline: "export.sectionTimeline",
  participants: "export.sectionParticipants",
  files: "export.sectionFiles",
  activity: "export.sectionActivity",
}

/**
 * Export Dialog ของกิจกรรม — เลือกรูปแบบไฟล์ + ข้อมูลที่ต้องการ แล้วสร้างไฟล์จริง
 * หมายเหตุ: PDF ใช้ข้อความอังกฤษ (ดูเหตุผลใน build-event-export.ts) ส่วน Excel มีชีต Activity ให้ด้วย
 */
export function ExportEventDialog({
  open,
  onOpenChange,
  eventId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
}) {
  const { t, locale } = useLocale()
  const state = useAppState()
  const demo = useDemo()

  const [format, setFormat] = React.useState<ExportFormat>("pdf")
  const [sections, setSections] = React.useState<ExportSection[]>([
    ...EXPORT_SECTIONS,
  ])
  const [busy, setBusy] = React.useState(false)

  // Activity มีเฉพาะใน Excel — PDF เป็นสรุปภาพรวมตามสเปก
  const availableSections = EXPORT_SECTIONS.filter(
    (section) => format === "excel" || section !== "activity"
  )
  const selected = sections.filter((section) =>
    availableSections.includes(section)
  )

  const toggleSection = (section: ExportSection, checked: boolean) => {
    setSections((current) =>
      checked
        ? [...current, section]
        : current.filter((entry) => entry !== section)
    )
  }

  const exportNow = async () => {
    setBusy(true)
    try {
      await demo.simulate()
    } catch {
      toast.error(t("toast.genericError"))
      setBusy(false)
      return
    }

    const data = collectEventExportData(state, eventId)
    if (!data) {
      setBusy(false)
      return
    }

    if (format === "pdf") {
      buildEventPdf(data, selected).save(`eventflow-${eventId}-summary.pdf`)
    } else {
      downloadWorkbook(
        buildEventWorkbook(data, selected, locale, t),
        `eventflow-${eventId}-export.xlsx`
      )
    }

    setBusy(false)
    toast.success(t("export.done"))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("export.title")}</DialogTitle>
          <DialogDescription>{t("export.description")}</DialogDescription>
        </DialogHeader>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{t("export.format")}</legend>
          <RadioGroup
            value={format}
            onValueChange={(value) => setFormat(value as ExportFormat)}
            className="gap-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="pdf" id="export-format-pdf" />
              <Label htmlFor="export-format-pdf" className="font-normal">
                {t("export.formatPdf")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="excel" id="export-format-excel" />
              <Label htmlFor="export-format-excel" className="font-normal">
                {t("export.formatExcel")}
              </Label>
            </div>
          </RadioGroup>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            {t("export.dataToInclude")}
          </legend>
          {availableSections.map((section) => {
            const id = `export-section-${section}`
            return (
              <div key={section} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={selected.includes(section)}
                  onCheckedChange={(checked) =>
                    toggleSection(section, checked === true)
                  }
                  data-testid={id}
                />
                <Label htmlFor={id} className="font-normal">
                  {t(SECTION_LABEL[section])}
                </Label>
              </div>
            )
          })}
          {selected.length === 0 ? (
            <p className="text-foreground text-xs" role="alert">
              {t("export.needSection")}
            </p>
          ) : null}
        </fieldset>

        {format === "pdf" ? (
          <p className="text-muted-foreground text-xs">{t("export.pdfNote")}</p>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={exportNow}
            disabled={busy || selected.length === 0}
            data-testid="confirm-event-export"
          >
            {busy ? (
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <DownloadIcon className="size-4" aria-hidden="true" />
            )}
            {busy ? t("export.exporting") : t("export.action")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
