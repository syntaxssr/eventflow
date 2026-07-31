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
export function sortTasksByUrgency(
  tasks: Task[],
  today: Date = getToday()
): Task[] {
  return [...tasks].sort((a, b) => {
    const aOverdue = isOverdue(a, today) ? 0 : 1
    const bOverdue = isOverdue(b, today) ? 0 : 1
    if (aOverdue !== bOverdue) return aOverdue - bOverdue
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate.localeCompare(b.dueDate)
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
