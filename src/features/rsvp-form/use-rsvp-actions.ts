"use client"

import * as React from "react"
import { appToast } from "@/lib/gif-toast"

import { useDemo } from "@/components/dev/demo-provider"
import { useActivityLog } from "@/hooks/use-activity-log"
import { useLocale } from "@/i18n"
import { getParticipantFullName } from "@/lib/participant"
import { RSVP_LABEL } from "@/lib/rsvp-form"
import { useAppDispatch, useCurrentUser } from "@/store"
import type { LocalizedText } from "@/types/common"
import type { EventItem } from "@/types/event"
import type { Participant, RsvpStatus } from "@/types/participant"

/** คำตอบที่ส่งได้จากแบบฟอร์ม — "ยังไม่ตอบรับ" ไม่ใช่คำตอบ จึงเลือกไม่ได้ */
export type RsvpResponse = Exclude<RsvpStatus, "pending">

export interface SubmitRsvpInput {
  participant: Participant
  rsvpStatus: RsvpResponse
  /** ผู้ตอบกรอกภาษาเดียว เก็บเหมือนกันทั้งสองภาษา — เว้นแต่ไม่ได้แก้ไข */
  note: string
  event: EventItem
}

function personName(participant: Participant): LocalizedText {
  return {
    th: getParticipantFullName(participant, "th"),
    en: getParticipantFullName(participant, "en"),
  }
}

/**
 * ส่งคำตอบ RSVP — Manual Save ตามข้อกำหนด
 * อัปเดตสถานะตอบรับของผู้เข้าร่วมคนนั้นโดยตรง และบันทึกค่าก่อน–หลังลง Activity History
 */
export function useRsvpActions() {
  const { t, tl, locale } = useLocale()
  const dispatch = useAppDispatch()
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const logActivity = useActivityLog()

  const save = React.useCallback(async () => {
    try {
      await demo.simulate()
      return true
    } catch {
      appToast.error(t("common.saveFailed"))
      return false
    }
  }, [demo, t])

  const submitRsvp = React.useCallback(
    async ({ participant, rsvpStatus, note, event }: SubmitRsvpInput) => {
      if (!currentUser || !(await save())) return false

      const trimmedNote = note.trim()
      // ช่องหมายเหตุเติมมาแค่ภาษาที่แสดงอยู่ ถ้าไม่ได้แก้ก็อย่าเขียนทับ ไม่งั้นอีกภาษาหาย
      const noteEdited = trimmedNote !== tl(participant.note).trim()
      dispatch({
        type: "participant/update",
        id: participant.id,
        changes: {
          rsvpStatus,
          ...(noteEdited ? { note: { th: trimmedNote, en: trimmedNote } } : {}),
        },
      })
      logActivity({
        action: "rsvp_submitted",
        targetType: "participant",
        targetId: participant.id,
        targetName: personName(participant),
        eventId: event.id,
        before: RSVP_LABEL[participant.rsvpStatus],
        after: RSVP_LABEL[rsvpStatus],
      })
      appToast.success(
        t("rsvpForm.submitted", {
          name: getParticipantFullName(participant, locale),
        })
      )
      return true
    },
    [currentUser, dispatch, locale, logActivity, save, t, tl]
  )

  return { submitRsvp }
}
