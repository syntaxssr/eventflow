import type { Metadata } from "next"

import { TrashView } from "@/features/trash/trash-view"

export const metadata: Metadata = {
  title: "ถังขยะ",
}

export default function TrashPage() {
  return <TrashView />
}
