import { beforeEach, describe, expect, it } from "vitest"

import { defaultDuplicateOptions, duplicateEvent } from "@/lib/event"
import { resetIdCounters } from "@/lib/id"
import { MAIN_EVENT_ID, createInitialState } from "@/mock"
import { appReducer } from "@/store/reducer"
import { selectActiveEvents, selectTasksByEvent } from "@/store/selectors"
import type { EventItem } from "@/types/event"

const AT = "2026-07-31T10:30:00+07:00"

const NEW_EVENT: EventItem = {
  id: "e-new",
  title: { th: "งานทดสอบ", en: "Test event" },
  description: { th: "", en: "" },
  startDate: "2026-11-01",
  endDate: "2026-11-01",
  startTime: "09:00",
  endTime: "12:00",
  location: { th: "ห้องประชุม A", en: "Meeting room A" },
  ownerId: "u-1",
  expectedAttendees: 30,
  color: "#C3DCFF",
  status: "draft",
  coverImage: "",
  createdAt: AT,
  createdBy: "u-1",
  updatedAt: AT,
  updatedBy: "u-1",
  deletedAt: null,
  deletedBy: null,
}

beforeEach(() => {
  resetIdCounters()
})

describe("appReducer — event", () => {
  it("event/create เพิ่มกิจกรรมไว้บนสุด", () => {
    const state = appReducer(createInitialState(), {
      type: "event/create",
      event: NEW_EVENT,
    })

    expect(state.events[0].id).toBe("e-new")
    expect(state.events).toHaveLength(createInitialState().events.length + 1)
  })

  it("event/update แก้เฉพาะกิจกรรมที่ระบุ และอัปเดตผู้แก้ไขล่าสุด", () => {
    const initial = createInitialState()
    const state = appReducer(initial, {
      type: "event/update",
      id: MAIN_EVENT_ID,
      changes: { expectedAttendees: 250, status: "ready" },
      by: "u-3",
      at: AT,
    })

    const updated = state.events.find((event) => event.id === MAIN_EVENT_ID)!
    expect(updated.expectedAttendees).toBe(250)
    expect(updated.status).toBe("ready")
    expect(updated.updatedBy).toBe("u-3")
    expect(updated.updatedAt).toBe(AT)

    const untouched = state.events.find((event) => event.id === "e-2")!
    expect(untouched).toEqual(initial.events.find((event) => event.id === "e-2"))
  })

  it("event/delete ทำเครื่องหมายว่าถูกลบและหายจากรายการที่ใช้งานอยู่", () => {
    const state = appReducer(createInitialState(), {
      type: "event/delete",
      id: MAIN_EVENT_ID,
      by: "u-1",
      at: AT,
    })

    const deleted = state.events.find((event) => event.id === MAIN_EVENT_ID)!
    expect(deleted.deletedAt).toBe(AT)
    expect(deleted.deletedBy).toBe("u-1")
    expect(
      selectActiveEvents(state).some((event) => event.id === MAIN_EVENT_ID)
    ).toBe(false)
  })

  it("event/restore นำกิจกรรมกลับมา", () => {
    const deleted = appReducer(createInitialState(), {
      type: "event/delete",
      id: MAIN_EVENT_ID,
      by: "u-1",
      at: AT,
    })
    const restored = appReducer(deleted, {
      type: "event/restore",
      id: MAIN_EVENT_ID,
    })

    expect(
      selectActiveEvents(restored).some((event) => event.id === MAIN_EVENT_ID)
    ).toBe(true)
  })

  it("event/duplicate เพิ่มทั้งกิจกรรม งานย่อย ไทม์ไลน์ และหมวดหมู่ไฟล์", () => {
    const initial = createInitialState()
    const source = initial.events.find((event) => event.id === MAIN_EVENT_ID)!
    const sourceTasks = selectTasksByEvent(initial, MAIN_EVENT_ID)

    const result = duplicateEvent({
      source,
      tasks: sourceTasks,
      timeline: [],
      fileCategories: initial.fileCategories,
      options: defaultDuplicateOptions(source),
      actorId: "u-1",
      now: AT,
    })

    const state = appReducer(initial, { type: "event/duplicate", ...result })

    expect(state.events).toHaveLength(initial.events.length + 1)
    expect(state.tasks).toHaveLength(initial.tasks.length + sourceTasks.length)
    expect(selectTasksByEvent(state, result.event.id)).toHaveLength(
      sourceTasks.length
    )
    // ข้อมูลเดิมต้องไม่ถูกแตะต้อง
    expect(selectTasksByEvent(state, MAIN_EVENT_ID)).toHaveLength(
      sourceTasks.length
    )
  })

  it("ความคืบหน้าของสำเนาเริ่มที่ 0% เพราะงานถูกรีเซ็ตทั้งหมด", () => {
    const initial = createInitialState()
    const source = initial.events.find((event) => event.id === MAIN_EVENT_ID)!
    const result = duplicateEvent({
      source,
      tasks: selectTasksByEvent(initial, MAIN_EVENT_ID),
      timeline: [],
      fileCategories: initial.fileCategories,
      options: defaultDuplicateOptions(source),
      actorId: "u-1",
      now: AT,
    })

    const state = appReducer(initial, { type: "event/duplicate", ...result })
    const copied = selectTasksByEvent(state, result.event.id)
    expect(copied.every((task) => task.status === "not_started")).toBe(true)
  })
})

describe("appReducer — notification", () => {
  it("notification/markAllRead อ่านเฉพาะของผู้ใช้ที่ระบุ", () => {
    const initial = createInitialState()
    const state = appReducer(initial, {
      type: "notification/markAllRead",
      userId: "u-3",
    })

    for (const notification of state.notifications) {
      if (notification.userId === "u-3") {
        expect(notification.isRead).toBe(true)
      }
    }

    const otherUnreadBefore = initial.notifications.filter(
      (notification) => notification.userId !== "u-3" && !notification.isRead
    ).length
    const otherUnreadAfter = state.notifications.filter(
      (notification) => notification.userId !== "u-3" && !notification.isRead
    ).length
    expect(otherUnreadAfter).toBe(otherUnreadBefore)
  })

  it("notification/updateSettings แก้เฉพาะค่าที่ส่งมา", () => {
    const state = appReducer(createInitialState(), {
      type: "notification/updateSettings",
      userId: "u-1",
      settings: { mention: false },
    })

    expect(state.notificationSettings["u-1"]).toEqual({
      assignedTask: true,
      dueSoon: true,
      fileChange: true,
      mention: false,
      timelineChange: true,
    })
  })
})
