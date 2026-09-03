"use client"

import { RoomLeaderboard } from "./room-leaderboard"
import { usePresentationMode } from "./presentation-mode-provider"
import { useQuizRoom } from "./quiz-room-provider"

/** การ์ดขวาของทุกหน้าในโซนเกมส์ — คนที่จอยเข้าห้องเดียวกันตลอดงาน */
export function GamesRoomPanel() {
  const room = useQuizRoom()
  const { presentationMode } = usePresentationMode()

  return (
    <RoomLeaderboard
      pin={room.pin}
      players={room.players}
      answeredPlayerIds={room.answeredPlayerIds}
      connected={room.connected}
      onKick={room.kick}
      onResetPin={room.resetPin}
      // เต็มจอไม่มี topbar ให้เลื่อนต่ำกว่า จึงตัด sticky ทิ้งให้ชิดขอบบนเท่าการ์ดฝั่งซ้าย
      className={presentationMode ? "xl:static xl:top-auto" : undefined}
    />
  )
}
