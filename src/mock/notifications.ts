import { ROUTES } from "@/constants/app"
import { getToday, shiftIsoHours } from "@/constants/mock-date"
import { isDueSoon, isOverdue } from "@/lib/due-date"
import type { Notification } from "@/types/notification"
import { MOCK_FILES } from "./files"
import { MOCK_TASKS } from "./tasks"

const notifications: Notification[] = []
let counter = 0

function add(notification: Omit<Notification, "id">) {
  counter += 1
  notifications.push({ id: `n-${counter}`, ...notification })
}

const today = getToday()

/* ---- งานเกินกำหนด ---- */
for (const task of MOCK_TASKS) {
  if (!isOverdue(task, today)) continue

  for (const assigneeId of task.assigneeIds) {
    add({
      userId: assigneeId,
      type: "task_overdue",
      title: { th: "งานเกินกำหนดแล้ว", en: "A task is overdue" },
      body: task.title,
      href: ROUTES.myTasks,
      eventId: task.eventId,
      isRead: false,
      createdAt: `${task.dueDate}T09:00:00+07:00`,
      actorId: null,
    })
  }
}

/* ---- งานใกล้ครบกำหนด ---- */
for (const task of MOCK_TASKS) {
  if (!isDueSoon(task, today)) continue

  for (const assigneeId of task.assigneeIds) {
    add({
      userId: assigneeId,
      type: "task_due_soon",
      title: { th: "งานใกล้ครบกำหนด", en: "A task is due soon" },
      body: task.title,
      href: ROUTES.myTasks,
      eventId: task.eventId,
      isRead: false,
      createdAt: "2026-07-31T08:00:00+07:00",
      actorId: null,
    })
  }
}

/* ---- งานที่เพิ่งได้รับมอบหมาย ---- */
const RECENTLY_ASSIGNED = ["t-13", "t-16", "t-20", "t-22", "t-23", "t-31", "t-34"]
for (const taskId of RECENTLY_ASSIGNED) {
  const task = MOCK_TASKS.find((item) => item.id === taskId)
  if (!task) continue

  for (const assigneeId of task.assigneeIds) {
    add({
      userId: assigneeId,
      type: "task_assigned",
      title: { th: "คุณได้รับมอบหมายงานใหม่", en: "You have a new task" },
      body: task.title,
      href: ROUTES.myTasks,
      eventId: task.eventId,
      isRead: true,
      createdAt: shiftIsoHours(task.createdAt, 1),
      actorId: task.createdBy,
    })
  }
}

/* ---- ไฟล์เวอร์ชันใหม่ — แจ้งทุกคนที่เกี่ยวข้องยกเว้นผู้อัปโหลดเอง ---- */
const WATCHERS = ["u-1", "u-2", "u-3"]
for (const file of MOCK_FILES) {
  const latest = file.versions[file.versions.length - 1]
  if (file.versions.length < 2 || file.deletedAt) continue

  for (const watcherId of WATCHERS) {
    if (watcherId === latest.uploadedBy) continue

    add({
      userId: watcherId,
      type: "file_new_version",
      title: { th: "มีการอัปโหลดไฟล์เวอร์ชันใหม่", en: "A new file version was uploaded" },
      body: { th: file.name, en: file.name },
      href: ROUTES.files,
      eventId: file.eventId,
      isRead: latest.uploadedAt < "2026-07-27",
      createdAt: latest.uploadedAt,
      actorId: latest.uploadedBy,
    })
  }
}

/* ---- ถูก Mention ในความคิดเห็น ---- */
const MENTIONS: {
  userId: string
  actorId: string
  taskId: string
  createdAt: string
  isRead: boolean
}[] = [
  { userId: "u-2", actorId: "u-1", taskId: "t-5", createdAt: "2026-07-30T14:20:00+07:00", isRead: false },
  { userId: "u-3", actorId: "u-1", taskId: "t-8", createdAt: "2026-07-29T09:35:00+07:00", isRead: false },
  { userId: "u-7", actorId: "u-5", taskId: "t-6", createdAt: "2026-07-28T16:10:00+07:00", isRead: true },
  { userId: "u-4", actorId: "u-1", taskId: "t-15", createdAt: "2026-07-24T11:00:00+07:00", isRead: true },
  { userId: "u-6", actorId: "u-1", taskId: "t-17", createdAt: "2026-07-26T13:45:00+07:00", isRead: false },
]

for (const mention of MENTIONS) {
  const task = MOCK_TASKS.find((item) => item.id === mention.taskId)
  if (!task) continue

  add({
    userId: mention.userId,
    type: "mentioned",
    title: { th: "มีคนกล่าวถึงคุณในความคิดเห็น", en: "You were mentioned in a comment" },
    body: task.title,
    href: ROUTES.myTasks,
    eventId: task.eventId,
    isRead: mention.isRead,
    createdAt: mention.createdAt,
    actorId: mention.actorId,
  })
}

/* ---- Timeline เปลี่ยนแปลง ---- */
for (const userId of ["u-1", "u-2", "u-4", "u-7"]) {
  add({
    userId,
    type: "timeline_changed",
    title: { th: "ไทม์ไลน์ของกิจกรรมมีการเปลี่ยนแปลง", en: "The event timeline changed" },
    body: {
      th: "ช่วงมอบรางวัลพนักงานดีเด่นเลื่อนเป็น 19:45",
      en: "The awards segment moved to 19:45",
    },
    href: ROUTES.timeline,
    eventId: "e-1",
    isRead: userId !== "u-1",
    createdAt: "2026-07-29T10:16:00+07:00",
    actorId: "u-6",
  })
}

/* ---- งานถูกบล็อก ---- */
add({
  userId: "u-2",
  type: "task_blocked",
  title: { th: "งานของคุณถูกบล็อก", en: "Your task is blocked" },
  body: {
    th: "จัดทำป้ายชื่อผู้เข้าร่วม — รอ “สรุปรายชื่อผู้เข้าร่วมทั้งหมด”",
    en: "Produce the guest name badges — waiting on “Finalise the full guest list”",
  },
  href: ROUTES.myTasks,
  eventId: "e-1",
  isRead: false,
  createdAt: "2026-07-28T10:30:00+07:00",
  actorId: "u-3",
})

/** เรียงจากใหม่ไปเก่า */
export const MOCK_NOTIFICATIONS: Notification[] = notifications.sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt)
)
