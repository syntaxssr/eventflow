"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronLeftIcon,
  Clock3Icon,
  EyeIcon,
  FlameIcon,
  Music2Icon,
  PlayIcon,
  SparklesIcon,
  Volume2Icon,
  ZapIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ROUTES } from "@/constants/app"
import { useQuizRoom } from "@/features/games/quiz-room-provider"
import { cn } from "@/lib/utils"
import styles from "./music-quiz.module.css"

type QuizSong = {
  title: string
  artist: string
  /** ยังไม่มีไฟล์จริง — ไม่ใส่ค่านี้ไว้ก่อน จะได้เห็น mockup ปกอัลบัม */
  coverUrl?: string
}

type Difficulty = {
  id: "very-hard" | "hard" | "normal" | "easy"
  label: string
  thaiLabel: string
  seconds: number
  icon: typeof ZapIcon
}

/**
 * ลิสต์เพลงสำหรับกลุ่มอายุ 22–50 — เลือกทีละเพลง เช็คยุคจริงก่อนใส่ทุกเพลง
 * กำลังทยอยเพิ่มทีละยุค ลำดับตรงกับที่จะใส่รูปปกทีหลัง
 */
const QUIZ_SONGS: readonly QuizSong[] = [
  // 90s
  { title: "หมอกหรือควัน", artist: "เบิร์ด ธงไชย" },
  { title: "เจ็บนิดเดียว", artist: "นิตยา บุญสูงเนิน" },
  // 2000s
  { title: "อกหัก", artist: "Bodyslam" },
  { title: "ดวงดาวแห่งรัก", artist: "Dr.Fuu" },
  // Kamikaze
  { title: "ไม่ใช่อิจฉา (Jealous)", artist: "FFK" },
  // ลูกทุ่ง
  { title: "แก้บน", artist: "ก้านตอง ทุ่งเงิน" },
  { title: "ดอกกระเจียวบาน", artist: "ก้อง ห้วยไร่" },
  // 2010s
  { title: "มันเป็นใคร", artist: "POLYCAT" },
  // 2020s
  { title: "ที่คั่นหนังสือ", artist: "BOWKYLION Ft. NONT TANONT" },
  // สากล
  { title: "About You", artist: "The 1975" },
]

const DIFFICULTIES: readonly Difficulty[] = [
  { id: "very-hard", label: "VERY HARD", thaiLabel: "ฟัง 1 วินาที", seconds: 1, icon: ZapIcon },
  { id: "hard", label: "HARD", thaiLabel: "ฟัง 3 วินาที", seconds: 3, icon: FlameIcon },
  { id: "normal", label: "NORMAL", thaiLabel: "ฟัง 10 วินาที", seconds: 10, icon: Music2Icon },
  { id: "easy", label: "EASY", thaiLabel: "ฟัง 15 วินาที", seconds: 15, icon: SparklesIcon },
]

const MAX_ROUNDS = 10

const WAVE_HEIGHTS = [
  "h-5", "h-11", "h-7", "h-14", "h-9", "h-16", "h-8", "h-12",
  "h-6", "h-15", "h-10", "h-18", "h-8", "h-13", "h-5", "h-16",
  "h-9", "h-12", "h-7", "h-14", "h-10", "h-17", "h-6", "h-11",
] as const

function formatTime(seconds: number) {
  return `0:${String(seconds).padStart(2, "0")}`
}

const ARTIST_MIN_PX = 12
const ARTIST_MAX_PX = 24

/**
 * ลดขนาดตัวอักษรชื่อศิลปินอัตโนมัติจนจบภายในบรรทัดเดียว — ชื่อวง/ฟีเจอริ่งบางชื่อยาวมาก
 * (เช่น "BOWKYLION Ft. NONT TANONT") ใช้แค่ clamp(cqw) ของ CSS ไม่พอเพราะไม่รู้ความยาวข้อความจริง
 * จึงวัดความกว้างด้วย canvas แล้วลดขนาดทีละ 1px จนพอดีกล่อง
 */
function useFitOneLine(
  ref: React.RefObject<HTMLParagraphElement | null>,
  text: string,
  active: boolean
) {
  const [fontSize, setFontSize] = React.useState(ARTIST_MAX_PX)

  React.useLayoutEffect(() => {
    // active สลับ false→true ตอนแผงเฉลย mount — ต้องอยู่ใน deps เอง
    // ไม่งั้น effect นี้จะไม่รันซ้ำตอน ref เพิ่งผูกกับ DOM จริง (ref ว่างตอนรอบก่อนเฉลย)
    if (!active) return
    const el = ref.current
    if (!el) return

    const measure = () => {
      const width = el.clientWidth
      if (width <= 0) return
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const nominal = Math.min(Math.max(width * 0.045, ARTIST_MIN_PX), ARTIST_MAX_PX)
      let size = nominal
      while (size > ARTIST_MIN_PX) {
        ctx.font = `600 ${size}px system-ui, sans-serif`
        if (ctx.measureText(text).width <= width) break
        size -= 1
      }
      setFontSize(size)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, text, active])

  return fontSize
}

/** การ์ดโฮสต์: เลือกเวลาของอินโทร แล้วผู้เล่นพิมพ์ชื่อเพลงจากมือถือ */
export function MusicQuizView() {
  const [roundIndex, setRoundIndex] = React.useState(0)
  const [difficulty, setDifficulty] = React.useState<Difficulty | null>(null)
  const [secondsLeft, setSecondsLeft] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [revealed, setRevealed] = React.useState(false)

  const { answeredPlayerIds, publishRound } = useQuizRoom()
  const song = QUIZ_SONGS[roundIndex % QUIZ_SONGS.length]
  const isLastRound = roundIndex >= MAX_ROUNDS - 1
  const artistRef = React.useRef<HTMLParagraphElement>(null)
  const artistFontSize = useFitOneLine(artistRef, song.artist, revealed)
  const duration = difficulty?.seconds ?? 0
  const progress = duration > 0 ? ((duration - secondsLeft) / duration) * 100 : 0

  // หมดเวลาแค่หยุดเล่น ไม่เฉลยเอง — โฮสต์กดฟังซ้ำความยาวไหนก็ได้จนกว่าจะกดเฉลยเอง
  React.useEffect(() => {
    if (!isPlaying) return

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setIsPlaying(false)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isPlaying])

  React.useEffect(() => {
    publishRound({
      index: roundIndex,
      durationSeconds: duration,
      open: isPlaying && !revealed,
      answer: song.title,
    })
  }, [duration, isPlaying, publishRound, revealed, roundIndex, song.title])

  // กดได้เรื่อย ๆ ไม่จำกัดจำนวนครั้งจนกว่าจะกดเฉลย — สลับความยาวหรือฟังซ้ำได้ตลอด
  const playDifficulty = (nextDifficulty: Difficulty) => {
    if (revealed) return
    setDifficulty(nextDifficulty)
    setSecondsLeft(nextDifficulty.seconds)
    setIsPlaying(true)
  }

  const revealAnswer = () => {
    setIsPlaying(false)
    setRevealed(true)
  }

  const nextRound = () => {
    if (isLastRound) return
    setRoundIndex((current) => current + 1)
    setDifficulty(null)
    setSecondsLeft(0)
    setIsPlaying(false)
    setRevealed(false)
  }

  const status = revealed
    ? isLastRound
      ? `จบเกมแล้ว — เล่นครบ ${MAX_ROUNDS} รอบ`
      : "เฉลยแล้ว — กดรอบถัดไปเมื่อพร้อม"
    : isPlaying
      ? `กำลังเล่นตัวอย่าง ${duration} วินาที — ผู้เล่นพิมพ์ชื่อเพลงจากมือถือได้เลย`
      : difficulty
        ? "ฟังซ้ำความยาวอื่นได้ หรือกดเฉลยเมื่อพร้อม"
        : "เลือกเวลาของอินโทรเพื่อเริ่มรอบ"

  return (
    <Card className={cn(styles.card, "h-full border-white/15 text-white shadow-2xl shadow-black/25")} data-testid="music-quiz-page">
      <CardContent className="relative z-10 flex h-full min-h-0 flex-col overflow-y-auto p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-white hover:bg-white/10 hover:text-white">
            <Link href={ROUTES.games}>
              <ChevronLeftIcon className="size-4" aria-hidden="true" />
              กลับไปเลือกเกมส์
            </Link>
          </Button>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-sm text-white/80">
            <span className="bg-general-green size-2 rounded-full" aria-hidden="true" />
            รอบ {String(roundIndex + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="my-auto grid gap-7 py-6 lg:grid-cols-[minmax(12rem,0.72fr)_minmax(0,1.28fr)] lg:items-center">
          <section className="flex flex-col items-center text-center">
            <div className={cn(styles.cover, isPlaying && styles.coverPlaying)} aria-hidden="true">
              <div className={styles.record}><Volume2Icon className="relative z-10 size-9 text-white" /></div>
            </div>
            <p className="mt-6 text-base font-medium text-white/58">MUSIC GUESSING GAME</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">ทายชื่อเพลง</h1>
            <p className="mt-4 max-w-sm text-base leading-7 text-white/68">
              เลือกช่วงเวลาที่อยากให้ฟัง
              <br />
              แล้วให้ทุกคนในห้องพิมพ์ชื่อเพลงจากมือถือ
            </p>
          </section>

          <section
            className="min-w-0"
            aria-labelledby={revealed ? undefined : "difficulty-heading"}
            aria-label={revealed ? "เฉลยเพลง" : undefined}
          >
            {revealed ? (
              <div className={styles.revealPanel} data-testid="music-quiz-reveal-panel">
                <div className={styles.revealCover}>
                  {song.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- ปกอัลบัมมาจาก URL ที่ผู้ใช้เพิ่มเอง ไม่ใช่ asset ในโปรเจกต์
                    <img
                      src={song.coverUrl}
                      alt=""
                      className={styles.revealCoverImage}
                    />
                  ) : (
                    <Music2Icon className={styles.revealCoverIcon} aria-hidden="true" />
                  )}
                </div>
                <div className={styles.revealText}>
                  <p className="text-sm font-semibold tracking-[0.2em] text-white/55">เฉลย</p>
                  <p className={styles.revealTitle} data-testid="music-quiz-answer">{song.title}</p>
                  <p
                    ref={artistRef}
                    className={styles.revealArtist}
                    style={{ fontSize: artistFontSize }}
                    data-testid="music-quiz-answer-artist"
                  >
                    {song.artist}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p id="difficulty-heading" className="text-sm font-semibold text-white">เลือกความยาก</p>
                    <p className="mt-1 text-xs text-white/55">ยิ่งฟังสั้น ยิ่งทายยาก</p>
                  </div>
                  {difficulty ? <span className="text-general-blue text-xs font-semibold tabular-nums">{formatTime(secondsLeft)} / {formatTime(duration)}</span> : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2" data-testid="music-quiz-difficulties">
                  {DIFFICULTIES.map((item) => {
                    const Icon = item.icon
                    const isSelected = difficulty?.id === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => playDifficulty(item)}
                        disabled={revealed}
                        className={cn(styles.difficultyButton, isSelected && styles.difficultyButtonSelected)}
                        data-testid={`music-quiz-difficulty-${item.id}`}
                        aria-label={`${item.label}, ${item.thaiLabel}`}
                      >
                        <span className={styles.difficultyIcon} aria-hidden="true"><Icon className="size-5" /></span>
                        <span className="min-w-0 text-left">
                          <span className="block text-sm font-bold tracking-wide">{item.label}</span>
                          <span className="mt-0.5 block text-xs text-white/60">{item.thaiLabel}</span>
                        </span>
                        <PlayIcon className="ml-auto size-4 shrink-0 text-white/65" aria-hidden="true" />
                      </button>
                    )
                  })}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/16 p-4">
                  <div className={cn(styles.wave, isPlaying && styles.wavePlaying)} aria-hidden="true">
                    {WAVE_HEIGHTS.map((height, index) => <span key={index} className={cn(styles.waveBar, height)} />)}
                  </div>
                  <Progress
                    value={progress}
                    aria-label="เวลาที่ผ่านไปของตัวอย่างเพลง"
                    className="mt-2 h-2 bg-white/12 [&>div]:bg-general-blue"
                    indicatorClassName="duration-1000 ease-linear"
                  />
                </div>
              </>
            )}
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-medium text-white" aria-live="polite">
              <Clock3Icon className="text-general-yellow size-4 shrink-0" aria-hidden="true" />
              {status}
            </p>
            {!revealed && difficulty ? <p className="mt-1 text-xs text-white/52">ตอบแล้ว {answeredPlayerIds.length} คน</p> : null}
          </div>
          {revealed && isLastRound ? (
            <Button asChild className="bg-general-green shrink-0 text-black hover:bg-general-green/85" data-testid="music-quiz-back-to-games">
              <Link href={ROUTES.games}>กลับไปเลือกเกมส์</Link>
            </Button>
          ) : revealed ? (
            <Button type="button" onClick={nextRound} className="bg-general-green shrink-0 text-black hover:bg-general-green/85" data-testid="music-quiz-next-round">
              รอบถัดไป
            </Button>
          ) : difficulty ? (
            <Button type="button" onClick={revealAnswer} variant="outline" className="shrink-0 border-white/20 text-white hover:bg-white/10 hover:text-white" data-testid="music-quiz-reveal">
              <EyeIcon className="size-4" aria-hidden="true" />
              เฉลย
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
