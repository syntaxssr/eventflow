import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/common/page-placeholder"

export const metadata: Metadata = {
  title: "การแจ้งเตือน",
}

export default function Page() {
  return <PagePlaceholder titleKey="nav.notifications" phase="Phase 8 — Collaboration & Notifications" />
}
