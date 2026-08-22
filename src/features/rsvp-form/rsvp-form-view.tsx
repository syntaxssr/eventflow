"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarOffIcon } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { PageContainer, PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ROUTES } from "@/constants/app"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import { useAppState } from "@/store"
import {
  compareEventsByRelevance,
  selectActiveEvents,
  selectParticipantsByEvent,
  selectUpcomingEvents,
} from "@/store/selectors"
import { RsvpResponseForm } from "./rsvp-response-form"
import { RsvpSummaryPanel } from "./rsvp-summary-panel"

/** หน้าแบบฟอร์ม RSVP — ฟอร์มตอบรับกับสรุปผลอยู่หน้าเดียวกัน */
export function RsvpFormView() {
  const { t } = useLocale()
  const state = useAppState()

  // กิจกรรมที่เปิดรับการตอบรับ — ตัดที่ยกเลิกออก เพราะไม่มีอะไรให้ตอบแล้ว
  const events = React.useMemo(
    () =>
      selectActiveEvents(state)
        .filter((event) => event.status !== "cancelled")
        .sort((a, b) => compareEventsByRelevance(a, b)),
    [state]
  )

  const [selectedEventId, setSelectedEventId] = React.useState(
    () => selectUpcomingEvents(state)[0]?.id ?? events[0]?.id ?? ""
  )
  const activeEventId = events.some((event) => event.id === selectedEventId)
    ? selectedEventId
    : (events[0]?.id ?? "")

  const participants = React.useMemo(
    () => selectParticipantsByEvent(state, activeEventId),
    [state, activeEventId]
  )

  const { state: pageState, retry } = usePageState(events.length === 0)

  let body: React.ReactNode
  if (pageState === "error") {
    body = <ErrorState onRetry={retry} />
  } else if (pageState === "loading") {
    body = (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Skeleton className="h-[28rem]" />
        <Skeleton className="h-[28rem]" />
      </div>
    )
  } else if (pageState === "empty") {
    body = (
      <EmptyState
        icon={CalendarOffIcon}
        title={t("rsvpForm.noEvents")}
        description={t("rsvpForm.noEventsDescription")}
        action={
          <Button variant="outline" asChild>
            <Link href={ROUTES.events}>{t("nav.events")}</Link>
          </Button>
        }
      />
    )
  } else {
    body = (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <RsvpResponseForm
          events={events}
          eventId={activeEventId}
          onEventChange={setSelectedEventId}
          participants={participants}
        />
        <RsvpSummaryPanel eventId={activeEventId} participants={participants} />
      </div>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={t("rsvpForm.title")}
        description={t("rsvpForm.subtitle")}
      />
      {body}
    </PageContainer>
  )
}
