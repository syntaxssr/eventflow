import type { AppState } from "@/store/types"
import { MOCK_USERS } from "./users"

/**
 * สร้าง State เริ่มต้นจาก Mock Data
 *
 * ถูกเรียกใหม่ทุกครั้งที่แอปเริ่มทำงาน (รวมถึงหลัง refresh)
 * จึงต้องคืนค่า object ชุดใหม่เสมอ ห้ามแชร์ reference กับ state เดิม
 *
 * แต่ละ Phase จะทยอยเติมข้อมูลจริงเข้ามา
 */
export function createInitialState(): AppState {
  return {
    session: null,
    users: MOCK_USERS.map((user) => ({ ...user })),
    events: [],
    tasks: [],
    timeline: [],
    files: [],
    fileCategories: [],
    participants: [],
    comments: [],
    notifications: [],
    activities: [],
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

export {
  MOCK_USERS,
  MOCK_CREDENTIALS,
  MOCK_PASSWORD,
  DEFAULT_USER_ID,
  authenticate,
  findUserById,
} from "./users"
