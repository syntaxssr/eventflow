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
import { selectActiveEvents, selectParticipantsByEvent } from "@/store/selectors"
import { FeedbackResponseForm } from "./feedback-response-form"
import { FeedbackSummaryPanel } from "./feedback-summary-panel"

/**
 * หน้าแบบประเมินหลังจบงาน — ฟอร์มกับสรุปผลอยู่หน้าเดียวกันแบบเดียวกับ RSVP
 * เปิดให้ประเมินเฉพาะกิจกรรมที่จบแล้ว งานที่ยังไม่เกิดยังไม่มีอะไรให้ประเมิน
 */
export function EventFeedbackView() {
  const { t } = useLocale()
  const state = useAppState()

  const events = React.useMemo(
    () =>
      selectActiveEvents(state)
        .filter((event) => event.status === "completed")
        .sort((a, b) => b.endDate.localeCompare(a.endDate)),
    [state]
  )

  const [selectedEventId, setSelectedEventId] = React.useState(
    () => events[0]?.id ?? ""
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
        title={t("eventFeedback.noEvents")}
        description={t("eventFeedback.noEventsDescription")}
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
        <FeedbackResponseForm
          events={events}
          eventId={activeEventId}
          onEventChange={setSelectedEventId}
          participants={participants}
        />
        <FeedbackSummaryPanel eventId={activeEventId} />
      </div>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={t("eventFeedback.title")}
        description={t("eventFeedback.subtitle")}
      />
      {body}
    </PageContainer>
  )
}
