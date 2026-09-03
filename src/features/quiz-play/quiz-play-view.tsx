"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2Icon,
  LoaderCircleIcon,
  Music2Icon,
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
 * จอนี้ไม่แสดงเนื้อเกม มีแค่ช้อยส์ให้กด ส่วนเพลง คำถาม และเฉลยอยู่บนจอโฮสต์
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
  const [myAnswer, setMyAnswer] = React.useState<number | null>(null)
  const [online, setOnline] = React.useState(false)

  const playerIdRef = React.useRef("")
  const nameRef = React.useRef("")

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
        setPlayerCount(message.players.filter((player) => player.connected).length)
        setHostOnline(message.hostOnline)
        setRound(message.round)
        setMyAnswer(message.myAnswer)
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

  const answer = (choiceIndex: number) => {
    if (!round?.open || myAnswer !== null) return
    // อัปเดตทันทีไม่รอ server ตอบกลับ ผู้เล่นจะได้เห็นว่ากดติดแล้ว
    setMyAnswer(choiceIndex)
    socket.send(JSON.stringify({ type: "answer", choiceIndex }))
  }

  const leave = () => {
    socket.close()
    setPhase("form")
    setRound(null)
    setMyAnswer(null)
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
          <div className="flex flex-1 flex-col gap-3" data-testid="play-choices">
            <p className="text-muted-foreground text-center text-sm" aria-live="polite">
              {canAnswer
                ? "เลือกคำตอบของคุณ"
                : myAnswer !== null
                  ? "ส่งคำตอบแล้ว รอผลบนจอใหญ่"
                  : "รอผู้ดำเนินรายการเปิดรอบถัดไป"}
            </p>
            {round.choices.map((choice, index) => (
              <button
                key={`${round.index}-${choice}`}
                type="button"
                disabled={!canAnswer}
                onClick={() => answer(index)}
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-2xl border px-4 text-left text-base font-medium transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  myAnswer === index
                    ? "border-general-green bg-general-green/15"
                    : "bg-card hover:border-general-blue"
                )}
                data-testid={`play-choice-${index}`}
              >
                <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="min-w-0 flex-1">{choice}</span>
                {myAnswer === index ? (
                  <CheckCircle2Icon
                    className="text-general-green size-5 shrink-0"
                    aria-label="คำตอบที่ส่งแล้ว"
                  />
                ) : null}
              </button>
            ))}
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
