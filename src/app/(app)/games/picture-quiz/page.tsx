import type { Metadata } from "next"

import { PictureQuizView } from "@/features/picture-quiz/picture-quiz-view"

export const metadata: Metadata = {
  title: "เกมส์ทายภาพ",
}

export default function PictureQuizPage() {
  return <PictureQuizView />
}
