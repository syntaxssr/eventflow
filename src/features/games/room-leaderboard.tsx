"use client"

import * as React from "react"
import {
  CheckIcon,
  Maximize2Icon,
  RefreshCwIcon,
  UserRoundXIcon,
  UsersRoundIcon,
  WifiIcon,
  WifiOffIcon,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useOrigin } from "@/hooks/use-origin"
import { joinUrl, type QuizPlayer } from "@/lib/quiz-room"
import { cn } from "@/lib/utils"
import styles from "./room-leaderboard.module.css"

type RoomLeaderboardProps = {
  pin: string
  players: QuizPlayer[]
  answeredPlayerIds: string[]
  connected: boolean
  onKick: (playerId: string) => void
  onResetPin: () => void
  className?: string
}

/**
 * การ์ดขวาของโซนเกมส์ — คนที่จอยเข้าห้องนี้
 *
 * ห้องไม่เก็บคะแนน จึงเรียงตามลำดับที่เข้าห้อง และไฮไลต์คนที่ตอบรอบล่าสุดแล้ว
 */
export function RoomLeaderboard({
  pin,
  players,
  answeredPlayerIds,
  connected,
  onKick,
  onResetPin,
  className,
}: RoomLeaderboardProps) {
  const origin = useOrigin()
  const answered = new Set(answeredPlayerIds)
  const onlineCount = players.filter((player) => player.connected).length

  const countRef = React.useRef<HTMLSpanElement>(null)
  const previousCountRef = React.useRef(onlineCount)

  React.useEffect(() => {
    if (previousCountRef.current === onlineCount) return
    previousCountRef.current = onlineCount

    const el = countRef.current
    if (!el) return
    el.classList.remove(styles.countBounce)
    void el.offsetWidth
    el.classList.add(styles.countBounce)
  }, [onlineCount])

  // รายชื่อยาวเกินพื้นที่การ์ด — เลื่อนขึ้นวนอัตโนมัติให้ทุกคนได้เห็นชื่อตัวเอง
  const listRef = React.useRef<HTMLOListElement>(null)
  const [needsAutoScroll, setNeedsAutoScroll] = React.useState(false)

  React.useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    // เช็คตอนที่ยังไม่มีชุดซ้ำ (เอฟเฟกต์ก่อนหน้ารีเซ็ต scrollTop ไว้แล้วตอน unmount)
    setNeedsAutoScroll(el.scrollHeight > el.clientHeight)
  }, [players.length])

  React.useEffect(() => {
    const el = listRef.current
    if (!el || !needsAutoScroll) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frameId: number
    let paused = false

    const tick = () => {
      if (!paused) {
        const singleSetHeight = el.scrollHeight / 2
        el.scrollTop += 0.4
        if (el.scrollTop >= singleSetHeight) el.scrollTop -= singleSetHeight
      }
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)

    // เมาส์ชี้ค้างไว้เพื่อกดเตะคนออกได้โดยรายชื่อไม่วิ่งหนี
    const pause = () => {
      paused = true
    }
    const resume = () => {
      paused = false
    }
    el.addEventListener("pointerenter", pause)
    el.addEventListener("pointerleave", resume)

    return () => {
      cancelAnimationFrame(frameId)
      el.removeEventListener("pointerenter", pause)
      el.removeEventListener("pointerleave", resume)
      el.scrollTop = 0
    }
  }, [needsAutoScroll])

  const renderPlayerRow = (
    player: QuizPlayer,
    index: number,
    duplicate: boolean
  ) => (
    <li
      key={duplicate ? `${player.id}-loop` : player.id}
      aria-hidden={duplicate || undefined}
      className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] items-center gap-2 border-t py-2.5 first:border-t-0"
    >
      <span className="bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-lg text-xs font-semibold tabular-nums">
        {index + 1}
      </span>
      <span
        className={cn(
          "truncate text-sm",
          player.connected ? "" : "text-muted-foreground/70 line-through"
        )}
      >
        {player.name}
      </span>
      {answered.has(player.id) ? (
        <CheckIcon
          className="text-general-green size-4"
          aria-label="ตอบแล้ว"
        />
      ) : (
        <span className="size-4" aria-hidden="true" />
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground size-7"
        onClick={() => onKick(player.id)}
        aria-label={`เอา ${player.name} ออกจากห้อง`}
        tabIndex={duplicate ? -1 : undefined}
      >
        <UserRoundXIcon className="size-4" aria-hidden="true" />
      </Button>
    </li>
  )

  return (
    <Card
      className={cn("h-full min-h-0", className)}
      aria-label="คนในห้องเล่นสด"
      data-testid="quiz-room-panel"
    >
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <UsersRoundIcon className="text-info size-5" aria-hidden="true" />
            คนในห้อง
          </h2>
          <span className="bg-muted flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-semibold">
            <span
              className="bg-general-green size-2 rounded-full"
              aria-hidden="true"
            />
            <span
              ref={countRef}
              className="inline-block tabular-nums"
              data-testid="quiz-room-count"
            >
              {onlineCount}
            </span>
          </span>
        </div>

        <div className="bg-muted/60 rounded-xl px-3 py-3 text-center">
          <div className="mx-auto inline-flex rounded-lg bg-white p-1.5">
            {pin && origin ? (
              <QRCodeSVG
                value={joinUrl(origin, pin)}
                size={128}
                marginSize={1}
              />
            ) : (
              <span className="text-muted-foreground flex size-28 items-center justify-center text-[0.65rem]">
                กำลังสร้างห้อง…
              </span>
            )}
          </div>
          <p
            className="mt-2 text-3xl font-bold tracking-[0.18em] tabular-nums"
            data-testid="quiz-room-pin"
          >
            {pin || "······"}
          </p>
          {pin && origin ? (
            <p className="text-muted-foreground mt-1 text-[0.7rem] break-all">
              {joinUrl(origin, pin)}
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-1",
                connected
                  ? "bg-general-green/15 text-general-green"
                  : "bg-general-red/15 text-general-red"
              )}
              role="status"
            >
              {connected ? (
                <WifiIcon className="size-3.5" aria-hidden="true" />
              ) : (
                <WifiOffIcon className="size-3.5" aria-hidden="true" />
              )}
              {connected ? "ห้องพร้อม" : "ยังไม่ได้ต่อห้อง"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={onResetPin}
            >
              <RefreshCwIcon className="size-3.5" aria-hidden="true" />
              PIN ใหม่
            </Button>
            {pin && origin ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    <Maximize2Icon className="size-3.5" aria-hidden="true" />
                    ขยาย
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md text-center sm:max-w-lg">
                  <DialogTitle className="sr-only">
                    QR สแกนเข้าห้อง PIN {pin}
                  </DialogTitle>
                  <div className="mx-auto inline-flex rounded-2xl bg-white p-4">
                    <QRCodeSVG
                      value={joinUrl(origin, pin)}
                      size={288}
                      marginSize={1}
                    />
                  </div>
                  <p className="mt-6 text-7xl font-bold tracking-[0.2em] tabular-nums">
                    {pin}
                  </p>
                  <p className="text-muted-foreground mt-3 text-base break-all">
                    {joinUrl(origin, pin)}
                  </p>
                </DialogContent>
              </Dialog>
            ) : null}
          </div>
        </div>

        {players.length === 0 ? (
          <p className="text-muted-foreground flex-1 px-2 py-8 text-center text-sm leading-6">
            ยังไม่มีใครเข้าห้อง
            <br />
            ให้ผู้เข้าร่วมกรอก PIN จากมือถือ
          </p>
        ) : (
          <ol
            ref={listRef}
            className="min-h-0 flex-1 space-y-1 overflow-y-auto"
            data-testid="quiz-room-players"
          >
            {players.map((player, index) => renderPlayerRow(player, index, false))}
            {needsAutoScroll
              ? players.map((player, index) => renderPlayerRow(player, index, true))
              : null}
          </ol>
        )}

        <p className="text-muted-foreground border-t pt-3 text-xs leading-5">
          ตอบแล้ว {answered.size} จาก {onlineCount} คน
        </p>
      </CardContent>
    </Card>
  )
}
