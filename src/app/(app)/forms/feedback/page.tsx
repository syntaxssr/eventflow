import type { Metadata } from "next"

import { EventFeedbackView } from "@/features/forms/event-feedback-view"

export const metadata: Metadata = {
  title: "ประเมินหลังจบงาน",
}

export default function EventFeedbackPage() {
  return <EventFeedbackView />
}
