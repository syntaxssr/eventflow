import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/common/page-placeholder"

export const metadata: Metadata = {
  title: "งานของฉัน",
}

export default function Page() {
  return <PagePlaceholder titleKey="nav.myTasks" phase="Phase 4 — Task, Kanban & Checklist" />
}
