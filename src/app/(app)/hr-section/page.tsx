import type { Metadata } from "next"

import { HrSectionPageView } from "@/features/hr-section/hr-section-page-view"

export const metadata: Metadata = {
  title: "HR Section",
}

export default function HrSectionPage() {
  return <HrSectionPageView />
}
