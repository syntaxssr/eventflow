"use client"

import * as React from "react"
import Link from "next/link"
import {
  ApertureIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  EyeIcon,
  ImageIcon,
  ZoomOutIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROUTES } from "@/constants/app"
import { useQuizRoom } from "@/features/games/quiz-room-provider"
import { cn } from "@/lib/utils"
import sharedStyles from "@/features/music-quiz/music-quiz.module.css"
import styles from "./picture-quiz.module.css"

type QuizPicture = {
  /** คำตอบที่ถูกต้อง (สิ่งที่อยู่ในภาพ) */
  label: string
  /** หมวดหมู่ของภาพ โชว์เป็นป้ายด้านบน */
  category: string
  /** ยังไม่มีไฟล์รูปจริงสักภาพ — ใส่เพิ่มทีหลังได้ที่ public/quiz-pictures/ ไม่ใส่จะเห็น
   *  ไอคอนรูปภาพ mockup แทน (เหมือน pattern เดียวกับ coverUrl ของเกมทายเพลง) */
  imageUrl?: string
}

/** รอบเกม — คละหมวดหมู่ให้ดูหลากหลาย ยังไม่มีรูปจริง รอใส่ทีหลัง */
const PICTURE_ROUNDS: readonly QuizPicture[] = [
  { label: "หอไอเฟล", category: "สถานที่ท่องเที่ยว", imageUrl: "/quiz-pictures/01.jpg" },
  { label: "นกฮูก", category: "สัตว์", imageUrl: "/quiz-pictures/02.jpg" },
  { label: "สตาร์บัคส์", category: "โลโก้แบรนด์", imageUrl: "/quiz-pictures/03.jpg" },
  { label: "ส้มตำ", category: "อาหารไทย", imageUrl: "/quiz-pictures/04.jpg" },
  { label: "โดราเอมอน", category: "การ์ตูน/อนิเมะ" },
  { label: "ลิโอเนล เมสซี", category: "คนดัง/นักกีฬา" },
  { label: "เฟอร์รารี", category: "รถยนต์" },
  { label: "ธงชาติญี่ปุ่น", category: "ธงชาติ" },
]

/**
 * เริ่มซูม 100 เท่า (เห็นแค่เสี้ยวเล็ก ๆ ทายยากสุด) กดปุ่ม "ซูมออก" ทีละสเต็ปจนกลับมา 1 เท่า
 * (เห็นภาพเต็ม) — ไล่แบบ geometric (ลดสัดส่วนใกล้เคียงกันทุกสเต็ป) ไม่ใช่ลดทีละเท่า ๆ กัน
 * เพราะช่วงซูมสูง ๆ ต้องลดเยอะกว่าจะรู้สึกว่าต่างกัน ส่วนช่วงใกล้ 1 ต้องลดทีละนิดให้ลุ้นนาน
 */
const ZOOM_STEPS = [100, 60, 36, 22, 13, 8, 5, 3, 2, 1] as const
const LAST_STEP_INDEX = ZOOM_STEPS.length - 1

/** สีประจำหมวดหมู่ภาพ — ย้อมกรอบ viewfinder + ป้ายหมวดหมู่ ให้แต่ละรอบไม่ซ้ำสีกัน */
const CATEGORY_ACCENTS: Record<string, string> = {
  สถานที่ท่องเที่ยว: "#5ac8d8",
  สัตว์: "#ffcf49",
  โลโก้แบรนด์: "#ff9f5a",
  อาหารไทย: "#73bfa3",
  "การ์ตูน/อนิเมะ": "#e685c2",
  "คนดัง/นักกีฬา": "#7b69cc",
  รถยนต์: "#a3defe",
  ธงชาติ: "#f49a7f",
}
const DEFAULT_CATEGORY_ACCENT = "#7b69cc"

function getCategoryAccent(category: string) {
  return CATEGORY_ACCENTS[category] ?? DEFAULT_CATEGORY_ACCENT
}

const CONFETTI_COLORS = ["#a3defe", "#73bfa3", "#f49a7f", "#ffcf49", "#7b69cc", "#f2f2f0"]

/** คอนเฟตตี้ตกต่อเนื่องจนกว่าจะออกจากรอบเฉลย — ค่าตายตัวจาก index กันผลเพี้ยนระหว่าง render */
const CONFETTI_PIECES = Array.from({ length: 16 }, (_, index) => ({
  left: (index * 37) % 100,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  delayMs: (index * 173) % 1800,
  durationMs: 2800 + ((index * 61) % 1400),
  rotate: (index * 47) % 360,
  drift: (index % 2 === 0 ? 1 : -1) * (12 + ((index * 13) % 34)),
}))

const MAX_ROUNDS = PICTURE_ROUNDS.length

/** การ์ดโฮสต์: ภาพเต็มพื้นที่จอ ค่อย ๆ กดซูมออกทีละสเต็ป ผู้เล่นพิมพ์คำตอบจากมือถือ */
export function PictureQuizView() {
  const [roundIndex, setRoundIndex] = React.useState(0)
  const [stepIndex, setStepIndex] = React.useState(0)
  const [revealed, setRevealed] = React.useState(false)

  const { publishRound } = useQuizRoom()
  const picture = PICTURE_ROUNDS[roundIndex % PICTURE_ROUNDS.length]
  const isLastRound = roundIndex >= MAX_ROUNDS - 1
  const nextPicture = PICTURE_ROUNDS[(roundIndex + 1) % PICTURE_ROUNDS.length]
  const zoom = revealed ? 1 : ZOOM_STEPS[stepIndex]
  const isFullyZoomedOut = stepIndex >= LAST_STEP_INDEX

  React.useEffect(() => {
    publishRound({
      gameType: "picture-quiz",
      index: roundIndex,
      durationSeconds: 0,
      open: !revealed,
      answer: picture.label,
    })
  }, [publishRound, revealed, roundIndex, picture.label])

  const zoomOut = () => {
    if (revealed || isFullyZoomedOut) return
    setStepIndex((current) => Math.min(current + 1, LAST_STEP_INDEX))
  }

  const revealAnswer = () => {
    setRevealed(true)
  }

  const resetRound = (index: number) => {
    setRoundIndex(index)
    setStepIndex(0)
    setRevealed(false)
  }

  const nextRound = () => {
    if (isLastRound) return
    resetRound(roundIndex + 1)
  }

  return (
    <Card className={cn(sharedStyles.card, "h-full border-white/15 text-white shadow-2xl shadow-black/25")} data-testid="picture-quiz-page">
      <CardContent className="relative z-10 flex h-full min-h-0 flex-col gap-4 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-white hover:bg-white/10 hover:text-white">
            <Link href={ROUTES.games}>
              <ChevronLeftIcon className="size-4" aria-hidden="true" />
              กลับไปเลือกเกมส์
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-sm text-white/80 hover:bg-white/12"
                data-testid="picture-quiz-round-trigger"
              >
                <span className="bg-general-green size-2 rounded-full" aria-hidden="true" />
                รอบ {String(roundIndex + 1).padStart(2, "0")}
                <ChevronDownIcon className="size-3.5 text-white/60" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {PICTURE_ROUNDS.map((round, index) => (
                <DropdownMenuItem
                  key={round.label}
                  onSelect={() => resetRound(index)}
                  className={cn("justify-center py-1.5 text-sm text-white", index === roundIndex && "bg-white/10")}
                  data-testid={`picture-quiz-round-option-${index}`}
                >
                  รอบ {String(index + 1).padStart(2, "0")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          className={cn(styles.stageFull, revealed && styles.stageFullRevealed)}
          style={{ "--category-accent": getCategoryAccent(picture.category) } as React.CSSProperties}
          data-testid="picture-quiz-stage"
        >
          <span className={cn(styles.peekCorner, styles.peekCornerTl)} aria-hidden="true" />
          <span className={cn(styles.peekCorner, styles.peekCornerTr)} aria-hidden="true" />
          <span className={cn(styles.peekCorner, styles.peekCornerBl)} aria-hidden="true" />
          <span className={cn(styles.peekCorner, styles.peekCornerBr)} aria-hidden="true" />

          <span className={styles.stageBadge} data-testid="picture-quiz-category">
            <ApertureIcon className="size-4" aria-hidden="true" />
            {picture.category}
          </span>
          <span className={cn(styles.stageBadge, styles.stageBadgeRight)} data-testid="picture-quiz-zoom-level">
            {zoom > 1 ? `ซูม ${zoom} เท่า` : "ภาพปกติ"}
          </span>

          {picture.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- รูปภาพมาจาก URL ที่ผู้ใช้เพิ่มเอง ไม่ใช่ asset ในโปรเจกต์
            <img
              src={picture.imageUrl}
              alt=""
              className={styles.stageImage}
              style={{ "--peek-scale": zoom } as React.CSSProperties}
            />
          ) : (
            <div className={styles.peekPlaceholder}>
              <ImageIcon className={styles.peekPlaceholderIcon} aria-hidden="true" />
              <span className={styles.peekPlaceholderLabel}>ยังไม่มีรูป</span>
            </div>
          )}

          {revealed ? (
            <div className={sharedStyles.confettiLayer} aria-hidden="true">
              {CONFETTI_PIECES.map((piece, index) => (
                <span
                  key={index}
                  className={sharedStyles.confettiPiece}
                  style={{
                    left: `${piece.left}%`,
                    background: piece.color,
                    animationDelay: `${piece.delayMs}ms`,
                    animationDuration: `${piece.durationMs}ms`,
                    "--confetti-rotate": `${piece.rotate}deg`,
                    "--confetti-drift": `${piece.drift}px`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          ) : null}
        </div>

        {revealed ? (
          <div className={styles.controlBar} data-testid="picture-quiz-reveal-bar">
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-wide text-white/55">เฉลย</p>
              <p className="truncate text-2xl font-extrabold sm:text-3xl">{picture.label}</p>
              <p className="truncate text-sm text-white/60">{picture.category}</p>
            </div>
            {isLastRound ? (
              <Link href={ROUTES.games} className={sharedStyles.primaryCta} data-testid="picture-quiz-back-to-games">
                <ArrowRightIcon className="size-5" aria-hidden="true" />
                กลับไปเลือกเกมส์
              </Link>
            ) : (
              <button
                type="button"
                onClick={nextRound}
                className={sharedStyles.primaryCta}
                style={{ "--cta-accent": getCategoryAccent(nextPicture.category) } as React.CSSProperties}
                data-testid="picture-quiz-next-round"
              >
                <ArrowRightIcon className="size-5" aria-hidden="true" />
                รอบถัดไป
              </button>
            )}
          </div>
        ) : (
          <div className={styles.controlBar} data-testid="picture-quiz-zoom-bar">
            <span className="shrink-0 text-sm font-semibold tabular-nums text-white/55" data-testid="picture-quiz-step">
              {stepIndex + 1}/{ZOOM_STEPS.length}
            </span>
            <button
              type="button"
              onClick={zoomOut}
              disabled={isFullyZoomedOut}
              className={styles.zoomButton}
              data-testid="picture-quiz-zoom-out"
            >
              <ZoomOutIcon className="size-5" aria-hidden="true" />
              {isFullyZoomedOut ? "เห็นเต็มภาพแล้ว" : "กดเพื่อซูมออก"}
            </button>
            <button
              type="button"
              onClick={revealAnswer}
              className={styles.skipButton}
              data-testid="picture-quiz-reveal"
            >
              <EyeIcon className="size-4" aria-hidden="true" />
              เฉลยเลย
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
