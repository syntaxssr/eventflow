import { getToday } from "@/constants/mock-date"
import { isDueSoon, isIncomplete, isOverdue } from "@/lib/due-date"
import { calculateEventProgress, countTasksByStatus } from "@/lib/progress"
import type { Activity } from "@/types/activity"
import type { EventItem, EventProgress } from "@/types/event"
import type { FileItem } from "@/types/file"
import type { Notification } from "@/types/notification"
import type { Participant, RsvpSummary } from "@/types/participant"
import type { Task } from "@/types/task"
import type { AppState } from "./types"

/* -------------------------------------------------------------------------
   กิจกรรม
   ------------------------------------------------------------------------- */

/** กิจกรรมที่ยังไม่ถูกย้ายไปถังขยะ */
export function selectActiveEvents(state: AppState): EventItem[] {
  return state.events.filter((event) => event.deletedAt === null)
}

export function selectEventById(
  state: AppState,
  eventId: string
): EventItem | undefined {
  return state.events.find((event) => event.id === eventId)
}

export function selectTasksByEvent(state: AppState, eventId: string): Task[] {
  return state.tasks.filter((task) => task.eventId === eventId)
}

export function selectEventProgress(
  state: AppState,
  eventId: string,
  today: Date = getToday()
): EventProgress {
  return calculateEventProgress(selectTasksByEvent(state, eventId), today)
}

/**
 * กิจกรรมที่กำลังจะมาถึง — ยังไม่เริ่มหรือกำลังดำเนินการ และวันจัดงานยังไม่ผ่าน
 * เรียงจากวันที่ใกล้ที่สุด
 */
export function selectUpcomingEvents(
  state: AppState,
  today: Date = getToday()
): EventItem[] {
  const todayKey = toKey(today)
  return selectActiveEvents(state)
    .filter(
      (event) =>
        event.status !== "cancelled" &&
        event.status !== "completed" &&
        event.endDate >= todayKey
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
}

function toKey(date: Date): string {
  const pad = (value: number) => `${value}`.padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * ลำดับความสำคัญของกิจกรรมสำหรับหน้ารายการ
 *
 * เรียงเป็นกลุ่มก่อน แล้วค่อยเรียงภายในกลุ่ม เพราะถ้าเรียงด้วยวันจัดงานล้วน ๆ
 * กิจกรรมที่จบไปแล้วจะยึดหัวตารางและกองสะสมขึ้นเรื่อย ๆ ตามเวลา
 * ส่วนกิจกรรมที่ยกเลิกจะแทรกกลางแถวทั้งที่ไม่มีอะไรต้องทำต่อ
 *
 * 1. กำลังจะถึง — ใกล้ที่สุดก่อน (สิ่งที่ต้องเตรียมเร่งที่สุด)
 * 2. ผ่านมาแล้ว — ล่าสุดก่อน (ประวัติที่เพิ่งจบถูกเปิดดูบ่อยกว่าของเก่า)
 * 3. ยกเลิก — ท้ายสุด แต่ยังแสดงอยู่ เพราะเป็นบันทึกว่าเคยมีแผนนี้
 */
export function compareEventsByRelevance(
  a: EventItem,
  b: EventItem,
  today: Date = getToday()
): number {
  const todayKey = toKey(today)
  const rank = (event: EventItem) => {
    if (event.status === "cancelled") return 2
    return event.endDate < todayKey ? 1 : 0
  }

  const rankA = rank(a)
  const rankB = rank(b)
  if (rankA !== rankB) return rankA - rankB

  // กลุ่มที่ผ่านมาแล้วเรียงย้อนหลัง กลุ่มอื่นเรียงจากใกล้ที่สุด
  return rankA === 1
    ? b.startDate.localeCompare(a.startDate)
    : a.startDate.localeCompare(b.startDate)
}

/* -------------------------------------------------------------------------
   งานย่อย
   ------------------------------------------------------------------------- */

/**
 * งานของกิจกรรมที่ยัง "มีชีวิต" อยู่
 *
 * ไม่นับงานของกิจกรรมที่ถูกยกเลิกหรือย้ายไปถังขยะ
 * เพื่อไม่ให้ตัวเลขบน Dashboard บวมด้วยงานที่ไม่มีใครต้องทำแล้ว
 */
export function selectActiveTasks(state: AppState): Task[] {
  const activeEventIds = new Set(
    selectActiveEvents(state)
      .filter((event) => event.status !== "cancelled")
      .map((event) => event.id)
  )
  return state.tasks.filter((task) => activeEventIds.has(task.eventId))
}

/** งานที่ผู้ใช้คนนี้เป็นผู้รับผิดชอบ (คนใดคนหนึ่งในหลายคน) */
export function selectTasksForUser(state: AppState, userId: string): Task[] {
  return state.tasks.filter((task) => task.assigneeIds.includes(userId))
}

export function selectOverdueTasks(
  tasks: Task[],
  today: Date = getToday()
): Task[] {
  return tasks.filter((task) => isOverdue(task, today))
}

export function selectDueSoonTasks(
  tasks: Task[],
  today: Date = getToday()
): Task[] {
  return tasks.filter((task) => isDueSoon(task, today))
}

export function selectIncompleteTasks(tasks: Task[]): Task[] {
  return tasks.filter(isIncomplete)
}

export { countTasksByStatus }

/** เรียงงานตามความเร่งด่วน: เกินกำหนดก่อน แล้วจึงเรียงตามวันครบกำหนด */
/** เร่งด่วนที่สุดมาก่อน — ใช้ตัดสินเมื่อวันครบกำหนดเท่ากัน */
const PRIORITY_ORDER: Record<Task["priority"], number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
}

/**
 * ลำดับงานสำหรับหน้ารายการงาน
 *
 * งานที่เสร็จแล้วถูกดันลงท้ายเสมอ ไม่ปนกับงานที่ยังต้องทำ —
 * ถ้าเรียงด้วยวันครบกำหนดล้วน ๆ งานที่เสร็จไปแล้ว (ซึ่งมักมีกำหนดส่งเก่า)
 * จะลอยขึ้นไปกองอยู่บนสุด บังงานที่ครบกำหนดวันนี้
 *
 * 1. ยังไม่เสร็จก่อน งานที่เสร็จแล้วไปท้ายสุด
 * 2. เกินกำหนดขึ้นก่อนภายในกลุ่ม
 * 3. เรียงตามวันครบกำหนด (ไม่ได้กำหนดวันส่งไปท้ายกลุ่ม)
 * 4. ความสำคัญเป็นตัวตัดสินเมื่อวันเท่ากัน ไม่ปล่อยให้ขึ้นกับลำดับใน array
 */
export function sortTasksByUrgency(
  tasks: Task[],
  today: Date = getToday()
): Task[] {
  return [...tasks].sort((a, b) => {
    const aDone = a.status === "completed" ? 1 : 0
    const bDone = b.status === "completed" ? 1 : 0
    if (aDone !== bDone) return aDone - bDone

    const aOverdue = isOverdue(a, today) ? 0 : 1
    const bOverdue = isOverdue(b, today) ? 0 : 1
    if (aOverdue !== bOverdue) return aOverdue - bOverdue

    if (a.dueDate !== b.dueDate) {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    }

    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  })
}

/* -------------------------------------------------------------------------
   ผู้เข้าร่วม
   ------------------------------------------------------------------------- */

export function selectParticipantsByEvent(
  state: AppState,
  eventId: string
): Participant[] {
  return state.participants.filter(
    (participant) => participant.eventId === eventId
  )
}

export function summariseRsvp(participants: Participant[]): RsvpSummary {
  return {
    total: participants.length,
    attending: participants.filter((p) => p.rsvpStatus === "attending").length,
    notAttending: participants.filter((p) => p.rsvpStatus === "not_attending")
      .length,
    pending: participants.filter((p) => p.rsvpStatus === "pending").length,
  }
}

/* -------------------------------------------------------------------------
   ไฟล์ / การแจ้งเตือน / ประวัติการใช้งาน
   ------------------------------------------------------------------------- */

/** ไฟล์ที่ยังไม่ถูกลบ เรียงจากที่แก้ไขล่าสุด */
export function selectRecentFiles(state: AppState, limit = 5): FileItem[] {
  return state.files
    .filter((file) => file.deletedAt === null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
}

export function selectTrashedFiles(state: AppState): FileItem[] {
  return state.files.filter((file) => file.deletedAt !== null)
}

export function selectNotificationsForUser(
  state: AppState,
  userId: string
): Notification[] {
  return state.notifications
    .filter((notification) => notification.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function selectUnreadCount(state: AppState, userId: string): number {
  return state.notifications.filter(
    (notification) => notification.userId === userId && !notification.isRead
  ).length
}

export function selectRecentActivities(
  state: AppState,
  limit = 8,
  actorId?: string
): Activity[] {
  const source = actorId
    ? state.activities.filter((activity) => activity.actorId === actorId)
    : state.activities
  return [...source]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}
