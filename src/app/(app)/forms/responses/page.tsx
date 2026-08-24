import type { Metadata } from "next"

import { FormResponsesView } from "@/features/forms/form-responses-view"

export const metadata: Metadata = {
  title: "ผลตอบกลับ / สรุปผล",
}

export default function FormResponsesPage() {
  return <FormResponsesView />
}
