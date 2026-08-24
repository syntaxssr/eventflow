"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarOffIcon, StarIcon } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { PageContainer, PageHeader } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ROUTES } from "@/constants/app"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import {
  selectFeedbackByEvent,
  summariseFeedback,
} from "@/lib/event-feedback"
import { formatDateRange } from "@/lib/format"
import { responseRate } from "@/lib/rsvp-form"
import { useAppState } from "@/store"
import {
  compareEventsByRelevance,
  selectActiveEvents,
  selectParticipantsByEvent,
  summariseRsvp,
} from "@/store/selectors"

/**
 * หน้าผลตอบกลับ — รวมสถานะตอบรับและผลประเมินของทุกกิจกรรมไว้ใบเดียวต่อกิจกรรม
 * อ่านอย่างเดียว ใครจะแก้คำตอบให้กดเข้าไปที่แบบฟอร์มต้นทาง
 */
export function FormResponsesView() {
  const { t, tl, locale } = useLocale()
  const state = useAppState()

  const events = React.useMemo(
    () =>
      selectActiveEvents(state)
        .filter((event) => event.status !== "cancelled")
        .sort((a, b) => compareEventsByRelevance(a, b)),
    [state]
  )

  const rows = React.useMemo(
    () =>
      events.map((event) => {
        const participants = selectParticipantsByEvent(state, event.id)
        const feedback = selectFeedbackByEvent(state.feedback, event.id)

        return {
          event,
          rsvp: summariseRsvp(participants),
          feedback: summariseFeedback(feedback),
          // แบบประเมินเปิดเมื่อกิจกรรมจบแล้วเท่านั้น
          feedbackOpen: event.status === "completed",
        }
      }),
    [events, state]
  )

  const totals = React.useMemo(
    () =>
      rows.reduce(
        (sum, row) => ({
          invited: sum.invited + row.rsvp.total,
          attending: sum.attending + row.rsvp.attending,
          feedback: sum.feedback + row.feedback.total,
        }),
        { invited: 0, attending: 0, feedback: 0 }
      ),
    [rows]
  )

  const { state: pageState, retry } = usePageState(events.length === 0)

  let body: React.ReactNode
  if (pageState === "error") {
    body = <ErrorState onRetry={retry} />
  } else if (pageState === "loading") {
    body = (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    )
  } else if (pageState === "empty") {
    body = (
      <EmptyState
        icon={CalendarOffIcon}
        title={t("formResponses.noEvents")}
        description={t("formResponses.noEventsDescription")}
        action={
          <Button variant="outline" asChild>
            <Link href={ROUTES.events}>{t("nav.events")}</Link>
          </Button>
        }
      />
    )
  } else {
    body = (
      <>
        <Card data-testid="form-responses-totals">
          <CardHeader>
            <CardTitle>{t("formResponses.totalsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-muted/40 rounded-lg px-2 py-3">
              <p className="text-2xl font-semibold tabular-nums">
                {totals.invited}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("formResponses.totalInvited")}
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg px-2 py-3">
              <p className="text-2xl font-semibold tabular-nums">
                {totals.attending}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("formResponses.totalAttending")}
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg px-2 py-3">
              <p className="text-2xl font-semibold tabular-nums">
                {totals.feedback}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("formResponses.totalFeedback")}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => {
            const rate = responseRate(row.rsvp)

            return (
              <Card key={row.event.id} data-testid={`form-response-${row.event.id}`}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {tl(row.event.title)}
                  </CardTitle>
                  <p className="text-muted-foreground text-xs">
                    {formatDateRange(
                      row.event.startDate,
                      row.event.endDate,
                      locale
                    )}
                    {" · "}
                    {t("formResponses.invited")} {row.rsvp.total}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <p className="font-medium">
                        {t("formResponses.rsvpTitle")}
                      </p>
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {t("formResponses.responseRate")} {rate}%
                      </p>
                    </div>
                    <Progress
                      value={rate}
                      aria-label={t("formResponses.responseRate")}
                    />
                    <dl className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <dt className="text-muted-foreground">
                          {t("formResponses.attending")}
                        </dt>
                        <dd className="text-success mt-0.5 text-base font-semibold tabular-nums">
                          {row.rsvp.attending}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          {t("formResponses.notAttending")}
                        </dt>
                        <dd className="mt-0.5 text-base font-semibold tabular-nums">
                          {row.rsvp.notAttending}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          {t("formResponses.pending")}
                        </dt>
                        <dd className="mt-0.5 text-base font-semibold tabular-nums">
                          {row.rsvp.pending}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <p className="font-medium">
                        {t("formResponses.feedbackTitle")}
                      </p>
                      {row.feedbackOpen ? null : (
                        <Badge variant="secondary">
                          {t("formResponses.feedbackNotOpen")}
                        </Badge>
                      )}
                    </div>

                    {!row.feedbackOpen ? (
                      <p className="text-muted-foreground text-xs">
                        {t("formResponses.feedbackNotOpenHint")}
                      </p>
                    ) : row.feedback.total === 0 ? (
                      <p className="text-muted-foreground text-xs">
                        {t("formResponses.noFeedback")}
                      </p>
                    ) : (
                      <dl className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div>
                          <dt className="text-muted-foreground">
                            {t("formResponses.feedbackResponses")}
                          </dt>
                          <dd className="mt-0.5 text-base font-semibold tabular-nums">
                            {row.feedback.total}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            {t("formResponses.feedbackAverage")}
                          </dt>
                          <dd className="mt-0.5 flex items-center justify-center gap-1 text-base font-semibold tabular-nums">
                            <StarIcon
                              className="fill-warning text-warning size-4"
                              aria-hidden="true"
                            />
                            {row.feedback.overallAverage}
                          </dd>
                        </div>
                      </dl>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={ROUTES.rsvpForm}>
                        {t("formResponses.openRsvp")}
                      </Link>
                    </Button>
                    {row.feedbackOpen ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={ROUTES.eventFeedback}>
                          {t("formResponses.openFeedback")}
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={t("formResponses.title")}
        description={t("formResponses.subtitle")}
      />
      {body}
    </PageContainer>
  )
}
