import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/common/page-placeholder"

export const metadata: Metadata = {
  title: "แดชบอร์ด",
}

export default function Page() {
  return <PagePlaceholder titleKey="nav.dashboard" phase="Phase 2 — Dashboard" />
}
