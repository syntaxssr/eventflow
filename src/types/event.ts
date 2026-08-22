import type {
  AuditFields,
  DateKey,
  Id,
  IsoDateTime,
  LocalizedText,
  TimeString,
} from "./common"
import type { EventColor } from "@/constants/event-colors"
import type { EventIconName } from "@/constants/event-icons"

export const EVENT_STATUSES = [
  "draft",
  "planning",
  "ready",
  "in_progress",
  "completed",
  "cancelled",
] as const

export type EventStatus = (typeof EVENT_STATUSES)[number]

export interface EventItem extends AuditFields {
  id: Id
  title: LocalizedText
  description: LocalizedText
  startDate: DateKey
  endDate: DateKey
  startTime: TimeString
  endTime: TimeString
  location: LocalizedText
  /** ผู้รับผิดชอบหลัก */
  ownerId: Id
  /** จำนวนผู้เข้าร่วมที่คาดการณ์ */
  expectedAttendees: number
  /** สีประจำกิจกรรม — เลือกได้จาก EVENT_COLOR_OPTIONS */
  color: EventColor
  /**
   * ไอคอนประจำกิจกรรม — เลือกได้จาก EVENT_ICON_OPTIONS
   * null = ให้เดาจากชื่อกิจกรรมเหมือนเดิม (พฤติกรรมก่อนมีตัวเลือกนี้)
   */
  icon: EventIconName | null
  status: EventStatus
  /** ถูกย้ายไป Trash เมื่อใด (null = ยังอยู่ในระบบ) */
  deletedAt: IsoDateTime | null
  deletedBy: Id | null
}

/** ข้อมูลที่คำนวณได้จาก Event + Task ที่เกี่ยวข้อง */
export interface EventProgress {
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  /** 0–100 */
  percent: number
}

/** ตัวเลือกตอน Duplicate Event */
export interface DuplicateEventOptions {
  title: LocalizedText
  startDate: DateKey
  endDate: DateKey
  includeTasks: boolean
  includeChecklists: boolean
  includeAssignees: boolean
  includeTimeline: boolean
  includeFileCategories: boolean
  includeDependencies: boolean
  includeNotificationSettings: boolean
}
