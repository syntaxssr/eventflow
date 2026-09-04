"use client"

import { RoomLeaderboard } from "./room-leaderboard"
import { useQuizRoom } from "./quiz-room-provider"

/** การ์ดขวาของทุกหน้าในโซนเกมส์ — คนที่จอยเข้าห้องเดียวกันตลอดงาน */
export function GamesRoomPanel() {
  const room = useQuizRoom()

  return (
    <RoomLeaderboard
      pin={room.pin}
      players={room.players}
      answeredPlayerIds={room.answeredPlayerIds}
      connected={room.connected}
      onKick={room.kick}
      onResetPin={room.resetPin}
    />
  )
}
