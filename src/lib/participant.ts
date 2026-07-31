import type { Locale } from "@/types/common"
import type {
  Participant,
  ParticipantType,
  RsvpStatus,
} from "@/types/participant"

/** ชื่อเต็มของผู้เข้าร่วมตามภาษาที่แสดงอยู่ */
export function getParticipantFullName(
  participant: Participant,
  locale: Locale
): string {
  return `${participant.firstName[locale]} ${participant.lastName[locale]}`
}

export interface ParticipantFilters {
  /** ค้นจากชื่อ อีเมล แผนก และเบอร์โทร */
  query: string
  type: ParticipantType | "all"
  rsvpStatus: RsvpStatus | "all"
  /** เทียบกับชื่อแผนกภาษาไทย (ใช้เป็นค่าอ้างอิงของตัวกรอง) */
  department: string | "all"
}

export const EMPTY_PARTICIPANT_FILTERS: ParticipantFilters = {
  query: "",
  type: "all",
  rsvpStatus: "all",
  department: "all",
}

/** รายชื่อแผนกไม่ซ้ำ เรียงตามตัวอักษร ใช้เติมตัวเลือกของตัวกรอง */
export function listDepartments(
  participants: Participant[],
  locale: Locale
): { key: string; label: string }[] {
  const byKey = new Map<string, string>()
  for (const participant of participants) {
    const key = participant.department.th
    if (key.trim() !== "" && !byKey.has(key)) {
      byKey.set(key, participant.department[locale])
    }
  }
  return [...byKey.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label, locale))
}

export function filterParticipants(
  participants: Participant[],
  filters: ParticipantFilters
): Participant[] {
  const query = filters.query.trim().toLowerCase()

  return participants.filter((participant) => {
    if (filters.type !== "all" && participant.type !== filters.type) return false
    if (
      filters.rsvpStatus !== "all" &&
      participant.rsvpStatus !== filters.rsvpStatus
    )
      return false
    if (
      filters.department !== "all" &&
      participant.department.th !== filters.department
    )
      return false

    if (query === "") return true
    const haystack = [
      participant.firstName.th,
      participant.firstName.en,
      participant.lastName.th,
      participant.lastName.en,
      participant.email,
      participant.department.th,
      participant.department.en,
      participant.phone,
    ]
      .join(" ")
      .toLowerCase()
    return haystack.includes(query)
  })
}

export const PARTICIPANT_SORT_KEYS = [
  "name",
  "email",
  "department",
  "rsvpStatus",
  "type",
] as const

export type ParticipantSortKey = (typeof PARTICIPANT_SORT_KEYS)[number]

export type SortDirection = "asc" | "desc"

const RSVP_ORDER: Record<RsvpStatus, number> = {
  attending: 0,
  pending: 1,
  not_attending: 2,
}

const TYPE_ORDER: Record<ParticipantType, number> = {
  executive: 0,
  speaker: 1,
  external_guest: 2,
  organizer: 3,
  employee: 4,
}

export function sortParticipants(
  participants: Participant[],
  key: ParticipantSortKey,
  direction: SortDirection,
  locale: Locale
): Participant[] {
  const factor = direction === "asc" ? 1 : -1

  return [...participants].sort((a, b) => {
    let result = 0
    switch (key) {
      case "name":
        result = getParticipantFullName(a, locale).localeCompare(
          getParticipantFullName(b, locale),
          locale
        )
        break
      case "email":
        result = a.email.localeCompare(b.email)
        break
      case "department":
        result = a.department[locale].localeCompare(b.department[locale], locale)
        break
      case "rsvpStatus":
        result = RSVP_ORDER[a.rsvpStatus] - RSVP_ORDER[b.rsvpStatus]
        break
      case "type":
        result = TYPE_ORDER[a.type] - TYPE_ORDER[b.type]
        break
    }
    // ผูกผลเสมอด้วยชื่อ เพื่อให้ลำดับคงที่ทุกครั้ง
    if (result === 0) {
      result = getParticipantFullName(a, locale).localeCompare(
        getParticipantFullName(b, locale),
        locale
      )
    }
    return result * factor
  })
}
