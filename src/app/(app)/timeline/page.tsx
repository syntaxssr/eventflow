import type { Metadata } from "next"

import { TimelinePageView } from "@/features/timeline/timeline-page-view"

export const metadata: Metadata = {
  title: "ไทม์ไลน์",
}

export default function TimelinePage() {
  return <TimelinePageView />
}
