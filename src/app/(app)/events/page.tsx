import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/common/page-placeholder"

export const metadata: Metadata = {
  title: "กิจกรรม",
}

export default function Page() {
  return <PagePlaceholder titleKey="nav.events" phase="Phase 3 — Event Management" />
}
