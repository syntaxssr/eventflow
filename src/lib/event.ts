import { daysBetween, fromDateKey, toDateKey } from "@/constants/mock-date"
import type { DateKey } from "@/types/common"
import type { DuplicateEventOptions, EventItem } from "@/types/event"
import type { FileCategory } from "@/types/file"
import type { Task } from "@/types/task"
import type { TimelineItem } from "@/types/timeline"
import { newId } from "./id"

/**
 * สีประจำกิจกรรมเก็บไว้กับข้อมูลกิจกรรม เพื่อให้ผู้ใช้เลือกและคงสีเดิมได้
 */
export function getEventColor(event: Pick<EventItem, "color">): string {
  return event.color
}

/** Emoji สำหรับใช้เป็นภาพนำกิจกรรม โดยอิงจากคำสำคัญของชื่อทั้งไทยและอังกฤษ */
export function getEventEmoji(event: Pick<EventItem, "title">): string {
  const title = `${event.title.th} ${event.title.en}`.toLowerCase()

  if (/ปฐมนิเทศ|orientation|onboarding/.test(title)) return "👋"
  if (/ความปลอดภัย|security|อบรม|training/.test(title)) return "🔐"
  if (/ปลูกป่า|ป่าชายเลน|mangrove|csr/.test(title)) return "🌱"
  if (/ประชุม|meeting|town hall/.test(title)) return "📊"
  if (/เปิดตัว|launch/.test(title)) return "🚀"
  if (/งานเลี้ยง|party|celebration/.test(title)) return "🎉"

  return "📅"
}

export interface DuplicateEventInput {
  source: EventItem
  tasks: Task[]
  timeline: TimelineItem[]
  fileCategories: FileCategory[]
  options: DuplicateEventOptions
  actorId: string
  now: string
}

export interface DuplicateEventResult {
  event: EventItem
  tasks: Task[]
  timeline: TimelineItem[]
  fileCategories: FileCategory[]
}

/** เลื่อนวันที่ตามจำนวนวันที่กิจกรรมใหม่ห่างจากกิจกรรมเดิม */
function shiftDate(dateKey: DateKey, offsetDays: number): DateKey {
  const date = fromDateKey(dateKey)
  date.setDate(date.getDate() + offsetDays)
  return toDateKey(date)
}

/**
 * คัดลอกกิจกรรมเพื่อสร้างกิจกรรมใหม่
 *
 * คัดลอก: งานย่อย, Checklist, ผู้รับผิดชอบ, Timeline, หมวดหมู่ไฟล์,
 *         Dependency และ Blocking Relationship
 * ไม่คัดลอก: ไฟล์จริง, File Version, ความคิดเห็น, Activity History,
 *            Notification และรายชื่อผู้เข้าร่วม
 *
 * วันครบกำหนดของงานและวันของ Timeline จะถูกเลื่อนตามระยะห่างของวันจัดงานใหม่
 * เพื่อให้แผนงานยังสมเหตุสมผล
 */
export function duplicateEvent({
  source,
  tasks,
  timeline,
  fileCategories,
  options,
  actorId,
  now,
}: DuplicateEventInput): DuplicateEventResult {
  const eventId = newId("e")
  const offsetDays = daysBetween(
    fromDateKey(source.startDate),
    fromDateKey(options.startDate)
  )

  const event: EventItem = {
    ...source,
    id: eventId,
    title: options.title,
    startDate: options.startDate,
    endDate: options.endDate,
    status: "draft",
    createdAt: now,
    createdBy: actorId,
    updatedAt: now,
    updatedBy: actorId,
    deletedAt: null,
    deletedBy: null,
  }

  /** map จาก id เดิม → id ใหม่ ใช้เชื่อมความสัมพันธ์ระหว่างงานให้ถูกคู่ */
  const taskIdMap = new Map<string, string>()

  const copiedTasks: Task[] = options.includeTasks
    ? tasks.map((task) => {
        const newTaskId = newId("t")
        taskIdMap.set(task.id, newTaskId)
        return { ...task, id: newTaskId }
      })
    : []

  const finalTasks: Task[] = copiedTasks.map((task) => ({
    ...task,
    eventId,
    // งานที่คัดลอกมาเริ่มต้นใหม่ทั้งหมด
    status: "not_started",
    blockOverridden: false,
    assigneeIds: options.includeAssignees ? [...task.assigneeIds] : [],
    checklist: options.includeChecklists
      ? task.checklist.map((item, index) => ({
          ...item,
          id: `${task.id}-c${index + 1}`,
          done: false,
        }))
      : [],
    dependsOn: options.includeDependencies
      ? task.dependsOn
          .map((id) => taskIdMap.get(id))
          .filter((id): id is string => Boolean(id))
      : [],
    blocks: options.includeDependencies
      ? task.blocks
          .map((id) => taskIdMap.get(id))
          .filter((id): id is string => Boolean(id))
      : [],
    // ไฟล์แนบและความคิดเห็นไม่ถูกคัดลอก
    attachmentIds: [],
    startDate: task.startDate ? shiftDate(task.startDate, offsetDays) : null,
    dueDate: task.dueDate ? shiftDate(task.dueDate, offsetDays) : null,
    createdAt: now,
    createdBy: actorId,
    updatedAt: now,
    updatedBy: actorId,
  }))

  const copiedTimeline: TimelineItem[] = options.includeTimeline
    ? timeline.map((item) => ({
        ...item,
        id: newId("tl"),
        eventId,
        date: shiftDate(item.date, offsetDays),
        readiness: "not_ready",
        linkedTaskId: item.linkedTaskId
          ? (taskIdMap.get(item.linkedTaskId) ?? null)
          : null,
        ownerIds: options.includeAssignees ? [...item.ownerIds] : [],
        createdAt: now,
        createdBy: actorId,
        updatedAt: now,
        updatedBy: actorId,
      }))
    : []

  const copiedCategories: FileCategory[] = options.includeFileCategories
    ? fileCategories
        .filter((category) => category.eventId === source.id)
        .map((category) => ({
          ...category,
          id: newId("fc"),
          eventId,
        }))
    : []

  return {
    event,
    tasks: finalTasks,
    timeline: copiedTimeline,
    fileCategories: copiedCategories,
  }
}

/** ตัวเลือกเริ่มต้นของหน้าตรวจสอบก่อน Duplicate — คัดลอกทุกอย่างที่คัดลอกได้ */
export function defaultDuplicateOptions(
  source: EventItem
): DuplicateEventOptions {
  return {
    title: {
      th: `${source.title.th} (สำเนา)`,
      en: `${source.title.en} (copy)`,
    },
    startDate: source.startDate,
    endDate: source.endDate,
    includeTasks: true,
    includeChecklists: true,
    includeAssignees: true,
    includeTimeline: true,
    includeFileCategories: true,
    includeDependencies: true,
    includeNotificationSettings: true,
  }
}
