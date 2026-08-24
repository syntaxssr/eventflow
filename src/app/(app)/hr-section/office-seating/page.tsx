import type { Metadata } from "next"

import { OfficeSeatingPageView } from "@/features/hr-section/office-seating-page-view"

export const metadata: Metadata = {
  title: "ตำแหน่งที่นั่งในออฟฟิศ",
}

export default function OfficeSeatingPage() {
  return <OfficeSeatingPageView />
}
