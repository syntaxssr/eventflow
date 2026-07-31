import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/common/page-placeholder"

export const metadata: Metadata = {
  title: "ถังขยะ",
}

export default function Page() {
  return <PagePlaceholder titleKey="nav.trash" phase="Phase 6 — Trash" />
}
