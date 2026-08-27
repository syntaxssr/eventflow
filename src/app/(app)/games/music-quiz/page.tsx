import type { Metadata } from "next"

import { MusicQuizView } from "@/features/music-quiz/music-quiz-view"

export const metadata: Metadata = {
  title: "เกมส์ทายเพลง",
}

export default function MusicQuizPage() {
  return <MusicQuizView />
}
