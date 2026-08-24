"use client"

import * as React from "react"
import {
  CalendarDaysIcon,
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  MapPinIcon,
  SendIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { hasSubmittedFeedback } from "@/lib/event-feedback"
import { formatDateRange, formatTimeRange } from "@/lib/format"
import { getParticipantFullName } from "@/lib/participant"
import { findParticipantForUser } from "@/lib/rsvp-form"
import { useAppState, useCurrentUser } from "@/store"
import type { EventItem } from "@/types/event"
import type { FeedbackAspect } from "@/types/feedback"
import { FEEDBACK_ASPECTS } from "@/types/feedback"
import type { Participant } from "@/types/participant"
import { FeedbackRatingInput } from "./feedback-rating-input"
import { useFeedbackActions } from "./use-feedback-actions"

/** ค่าใน Select ที่หมายถึง "ไม่ระบุตัวตน" — Select ว่างไม่ได้ จึงต้องมี sentinel */
const ANONYMOUS_VALUE = "__anonymous__"

const ASPECT_LABEL_KEY: Record<FeedbackAspect, TranslationKey> = {
  overall: "eventFeedback.aspectOverall",
  content: "eventFeedback.aspectContent",
  venue: "eventFeedback.aspectVenue",
  catering: "eventFeedback.aspectCatering",
  organization: "eventFeedback.aspectOrganization",
}

function emptyRatings(): Record<FeedbackAspect, number> {
  return Object.fromEntries(
    FEEDBACK_ASPECTS.map((aspect) => [aspect, 0])
  ) as Record<FeedbackAspect, number>
}

export function FeedbackResponseForm({
  events,
  eventId,
  onEventChange,
  participants,
}: {
  events: EventItem[]
  eventId: string
  onEventChange: (eventId: string) => void
  /** ผู้เข้าร่วมของกิจกรรมที่เลือกอยู่ */
  participants: Participant[]
}) {
  const { t, tl, locale } = useLocale()
  const currentUser = useCurrentUser()
  const feedback = useAppState().feedback
  const { submitFeedback } = useFeedbackActions()
  const successRef = React.useRef<HTMLDivElement>(null)

  // null = ผู้ตอบยังไม่ได้เลือกเอง ให้เดาจากอีเมลของผู้ใช้ที่ล็อกอินอยู่
  const [chosenParticipantId, setChosenParticipantId] = React.useState<
    string | null
  >(null)
  const [ratings, setRatings] = React.useState(emptyRatings)
  const [wouldJoinAgain, setWouldJoinAgain] = React.useState(true)
  const [comment, setComment] = React.useState("")
  const [ratingError, setRatingError] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submittedName, setSubmittedName] = React.useState<string | null>(null)

  const selectedEvent = events.find((event) => event.id === eventId) ?? null

  React.useEffect(() => {
    if (submittedName !== null) successRef.current?.focus()
  }, [submittedName])

  const suggestedParticipant = currentUser
    ? findParticipantForUser(participants, currentUser)
    : undefined
  // ค่าที่เลือกไว้ต้องอยู่ในกิจกรรมที่เลือกอยู่ ไม่งั้นถอยไปเป็นไม่ระบุตัวตน
  const selectedParticipant =
    (chosenParticipantId === null
      ? suggestedParticipant
      : participants.find(
          (participant) => participant.id === chosenParticipantId
        )) ?? null
  const participantId = selectedParticipant?.id ?? ANONYMOUS_VALUE

  const alreadySubmitted =
    selectedParticipant !== null &&
    hasSubmittedFeedback(feedback, eventId, selectedParticipant.id)

  const resetAnswers = () => {
    setRatings(emptyRatings())
    setWouldJoinAgain(true)
    setComment("")
    setRatingError(false)
  }

  const changeEvent = (nextEventId: string) => {
    onEventChange(nextEventId)
    // รายชื่อผู้เข้าร่วมเปลี่ยนตามกิจกรรม จึงกลับไปเดาผู้ตอบใหม่
    setChosenParticipantId(null)
    resetAnswers()
    setSubmittedName(null)
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedEvent) return

    if (FEEDBACK_ASPECTS.some((aspect) => ratings[aspect] === 0)) {
      setRatingError(true)
      return
    }

    setRatingError(false)
    setIsSubmitting(true)
    const ok = await submitFeedback({
      participant: selectedParticipant,
      event: selectedEvent,
      ratings,
      wouldJoinAgain,
      comment,
    })
    setIsSubmitting(false)

    if (ok) {
      setSubmittedName(
        selectedParticipant
          ? getParticipantFullName(selectedParticipant, locale)
          : t("eventFeedback.anonymous")
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("eventFeedback.formTitle")}</CardTitle>
        <CardDescription>{t("eventFeedback.formDescription")}</CardDescription>
      </CardHeader>

      <CardContent>
        {submittedName !== null ? (
          <div
            ref={successRef}
            role="status"
            tabIndex={-1}
            className="flex flex-col items-center gap-3 py-8 text-center focus-visible:outline-none"
            data-testid="feedback-success"
          >
            <span
              className="bg-icon-tile-green text-icon-tile-green-foreground flex size-14 items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <CircleCheckIcon className="size-7" />
            </span>
            <div className="space-y-1">
              <p className="text-lg font-semibold">
                {t("eventFeedback.thanks")}
              </p>
              <p className="text-muted-foreground text-sm">{submittedName}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSubmittedName(null)}
              data-testid="feedback-change-answer"
            >
              {t("eventFeedback.changeAnswer")}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-5"
            noValidate
            data-testid="feedback-form"
          >
            <div className="space-y-2">
              <Label htmlFor="feedback-event">
                {t("eventFeedback.event")}
              </Label>
              <Select
                value={eventId}
                onValueChange={changeEvent}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="feedback-event"
                  className="w-full"
                  data-testid="feedback-event"
                >
                  <SelectValue placeholder={t("eventFeedback.selectEvent")} />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {tl(event.title)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEvent ? (
                <dl className="text-muted-foreground grid gap-1 text-xs sm:grid-cols-2">
                  <div className="flex items-center gap-1.5">
                    <CalendarDaysIcon
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <dt className="sr-only">{t("eventFeedback.event")}</dt>
                    <dd>
                      {formatDateRange(
                        selectedEvent.startDate,
                        selectedEvent.endDate,
                        locale
                      )}
                      {" · "}
                      {formatTimeRange(
                        selectedEvent.startTime,
                        selectedEvent.endTime,
                        locale
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPinIcon
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <dd className="truncate">{tl(selectedEvent.location)}</dd>
                  </div>
                </dl>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-respondent">
                {t("eventFeedback.respondent")}
              </Label>
              <Select
                value={participantId}
                onValueChange={setChosenParticipantId}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="feedback-respondent"
                  className="w-full"
                  data-testid="feedback-respondent"
                >
                  <SelectValue
                    placeholder={t("eventFeedback.selectRespondent")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANONYMOUS_VALUE}>
                    {t("eventFeedback.anonymous")}
                  </SelectItem>
                  {participants.map((participant) => (
                    <SelectItem key={participant.id} value={participant.id}>
                      {getParticipantFullName(participant, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
                <InfoIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {alreadySubmitted
                  ? t("eventFeedback.alreadySubmitted")
                  : t("eventFeedback.anonymousHint")}
              </p>
            </div>

            <fieldset className="space-y-3" disabled={isSubmitting}>
              <legend className="text-sm font-medium">
                {t("eventFeedback.ratings")}
              </legend>
              <p className="text-muted-foreground text-xs">
                {t("eventFeedback.ratingHint")}
              </p>
              {FEEDBACK_ASPECTS.map((aspect) => (
                <div
                  key={aspect}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span className="text-sm">{t(ASPECT_LABEL_KEY[aspect])}</span>
                  <FeedbackRatingInput
                    label={t(ASPECT_LABEL_KEY[aspect])}
                    value={ratings[aspect]}
                    onChange={(value) =>
                      setRatings((current) => ({ ...current, [aspect]: value }))
                    }
                    disabled={isSubmitting}
                    testId={`feedback-rating-${aspect}`}
                  />
                </div>
              ))}
              {ratingError ? (
                <p
                  className="text-destructive-message text-sm"
                  data-testid="feedback-rating-error"
                >
                  {t("eventFeedback.ratingRequired")}
                </p>
              ) : null}
            </fieldset>

            <div className="flex items-center gap-2">
              <Checkbox
                id="feedback-join-again"
                checked={wouldJoinAgain}
                onCheckedChange={(checked) =>
                  setWouldJoinAgain(checked === true)
                }
                disabled={isSubmitting}
                data-testid="feedback-join-again"
              />
              <Label htmlFor="feedback-join-again" className="font-normal">
                {t("eventFeedback.wouldJoinAgain")}
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-comment">
                {t("eventFeedback.comment")}
              </Label>
              <Textarea
                id="feedback-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={t("eventFeedback.commentPlaceholder")}
                rows={4}
                disabled={isSubmitting}
                data-testid="feedback-comment"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !selectedEvent}
              data-testid="feedback-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                  {t("eventFeedback.submitting")}
                </>
              ) : (
                <>
                  <SendIcon aria-hidden="true" />
                  {t("eventFeedback.submit")}
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
