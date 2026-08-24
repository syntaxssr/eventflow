"use client"

import * as React from "react"
import { MessageSquareTextIcon, StarIcon, ThumbsUpIcon } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import {
  listFeedbackComments,
  selectFeedbackByEvent,
  summariseFeedback,
} from "@/lib/event-feedback"
import { formatDateTime } from "@/lib/format"
import { useAppState } from "@/store"
import type { FeedbackAspect } from "@/types/feedback"
import { FEEDBACK_ASPECTS, FEEDBACK_RATING_MAX } from "@/types/feedback"

const ASPECT_LABEL_KEY: Record<FeedbackAspect, TranslationKey> = {
  overall: "eventFeedback.aspectOverall",
  content: "eventFeedback.aspectContent",
  venue: "eventFeedback.aspectVenue",
  catering: "eventFeedback.aspectCatering",
  organization: "eventFeedback.aspectOrganization",
}

/** ความเห็นที่แสดงบนแผงสรุป — ที่เหลือดูได้ในหน้าผลตอบกลับ */
const VISIBLE_COMMENT_COUNT = 4

export function FeedbackSummaryPanel({ eventId }: { eventId: string }) {
  const { t, tl, locale } = useLocale()
  const allFeedback = useAppState().feedback

  const feedback = React.useMemo(
    () => selectFeedbackByEvent(allFeedback, eventId),
    [allFeedback, eventId]
  )
  const summary = React.useMemo(() => summariseFeedback(feedback), [feedback])
  const comments = React.useMemo(
    () => listFeedbackComments(feedback, locale).slice(0, VISIBLE_COMMENT_COUNT),
    [feedback, locale]
  )

  const joinAgainRate =
    summary.total === 0
      ? 0
      : Math.round((summary.wouldJoinAgain / summary.total) * 100)

  return (
    <Card data-testid="feedback-summary">
      <CardHeader>
        <CardTitle>{t("eventFeedback.summaryTitle")}</CardTitle>
        <CardDescription>
          {t("eventFeedback.summaryDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {summary.total === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            {t("eventFeedback.noResponses")}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-muted/40 rounded-lg px-2 py-3">
                <p className="flex items-center justify-center gap-1 text-2xl font-semibold tabular-nums">
                  <StarIcon
                    className="fill-warning text-warning size-5"
                    aria-hidden="true"
                  />
                  {summary.overallAverage}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t("eventFeedback.overallAverage")}
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg px-2 py-3">
                <p className="text-2xl font-semibold tabular-nums">
                  {summary.total}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t("eventFeedback.responseCount", { count: summary.total })}
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg px-2 py-3">
                <p className="flex items-center justify-center gap-1 text-2xl font-semibold tabular-nums">
                  <ThumbsUpIcon className="size-5" aria-hidden="true" />
                  {joinAgainRate}%
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t("eventFeedback.joinAgainRate")}
                </p>
              </div>
            </div>

            <dl className="space-y-3">
              {FEEDBACK_ASPECTS.map((aspect) => (
                <div key={aspect} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <dt>{t(ASPECT_LABEL_KEY[aspect])}</dt>
                    <dd className="font-medium tabular-nums">
                      {summary.averages[aspect]}
                    </dd>
                  </div>
                  <Progress
                    value={(summary.averages[aspect] / FEEDBACK_RATING_MAX) * 100}
                    aria-label={t(ASPECT_LABEL_KEY[aspect])}
                  />
                </div>
              ))}
            </dl>

            <Separator />

            <div className="space-y-3">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <MessageSquareTextIcon className="size-4" aria-hidden="true" />
                {t("eventFeedback.latestComments")}
              </p>
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t("eventFeedback.noComments")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((entry) => (
                    <li
                      key={entry.id}
                      className="bg-muted/40 rounded-lg px-3 py-2 text-sm"
                    >
                      <p>{tl(entry.comment)}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {tl(entry.participantName) ||
                          t("eventFeedback.anonymous")}
                        {" · "}
                        {formatDateTime(entry.submittedAt, locale)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
