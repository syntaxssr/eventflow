"use client"

import * as React from "react"
import {
  FileSpreadsheetIcon,
  FileUpIcon,
  Loader2Icon,
} from "lucide-react"
import { appToast } from "@/lib/gif-toast"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/i18n"
import {
  buildTemplateWorkbook,
  downloadWorkbook,
  readWorkbookRows,
  type SheetData,
} from "@/lib/excel"
import { cn } from "@/lib/utils"

const EXCEL_EXTENSIONS = [".xlsx", ".xls"]

/** ขั้นที่ 1 — เลือกหรือลากไฟล์ Excel + ปุ่มดาวน์โหลด Template */
export function ImportStepUpload({
  fileName,
  onFileLoaded,
}: {
  fileName: string | null
  onFileLoaded: (name: string, data: SheetData) => void
}) {
  const { t } = useLocale()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [reading, setReading] = React.useState(false)

  const readFile = async (file: File) => {
    const isExcel = EXCEL_EXTENSIONS.some((extension) =>
      file.name.toLowerCase().endsWith(extension)
    )
    if (!isExcel) {
      appToast.error(t("participant.onlyExcel"))
      return
    }

    setReading(true)
    try {
      const data = readWorkbookRows(await file.arrayBuffer())
      if (data.headers.length === 0 || data.rows.length === 0) {
        appToast.error(t("participant.fileEmpty"))
        return
      }
      onFileLoaded(file.name, data)
    } catch {
      appToast.error(t("toast.genericError"))
    } finally {
      setReading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragOver(false)
          const file = event.dataTransfer.files[0]
          if (file) void readFile(file)
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          dragOver ? "border-brand-400 bg-brand-50/50" : "border-border"
        )}
        data-testid="import-drop-zone"
      >
        {reading ? (
          <>
            <Loader2Icon
              className="text-brand-500 size-8 animate-spin"
              aria-hidden="true"
            />
            <p className="text-sm">{t("participant.readingFile")}</p>
          </>
        ) : (
          <>
            <FileUpIcon
              className="text-muted-foreground size-8"
              aria-hidden="true"
            />
            <p className="text-sm">{t("participant.dropHint")}</p>
            <p className="text-muted-foreground text-xs">
              {t("participant.onlyExcel")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              data-testid="import-choose-file"
            >
              {t("participant.chooseFile")}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              aria-label={t("participant.chooseFile")}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void readFile(file)
                event.target.value = ""
              }}
            />
          </>
        )}
      </div>

      {fileName ? (
        <div className="bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
          <FileSpreadsheetIcon
            className="text-brand-600 size-4 shrink-0"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate">
            {t("participant.selectedFile")}: <strong>{fileName}</strong>
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => inputRef.current?.click()}
          >
            {t("participant.changeFile")}
          </Button>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
        <p className="text-muted-foreground text-xs">
          {t("participant.mappingHint")}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => {
            downloadWorkbook(
              buildTemplateWorkbook(),
              "eventflow-participants-template.xlsx"
            )
            appToast.success(t("participant.templateDownloaded"))
          }}
          data-testid="download-template"
        >
          {t("participant.downloadTemplate")}
        </Button>
      </div>
    </div>
  )
}
