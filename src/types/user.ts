import type { Id, IsoDateTime, LocalizedText } from "./common"

/** สิทธิ์บัญชี — ใช้เพื่อสื่อสาร ไม่ได้ใช้จำกัดสิทธิ์จริงใน Prototype นี้ */
export type TeamRole = "admin" | "staff"

export interface User {
  id: Id
  firstName: LocalizedText
  lastName: LocalizedText
  /** ชื่อเล่น — คนไทยจำกันด้วยชื่อนี้มากกว่าชื่อจริง แสดงในวงเล็บท้ายชื่อเต็ม */
  nickname: LocalizedText
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

/** ข้อมูล Session ปัจจุบัน — เก็บถาวรเฉพาะเมื่อผู้ใช้เลือกจดจำ */
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
