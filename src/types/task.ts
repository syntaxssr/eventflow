import type {
  AuditFields,
  DateKey,
  Id,
  LocalizedText,
} from "./common"

export const TASK_STATUSES = [
  "not_started",
  "in_progress",
  "awaiting_review",
  "completed",
  "blocked",
] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export const PRIORITIES = ["low", "normal", "high", "urgent"] as const

export type Priority = (typeof PRIORITIES)[number]

export interface ChecklistItem {
  id: Id
  label: LocalizedText
  done: boolean
  /** ลำดับการแสดงผล (จัดเรียงใหม่ได้) */
  order: number
}

export interface Task extends AuditFields {
  id: Id
  eventId: Id
  title: LocalizedText
  description: LocalizedText
  /** ผู้รับผิดชอบหลายคนได้ */
  assigneeIds: Id[]
  startDate: DateKey | null
  dueDate: DateKey | null
  priority: Priority
  status: TaskStatus
  notes: LocalizedText
  checklist: ChecklistItem[]
  attachmentIds: Id[]
  /** งานที่ต้องเสร็จก่อน งานนี้จึงจะเริ่มได้ */
  dependsOn: Id[]
  /** งานที่ถูกงานนี้บล็อกอยู่ (derived แต่เก็บไว้เพื่อความเร็ว) */
  blocks: Id[]
  /** ผู้ใช้ยืนยัน Override คำเตือน "ยังถูกบล็อก" แล้วหรือยัง */
  blockOverridden: boolean
}

/** ผลการตรวจสอบก่อนสร้างความสัมพันธ์ระหว่างงาน */
export interface DependencyValidation {
  valid: boolean
  reason?: "self_reference" | "circular" | "duplicate" | "cross_event"
  /** เส้นทางที่ทำให้เกิด Circular Dependency */
  cyclePath?: Id[]
}

/** สถานะการถูกบล็อกของงาน (คำนวณจาก dependsOn) */
export interface BlockedInfo {
  isBlocked: boolean
  blockingTaskIds: Id[]
}

export type TaskView = "table" | "kanban" | "calendar"
