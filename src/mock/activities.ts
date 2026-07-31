import { shiftIsoHours } from "@/constants/mock-date"
import { TASK_STATUS_STYLE } from "@/constants/status"
import type { Activity } from "@/types/activity"
import type { LocalizedText } from "@/types/common"
import { MOCK_EVENTS } from "./events"
import { MOCK_FILES } from "./files"
import { MOCK_TASKS } from "./tasks"

const STATUS_LABEL: Record<string, LocalizedText> = {
  not_started: { th: "ยังไม่เริ่ม", en: "Not Started" },
  in_progress: { th: "กำลังดำเนินการ", en: "In Progress" },
  awaiting_review: { th: "รอตรวจสอบ", en: "Awaiting Review" },
  completed: { th: "เสร็จสิ้น", en: "Completed" },
  blocked: { th: "ถูกบล็อก", en: "Blocked" },
}

// อ้างอิง TASK_STATUS_STYLE เพื่อให้แน่ใจว่ารายการสถานะทั้งสองที่ตรงกันเสมอ
for (const status of Object.keys(TASK_STATUS_STYLE)) {
  if (!STATUS_LABEL[status]) {
    throw new Error(`Missing activity status label for "${status}"`)
  }
}

const activities: Activity[] = []
let counter = 0

function add(activity: Omit<Activity, "id">) {
  counter += 1
  activities.push({ id: `a-${counter}`, ...activity })
}

/** เลื่อนเวลาไปข้างหน้าตามจำนวนชั่วโมง เพื่อให้ลำดับเหตุการณ์ดูสมจริง */
const shiftHours = shiftIsoHours

/* ---- การสร้างกิจกรรม ---- */
for (const event of MOCK_EVENTS) {
  add({
    actorId: event.createdBy,
    action: "event_created",
    targetType: "event",
    targetId: event.id,
    targetName: event.title,
    eventId: event.id,
    createdAt: event.createdAt,
    before: null,
    after: null,
  })

  if (event.status === "cancelled") {
    add({
      actorId: event.updatedBy,
      action: "event_status_changed",
      targetType: "event",
      targetId: event.id,
      targetName: event.title,
      eventId: event.id,
      createdAt: event.updatedAt,
      before: { th: "กำลังวางแผน", en: "Planning" },
      after: { th: "ยกเลิก", en: "Cancelled" },
    })
  }
}

/* ---- การสร้างงานย่อย (เลือกเฉพาะงานของกิจกรรมหลักเพื่อไม่ให้ล้น) ---- */
for (const task of MOCK_TASKS) {
  add({
    actorId: task.createdBy,
    action: "task_created",
    targetType: "task",
    targetId: task.id,
    targetName: task.title,
    eventId: task.eventId,
    createdAt: task.createdAt,
    before: null,
    after: null,
  })
}

/* ---- การเปลี่ยนสถานะงาน ---- */
for (const task of MOCK_TASKS) {
  if (task.status === "not_started") continue

  add({
    actorId: task.assigneeIds[0],
    action: "task_status_changed",
    targetType: "task",
    targetId: task.id,
    targetName: task.title,
    eventId: task.eventId,
    createdAt: shiftHours(task.createdAt, 26),
    before: STATUS_LABEL.not_started,
    after: STATUS_LABEL[task.status],
  })
}

/* ---- Checklist ---- */
for (const task of MOCK_TASKS) {
  const doneItems = task.checklist.filter((item) => item.done)
  if (doneItems.length === 0) continue

  add({
    actorId: task.assigneeIds[0],
    action: "checklist_added",
    targetType: "checklist",
    targetId: task.id,
    targetName: task.title,
    eventId: task.eventId,
    createdAt: shiftHours(task.createdAt, 4),
    before: null,
    after: {
      th: `เพิ่ม ${task.checklist.length} รายการ`,
      en: `Added ${task.checklist.length} items`,
    },
  })
}

/* ---- ไฟล์ ---- */
for (const file of MOCK_FILES) {
  for (const version of file.versions) {
    add({
      actorId: version.uploadedBy,
      action: version.versionNumber === 1 ? "file_uploaded" : "file_version_uploaded",
      targetType: "file",
      targetId: file.id,
      targetName: { th: file.name, en: file.name },
      eventId: file.eventId,
      createdAt: version.uploadedAt,
      before:
        version.versionNumber === 1
          ? null
          : { th: `เวอร์ชัน ${version.versionNumber - 1}`, en: `Version ${version.versionNumber - 1}` },
      after: { th: `เวอร์ชัน ${version.versionNumber}`, en: `Version ${version.versionNumber}` },
    })
  }

  if (file.deletedAt && file.deletedBy) {
    add({
      actorId: file.deletedBy,
      action: "file_deleted",
      targetType: "file",
      targetId: file.id,
      targetName: { th: file.name, en: file.name },
      eventId: file.eventId,
      createdAt: file.deletedAt,
      before: null,
      after: { th: "ย้ายไปถังขยะ", en: "Moved to trash" },
    })
  }
}

/* ---- เหตุการณ์เพิ่มเติมที่เขียนไว้เองเพื่อความสมจริง ---- */
add({
  actorId: "u-1",
  action: "event_updated",
  targetType: "event",
  targetId: "e-1",
  targetName: MOCK_EVENTS[0].title,
  eventId: "e-1",
  createdAt: "2026-07-30T16:42:00+07:00",
  before: { th: "ผู้เข้าร่วมที่คาดการณ์ 180 คน", en: "Expected attendees: 180" },
  after: { th: "ผู้เข้าร่วมที่คาดการณ์ 220 คน", en: "Expected attendees: 220" },
})

add({
  actorId: "u-7",
  action: "participant_imported",
  targetType: "participant",
  targetId: "e-1",
  targetName: MOCK_EVENTS[0].title,
  eventId: "e-1",
  createdAt: "2026-07-27T15:20:00+07:00",
  before: null,
  after: { th: "นำเข้ารายชื่อ 38 คนจาก Excel", en: "Imported 38 people from Excel" },
})

add({
  actorId: "u-6",
  action: "timeline_updated",
  targetType: "timeline",
  targetId: "e-1",
  targetName: { th: "ช่วงมอบรางวัลพนักงานดีเด่น", en: "Outstanding employee awards" },
  eventId: "e-1",
  createdAt: "2026-07-29T10:15:00+07:00",
  before: { th: "19:30 – 20:00", en: "19:30 – 20:00" },
  after: { th: "19:45 – 20:20", en: "19:45 – 20:20" },
})

/** เรียงจากใหม่ไปเก่า */
export const MOCK_ACTIVITIES: Activity[] = activities.sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt)
)
