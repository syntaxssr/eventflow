import {
  MOCK_DATE_SHIFT_DAYS,
  shiftDateKey,
  shiftIsoDays,
} from "@/constants/mock-date"
import type { AppState } from "@/store/types"
import { MOCK_ACTIVITIES } from "./activities"
import { MOCK_COMMENTS } from "./comments"
import { MOCK_EMPLOYEES } from "./employees"
import { MOCK_EVENTS } from "./events"
import { MOCK_FILE_CATEGORIES, MOCK_FILES } from "./files"
import { MOCK_NOTIFICATIONS } from "./notifications"
import { MOCK_PARTICIPANTS } from "./participants"
import { MOCK_TASKS } from "./tasks"
import { MOCK_TIMELINE } from "./timeline"
import { MOCK_USERS } from "./users"

/** `YYYY-MM-DD` ล้วน */
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
/** ISO เต็มรูปแบบ เช่น `2026-07-31T09:30:00+07:00` */
const ISO_DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/

/**
 * เลื่อนทุกค่าที่เป็นวันที่ในโครงสร้างข้อมูลไปตามจำนวนวันที่กำหนด
 *
 * จับจากรูปแบบสตริงแบบตรงทั้งค่า ไม่ใช่จากชื่อฟิลด์ จึงครอบคลุมของที่ซ้อนอยู่ลึก ๆ
 * (เช่น `files[].versions[].uploadedAt`) โดยไม่ต้องไล่ระบุทีละฟิลด์
 * ค่าอื่นอย่าง id หรือชื่อไฟล์ที่มีตัวเลขปีอยู่ด้วยจะไม่โดน เพราะไม่ match ทั้งสตริง
 */
function shiftValue(value: unknown, days: number): unknown {
  if (typeof value === "string") {
    if (DATE_KEY_PATTERN.test(value)) return shiftDateKey(value, days)
    if (ISO_DATETIME_PATTERN.test(value)) return shiftIsoDays(value, days)
    return value
  }
  if (Array.isArray(value)) return value.map((item) => shiftValue(item, days))
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, shiftValue(item, days)])
    )
  }
  return value
}

/**
 * สร้าง State เริ่มต้นจาก Mock Data
 *
 * ถูกเรียกใหม่ทุกครั้งที่แอปเริ่มทำงาน (รวมถึงหลัง refresh)
 * จึงต้องคืนค่า object ชุดใหม่เสมอ ห้ามแชร์ reference กับ state เดิม
 *
 * Mock Data เขียนไว้โดยยึด ANCHOR_TODAY_ISO เป็น "วันนี้"
 * จึงเลื่อนทั้งชุดให้มาตรงกับวันจริงก่อนส่งออก ระยะห่างระหว่างวันคงเดิมทุกจุด
 */
export function createInitialState(): AppState {
  const state: AppState = {
    session: null,
    sessionHydrated: false,
    users: MOCK_USERS.map((user) => ({ ...user })),
    events: MOCK_EVENTS.map((event) => ({ ...event })),
    tasks: MOCK_TASKS.map((task) => ({
      ...task,
      assigneeIds: [...task.assigneeIds],
      dependsOn: [...task.dependsOn],
      blocks: [...task.blocks],
      checklist: task.checklist.map((item) => ({ ...item })),
    })),
    timeline: MOCK_TIMELINE.map((item) => ({
      ...item,
      ownerIds: [...item.ownerIds],
    })),
    files: MOCK_FILES.map((file) => ({
      ...file,
      versions: file.versions.map((version) => ({ ...version })),
    })),
    fileCategories: MOCK_FILE_CATEGORIES.map((category) => ({ ...category })),
    participants: MOCK_PARTICIPANTS.map((participant) => ({ ...participant })),
    employees: MOCK_EMPLOYEES.map((employee) => ({ ...employee })),
    comments: MOCK_COMMENTS.map((comment) => ({
      ...comment,
      mentionIds: [...comment.mentionIds],
      attachments: comment.attachments.map((attachment) => ({ ...attachment })),
      reactions: comment.reactions.map((reaction) => ({
        ...reaction,
        userIds: [...reaction.userIds],
      })),
    })),
    notifications: MOCK_NOTIFICATIONS.map((notification) => ({ ...notification })),
    activities: MOCK_ACTIVITIES.map((activity) => ({ ...activity })),
    notificationSettings: Object.fromEntries(
      MOCK_USERS.map((user) => [
        user.id,
        {
          assignedTask: true,
          dueSoon: true,
          fileChange: true,
          mention: true,
          timelineChange: true,
        },
      ])
    ),
  }

  if (MOCK_DATE_SHIFT_DAYS === 0) return state
  return shiftValue(state, MOCK_DATE_SHIFT_DAYS) as AppState
}

export { MAIN_EVENT_ID } from "./events"
export {
  MOCK_USERS,
  MOCK_CREDENTIALS,
  MOCK_PASSWORD,
  DEFAULT_USER_ID,
  authenticate,
  findUserById,
} from "./users"
