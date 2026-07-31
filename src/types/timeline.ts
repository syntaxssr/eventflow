import type {
  AuditFields,
  DateKey,
  Id,
  LocalizedText,
  TimeString,
} from "./common"

/** ช่วงของ Timeline */
export const TIMELINE_PHASES = ["before", "during", "after"] as const

export type TimelinePhase = (typeof TIMELINE_PHASES)[number]

/** สถานะความพร้อมของรายการใน Timeline */
export const READINESS_STATUSES = [
  "not_ready",
  "preparing",
  "ready",
  "done",
] as const

export type ReadinessStatus = (typeof READINESS_STATUSES)[number]

export interface TimelineItem extends AuditFields {
  id: Id
  eventId: Id
  phase: TimelinePhase
  date: DateKey
  startTime: TimeString
  endTime: TimeString
  title: LocalizedText
  ownerIds: Id[]
  location: LocalizedText
  readiness: ReadinessStatus
  note: LocalizedText
  /** Task ที่เชื่อมโยงกับรายการนี้ */
  linkedTaskId: Id | null
  order: number
}

export type TimelineView = "vertical" | "calendar" | "gantt"
