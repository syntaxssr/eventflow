"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2Icon,
  LoaderCircleIcon,
  Music2Icon,
  SendIcon,
  UsersRoundIcon,
  WifiOffIcon,
} from "lucide-react"
import usePartySocket from "partysocket/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PARTYKIT_HOST,
  getOrCreatePlayerId,
  isValidPin,
  normalizePin,
  parseServerMessage,
  type QuizRoomRound,
} from "@/lib/quiz-room"
import { cn } from "@/lib/utils"

type Phase = "form" | "joining" | "playing"

const REJECT_MESSAGE: Record<string, string> = {
  full: "ห้องเต็มแล้ว",
  "duplicate-name": "ชื่อนี้มีคนใช้แล้ว ลองชื่ออื่น",
  "bad-name": "ใส่ชื่ออย่างน้อย 2 ตัวอักษร",
}

/**
 * จอผู้เข้าร่วม — ออกแบบสำหรับมือถือ
 *
 * จอนี้ไม่แสดงเฉลย ผู้เล่นพิมพ์ชื่อเพลงขณะโฮสต์เปิดช่วงอินโทร
 */
export function QuizPlayView() {
  const searchParams = useSearchParams()
  const [pin, setPin] = React.useState(() =>
    normalizePin(searchParams.get("pin") ?? "")
  )
  const [name, setName] = React.useState("")
  const [joinedName, setJoinedName] = React.useState("")
  const [phase, setPhase] = React.useState<Phase>("form")
  const [error, setError] = React.useState("")
  const [playerCount, setPlayerCount] = React.useState(0)
  const [hostOnline, setHostOnline] = React.useState(false)
  const [round, setRound] = React.useState<QuizRoomRound | null>(null)
  const [myAnswer, setMyAnswer] = React.useState<string | null>(null)
  const [myAnswerCorrect, setMyAnswerCorrect] = React.useState<boolean | null>(null)
  const [answerText, setAnswerText] = React.useState("")
  const [online, setOnline] = React.useState(false)

  const playerIdRef = React.useRef("")
  const nameRef = React.useRef("")
  const roundIndexRef = React.useRef<number | null>(null)

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: isValidPin(pin) ? pin : "lobby",
    startClosed: true,
    onOpen() {
      setOnline(true)
      socket.send(
        JSON.stringify({
          type: "join",
          role: "player",
          playerId: playerIdRef.current,
          name: nameRef.current,
        })
      )
    },
    onClose() {
      setOnline(false)
    },
    onMessage(event: MessageEvent<string>) {
      const message = parseServerMessage(event.data)
      if (!message) return

      if (message.type === "state") {
        const nextRoundIndex = message.round?.index ?? null
        if (nextRoundIndex !== roundIndexRef.current) {
          roundIndexRef.current = nextRoundIndex
          setAnswerText("")
        }
        setPlayerCount(message.players.filter((player) => player.connected).length)
        setHostOnline(message.hostOnline)
        setRound(message.round)
        setMyAnswer(message.myAnswer)
        setMyAnswerCorrect(message.myAnswerCorrect)
        setJoinedName(nameRef.current)
        setPhase("playing")
        setError("")
        return
      }
      if (message.type === "rejected") {
        setError(REJECT_MESSAGE[message.reason] ?? "เข้าห้องไม่สำเร็จ")
        setPhase("form")
        socket.close()
        return
      }
      if (message.type === "kicked") {
        setError("ผู้ดำเนินรายการเอาคุณออกจากห้องแล้ว")
        setPhase("form")
      }
    },
  })

  const join = (event: React.FormEvent) => {
    event.preventDefault()
    if (!isValidPin(pin)) {
      setError("PIN ต้องเป็นตัวเลข 6 หลัก")
      return
    }
    if (name.trim().length < 2) {
      setError("ใส่ชื่ออย่างน้อย 2 ตัวอักษร")
      return
    }

    playerIdRef.current = playerIdRef.current || getOrCreatePlayerId()
    nameRef.current = name.trim()
    setError("")
    setPhase("joining")
    socket.reconnect()
  }

  const answer = (event: React.FormEvent) => {
    event.preventDefault()
    if (!round?.open || myAnswer !== null || !answerText.trim()) return
    // อัปเดตทันทีไม่รอ server ตอบกลับ ผู้เล่นจะได้เห็นว่ากดติดแล้ว
    const value = answerText.trim()
    setMyAnswer(value)
    socket.send(JSON.stringify({ type: "answer", answer: value }))
  }

  const leave = () => {
    socket.close()
    setPhase("form")
    setRound(null)
    setMyAnswer(null)
    setMyAnswerCorrect(null)
    setAnswerText("")
  }

  if (phase === "playing") {
    const canAnswer = round?.open === true && myAnswer === null

    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-5">
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{joinedName}</p>
            <p className="text-muted-foreground text-xs">PIN {pin}</p>
          </div>
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <UsersRoundIcon className="size-4" aria-hidden="true" />
            <span className="tabular-nums" data-testid="play-player-count">
              {playerCount}
            </span>
          </span>
        </header>

        {online ? null : (
          <p
            className="bg-general-red/10 text-general-red flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
            role="status"
          >
            <WifiOffIcon className="size-4" aria-hidden="true" />
            เน็ตหลุด กำลังต่อกลับเข้าห้อง
          </p>
        )}

        {round ? (
          <div className="flex flex-1 flex-col justify-center gap-4" data-testid="play-song-answer">
            <div className="rounded-3xl border border-general-blue/20 bg-general-blue/8 p-5 text-center">
              <Music2Icon className="text-general-blue mx-auto size-8" aria-hidden="true" />
              <p className="mt-3 text-lg font-bold">ทายชื่อเพลง</p>
              <p className="text-muted-foreground mt-1 text-sm" aria-live="polite">
                {canAnswer
                  ? `อินโทรกำลังเล่น ${round.durationSeconds} วินาที · พิมพ์คำตอบของคุณ`
                  : myAnswer !== null
                    ? myAnswerCorrect
                      ? "ตอบถูกแล้ว! รอเฉลยบนจอใหญ่"
                      : "ส่งคำตอบแล้ว รอเฉลยบนจอใหญ่"
                    : "รอผู้ดำเนินรายการเปิดรอบถัดไป"}
              </p>
            </div>

            <form className="space-y-2" onSubmit={answer}>
              <Label htmlFor="play-song-title">ชื่อเพลงที่คุณได้ยิน</Label>
              <div className="flex gap-2">
                <Input
                  id="play-song-title"
                  value={answerText}
                  onChange={(event) => setAnswerText(event.target.value)}
                  disabled={!canAnswer}
                  autoComplete="off"
                  maxLength={120}
                  placeholder="พิมพ์ชื่อเพลง"
                  className="h-12 min-w-0 flex-1"
                />
                <Button
                  type="submit"
                  disabled={!canAnswer || !answerText.trim()}
                  className="h-12 shrink-0"
                  data-testid="play-answer-submit"
                >
                  <SendIcon className="size-4" aria-hidden="true" />
                  ส่ง
                </Button>
              </div>
            </form>

            {myAnswer !== null ? (
              <p className={cn("flex items-center justify-center gap-2 text-sm", myAnswerCorrect ? "text-general-green" : "text-muted-foreground")}>
                <CheckCircle2Icon className="size-4" aria-hidden="true" />
                ส่งคำตอบ “{myAnswer}” แล้ว
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground flex-1 py-16 text-center text-sm">
            {hostOnline
              ? "รอผู้ดำเนินรายการเริ่มเกม"
              : "รอผู้ดำเนินรายการเปิดจอห้อง"}
          </p>
        )}

        <Button variant="outline" onClick={leave}>
          ออกจากห้อง
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-5">
      <header className="text-center">
        <p className="text-general-blue mb-1 flex items-center justify-center gap-2 text-sm font-semibold">
          <Music2Icon className="size-4" aria-hidden="true" />
          MUSIC QUIZ
        </p>
        <h1 className="text-3xl font-bold tracking-tight">เข้าห้องเล่นเกม</h1>
      </header>

      <form className="space-y-4" onSubmit={join} data-testid="play-join-form">
        <div className="space-y-2">
          <Label htmlFor="play-pin">PIN ห้อง</Label>
          <Input
            id="play-pin"
            inputMode="numeric"
            autoComplete="off"
            placeholder="123456"
            className="h-14 text-center text-2xl tracking-[0.3em] tabular-nums"
            value={pin}
            onChange={(event) => setPin(normalizePin(event.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="play-name">ชื่อที่จะให้คนอื่นเห็น</Label>
          <Input
            id="play-name"
            autoComplete="nickname"
            maxLength={20}
            placeholder="ชื่อเล่นของคุณ"
            className="h-12"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        {error ? (
          <p
            className="text-general-red text-sm"
            role="alert"
            data-testid="play-error"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-12 w-full text-base"
          disabled={phase === "joining"}
          data-testid="play-join"
        >
          {phase === "joining" ? (
            <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          เข้าห้อง
        </Button>
      </form>
    </main>
  )
}
