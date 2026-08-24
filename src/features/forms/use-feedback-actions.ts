"use client"

import * as React from "react"

import { useDemo } from "@/components/dev/demo-provider"
import { useActivityLog } from "@/hooks/use-activity-log"
import { useLocale } from "@/i18n"
import { nowIso } from "@/lib/clock"
import { appToast } from "@/lib/gif-toast"
import { newId } from "@/lib/id"
import { getParticipantFullName } from "@/lib/participant"
import { useAppDispatch, useCurrentUser } from "@/store"
import type { LocalizedText } from "@/types/common"
import type { EventItem } from "@/types/event"
import type { EventFeedback, FeedbackAspect } from "@/types/feedback"
import type { Participant } from "@/types/participant"

export interface SubmitFeedbackInput {
  /** null เมื่อผู้ตอบเลือกไม่ระบุตัวตน */
  participant: Participant | null
  event: EventItem
  ratings: Record<FeedbackAspect, number>
  wouldJoinAgain: boolean
  /** ผู้ตอบกรอกภาษาเดียว เก็บเหมือนกันทั้งสองภาษา */
  comment: string
}

const ANONYMOUS_NAME: LocalizedText = {
  th: "ไม่ระบุตัวตน",
  en: "Anonymous",
}

/**
 * ส่งแบบประเมินหลังจบงาน — Manual Save เหมือนแบบฟอร์มตอบรับ
 * คำตอบของคนเดิมในกิจกรรมเดิมจะถูกทับ ส่วนคำตอบแบบไม่ระบุตัวตนนับเป็นชุดใหม่เสมอ
 */
export function useFeedbackActions() {
  const { t, locale } = useLocale()
  const dispatch = useAppDispatch()
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const logActivity = useActivityLog()

  const submitFeedback = React.useCallback(
    async ({
      participant,
      event,
      ratings,
      wouldJoinAgain,
      comment,
    }: SubmitFeedbackInput) => {
      if (!currentUser) return false

      try {
        await demo.simulate()
      } catch {
        appToast.error(t("common.saveFailed"))
        return false
      }

      const trimmedComment = comment.trim()
      const participantName: LocalizedText = participant
        ? {
            th: getParticipantFullName(participant, "th"),
            en: getParticipantFullName(participant, "en"),
          }
        : { th: "", en: "" }

      const feedback: EventFeedback = {
        id: newId("fb"),
        eventId: event.id,
        participantId: participant?.id ?? null,
        participantName,
        ratings: { ...ratings },
        comment: { th: trimmedComment, en: trimmedComment },
        wouldJoinAgain,
        submittedAt: nowIso(),
      }

      dispatch({ type: "feedback/submit", feedback })
      logActivity({
        action: "feedback_submitted",
        targetType: "feedback",
        targetId: feedback.id,
        targetName: participant ? participantName : ANONYMOUS_NAME,
        eventId: event.id,
        before: null,
        after: {
          th: `${ratings.overall} คะแนน`,
          en: `${ratings.overall} out of 5`,
        },
      })
      appToast.success(
        participant
          ? t("eventFeedback.submitted", {
              name: getParticipantFullName(participant, locale),
            })
          : t("eventFeedback.submittedAnonymous")
      )
      return true
    },
    [currentUser, demo, dispatch, locale, logActivity, t]
  )

  return { submitFeedback }
}
