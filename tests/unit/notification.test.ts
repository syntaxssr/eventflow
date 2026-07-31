import { describe, expect, it } from "vitest"

import {
  buildNotifications,
  countUnread,
  shouldNotify,
  type NotificationDraft,
} from "@/lib/notification"
import type {
  Notification,
  NotificationSettings,
} from "@/types/notification"

const ALL_ON: NotificationSettings = {
  assignedTask: true,
  dueSoon: true,
  fileChange: true,
  mention: true,
  timelineChange: true,
}

function makeDraft(
  overrides: Partial<NotificationDraft> = {}
): NotificationDraft {
  return {
    type: "mentioned",
    title: { th: "มีคนกล่าวถึงคุณ", en: "You were mentioned" },
    body: { th: "งาน", en: "Task" },
    href: "/my-tasks",
    eventId: "e-1",
    createdAt: "2026-07-31T10:00:00+07:00",
    actorId: "u-1",
    ...overrides,
  }
}

describe("shouldNotify", () => {
  it("เคารพปุ่มตั้งค่าของประเภทนั้น", () => {
    expect(shouldNotify("mentioned", { ...ALL_ON, mention: false })).toBe(false)
    expect(shouldNotify("task_assigned", { ...ALL_ON, assignedTask: false })).toBe(false)
    expect(shouldNotify("file_new_version", { ...ALL_ON, fileChange: false })).toBe(false)
    expect(shouldNotify("file_updated", { ...ALL_ON, fileChange: false })).toBe(false)
    expect(shouldNotify("task_due_soon", { ...ALL_ON, dueSoon: false })).toBe(false)
    expect(shouldNotify("task_overdue", { ...ALL_ON, dueSoon: false })).toBe(false)
    expect(shouldNotify("timeline_changed", { ...ALL_ON, timelineChange: false })).toBe(false)
  })

  it("ประเภทที่ไม่มีปุ่มปิดต้องแจ้งเสมอ", () => {
    const allOff: NotificationSettings = {
      assignedTask: false,
      dueSoon: false,
      fileChange: false,
      mention: false,
      timelineChange: false,
    }
    expect(shouldNotify("checklist_completed", allOff)).toBe(true)
    expect(shouldNotify("task_blocked", allOff)).toBe(true)
    expect(shouldNotify("task_unblocked", allOff)).toBe(true)
  })

  it("ไม่มีการตั้งค่า = เปิดรับทุกประเภท", () => {
    expect(shouldNotify("mentioned", undefined)).toBe(true)
  })
})

describe("buildNotifications", () => {
  it("ตัดผู้กระทำเองและผู้รับซ้ำออก", () => {
    let seq = 0
    const result = buildNotifications(
      makeDraft({ actorId: "u-1" }),
      ["u-1", "u-2", "u-2", "u-3"],
      { "u-1": ALL_ON, "u-2": ALL_ON, "u-3": ALL_ON },
      () => `n-${++seq}`
    )
    expect(result.map((entry) => entry.userId)).toEqual(["u-2", "u-3"])
    expect(result.every((entry) => !entry.isRead)).toBe(true)
  })

  it("ข้ามผู้รับที่ปิดการแจ้งเตือนประเภทนั้น", () => {
    const result = buildNotifications(
      makeDraft(),
      ["u-2", "u-3"],
      { "u-2": { ...ALL_ON, mention: false }, "u-3": ALL_ON },
      () => "n-x"
    )
    expect(result.map((entry) => entry.userId)).toEqual(["u-3"])
  })
})

describe("countUnread", () => {
  it("นับเฉพาะของผู้ใช้คนนั้นที่ยังไม่อ่าน", () => {
    const notifications = [
      { userId: "u-1", isRead: false },
      { userId: "u-1", isRead: true },
      { userId: "u-2", isRead: false },
    ] as Notification[]
    expect(countUnread(notifications, "u-1")).toBe(1)
  })
})
