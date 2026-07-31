import type { Id, IsoDateTime, LocalizedText } from "./common"

export const NOTIFICATION_TYPES = [
  "task_assigned",
  "task_due_soon",
  "task_overdue",
  "file_updated",
  "file_new_version",
  "mentioned",
  "timeline_changed",
  "checklist_completed",
  "task_blocked",
  "task_unblocked",
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export interface Notification {
  id: Id
  /** ผู้รับการแจ้งเตือน */
  userId: Id
  type: NotificationType
  title: LocalizedText
  body: LocalizedText
  /** ลิงก์ไปยังข้อมูลที่เกี่ยวข้อง */
  href: string
  eventId: Id | null
  isRead: boolean
  createdAt: IsoDateTime
  /** ผู้ที่ทำให้เกิดการแจ้งเตือนนี้ */
  actorId: Id | null
}

/** ประเภทที่ผู้ใช้เปิด–ปิดได้ในหน้า Notification Settings */
export const NOTIFICATION_SETTING_KEYS = [
  "assignedTask",
  "dueSoon",
  "fileChange",
  "mention",
  "timelineChange",
] as const

export type NotificationSettingKey = (typeof NOTIFICATION_SETTING_KEYS)[number]

export type NotificationSettings = Record<NotificationSettingKey, boolean>
