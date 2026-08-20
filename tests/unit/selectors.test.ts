import { describe, expect, it } from "vitest"

import { fromDateKey, getToday, toDateKey } from "@/constants/mock-date"
import { MAIN_EVENT_ID, createInitialState } from "@/mock"
import {
  compareEventsByRelevance,
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
  // Mock Data เลื่อนตามวันจริง จึงต้องใช้ "วันนี้" จริง ไม่ใช่วันที่ตายตัว
  const today = getToday()
  const todayKey = toDateKey(today)

  it("ยกงานเกินกำหนดขึ้นมาก่อน แล้วเรียงตามวันครบกำหนด", () => {
    const tasks = sortTasksByUrgency(
      state.tasks.filter((task) => task.status !== "completed"),
      today
    )

    const firstOnTimeIndex = tasks.findIndex((task) => task.dueDate! >= todayKey)
    const lastOverdueIndex = tasks.findLastIndex(
      (task) => task.dueDate! < todayKey
    )

    expect(lastOverdueIndex).toBeLessThan(firstOnTimeIndex)
  })

  it("ดันงานที่เสร็จแล้วลงไปท้ายสุด ไม่ปนกับงานที่ยังต้องทำ", () => {
    const tasks = sortTasksByUrgency(
      selectTasksByEvent(state, MAIN_EVENT_ID),
      today
    )

    const firstDone = tasks.findIndex((task) => task.status === "completed")
    const lastOpen = tasks.findLastIndex((task) => task.status !== "completed")

    expect(firstDone).toBeGreaterThan(-1)
    expect(lastOpen).toBeLessThan(firstDone)
  })

  it("ใช้ความสำคัญตัดสินเมื่อวันครบกำหนดเท่ากัน", () => {
    const tasks = sortTasksByUrgency(
      selectTasksByEvent(state, MAIN_EVENT_ID),
      today
    )
    const rank = { urgent: 0, high: 1, normal: 2, low: 3 } as const

    for (let i = 1; i < tasks.length; i += 1) {
      const prev = tasks[i - 1]
      const curr = tasks[i]
      const sameGroup =
        (prev.status === "completed") === (curr.status === "completed")
      if (!sameGroup || prev.dueDate !== curr.dueDate) continue
      expect(rank[prev.priority]).toBeLessThanOrEqual(rank[curr.priority])
    }
  })
})

describe("compareEventsByRelevance", () => {
  const today = getToday()
  const todayKey = toDateKey(today)
  const sorted = [...state.events]
    .filter((event) => event.deletedAt === null)
    .sort((a, b) => compareEventsByRelevance(a, b, today))

  it("กิจกรรมที่ยังไม่ถึงขึ้นก่อนกิจกรรมที่ผ่านมาแล้ว", () => {
    const groupOf = (index: number) => {
      const event = sorted[index]
      if (event.status === "cancelled") return 2
      return event.endDate < todayKey ? 1 : 0
    }
    for (let i = 1; i < sorted.length; i += 1) {
      expect(groupOf(i - 1)).toBeLessThanOrEqual(groupOf(i))
    }
  })

  it("กิจกรรมที่ยกเลิกอยู่ท้ายสุดแต่ยังแสดงอยู่", () => {
    const cancelled = sorted.filter((event) => event.status === "cancelled")
    expect(cancelled.length).toBeGreaterThan(0)
    expect(sorted.slice(-cancelled.length).every((e) => e.status === "cancelled")).toBe(
      true
    )
  })

  it("กลุ่มที่ยังไม่ถึงเรียงจากวันที่ใกล้ที่สุด", () => {
    const upcoming = sorted.filter(
      (event) => event.status !== "cancelled" && event.endDate >= todayKey
    )
    const dates = upcoming.map((event) => event.startDate)
    expect(dates).toEqual([...dates].sort())
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
