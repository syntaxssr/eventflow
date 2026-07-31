import type { AppState } from "@/store/types"

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
    users: [],
    events: [],
    tasks: [],
    timeline: [],
    files: [],
    fileCategories: [],
    participants: [],
    comments: [],
    notifications: [],
    activities: [],
    notificationSettings: {},
  }
}
