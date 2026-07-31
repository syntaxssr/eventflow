import { Suspense } from "react"
import type { Metadata } from "next"

import { ParticipantsPageView } from "@/features/participants/participants-page-view"

export const metadata: Metadata = {
  title: "ผู้เข้าร่วม",
}

export default function Page() {
  return (
    <Suspense>
      <ParticipantsPageView />
    </Suspense>
  )
}
