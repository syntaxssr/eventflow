"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  Clock3Icon,
  Music2Icon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  TrophyIcon,
  Volume2Icon,
  XCircleIcon,
} from "lucide-react"

import { PageContainer } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ROUTES } from "@/constants/app"
import { cn } from "@/lib/utils"
import styles from "./music-quiz.module.css"

type QuizRound = {
  title: string
  choices: readonly string[]
  answer: number
}

const ROUND_DURATION_SECONDS = 12

const QUIZ_ROUNDS: readonly QuizRound[] = [
  {
    title: "แสงแรกของวัน",
    choices: ["คืนที่ดาวเต็มฟ้า", "แสงแรกของวัน", "เราในวันวาน", "ทางที่ไม่มีเธอ"],
    answer: 1,
  },
  {
    title: "ปลายทางของเรา",
    choices: ["ปลายทางของเรา", "ลมที่พัดผ่าน", "ฝากดาวไว้กับเธอ", "วันธรรมดาที่พิเศษ"],
    answer: 0,
  },
  {
    title: "หัวใจสีฟ้า",
    choices: ["กลับมาได้ไหม", "หัวใจสีฟ้า", "เธอในความทรงจำ", "เรื่องเล่าคืนนี้"],
    answer: 1,
  },
  {
    title: "คืนที่เราร้องเพลง",
    choices: ["คืนที่เราร้องเพลง", "ไกลแค่ไหน", "สิ่งดี ๆ", "เริ่มต้นใหม่"],
    answer: 0,
  },
]

const WAVE_HEIGHTS = [
  "h-5", "h-11", "h-7", "h-14", "h-9", "h-16", "h-8", "h-12",
  "h-6", "h-15", "h-10", "h-18", "h-8", "h-13", "h-5", "h-16",
  "h-9", "h-12", "h-7", "h-14", "h-10", "h-17", "h-6", "h-11",
] as const

const TEAMS = [
  { rank: 1, name: "ทีมดาวเหนือ", score: 850 },
  { rank: 2, name: "ทีมวันศุกร์", score: 770 },
  { rank: 3, name: "ทีมเสียงดี", score: 620 },
  { rank: 4, name: "ทีมอินโทร", score: 540 },
] as const

function formatTime(seconds: number) {
  return `0:${String(seconds).padStart(2, "0")}`
}

export function MusicQuizView() {
  const [roundIndex, setRoundIndex] = React.useState(0)
  const [secondsLeft, setSecondsLeft] = React.useState(ROUND_DURATION_SECONDS)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null)
  const [timedOut, setTimedOut] = React.useState(false)
  const announcementRef = React.useRef<HTMLParagraphElement>(null)

  const round = QUIZ_ROUNDS[roundIndex]
  const isAnswered = selectedAnswer !== null || timedOut
  const isCorrect = selectedAnswer === round.answer
  const progress = ((ROUND_DURATION_SECONDS - secondsLeft) / ROUND_DURATION_SECONDS) * 100

  React.useEffect(() => {
    if (!isPlaying || isAnswered) return

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setIsPlaying(false)
          setTimedOut(true)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isAnswered, isPlaying])

  const startOrPause = () => {
    if (isAnswered) return
    setIsPlaying((current) => !current)
  }

  const selectAnswer = (answerIndex: number) => {
    if (!isPlaying || isAnswered) return
    setSelectedAnswer(answerIndex)
    setIsPlaying(false)
  }

  const nextRound = () => {
    setRoundIndex((current) => (current + 1) % QUIZ_ROUNDS.length)
    setSecondsLeft(ROUND_DURATION_SECONDS)
    setSelectedAnswer(null)
    setTimedOut(false)
    setIsPlaying(false)
  }

  const resetRound = () => {
    setSecondsLeft(ROUND_DURATION_SECONDS)
    setSelectedAnswer(null)
    setTimedOut(false)
    setIsPlaying(false)
  }

  const status = timedOut
    ? `หมดเวลา — เฉลยคือ “${round.title}”`
    : selectedAnswer !== null
      ? isCorrect
        ? "ตอบถูก! ทีมของคุณได้รับ 100 คะแนน"
        : `เฉลย: “${round.title}”`
      : isPlaying
        ? "กำลังเล่นอินโทร เลือกคำตอบก่อนเวลาหมด"
        : "กดเริ่มฟังอินโทร แล้วเลือกคำตอบที่ใช่"

  return (
    <section className={styles.page} data-testid="music-quiz-page">
      <PageContainer className="relative z-10 mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <Link href={ROUTES.games}>
              <ChevronLeftIcon className="size-4" aria-hidden="true" />
              กลับไปหน้าเกมส์
            </Link>
          </Button>
          <span className="bg-white/10 text-white inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm">
            <span className="bg-general-green size-2 rounded-full" aria-hidden="true" />
            กำลังเล่นสด
          </span>
        </div>

        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-5">
          <div>
            <p className="text-general-blue mb-1 flex items-center gap-2 text-sm font-semibold tracking-wide">
              <Music2Icon className="size-4" aria-hidden="true" />
              MUSIC QUIZ · LIVE GAME
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">ทายเพลงให้ทันอินโทร</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/72 sm:text-base">
              ฟังตัวอย่างเพลงสั้น ๆ แล้วเลือกคำตอบที่ใช่ให้ทันเวลา
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/75">
            <span className="font-semibold text-white">รอบ {String(roundIndex + 1).padStart(2, "0")}</span>
            <span aria-hidden="true"> / </span>{QUIZ_ROUNDS.length}
          </div>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <Card className="border-white/15 bg-[#1c1c1c]/80 text-white shadow-2xl shadow-black/25 backdrop-blur-sm">
            <CardContent className="space-y-6 p-5 sm:p-7">
              <div className="grid items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)]">
                <div className={styles.cover} aria-hidden="true"><Volume2Icon className="relative z-10 size-8 text-white" /></div>
                <div className="min-w-0">
                  <p className="text-sm text-white/60">กำลังฟังอินโทร</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {isAnswered ? round.title : "เพลงนี้ชื่ออะไร?"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/70">เพลงตัวอย่างสำหรับกิจกรรมนี้</p>
                </div>
              </div>

              <div className={cn(styles.wave, isPlaying && styles.wavePlaying)} aria-hidden="true">
                {WAVE_HEIGHTS.map((height, index) => <span key={index} className={cn(styles.waveBar, height)} />)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    size="icon"
                    className="size-12 shrink-0 rounded-full bg-general-purple text-white hover:bg-general-purple/85"
                    onClick={startOrPause}
                    disabled={isAnswered}
                    aria-label={isPlaying ? "หยุดฟังอินโทร" : "เริ่มฟังอินโทร"}
                    data-testid="music-quiz-play"
                  >
                    {isPlaying ? <PauseIcon className="size-5" aria-hidden="true" /> : <PlayIcon className="size-5" aria-hidden="true" />}
                  </Button>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Progress value={progress} aria-label="เวลาที่ผ่านไปของอินโทร" className="h-2 bg-white/15 [&>div]:bg-general-blue" />
                    <div className="flex justify-between text-xs tabular-nums text-white/55">
                      <span>{formatTime(ROUND_DURATION_SECONDS - secondsLeft)}</span>
                      <span>{formatTime(ROUND_DURATION_SECONDS)}</span>
                    </div>
                  </div>
                  <span className="flex min-w-14 items-center justify-center gap-1 rounded-lg bg-white/10 px-2 py-2 text-sm font-semibold tabular-nums">
                    <Clock3Icon className="size-4 text-general-yellow" aria-hidden="true" />{secondsLeft}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/12 pt-5">
                <p className="mb-3 text-sm font-semibold">เลือกชื่อเพลงที่ตรงกับอินโทรนี้</p>
                <div className="grid gap-3 sm:grid-cols-2" data-testid="music-quiz-answers">
                  {round.choices.map((choice, index) => {
                    const revealCorrect = isAnswered && index === round.answer
                    const revealWrong = selectedAnswer === index && index !== round.answer
                    return (
                      <button
                        key={choice}
                        type="button"
                        disabled={!isPlaying || isAnswered}
                        onClick={() => selectAnswer(index)}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-3 text-left text-sm font-medium text-white transition-colors duration-200 hover:border-general-blue hover:bg-white/10 disabled:cursor-not-allowed disabled:hover:border-white/15 disabled:hover:bg-white/5",
                          revealCorrect && styles.answerCorrect,
                          revealWrong && styles.answerWrong
                        )}
                        data-testid={`music-quiz-answer-${index}`}
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs text-white/70">{String.fromCharCode(65 + index)}</span>
                        <span className="min-w-0 flex-1">{choice}</span>
                        {revealCorrect ? <CheckCircle2Icon className="size-5 shrink-0 text-general-green" aria-label="คำตอบที่ถูก" /> : null}
                        {revealWrong ? <XCircleIcon className="size-5 shrink-0 text-general-red" aria-label="คำตอบที่เลือกไม่ถูก" /> : null}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                <p ref={announcementRef} className="text-sm text-white/80" aria-live="polite">{status}</p>
                {isAnswered ? (
                  <Button type="button" onClick={nextRound} className="bg-general-green text-black hover:bg-general-green/85" data-testid="music-quiz-next-round">
                    รอบถัดไป
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" onClick={resetRound} className="text-white hover:bg-white/10 hover:text-white">
                    <RotateCcwIcon className="size-4" aria-hidden="true" />เริ่มรอบใหม่
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <aside className="rounded-2xl border border-white/15 bg-black/20 p-5 shadow-xl shadow-black/10" aria-label="คะแนนทีม">
            <div className="mb-4 flex items-center gap-2">
              <TrophyIcon className="size-5 text-general-yellow" aria-hidden="true" />
              <h2 className="font-bold">คะแนนทีม</h2>
            </div>
            <ol className="space-y-1">
              {TEAMS.map((team) => (
                <li key={team.name} className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-2 border-t border-white/10 py-3 first:border-t-0 first:pt-0">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-xs font-semibold text-white/70">{team.rank}</span>
                  <span className="truncate text-sm text-white/85">{team.name}</span>
                  <strong className="text-sm tabular-nums">{team.score}</strong>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-white/60">ตอบก่อน ได้คะแนนมากกว่า</p>
          </aside>
        </div>
      </PageContainer>
    </section>
  )
}
