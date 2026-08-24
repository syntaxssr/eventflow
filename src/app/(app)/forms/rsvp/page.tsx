import type { Metadata } from "next"

import { RsvpFormView } from "@/features/rsvp-form/rsvp-form-view"

export const metadata: Metadata = {
  title: "ตอบรับเข้าร่วมงาน",
}

export default function RsvpFormPage() {
  return <RsvpFormView />
}
