import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/common/page-placeholder"

export const metadata: Metadata = {
  title: "ผู้เข้าร่วม",
}

export default function Page() {
  return <PagePlaceholder titleKey="nav.participants" phase="Phase 7 — Participants & Excel Import" />
}
