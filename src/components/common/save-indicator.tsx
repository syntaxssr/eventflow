"use client"

import * as React from "react"
import { CheckIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react"

import { useT } from "@/i18n"
import { cn } from "@/lib/utils"
import type { SaveState } from "@/types/common"

/**
 * สถานะ Auto Save — บอกผู้ใช้ว่าการเปลี่ยนแปลงถูกบันทึกแล้วหรือยัง
 * ใช้กับการกระทำที่บันทึกเองอัตโนมัติ เช่น ลาก Kanban หรือติ๊ก Checklist
 */
export function SaveIndicator({
  state,
  className,
}: {
  state: SaveState
  className?: string
}) {
  const t = useT()

  if (state === "idle") return null

  const content = {
    saving: {
      icon: <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />,
      label: t("common.saving"),
      tone: "text-muted-foreground",
    },
    saved: {
      icon: <CheckIcon className="size-3.5" aria-hidden="true" />,
      label: t("common.saved"),
      tone: "text-foreground",
    },
    error: {
      icon: <TriangleAlertIcon className="size-3.5" aria-hidden="true" />,
      label: t("common.saveFailed"),
      tone: "text-destructive",
    },
  }[state]

  return (
    <span
      role="status"
      aria-live="polite"
      data-testid="save-indicator"
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        content.tone,
        className
      )}
    >
      {content.icon}
      {content.label}
    </span>
  )
}

/**
 * จัดการวงจร Saving → Saved → หายไปเอง
 * คืนฟังก์ชัน `run` ที่ห่อ action ใด ๆ ให้แสดงสถานะบันทึกอัตโนมัติ
 */
export function useAutoSaveState() {
  const [state, setState] = React.useState<SaveState>("idle")
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  const run = React.useCallback(async (action: () => Promise<void> | void) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setState("saving")
    try {
      await action()
      setState("saved")
      timerRef.current = setTimeout(() => setState("idle"), 2200)
      return true
    } catch {
      setState("error")
      timerRef.current = setTimeout(() => setState("idle"), 4000)
      return false
    }
  }, [])

  return { state, run }
}
