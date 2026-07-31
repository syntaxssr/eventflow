import type { EventItem } from "@/types/event"
import type { FileItem } from "@/types/file"
import type { Participant } from "@/types/participant"
import type { Task, TaskStatus } from "@/types/task"
import type { User } from "@/types/user"

/**
 * Global Search — ค้นจากทุกแหล่งข้อมูลตามสเปกข้อ 25
 * เป็น pure function เพื่อให้ unit test ครอบคลุมได้ทุกกรณี
 */

/** ป้ายสถานะงานสองภาษา — ให้ค้นด้วยคำว่า "ถูกบล็อก" หรือ "blocked" ได้ */
const TASK_STATUS_TEXT: Record<TaskStatus, string> = {
  not_started: "ยังไม่เริ่ม not started",
  in_progress: "กำลังดำเนินการ in progress",
  awaiting_review: "รอตรวจสอบ awaiting review",
  completed: "เสร็จสิ้น completed",
  blocked: "ถูกบล็อก blocked",
}

/** ประเภทไฟล์ที่ผู้ใช้พิมพ์ค้นได้ */
const FILE_TYPE_TEXT: Record<FileItem["type"], string> = {
  powerpoint: "powerpoint pptx สไลด์",
  excel: "excel xlsx สเปรดชีต",
  pdf: "pdf เอกสาร",
  word: "word docx เอกสาร",
  image: "image รูปภาพ",
}

export interface SearchSource {
  events: EventItem[]
  tasks: Task[]
  files: FileItem[]
  participants: Participant[]
  users: User[]
}

export interface GlobalSearchResults {
  events: EventItem[]
  tasks: Task[]
  files: FileItem[]
  participants: Participant[]
  users: User[]
  /** จำนวนผลรวมทุกกลุ่ม (ก่อนตัดตาม limit) */
  total: number
}

const includes = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle)

/**
 * ค้นหาจากทุกแหล่ง — คืนผลแบ่งกลุ่ม กลุ่มละไม่เกิน `limit` รายการ
 * ข้อมูลที่ถูกลบ (กิจกรรม/ไฟล์ในถังขยะ) ไม่ถูกนำมาค้น
 */
export function globalSearch(
  source: SearchSource,
  rawQuery: string,
  limit = 5
): GlobalSearchResults {
  const query = rawQuery.trim().toLowerCase()
  if (query === "") {
    return { events: [], tasks: [], files: [], participants: [], users: [], total: 0 }
  }

  const usersById = new Map(source.users.map((user) => [user.id, user]))
  const activeEvents = source.events.filter((event) => event.deletedAt === null)
  const activeEventIds = new Set(activeEvents.map((event) => event.id))

  const userText = (user: User) =>
    [
      user.firstName.th,
      user.firstName.en,
      user.lastName.th,
      user.lastName.en,
      user.position.th,
      user.position.en,
      user.team.th,
      user.team.en,
      user.email,
    ].join(" ")

  const events = activeEvents.filter((event) =>
    includes(
      [
        event.title.th,
        event.title.en,
        event.location.th,
        event.location.en,
        event.startDate,
        event.endDate,
      ].join(" "),
      query
    )
  )

  const tasks = source.tasks.filter((task) => {
    if (!activeEventIds.has(task.eventId)) return false
    const assigneeText = task.assigneeIds
      .map((id) => {
        const user = usersById.get(id)
        return user ? userText(user) : ""
      })
      .join(" ")
    return includes(
      [
        task.title.th,
        task.title.en,
        TASK_STATUS_TEXT[task.status],
        assigneeText,
      ].join(" "),
      query
    )
  })

  const files = source.files.filter((file) => {
    if (file.deletedAt !== null || !activeEventIds.has(file.eventId)) return false
    return includes(`${file.name} ${file.type} ${FILE_TYPE_TEXT[file.type]}`, query)
  })

  const participants = source.participants.filter((participant) => {
    if (!activeEventIds.has(participant.eventId)) return false
    return includes(
      [
        participant.firstName.th,
        participant.firstName.en,
        participant.lastName.th,
        participant.lastName.en,
        participant.department.th,
        participant.department.en,
        participant.email,
      ].join(" "),
      query
    )
  })

  const users = source.users.filter((user) => includes(userText(user), query))

  const total =
    events.length + tasks.length + files.length + participants.length + users.length

  return {
    events: events.slice(0, limit),
    tasks: tasks.slice(0, limit),
    files: files.slice(0, limit),
    participants: participants.slice(0, limit),
    users: users.slice(0, limit),
    total,
  }
}
