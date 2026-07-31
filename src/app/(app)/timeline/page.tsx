import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/common/page-placeholder"

export const metadata: Metadata = {
  title: "ไทม์ไลน์",
}

export default function Page() {
  return <PagePlaceholder titleKey="nav.timeline" phase="Phase 5 — Timeline, Calendar & Gantt" />
}
