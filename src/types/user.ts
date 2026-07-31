import type { Id, IsoDateTime, LocalizedText } from "./common"

/** บทบาทในทีมจัดงาน — ใช้เพื่อสื่อสาร ไม่ได้ใช้จำกัดสิทธิ์ใน Prototype นี้ */
export type TeamRole =
  | "event_manager"
  | "creative_designer"
  | "it_support"
  | "hr_coordinator"
  | "finance_coordinator"
  | "mc_coordinator"
  | "venue_coordinator"

export interface User {
  id: Id
  firstName: LocalizedText
  lastName: LocalizedText
  /** ชื่อย่อสำหรับ Avatar fallback เช่น "ปว" / "PW" */
  initials: LocalizedText
  avatarUrl: string
  /** สีพื้นหลัง Avatar เมื่อไม่มีรูป */
  avatarColor: string
  role: TeamRole
  position: LocalizedText
  team: LocalizedText
  email: string
  phone: string
}

/** ข้อมูล Session ปัจจุบัน (อยู่ใน memory เท่านั้น — refresh แล้วหาย) */
export interface AuthSession {
  userId: Id
  signedInAt: IsoDateTime
  rememberMe: boolean
}

/** บัญชีสำหรับ Login ใน Prototype */
export interface MockCredential {
  email: string
  password: string
  userId: Id
}
