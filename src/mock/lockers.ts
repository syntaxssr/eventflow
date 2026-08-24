import type { Locker } from "@/types/locker"
import { IMPORTED_LOCKERS } from "./lockers.generated"

/**
 * ทะเบียนล็อกเกอร์จาก HR — ข้อมูลอ้างอิงคงที่ ไม่ผ่าน store เพราะหน้าเว็บอ่านอย่างเดียว
 */
export const MOCK_LOCKERS: Locker[] = IMPORTED_LOCKERS

export const LOCKERS_PER_CABINET = 12

export const LOCKER_CABINET_COUNT = Math.ceil(
  MOCK_LOCKERS.length / LOCKERS_PER_CABINET
)
