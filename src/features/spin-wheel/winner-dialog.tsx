"use client"

import * as React from "react"
import { PartyPopperIcon, RotateCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocale } from "@/i18n"

/** ผลการหมุนหนึ่งรอบ — เก็บชื่อไว้เอง เพราะรายชื่ออาจถูกลบออกจากวงล้อภายหลัง */
export interface SpinRecord {
  round: number
  entryId: string
  label: string
  prize: string
  at: string
}

/** สีชิ้นกระดาษ — เฉด Version 3 ชุดเดียวกับพลุใน Toast */
const CONFETTI_COLORS = [
  "var(--icon-tile-blue)",
  "var(--icon-tile-yellow)",
  "var(--icon-tile-green)",
  "var(--icon-tile-purple)",
  "var(--icon-tile-red)",
  "var(--icon-tile-orange)",
]

/**
 * ชิ้นกระดาษกระจายเป็นวงรอบชื่อผู้ชนะ — คำนวณครั้งเดียวตอนโหลดโมดูลจากสูตรตายตัว
 * (ไม่สุ่มตอน render) ผลลัพธ์จึงเหมือนกันทุกครั้ง
 */
const CONFETTI = Array.from({ length: 36 }, (_, index) => {
  const angle = (index / 36) * Math.PI * 2
  const radius = 150 + (index % 4) * 22
  return {
    tx: `${Math.round(Math.sin(angle) * radius)}px`,
    ty: `${Math.round(-Math.cos(angle) * radius)}px`,
    delay: `${((index % 5) * 0.28).toFixed(2)}s`,
    duration: `${(2.2 + (index % 4) * 0.35).toFixed(2)}s`,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    size: 6 + (index % 4),
  }
})

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {CONFETTI.map((piece, index) => (
        <span
          key={index}
          className="toast-confetti-piece absolute top-1/2 left-1/2 block rounded-[2px]"
          style={
            {
              width: piece.size,
              height: piece.size * 1.6,
              backgroundColor: piece.color,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              // คลาสที่ยืมมาจาก Toast ตั้งค่าให้วนไม่รู้จบ (Toast ปิดตัวเอง แต่กล่องนี้เปิดค้าง)
              // ทับเฉพาะ longhand เพื่อไม่ล้าง animation: none ของโหมดลดการเคลื่อนไหว
              animationIterationCount: 1,
              animationFillMode: "forwards",
              "--tx": piece.tx,
              "--ty": piece.ty,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

/**
 * กล่องประกาศผู้โชคดี — เปิดเมื่อวงล้อหยุด
 * การนำผู้ชนะออกจากวงล้อเกิดตอนปิดกล่อง (ดู spin-wheel-view.tsx) ไม่ใช่ที่นี่
 */
export function WinnerDialog({
  open,
  onOpenChange,
  record,
  canSpinAgain,
  onSpinAgain,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: SpinRecord | null
  canSpinAgain: boolean
  onSpinAgain: () => void
}) {
  const { t } = useLocale()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden text-center sm:max-w-md"
        data-testid="winner-dialog"
      >
        <Confetti />

        <DialogHeader className="relative items-center pt-2">
          <span
            className="bg-success text-success-foreground flex size-12 items-center justify-center rounded-full"
            aria-hidden="true"
          >
            <PartyPopperIcon className="size-6" />
          </span>
          <DialogTitle className="text-muted-foreground text-sm font-medium">
            {t("spinWheel.winnerTitle")}
          </DialogTitle>
          <p
            className="text-3xl font-bold break-words text-balance"
            data-testid="winner-name"
          >
            {record?.label}
          </p>
          <DialogDescription>
            {record ? t("spinWheel.winnerAnnounce", { name: record.label }) : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="relative space-y-1">
          {record?.prize ? (
            <p className="text-base font-medium" data-testid="winner-prize">
              {t("spinWheel.winnerPrize", { prize: record.prize })}
            </p>
          ) : null}
          {record ? (
            <p className="text-muted-foreground text-xs">
              {t("spinWheel.round", { round: record.round })}
            </p>
          ) : null}
        </div>

        <DialogFooter className="relative sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="winner-close"
          >
            {t("spinWheel.close")}
          </Button>
          <Button
            onClick={onSpinAgain}
            disabled={!canSpinAgain}
            data-testid="winner-spin-again"
          >
            <RotateCwIcon className="size-4" aria-hidden="true" />
            {t("spinWheel.spinAgain")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
