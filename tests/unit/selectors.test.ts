import { describe, expect, it } from "vitest"

import { fromDateKey } from "@/constants/mock-date"
import { MAIN_EVENT_ID, createInitialState } from "@/mock"
import {
  selectActiveTasks,
  selectEventProgress,
  selectNotificationsForUser,
  selectParticipantsByEvent,
  selectRecentFiles,
  selectTasksByEvent,
  selectTasksForUser,
  selectUnreadCount,
  selectUpcomingEvents,
  sortTasksByUrgency,
  summariseRsvp,
} from "@/store/selectors"

const state = createInitialState()
const TODAY = fromDateKey("2026-07-31")

describe("selectUpcomingEvents", () => {
  const upcoming = selectUpcomingEvents(state, TODAY)

  it("ไม่รวมกิจกรรมที่ยกเลิกหรือจบไปแล้ว", () => {
    for (const event of upcoming) {
      expect(event.status).not.toBe("cancelled")
      expect(event.status).not.toBe("completed")
    }
  })

  it("ไม่รวมกิจกรรมที่วันจัดงานผ่านไปแล้ว", () => {
    for (const event of upcoming) {
      expect(event.endDate >= "2026-07-31").toBe(true)
    }
  })

  it("เรียงจากวันที่ใกล้ที่สุด", () => {
    for (let i = 1; i < upcoming.length; i += 1) {
      expect(upcoming[i - 1].startDate <= upcoming[i].startDate).toBe(true)
    }
  })

  it("มีงานเลี้ยงประจำปีอยู่ในรายการ", () => {
    expect(upcoming.some((event) => event.id === MAIN_EVENT_ID)).toBe(true)
  })
})

describe("selectActiveTasks", () => {
  it("ไม่นับงานของกิจกรรมที่ถูกยกเลิก", () => {
    const cancelledEventIds = state.events
      .filter((event) => event.status === "cancelled")
      .map((event) => event.id)

    expect(cancelledEventIds.length).toBeGreaterThan(0)
    for (const task of selectActiveTasks(state)) {
      expect(cancelledEventIds).not.toContain(task.eventId)
    }
  })
})

describe("selectEventProgress", () => {
  it("สอดคล้องกับจำนวนงานที่เสร็จของกิจกรรมนั้น", () => {
    const tasks = selectTasksByEvent(state, MAIN_EVENT_ID)
    const progress = selectEventProgress(state, MAIN_EVENT_ID, TODAY)

    expect(progress.totalTasks).toBe(tasks.length)
    expect(progress.completedTasks).toBe(
      tasks.filter((task) => task.status === "completed").length
    )
    expect(progress.percent).toBeGreaterThan(0)
    expect(progress.percent).toBeLessThan(100)
  })

  it("คืน 0% สำหรับกิจกรรมที่ยังไม่มีงานย่อย", () => {
    expect(selectEventProgress(state, "e-4", TODAY)).toEqual({
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      percent: 0,
    })
  })
})

describe("selectTasksForUser", () => {
  it("คืนงานที่ผู้ใช้เป็นหนึ่งในผู้รับผิดชอบ", () => {
    const tasks = selectTasksForUser(state, "u-2")
    expect(tasks.length).toBeGreaterThan(0)
    for (const task of tasks) {
      expect(task.assigneeIds).toContain("u-2")
    }
  })

  it("ผู้ใช้แต่ละคนได้งานคนละชุด", () => {
    const a = selectTasksForUser(state, "u-2").map((task) => task.id)
    const b = selectTasksForUser(state, "u-5").map((task) => task.id)
    expect(a).not.toEqual(b)
  })
})

describe("sortTasksByUrgency", () => {
  it("ยกงานเกินกำหนดขึ้นมาก่อน แล้วเรียงตามวันครบกำหนด", () => {
    const tasks = sortTasksByUrgency(
      state.tasks.filter((task) => task.status !== "completed"),
      TODAY
    )

    const firstOnTimeIndex = tasks.findIndex(
      (task) => task.dueDate! >= "2026-07-31"
    )
    const lastOverdueIndex = tasks.findLastIndex(
      (task) => task.dueDate! < "2026-07-31"
    )

    expect(lastOverdueIndex).toBeLessThan(firstOnTimeIndex)
  })
})

describe("summariseRsvp", () => {
  it("ยอดรวมของแต่ละสถานะเท่ากับจำนวนผู้เข้าร่วมทั้งหมด", () => {
    const participants = selectParticipantsByEvent(state, MAIN_EVENT_ID)
    const summary = summariseRsvp(participants)

    expect(summary.total).toBe(participants.length)
    expect(summary.attending + summary.notAttending + summary.pending).toBe(
      summary.total
    )
    expect(summary.attending).toBeGreaterThan(0)
    expect(summary.notAttending).toBeGreaterThan(0)
    expect(summary.pending).toBeGreaterThan(0)
  })
})

describe("selectRecentFiles", () => {
  it("ไม่รวมไฟล์ที่อยู่ในถังขยะ และเรียงจากที่แก้ไขล่าสุด", () => {
    const files = selectRecentFiles(state, 5)
    expect(files.length).toBe(5)
    for (const file of files) {
      expect(file.deletedAt).toBeNull()
    }
    for (let i = 1; i < files.length; i += 1) {
      expect(files[i - 1].updatedAt >= files[i].updatedAt).toBe(true)
    }
  })
})

describe("การแจ้งเตือน", () => {
  it("คืนเฉพาะการแจ้งเตือนของผู้ใช้คนนั้น", () => {
    const notifications = selectNotificationsForUser(state, "u-3")
    expect(notifications.length).toBeGreaterThan(0)
    for (const notification of notifications) {
      expect(notification.userId).toBe("u-3")
    }
  })

  it("จำนวนที่ยังไม่อ่านตรงกับข้อมูลจริง", () => {
    const unread = selectNotificationsForUser(state, "u-3").filter(
      (notification) => !notification.isRead
    ).length
    expect(selectUnreadCount(state, "u-3")).toBe(unread)
  })

  it("ผู้ใช้แต่ละคนเห็นการแจ้งเตือนไม่เหมือนกัน", () => {
    const a = selectNotificationsForUser(state, "u-2").length
    const b = selectNotificationsForUser(state, "u-6").length
    expect(a).toBeGreaterThan(0)
    expect(b).toBeGreaterThan(0)
    expect(a).not.toBe(b)
  })
})
