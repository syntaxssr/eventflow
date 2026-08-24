import type { Metadata } from "next"

import { GamesPageView } from "@/features/games/games-page-view"

export const metadata: Metadata = {
  title: "เกมส์",
}

export default function GamesPage() {
  return <GamesPageView />
}
