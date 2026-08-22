import type { DateKey, Id, LocalizedText } from "./common"

/**
 * สถานะการทำงานของพนักงานในทะเบียน
 * คนที่ลาออกแล้วยังเก็บไว้เพื่ออ้างอิงย้อนหลัง แต่ไม่ถูกนับเข้าวงล้อ/กิจกรรมใหม่
 */
export const EMPLOYEE_STATUSES = ["active", "on_leave", "resigned"] as const

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number]

/**
 * ทะเบียนพนักงานทั้งบริษัท — แยกจาก `User` (บัญชีทีมจัดงานที่ล็อกอินได้)
 * และแยกจาก `Participant` (รายชื่อต่อกิจกรรม) เพื่อให้ใช้เป็นแหล่งอ้างอิงกลาง
 */
export interface Employee {
  id: Id
  /** รหัสพนักงาน เช่น `EMP-0001` — ไม่ซ้ำกันทั้งทะเบียน */
  employeeCode: string
  firstName: LocalizedText
  lastName: LocalizedText
  /** ชื่อเล่น — ใช้เรียกบนวงล้อและในวงเล็บท้ายชื่อเต็ม */
  nickname: LocalizedText
  department: LocalizedText
  position: LocalizedText
  email: string
  phone: string
  /** วันเริ่มงาน `YYYY-MM-DD` */
  startDate: DateKey
  status: EmployeeStatus
  note: LocalizedText
}
