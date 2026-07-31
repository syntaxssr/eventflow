import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/common/page-placeholder"

export const metadata: Metadata = {
  title: "ไฟล์",
}

export default function Page() {
  return <PagePlaceholder titleKey="nav.files" phase="Phase 6 — File Management" />
}
