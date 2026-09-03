"use client"

import * as React from "react"
import usePartySocket from "partysocket/react"

import {
  getHostPin,
  getHostPinOnServer,
  regenerateHostPin,
  subscribeHostPin,
} from "@/lib/quiz-room-host-store"
import {
  PARTYKIT_HOST,
  parseServerMessage,
  type QuizPlayer,
  type QuizRoomRound,
} from "@/lib/quiz-room"

/**
 * ฝั่งโฮสต์ของห้องเล่นสด — เปิด PIN, รับรายชื่อผู้เล่น, ส่งรอบที่กำลังเล่น
 *
 * ห้องไม่เก็บคะแนน จอโฮสต์จึงใช้แค่จำนวนคนในห้อง รายชื่อ และใครตอบแล้ว
 */
export function useQuizRoomHost() {
  const pin = React.useSyncExternalStore(
    subscribeHostPin,
    getHostPin,
    getHostPinOnServer
  )
  const [players, setPlayers] = React.useState<QuizPlayer[]>([])
  const [answeredPlayerIds, setAnsweredPlayerIds] = React.useState<string[]>([])
  const [connected, setConnected] = React.useState(false)

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: pin || "lobby",
    startClosed: !pin,
    onOpen() {
      setConnected(true)
      socket.send(JSON.stringify({ type: "join", role: "host" }))
    },
    onClose() {
      setConnected(false)
    },
    onMessage(event: MessageEvent<string>) {
      const message = parseServerMessage(event.data)
      if (message?.type !== "state") return
      setPlayers(message.players)
      setAnsweredPlayerIds(message.answeredPlayerIds)
    },
  })

  const publishRound = React.useCallback(
    (round: QuizRoomRound) => {
      if (!connected) return
      socket.send(JSON.stringify({ type: "round", round }))
    },
    [connected, socket]
  )

  const kick = React.useCallback(
    (playerId: string) => {
      socket.send(JSON.stringify({ type: "kick", playerId }))
    },
    [socket]
  )

  const resetPin = React.useCallback(() => {
    regenerateHostPin()
    setPlayers([])
    setAnsweredPlayerIds([])
  }, [])

  return {
    pin,
    players,
    answeredPlayerIds,
    connected,
    publishRound,
    kick,
    resetPin,
  }
}
