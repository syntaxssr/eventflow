import type { Metadata } from "next"

import { EventDetailView } from "@/features/events/event-detail-view"

export const metadata: Metadata = {
  title: "รายละเอียดกิจกรรม",
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EventDetailView eventId={id} />
}
