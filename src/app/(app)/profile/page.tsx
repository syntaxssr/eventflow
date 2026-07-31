import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/common/page-placeholder"

export const metadata: Metadata = {
  title: "โปรไฟล์",
}

export default function Page() {
  return <PagePlaceholder titleKey="nav.profile" phase="Phase 9 — User Profile" />
}
