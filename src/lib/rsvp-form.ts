import type { Activity, ActivityAction } from "@/types/activity"
import type { Locale, LocalizedText } from "@/types/common"
import type {
  Participant,
  RsvpStatus,
  RsvpSummary,
} from "@/types/participant"
import { getParticipantFullName } from "./participant"

/** ป้ายสถานะตอบรับสองภาษา สำหรับบันทึกค่าก่อน–หลังลง Activity History */
export const RSVP_LABEL: Record<RsvpStatus, LocalizedText> = {
  pending: { th: "ยังไม่ตอบรับ", en: "Pending" },
  attending: { th: "เข้าร่วม", en: "Attending" },
  not_attending: { th: "ไม่เข้าร่วม", en: "Not attending" },
}

/**
 * แปลงป้ายที่เก็บใน Activity กลับเป็นสถานะ เพื่อให้รายการคำตอบล่าสุด
 * วาด Badge ได้เหมือนที่อื่น (ประวัติเก็บเป็นข้อความ ไม่ได้เก็บ key)
 */
export function rsvpStatusFromLabel(
  label: LocalizedText | null
): RsvpStatus | null {
  if (!label) return null
  const found = (Object.keys(RSVP_LABEL) as RsvpStatus[]).find(
    (status) =>
      RSVP_LABEL[status].th === label.th || RSVP_LABEL[status].en === label.en
  )
  return found ?? null
}

export interface DepartmentRsvpSummary extends RsvpSummary {
  /** ชื่อแผนกตามภาษาที่แสดงอยู่ — ว่างได้เมื่อผู้เข้าร่วมไม่ระบุแผนก */
  department: string
}

/** สรุปสถานะตอบรับแยกตามแผนก เรียงตามชื่อแผนก */
export function summariseRsvpByDepartment(
  participants: Participant[],
  locale: Locale
): DepartmentRsvpSummary[] {
  const byDepartment = new Map<string, DepartmentRsvpSummary>()

  for (const participant of participants) {
    const department = participant.department[locale].trim()
    const entry = byDepartment.get(department) ?? {
      department,
      total: 0,
      attending: 0,
      notAttending: 0,
      pending: 0,
    }
    entry.total += 1
    if (participant.rsvpStatus === "attending") entry.attending += 1
    else if (participant.rsvpStatus === "not_attending") entry.notAttending += 1
    else entry.pending += 1
    byDepartment.set(department, entry)
  }

  return [...byDepartment.values()].sort((a, b) =>
    a.department.localeCompare(b.department, locale)
  )
}

/** เปอร์เซ็นต์ผู้ที่ตอบแล้ว (เข้าร่วม + ไม่เข้าร่วม) ปัดเป็นจำนวนเต็ม */
export function responseRate(summary: RsvpSummary): number {
  if (summary.total === 0) return 0
  return Math.round(
    ((summary.attending + summary.notAttending) / summary.total) * 100
  )
}

/** หาผู้เข้าร่วมที่อีเมลตรงกับผู้ใช้ที่ล็อกอินอยู่ (ไม่สนตัวพิมพ์เล็ก-ใหญ่) */
export function findParticipantForUser(
  participants: Participant[],
  user: { email: string }
): Participant | undefined {
  const email = user.email.trim().toLowerCase()
  if (email === "") return undefined
  return participants.find(
    (participant) => participant.email.trim().toLowerCase() === email
  )
}

/** ค้นจากชื่อเต็ม (ทั้งสองภาษา) และอีเมล แล้วเรียงตามชื่อในภาษาที่แสดงอยู่ */
export function searchParticipants(
  participants: Participant[],
  query: string,
  locale: Locale
): Participant[] {
  const needle = query.trim().toLowerCase()

  return participants
    .filter((participant) => {
      if (needle === "") return true
      return [
        getParticipantFullName(participant, "th"),
        getParticipantFullName(participant, "en"),
        participant.email,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    })
    .sort((a, b) =>
      getParticipantFullName(a, locale).localeCompare(
        getParticipantFullName(b, locale),
        locale
      )
    )
}

/** ผู้ที่ยังไม่ตอบรับ เรียงตามชื่อในภาษาที่แสดงอยู่ */
export function listPendingParticipants(
  participants: Participant[],
  locale: Locale
): Participant[] {
  return participants
    .filter((participant) => participant.rsvpStatus === "pending")
    .sort((a, b) =>
      getParticipantFullName(a, locale).localeCompare(
        getParticipantFullName(b, locale),
        locale
      )
    )
}

/** การกระทำที่นับเป็น "คำตอบ" — ทั้งจากแบบฟอร์มนี้และจากหน้ารายชื่อผู้เข้าร่วม */
const RSVP_ACTIVITY_ACTIONS: ActivityAction[] = [
  "rsvp_submitted",
  "participant_rsvp_changed",
]

/** ประวัติการตอบรับของกิจกรรม เรียงจากใหม่ไปเก่า */
export function selectRsvpActivities(
  activities: Activity[],
  eventId: string
): Activity[] {
  return activities
    .filter(
      (activity) =>
        activity.eventId === eventId &&
        RSVP_ACTIVITY_ACTIONS.includes(activity.action)
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
