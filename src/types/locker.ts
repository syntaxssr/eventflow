import type { Id } from "./common"

/** สถานะของช่องล็อกเกอร์ตามทะเบียนของ HR */
export const LOCKER_STATUSES = ["occupied", "available"] as const

export type LockerStatus = (typeof LOCKER_STATUSES)[number]

/** สิ่งของอื่นที่เก็บในช่องนอกเหนือจากของพนักงาน — มาจากคอลัมน์ Remarks */
export const LOCKER_CONTENT_TAGS = ["office_supply", "snack"] as const

export type LockerContentTag = (typeof LOCKER_CONTENT_TAGS)[number]

/** กุญแจหนึ่งดอกที่ผูกกับช่องล็อกเกอร์ */
export interface LockerKey {
  /** ชื่อกุญแจที่แสดงบนพวงกุญแจ เช่น `K007` หรือ `K007-2` เมื่อมีหลายดอก */
  name: string
}

/**
 * ช่องล็อกเกอร์หนึ่งช่องจากทะเบียน `data/lockers/locker-register.csv`
 * ผูกกับทะเบียนพนักงานผ่าน `employeeId` เมื่อเทียบชื่อได้ ส่วนช่องของทีม
 * (เช่น Network Team) จะไม่มี `employeeId` แต่ยังมี `occupantName`
 */
export interface Locker {
  /** รหัสช่องตามทะเบียน เช่น `L001` */
  code: string
  /** ลำดับช่อง 1-96 ใช้เรียงลงตู้ */
  number: number
  status: LockerStatus
  /** รหัสพนักงานตามทะเบียนล็อกเกอร์ (คนละชุดกับ `Employee.employeeCode`) */
  registryEmployeeCode: string
  /** ชื่อผู้ครอบครองตามทะเบียน — ว่างเมื่อช่องไม่มีคนใช้ */
  occupantName: string
  occupantNickname: string
  /** `Employee.id` ที่จับคู่ได้จากชื่อ — null เมื่อเป็นทีมหรือหาไม่เจอ */
  employeeId: Id | null
  /** วันที่รับช่อง `M/D/YY` ตามต้นฉบับ — ว่างเมื่อทะเบียนใส่ `-` */
  assignedDate: string
  keyNo: string
  hasSpareKey: boolean
  keys: LockerKey[]
  contentTags: LockerContentTag[]
  /** ข้อความ Remarks ดิบ เก็บไว้อ้างอิงย้อนหลัง */
  remarks: string
}
