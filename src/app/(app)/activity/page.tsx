import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/common/page-placeholder"

export const metadata: Metadata = {
  title: "ประวัติการใช้งาน",
}

export default function Page() {
  return <PagePlaceholder titleKey="nav.activity" phase="Phase 9 — Activity History" />
}
