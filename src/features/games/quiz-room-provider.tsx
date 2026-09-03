"use client"

import * as React from "react"

import { useQuizRoomHost } from "./use-quiz-room-host"

type QuizRoomContextValue = ReturnType<typeof useQuizRoomHost>

const QuizRoomContext = React.createContext<QuizRoomContextValue | null>(null)

/**
 * ห้องเล่นสดของโซนเกมส์ — provider อยู่บน layout ของ `/games`
 *
 * ต่อห้องครั้งเดียวแล้วอยู่ยาว สลับไปมาระหว่างหน้าเลือกเกมกับตัวเกมได้
 * โดยที่ PIN และรายชื่อคนในห้องไม่รีเซ็ต
 */
export function QuizRoomProvider({ children }: { children: React.ReactNode }) {
  const room = useQuizRoomHost()
  return <QuizRoomContext value={room}>{children}</QuizRoomContext>
}

export function useQuizRoom() {
  const context = React.use(QuizRoomContext)
  if (!context) {
    throw new Error("useQuizRoom ต้องอยู่ภายใต้ QuizRoomProvider")
  }
  return context
}
