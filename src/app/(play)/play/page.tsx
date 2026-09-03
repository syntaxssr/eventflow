import type { Metadata } from "next"
import { Suspense } from "react"

import { QuizPlayView } from "@/features/quiz-play/quiz-play-view"

export const metadata: Metadata = {
  title: "เข้าห้องเล่นเกม",
}

export default function PlayPage() {
  return (
    <Suspense>
      <QuizPlayView />
    </Suspense>
  )
}
