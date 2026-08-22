import type { Metadata } from "next"

import { RsvpFormView } from "@/features/rsvp-form/rsvp-form-view"

export const metadata: Metadata = {
  title: "แบบฟอร์ม RSVP",
}

export default function RsvpFormPage() {
  return <RsvpFormView />
}
