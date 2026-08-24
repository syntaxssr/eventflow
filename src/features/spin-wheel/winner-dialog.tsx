"use client"

import * as React from "react"
import { RotateCwIcon, StarIcon } from "lucide-react"

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
import { cn } from "@/lib/utils"
import styles from "./spin-wheel.module.css"

/** ผลการหมุนหนึ่งรอบ — เก็บชื่อไว้เอง เพราะรายชื่ออาจถูกลบออกจากวงล้อภายหลัง */
export interface SpinRecord {
  round: number
  entryId: string
  label: string
  prize: string
  at: string
}

type MarqueePoint = { x: number; y: number }

const MARQUEE_CORNERS: MarqueePoint[] = [
  { x: 13, y: 4 },
  { x: 87, y: 4 },
  { x: 97, y: 50 },
  { x: 87, y: 96 },
  { x: 13, y: 96 },
  { x: 3, y: 50 },
]
const MARQUEE_BULBS_PER_EDGE = [12, 5, 5, 12, 5, 5]

/** วางหลอดไฟตามขอบหกเหลี่ยม โดยไม่ซ้ำหลอดตรงมุมระหว่างแต่ละด้าน */
const MARQUEE_BULBS = MARQUEE_CORNERS.flatMap((start, edgeIndex) => {
  const end = MARQUEE_CORNERS[(edgeIndex + 1) % MARQUEE_CORNERS.length]
  const count = MARQUEE_BULBS_PER_EDGE[edgeIndex]

  return Array.from({ length: count }, (_, index) => {
    const progress = index / count
    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress,
    }
  })
})

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
  const winnerName = record?.label ?? ""
  const winnerNameLength = Array.from(winnerName).length
  const winnerDialogWidth = Math.max(
    38,
    Math.min(96, 28 + winnerNameLength * 1.05)
  )
  const winnerNameBaseSize = Math.max(
    14,
    Math.min(76, 1520 / Math.max(winnerNameLength, 1))
  )
  const winnerNameViewportSize = 120 / Math.max(winnerNameLength, 1)
  const winnerNameMobileSize = 70 / Math.max(winnerNameLength, 1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(styles.winnerDialog, "text-center text-white")}
        style={
          {
            "--winner-dialog-width": `${winnerDialogWidth}rem`,
          } as React.CSSProperties
        }
        data-testid="winner-dialog"
      >
        <div className={styles.winnerSign} data-testid="winner-sign">
          <div className={styles.winnerBulbs} aria-hidden="true">
            {MARQUEE_BULBS.map((bulb, index) => (
              <span
                key={index}
                className={styles.winnerBulb}
                style={
                  {
                    left: `${bulb.x}%`,
                    top: `${bulb.y}%`,
                    "--winner-bulb-index": index,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          <div className={styles.winnerSignInner}>
            <div className={styles.winnerStars} aria-hidden="true">
              <StarIcon />
              <StarIcon />
              <StarIcon />
            </div>
            <DialogHeader className="min-w-0 items-center gap-1.5">
              <DialogTitle className={styles.winnerEyebrow}>
                {t("spinWheel.winnerTitle")}
              </DialogTitle>
              <div className={styles.winnerNameViewport}>
                <p
                  className={styles.winnerName}
                  style={
                    {
                      "--winner-name-base-size": `${winnerNameBaseSize}px`,
                      "--winner-name-viewport-size": `${winnerNameViewportSize}vw`,
                      "--winner-name-mobile-size": `${winnerNameMobileSize}vw`,
                    } as React.CSSProperties
                  }
                  data-testid="winner-name"
                >
                  {winnerName}
                </p>
              </div>
              <DialogDescription className={styles.winnerCongratulations}>
                {record ? t("spinWheel.winnerAnnounce") : ""}
              </DialogDescription>
            </DialogHeader>

            <div className={styles.winnerDetails}>
              {record?.prize ? (
                <p data-testid="winner-prize">
                  {t("spinWheel.winnerPrize", { prize: record.prize })}
                </p>
              ) : null}
              {record ? (
                <p>{t("spinWheel.round", { round: record.round })}</p>
              ) : null}
            </div>
          </div>
        </div>

        <DialogFooter className={styles.winnerFooter}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
            data-testid="winner-close"
          >
            {t("spinWheel.close")}
          </Button>
          <Button
            onClick={onSpinAgain}
            disabled={!canSpinAgain}
            className="bg-gradient-to-r from-amber-300 via-orange-400 to-pink-500 font-bold text-violet-950 hover:brightness-110"
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
