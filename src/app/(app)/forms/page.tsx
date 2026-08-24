import type { Metadata } from "next"

import { FormsPageView } from "@/features/forms/forms-page-view"

export const metadata: Metadata = {
  title: "แบบฟอร์ม",
}

export default function FormsPage() {
  return <FormsPageView />
}
