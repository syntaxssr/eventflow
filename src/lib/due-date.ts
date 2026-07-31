import { DUE_SOON_DAYS } from "@/constants/app"
import { daysBetween, fromDateKey, getToday } from "@/constants/mock-date"
import type { Task } from "@/types/task"

export type DueStatus = "none" | "due_soon" | "overdue"

/**
 * จำนวนวันที่เหลือก่อนถึงกำหนดส่ง
 * ค่าติดลบ = เลยกำหนดมาแล้ว, null = งานนี้ไม่ได้กำหนดวันส่ง
 */
export function daysUntilDue(
  task: Pick<Task, "dueDate">,
  today: Date = getToday()
): number | null {
  if (!task.dueDate) return null
  return daysBetween(today, fromDateKey(task.dueDate))
}

/**
 * งานเกินกำหนด — เลย Due Date แล้วและยังไม่เสร็จสิ้น
 *
 * สถานะเดิมของงานไม่ถูกเปลี่ยน เป็นเพียง Badge ที่เพิ่มเข้ามา
 * เช่น งานยังเป็น In Progress แต่มี Badge "เกินกำหนด" กำกับ
 */
export function isOverdue(
  task: Pick<Task, "dueDate" | "status">,
  today: Date = getToday()
): boolean {
  if (task.status === "completed") return false
  const remaining = daysUntilDue(task, today)
  return remaining !== null && remaining < 0
}

/** งานใกล้ครบกำหนด — เหลือไม่เกิน 1 วัน และยังไม่เสร็จสิ้น */
export function isDueSoon(
  task: Pick<Task, "dueDate" | "status">,
  today: Date = getToday()
): boolean {
  if (task.status === "completed") return false
  const remaining = daysUntilDue(task, today)
  return remaining !== null && remaining >= 0 && remaining <= DUE_SOON_DAYS
}

export function getDueStatus(
  task: Pick<Task, "dueDate" | "status">,
  today: Date = getToday()
): DueStatus {
  if (isOverdue(task, today)) return "overdue"
  if (isDueSoon(task, today)) return "due_soon"
  return "none"
}

/** งานที่ยังไม่เสร็จสิ้น (ใช้กับ Dashboard "งานที่ยังไม่เสร็จ") */
export function isIncomplete(task: Pick<Task, "status">): boolean {
  return task.status !== "completed"
}
