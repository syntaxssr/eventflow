import { describe, expect, it } from "vitest"

import { EMPTY_ACTIVITY_FILTERS, filterActivities } from "@/lib/activity"
import { globalSearch, type SearchSource } from "@/lib/search"
import { createInitialState } from "@/mock"
import type { Activity } from "@/types/activity"

/** ใช้ mock data จริงของระบบเป็นแหล่งค้นหา */
function makeSource(): SearchSource {
  const state = createInitialState()
  return {
    events: state.events,
    tasks: state.tasks,
    files: state.files,
    participants: state.participants,
    users: state.users,
  }
}

describe("globalSearch", () => {
  it("คำค้นว่างคืนผลว่างทุกกลุ่ม", () => {
    const results = globalSearch(makeSource(), "   ")
    expect(results.total).toBe(0)
    expect(results.events).toEqual([])
  })

  it("ค้นชื่อกิจกรรมได้ทั้งไทยและอังกฤษ", () => {
    const source = makeSource()
    expect(
      globalSearch(source, "งานเลี้ยงประจำปี").events.length
    ).toBeGreaterThan(0)
    expect(globalSearch(source, "annual").events.length).toBeGreaterThan(0)
  })

  it("ค้นวันที่กิจกรรมจาก date key ได้", () => {
    const results = globalSearch(makeSource(), "2026-09-18")
    expect(results.events.some((event) => event.startDate === "2026-09-18")).toBe(
      true
    )
  })

  it("ค้นงานจากสถานะ (ป้ายไทย) และจากชื่อผู้รับผิดชอบ", () => {
    const source = makeSource()
    const byStatus = globalSearch(source, "ถูกบล็อก")
    expect(byStatus.tasks.some((task) => task.status === "blocked")).toBe(true)

    const byAssignee = globalSearch(source, "อลิสา")
    expect(byAssignee.tasks.length).toBeGreaterThan(0)
    expect(byAssignee.users.some((user) => user.firstName.th === "อลิสา")).toBe(
      true
    )
  })

  it("ค้นไฟล์จากชื่อและประเภท และไม่รวมไฟล์ในถังขยะ", () => {
    const source = makeSource()
    const byName = globalSearch(source, "Golden Night")
    expect(byName.files.length).toBeGreaterThan(0)

    const byType = globalSearch(source, "powerpoint")
    expect(byType.files.every((file) => file.type === "powerpoint")).toBe(true)
    expect(byType.files.every((file) => file.deletedAt === null)).toBe(true)
  })

  it("ค้นผู้เข้าร่วมจากอีเมลและแผนก", () => {
    const source = makeSource()
    const byEmail = globalSearch(source, "somchai.w@company.co.th")
    expect(byEmail.participants).toHaveLength(1)

    const byDepartment = globalSearch(source, "ฝ่ายจัดซื้อ")
    expect(byDepartment.participants.length).toBeGreaterThan(0)
  })

  it("จำกัดจำนวนต่อกลุ่มแต่ total นับผลทั้งหมด", () => {
    const results = globalSearch(makeSource(), "company.co.th", 3)
    expect(results.participants).toHaveLength(3)
    expect(results.total).toBeGreaterThan(3)
  })
})

describe("filterActivities", () => {
  const base: Activity = {
    id: "a-1",
    actorId: "u-1",
    action: "task_created",
    targetType: "task",
    targetId: "t-1",
    targetName: { th: "จองสถานที่", en: "Book the venue" },
    eventId: "e-1",
    createdAt: "2026-07-20T10:00:00+07:00",
    before: null,
    after: null,
  }
  const activities: Activity[] = [
    base,
    {
      ...base,
      id: "a-2",
      actorId: "u-2",
      action: "file_uploaded",
      targetType: "file",
      targetName: { th: "โปสเตอร์", en: "Poster" },
      createdAt: "2026-07-25T09:00:00+07:00",
    },
    {
      ...base,
      id: "a-3",
      action: "task_status_changed",
      eventId: "e-2",
      before: { th: "ยังไม่เริ่ม", en: "Not started" },
      after: { th: "กำลังดำเนินการ", en: "In progress" },
      createdAt: "2026-07-30T15:00:00+07:00",
    },
  ]

  it("ไม่มีตัวกรอง = ทั้งหมด เรียงจากใหม่ไปเก่า", () => {
    const result = filterActivities(activities, EMPTY_ACTIVITY_FILTERS)
    expect(result.map((entry) => entry.id)).toEqual(["a-3", "a-2", "a-1"])
  })

  it("กรองตามผู้ดำเนินการ ประเภท action และกิจกรรม", () => {
    expect(
      filterActivities(activities, {
        ...EMPTY_ACTIVITY_FILTERS,
        actorId: "u-2",
      }).map((entry) => entry.id)
    ).toEqual(["a-2"])
    expect(
      filterActivities(activities, {
        ...EMPTY_ACTIVITY_FILTERS,
        action: "task_status_changed",
      }).map((entry) => entry.id)
    ).toEqual(["a-3"])
    expect(
      filterActivities(activities, {
        ...EMPTY_ACTIVITY_FILTERS,
        eventId: "e-2",
      }).map((entry) => entry.id)
    ).toEqual(["a-3"])
  })

  it("กรองช่วงวันที่แบบรวมปลายทั้งสองด้าน", () => {
    const result = filterActivities(activities, {
      ...EMPTY_ACTIVITY_FILTERS,
      dateFrom: "2026-07-25",
      dateTo: "2026-07-30",
    })
    expect(result.map((entry) => entry.id)).toEqual(["a-3", "a-2"])
  })

  it("ค้นจากชื่อ target และสรุปก่อน–หลัง", () => {
    expect(
      filterActivities(activities, {
        ...EMPTY_ACTIVITY_FILTERS,
        query: "poster",
      }).map((entry) => entry.id)
    ).toEqual(["a-2"])
    expect(
      filterActivities(activities, {
        ...EMPTY_ACTIVITY_FILTERS,
        query: "กำลังดำเนินการ",
      }).map((entry) => entry.id)
    ).toEqual(["a-3"])
  })
})
