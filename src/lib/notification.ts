import type { Id } from "@/types/common"
import type {
  Notification,
  NotificationSettingKey,
  NotificationSettings,
  NotificationType,
} from "@/types/notification"

/**
 * ตรรกะการสร้างการแจ้งเตือนทั้งหมดเป็น pure function
 * การเคารพ Notification Settings ของผู้รับแต่ละคนถูกบังคับที่นี่ที่เดียว
 */

/**
 * ประเภทการแจ้งเตือน → ปุ่มตั้งค่าที่ควบคุมมัน
 * `null` = ไม่มีปุ่มปิด (แจ้งเสมอ) ตามสเปกที่ให้ตั้งค่าได้ 5 ประเภท
 */
export const SETTING_KEY_BY_TYPE: Record<
  NotificationType,
  NotificationSettingKey | null
> = {
  task_assigned: "assignedTask",
  task_due_soon: "dueSoon",
  task_overdue: "dueSoon",
  file_updated: "fileChange",
  file_new_version: "fileChange",
  mentioned: "mention",
  timeline_changed: "timelineChange",
  checklist_completed: null,
  task_blocked: null,
  task_unblocked: null,
}

/** ผู้รับคนนี้เปิดรับการแจ้งเตือนประเภทนี้อยู่หรือไม่ */
export function shouldNotify(
  type: NotificationType,
  settings: NotificationSettings | undefined
): boolean {
  const key = SETTING_KEY_BY_TYPE[type]
  if (key === null) return true
  // ไม่มีการตั้งค่า = ใช้ค่าเริ่มต้นคือเปิดทุกประเภท
  return settings ? settings[key] : true
}

/** เนื้อหาการแจ้งเตือนหนึ่งเรื่อง ยังไม่ผูกกับผู้รับ */
export type NotificationDraft = Omit<Notification, "id" | "userId" | "isRead">

/**
 * สร้างการแจ้งเตือนให้ผู้รับหลายคนจากเหตุการณ์เดียว
 *
 * - ตัดผู้รับซ้ำ และไม่แจ้งผู้ที่ทำให้เกิดเหตุการณ์เอง
 * - ข้ามผู้รับที่ปิดการแจ้งเตือนประเภทนั้นไว้
 */
export function buildNotifications(
  draft: NotificationDraft,
  recipientIds: Id[],
  settingsByUser: Record<Id, NotificationSettings>,
  makeId: () => string
): Notification[] {
  return [...new Set(recipientIds)]
    .filter((userId) => userId !== draft.actorId)
    .filter((userId) => shouldNotify(draft.type, settingsByUser[userId]))
    .map((userId) => ({
      ...draft,
      id: makeId(),
      userId,
      isRead: false,
    }))
}

/** จำนวนการแจ้งเตือนที่ยังไม่อ่านของผู้ใช้ */
export function countUnread(
  notifications: Notification[],
  userId: Id
): number {
  return notifications.filter(
    (notification) => notification.userId === userId && !notification.isRead
  ).length
}
