"use client"

import * as React from "react"
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DESTRUCTIVE_ACTION_CLASS } from "@/constants/status"
import { useLocale } from "@/i18n"
import {
  isDuplicateLabel,
  normalizeEntryLabel,
  type WheelEntry,
} from "@/lib/spin-wheel"
import { cn } from "@/lib/utils"
import styles from "./spin-wheel.module.css"

type EntryError = "spinWheel.entryRequired" | "spinWheel.entryDuplicate"

interface EntryEditorProps {
  entries: WheelEntry[]
  onAdd: (label: string) => void
  onRemove: (entry: WheelEntry) => void
  onClear: () => void
  /** ระหว่างหมุนห้ามแก้รายชื่อ ไม่งั้นช่องผู้ชนะที่เลือกไว้ล่วงหน้าจะคลาดเคลื่อน */
  disabled?: boolean
  inputRef?: React.Ref<HTMLInputElement>
}

/** ช่องเพิ่มชื่อ + รายชื่อในวงล้อ — ตรวจชื่อว่าง/ซ้ำแบบ inline ใต้ช่องกรอก */
export function EntryEditor({
  entries,
  onAdd,
  onRemove,
  onClear,
  disabled = false,
  inputRef,
}: EntryEditorProps) {
  const { t } = useLocale()
  const [draft, setDraft] = React.useState("")
  const [error, setError] = React.useState<EntryError | null>(null)

  // รายชื่ออาจถูกแทนทั้งชุดจากภายนอก (เช่นกดโหลดรายชื่อ) ชื่อที่เคยซ้ำจึงอาจไม่ซ้ำแล้ว
  // ตรวจซ้ำกับรายชื่อชุดปัจจุบันตอน render แทนการจำผลเดิมไว้
  const activeError =
    error === "spinWheel.entryDuplicate" && !isDuplicateLabel(entries, draft)
      ? null
      : error

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const label = normalizeEntryLabel(draft)
    if (!label) {
      setError("spinWheel.entryRequired")
      return
    }
    if (isDuplicateLabel(entries, label)) {
      setError("spinWheel.entryDuplicate")
      return
    }
    onAdd(label)
    setDraft("")
    setError(null)
  }

  return (
    <Card
      size="sm"
      className={cn(styles.controlCard, "border-0 text-white ring-0")}
    >
      <CardHeader>
        <CardTitle className="text-white">{t("spinWheel.entries")}</CardTitle>
        <CardDescription className="text-violet-100/65" aria-live="polite">
          {t("spinWheel.entryCount", { count: entries.length })}
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={disabled || entries.length === 0}
            className={cn(
              DESTRUCTIVE_ACTION_CLASS,
              "text-rose-300 hover:bg-rose-400/15 hover:text-rose-200"
            )}
            data-testid="clear-entries"
          >
            <Trash2Icon className="size-3.5" aria-hidden="true" />
            {t("spinWheel.clearEntries")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={submit} noValidate className="space-y-1.5">
          <Label htmlFor="wheel-entry-input" className="sr-only">
            {t("spinWheel.addEntry")}
          </Label>
          <div className="flex gap-2">
            <Input
              id="wheel-entry-input"
              ref={inputRef}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
                if (error) setError(null)
              }}
              placeholder={t("spinWheel.entryPlaceholder")}
              disabled={disabled}
              className="h-10 border-white/20 bg-white/10 text-white placeholder:text-violet-200/55 focus-visible:border-cyan-300 focus-visible:ring-cyan-300/30 dark:bg-white/10"
              aria-invalid={activeError ? true : undefined}
              aria-describedby={activeError ? "wheel-entry-error" : undefined}
              autoComplete="off"
              data-testid="wheel-entry-input"
            />
            <Button
              type="submit"
              variant="outline"
              disabled={disabled}
              className="h-10 border-cyan-300/35 bg-cyan-300/15 text-cyan-50 hover:border-cyan-200 hover:bg-cyan-300/25 hover:text-white"
              data-testid="add-entry"
            >
              <PlusIcon className="size-4" aria-hidden="true" />
              {t("spinWheel.addEntry")}
            </Button>
          </div>
          {activeError ? (
            <p
              id="wheel-entry-error"
              role="alert"
              className="text-sm text-rose-300"
            >
              {t(activeError)}
            </p>
          ) : null}
        </form>

        {entries.length > 0 ? (
          <ol
            aria-label={t("spinWheel.entries")}
            className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-white/12 bg-black/10 p-1"
            data-testid="wheel-entries"
          >
            {entries.map((entry, index) => (
              <li
                key={entry.id}
                className="flex min-h-8 items-center gap-2 rounded-md px-2 py-1 hover:bg-white/8"
              >
                <span className="w-6 shrink-0 text-right text-xs text-violet-200/60 tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {entry.label}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRemove(entry)}
                  disabled={disabled}
                  aria-label={t("spinWheel.removeEntry", { name: entry.label })}
                  className={cn(
                    DESTRUCTIVE_ACTION_CLASS,
                    "text-rose-300 hover:bg-rose-400/15 hover:text-rose-200"
                  )}
                >
                  <XIcon className="size-3.5" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ol>
        ) : null}
      </CardContent>
    </Card>
  )
}
