"use client"

import {
  CheckIcon,
  RefreshCwIcon,
  UserRoundXIcon,
  UsersRoundIcon,
  WifiIcon,
  WifiOffIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useOrigin } from "@/hooks/use-origin"
import { joinUrl, type QuizPlayer } from "@/lib/quiz-room"
import { cn } from "@/lib/utils"

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

  return (
    <Card
      className={cn("xl:sticky xl:top-20", className)}
      aria-label="คนในห้องเล่นสด"
      data-testid="quiz-room-panel"
    >
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <UsersRoundIcon className="text-info size-5" aria-hidden="true" />
            คนในห้อง
          </h2>
          <span
            className="bg-muted rounded-lg px-2.5 py-1 text-sm font-semibold tabular-nums"
            data-testid="quiz-room-count"
          >
            {onlineCount}
          </span>
        </div>

        <div className="bg-muted/60 rounded-xl px-3 py-3 text-center">
          <p className="text-muted-foreground text-xs">
            เข้าที่ {origin || "…"}/play
          </p>
          <p
            className="mt-1 text-3xl font-bold tracking-[0.18em] tabular-nums"
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
          </div>
        </div>

        {players.length === 0 ? (
          <p className="text-muted-foreground px-2 py-8 text-center text-sm leading-6">
            ยังไม่มีใครเข้าห้อง
            <br />
            ให้ผู้เข้าร่วมกรอก PIN จากมือถือ
          </p>
        ) : (
          <ol
            className="max-h-[26rem] space-y-1 overflow-y-auto"
            data-testid="quiz-room-players"
          >
            {players.map((player, index) => (
              <li
                key={player.id}
                className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] items-center gap-2 border-t py-2.5 first:border-t-0"
              >
                <span className="bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-lg text-xs font-semibold tabular-nums">
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "truncate text-sm",
                    player.connected
                      ? ""
                      : "text-muted-foreground/70 line-through"
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
                >
                  <UserRoundXIcon className="size-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ol>
        )}

        <p className="text-muted-foreground border-t pt-3 text-xs leading-5">
          ตอบแล้ว {answered.size} จาก {onlineCount} คน
        </p>
      </CardContent>
    </Card>
  )
}
