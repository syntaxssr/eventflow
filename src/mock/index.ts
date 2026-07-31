import type { AppState } from "@/store/types"
import { MOCK_ACTIVITIES } from "./activities"
import { MOCK_EVENTS } from "./events"
import { MOCK_FILE_CATEGORIES, MOCK_FILES } from "./files"
import { MOCK_NOTIFICATIONS } from "./notifications"
import { MOCK_PARTICIPANTS } from "./participants"
import { MOCK_TASKS } from "./tasks"
import { MOCK_USERS } from "./users"

/**
 * สร้าง State เริ่มต้นจาก Mock Data
 *
 * ถูกเรียกใหม่ทุกครั้งที่แอปเริ่มทำงาน (รวมถึงหลัง refresh)
 * จึงต้องคืนค่า object ชุดใหม่เสมอ ห้ามแชร์ reference กับ state เดิม
 */
export function createInitialState(): AppState {
  return {
    session: null,
    users: MOCK_USERS.map((user) => ({ ...user })),
    events: MOCK_EVENTS.map((event) => ({ ...event })),
    tasks: MOCK_TASKS.map((task) => ({
      ...task,
      assigneeIds: [...task.assigneeIds],
      dependsOn: [...task.dependsOn],
      blocks: [...task.blocks],
      checklist: task.checklist.map((item) => ({ ...item })),
    })),
    timeline: [],
    files: MOCK_FILES.map((file) => ({
      ...file,
      versions: file.versions.map((version) => ({ ...version })),
    })),
    fileCategories: MOCK_FILE_CATEGORIES.map((category) => ({ ...category })),
    participants: MOCK_PARTICIPANTS.map((participant) => ({ ...participant })),
    comments: [],
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
