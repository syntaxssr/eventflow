"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { useT } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * กล่องยืนยันมาตรฐานของระบบ
 *
 * ต้องบอกให้ครบว่ากำลังจะเกิดอะไรขึ้น ผลกระทบคืออะไร และกระทบข้อมูลชิ้นไหน
 * Action ที่ย้อนกลับไม่ได้ใช้ปุ่มสีแดงทึบเพื่อให้เห็นความต่างชัดเจน
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  targetName,
  impact,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description: React.ReactNode
  /** ชื่อข้อมูลที่ได้รับผลกระทบ */
  targetName?: React.ReactNode
  /** รายการผลกระทบที่จะเกิดขึ้น */
  impact?: React.ReactNode[]
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void | Promise<void>
}) {
  const t = useT()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {targetName ? (
          <p className="bg-muted rounded-md px-3 py-2 text-sm font-medium break-words">
            {targetName}
          </p>
        ) : null}

        {impact && impact.length > 0 ? (
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            {impact.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelLabel ?? t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
            className={cn(
              buttonVariants({
                variant: destructive ? "destructive-solid" : "default",
              })
            )}
          >
            {loading ? (
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
