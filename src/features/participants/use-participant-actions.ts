"use client"

import * as React from "react"
import { appToast } from "@/lib/gif-toast"

import { useDemo } from "@/components/dev/demo-provider"
import { useActivityLog } from "@/hooks/use-activity-log"
import { useLocale } from "@/i18n"
import type { ImportResolution } from "@/lib/import"
import { newId } from "@/lib/id"
import { useAppDispatch, useCurrentUser } from "@/store"
import type { LocalizedText } from "@/types/common"
import type {
  ImportConflict,
  Participant,
  RsvpStatus,
} from "@/types/participant"

/** ข้อมูลจากฟอร์ม — ผู้ใช้กรอกชุดเดียว เก็บเหมือนกันทั้งสองภาษา */
export interface ParticipantFormInput {
  firstName: string
  lastName: string
  email: string
  department: string
  phone: string
  rsvpStatus: RsvpStatus
  type: Participant["type"]
  note: string
}

function asLocalized(value: string): LocalizedText {
  return { th: value, en: value }
}

/** ป้ายสถานะตอบรับสองภาษา สำหรับบันทึกลง Activity History */
const RSVP_LABEL: Record<RsvpStatus, LocalizedText> = {
  pending: { th: "ยังไม่ตอบรับ", en: "Pending" },
  attending: { th: "เข้าร่วม", en: "Attending" },
  not_attending: { th: "ไม่เข้าร่วม", en: "Not attending" },
}

function personName(participant: Participant): LocalizedText {
  return {
    th: `${participant.firstName.th} ${participant.lastName.th}`,
    en: `${participant.firstName.en} ${participant.lastName.en}`,
  }
}

/**
 * การกระทำทั้งหมดกับรายชื่อผู้เข้าร่วม — Manual Save ตามข้อกำหนด
 * ทุกการเปลี่ยนแปลงบันทึกลง Activity History
 */
export function useParticipantActions() {
  const { t } = useLocale()
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

  const addParticipant = React.useCallback(
    async (eventId: string, input: ParticipantFormInput) => {
      if (!currentUser || !(await save())) return false

      const participant: Participant = {
        id: newId("p"),
        eventId,
        firstName: asLocalized(input.firstName),
        lastName: asLocalized(input.lastName),
        email: input.email,
        department: asLocalized(input.department),
        phone: input.phone,
        rsvpStatus: input.rsvpStatus,
        type: input.type,
        note: asLocalized(input.note),
      }

      dispatch({ type: "participant/add", participant })
      logActivity({
        action: "participant_added",
        targetType: "participant",
        targetId: participant.id,
        targetName: personName(participant),
        eventId,
        before: null,
        after: null,
      })
      appToast.success(t("participant.added"))
      return true
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  const updateParticipant = React.useCallback(
    async (participant: Participant, input: ParticipantFormInput) => {
      if (!currentUser || !(await save())) return false

      const changes: Partial<Participant> = {
        firstName: asLocalized(input.firstName),
        lastName: asLocalized(input.lastName),
        email: input.email,
        department: asLocalized(input.department),
        phone: input.phone,
        rsvpStatus: input.rsvpStatus,
        type: input.type,
        note: asLocalized(input.note),
      }

      dispatch({ type: "participant/update", id: participant.id, changes })
      logActivity({
        action: "participant_updated",
        targetType: "participant",
        targetId: participant.id,
        targetName: {
          th: `${input.firstName} ${input.lastName}`,
          en: `${input.firstName} ${input.lastName}`,
        },
        eventId: participant.eventId,
        before: null,
        after: null,
      })
      appToast.success(t("participant.updated"))
      return true
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  const deleteParticipants = React.useCallback(
    async (participants: Participant[]) => {
      if (!currentUser || participants.length === 0 || !(await save()))
        return false

      dispatch({
        type: "participant/delete",
        ids: participants.map((participant) => participant.id),
      })
      logActivity({
        action: "participant_deleted",
        targetType: "participant",
        targetId: participants[0].id,
        targetName:
          participants.length === 1
            ? personName(participants[0])
            : {
                th: `${participants.length} รายชื่อ`,
                en: `${participants.length} participants`,
              },
        eventId: participants[0].eventId,
        before: null,
        after: null,
      })
      appToast.delete(t("participant.deleted", { count: participants.length }))
      return true
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  const bulkChangeRsvp = React.useCallback(
    async (participants: Participant[], rsvpStatus: RsvpStatus) => {
      if (!currentUser || participants.length === 0 || !(await save()))
        return false

      dispatch({
        type: "participant/bulkRsvp",
        ids: participants.map((participant) => participant.id),
        rsvpStatus,
      })
      logActivity({
        action: "participant_rsvp_changed",
        targetType: "participant",
        targetId: participants[0].id,
        targetName:
          participants.length === 1
            ? personName(participants[0])
            : {
                th: `${participants.length} รายชื่อ`,
                en: `${participants.length} participants`,
              },
        eventId: participants[0].eventId,
        before: null,
        after: RSVP_LABEL[rsvpStatus],
      })
      appToast.success(t("participant.rsvpChanged", { count: participants.length }))
      return true
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  const importParticipants = React.useCallback(
    async (
      eventId: string,
      resolution: ImportResolution,
      conflicts: ImportConflict[]
    ) => {
      if (!currentUser || !(await save())) return false

      const created: Participant[] = resolution.toCreate.map((incoming) => ({
        ...incoming,
        id: newId("p"),
        eventId,
      }))
      const updated: Participant[] = resolution.toUpdate.map((entry) => {
        const base = conflicts.find(
          (conflict) => conflict.existing.id === entry.id
        )!.existing
        return { ...base, ...entry.changes }
      })

      dispatch({ type: "participant/import", created, updated })

      logActivity({
        action: "participant_imported",
        targetType: "participant",
        targetId: eventId,
        targetName: {
          th: `เพิ่มใหม่ ${created.length} คน อัปเดต ${updated.length} คน`,
          en: `${created.length} added, ${updated.length} updated`,
        },
        eventId,
        before: null,
        after: null,
      })
      const resolved = conflicts.filter((conflict) => conflict.choice !== null)
      if (resolved.length > 0) {
        logActivity({
          action: "participant_conflict_resolved",
          targetType: "participant",
          targetId: eventId,
          targetName: {
            th: `${resolved.length} รายการ`,
            en: `${resolved.length} records`,
          },
          eventId,
          before: null,
          after: null,
        })
      }

      appToast.success(
        t("participant.importSuccess", {
          created: created.length,
          updated: updated.length,
        })
      )
      return true
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  return {
    addParticipant,
    updateParticipant,
    deleteParticipants,
    bulkChangeRsvp,
    importParticipants,
  }
}
