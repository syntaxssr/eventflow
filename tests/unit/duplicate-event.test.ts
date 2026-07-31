import { beforeEach, describe, expect, it } from "vitest"

import { defaultDuplicateOptions, duplicateEvent } from "@/lib/event"
import { resetIdCounters } from "@/lib/id"
import { MAIN_EVENT_ID, createInitialState } from "@/mock"
import { selectTasksByEvent } from "@/store/selectors"

const NOW = "2026-07-31T10:00:00+07:00"
const ACTOR = "u-1"

function setup(overrides: Partial<ReturnType<typeof defaultDuplicateOptions>> = {}) {
  const state = createInitialState()
  const source = state.events.find((event) => event.id === MAIN_EVENT_ID)!
  const tasks = selectTasksByEvent(state, MAIN_EVENT_ID)

  return {
    source,
    tasks,
    result: duplicateEvent({
      source,
      tasks,
      timeline: state.timeline.filter((item) => item.eventId === MAIN_EVENT_ID),
      fileCategories: state.fileCategories,
      options: { ...defaultDuplicateOptions(source), ...overrides },
      actorId: ACTOR,
      now: NOW,
    }),
  }
}

beforeEach(() => {
  resetIdCounters()
})

describe("duplicateEvent — กิจกรรมใหม่", () => {
  it("สร้างกิจกรรมใหม่เป็นสถานะร่างพร้อม id ใหม่", () => {
    const { source, result } = setup()

    expect(result.event.id).not.toBe(source.id)
    expect(result.event.status).toBe("draft")
    expect(result.event.createdBy).toBe(ACTOR)
    expect(result.event.updatedBy).toBe(ACTOR)
    expect(result.event.createdAt).toBe(NOW)
    expect(result.event.deletedAt).toBeNull()
  })

  it("ใช้ชื่อและวันที่ที่ผู้ใช้กำหนด", () => {
    const { result } = setup({
      title: { th: "งานเลี้ยงปีหน้า", en: "Next year party" },
      startDate: "2027-09-17",
      endDate: "2027-09-17",
    })

    expect(result.event.title.th).toBe("งานเลี้ยงปีหน้า")
    expect(result.event.startDate).toBe("2027-09-17")
  })
})

describe("duplicateEvent — งานย่อย", () => {
  it("คัดลอกงานย่อยครบทุกงานพร้อม id ใหม่", () => {
    const { tasks, result } = setup()

    expect(result.tasks).toHaveLength(tasks.length)
    const oldIds = new Set(tasks.map((task) => task.id))
    for (const task of result.tasks) {
      expect(oldIds.has(task.id)).toBe(false)
      expect(task.eventId).toBe(result.event.id)
    }
  })

  it("รีเซ็ตสถานะงานทุกงานเป็น 'ยังไม่เริ่ม'", () => {
    const { tasks, result } = setup()

    expect(tasks.some((task) => task.status === "completed")).toBe(true)
    for (const task of result.tasks) {
      expect(task.status).toBe("not_started")
      expect(task.blockOverridden).toBe(false)
    }
  })

  it("คัดลอก Checklist แต่ยกเลิกเครื่องหมายทั้งหมด", () => {
    const { tasks, result } = setup()

    const sourceWithChecklist = tasks.find((task) => task.checklist.length > 0)!
    expect(sourceWithChecklist.checklist.some((item) => item.done)).toBe(true)

    const copied = result.tasks.filter((task) => task.checklist.length > 0)
    expect(copied.length).toBeGreaterThan(0)
    for (const task of copied) {
      for (const item of task.checklist) {
        expect(item.done).toBe(false)
        expect(item.id.startsWith(task.id)).toBe(true)
      }
    }
  })

  it("เลื่อนวันครบกำหนดตามระยะห่างของวันจัดงานใหม่", () => {
    const { tasks, result } = setup({
      startDate: "2026-09-25",
      endDate: "2026-09-25",
    })

    // วันจัดงานเลื่อนไป 7 วัน งานทุกงานต้องเลื่อนตามเท่ากัน
    const sourceById = new Map(tasks.map((task) => [task.id, task]))
    const sourceDueDates = tasks.map((task) => task.dueDate!).sort()
    const copiedDueDates = result.tasks.map((task) => task.dueDate!).sort()

    expect(sourceById.size).toBe(tasks.length)
    for (let i = 0; i < sourceDueDates.length; i += 1) {
      const before = new Date(sourceDueDates[i]).getTime()
      const after = new Date(copiedDueDates[i]).getTime()
      expect((after - before) / 86_400_000).toBe(7)
    }
  })

  it("แปลง Dependency ให้ชี้ไปยังงานที่คัดลอกใหม่ ไม่ใช่งานเดิม", () => {
    const { tasks, result } = setup()

    const newIds = new Set(result.tasks.map((task) => task.id))
    const oldIds = new Set(tasks.map((task) => task.id))

    const withDeps = result.tasks.filter((task) => task.dependsOn.length > 0)
    expect(withDeps.length).toBeGreaterThan(0)

    for (const task of result.tasks) {
      for (const dependencyId of task.dependsOn) {
        expect(newIds.has(dependencyId)).toBe(true)
        expect(oldIds.has(dependencyId)).toBe(false)
      }
      for (const blockedId of task.blocks) {
        expect(newIds.has(blockedId)).toBe(true)
      }
    }
  })

  it("`blocks` กับ `dependsOn` ของสำเนายังสอดคล้องกันสองทาง", () => {
    const { result } = setup()
    const byId = new Map(result.tasks.map((task) => [task.id, task]))

    for (const task of result.tasks) {
      for (const dependencyId of task.dependsOn) {
        expect(byId.get(dependencyId)!.blocks).toContain(task.id)
      }
    }
  })

  it("ไม่คัดลอกไฟล์แนบของงาน", () => {
    const { result } = setup()
    for (const task of result.tasks) {
      expect(task.attachmentIds).toEqual([])
    }
  })
})

describe("duplicateEvent — ตัวเลือกที่ปิดไว้", () => {
  it("ไม่คัดลอกงานย่อยเมื่อปิด includeTasks", () => {
    const { result } = setup({ includeTasks: false })
    expect(result.tasks).toEqual([])
  })

  it("ไม่คัดลอกผู้รับผิดชอบเมื่อปิด includeAssignees", () => {
    const { result } = setup({ includeAssignees: false })
    for (const task of result.tasks) {
      expect(task.assigneeIds).toEqual([])
    }
  })

  it("ไม่คัดลอก Checklist เมื่อปิด includeChecklists", () => {
    const { result } = setup({ includeChecklists: false })
    for (const task of result.tasks) {
      expect(task.checklist).toEqual([])
    }
  })

  it("ไม่คัดลอก Dependency เมื่อปิด includeDependencies", () => {
    const { result } = setup({ includeDependencies: false })
    for (const task of result.tasks) {
      expect(task.dependsOn).toEqual([])
      expect(task.blocks).toEqual([])
    }
  })
})

describe("defaultDuplicateOptions", () => {
  it("ตั้งชื่อสำเนาและเปิดตัวเลือกที่คัดลอกได้ทั้งหมด", () => {
    const state = createInitialState()
    const source = state.events.find((event) => event.id === MAIN_EVENT_ID)!
    const options = defaultDuplicateOptions(source)

    expect(options.title.th).toContain(source.title.th)
    expect(options.includeTasks).toBe(true)
    expect(options.includeChecklists).toBe(true)
    expect(options.includeAssignees).toBe(true)
    expect(options.includeTimeline).toBe(true)
    expect(options.includeFileCategories).toBe(true)
    expect(options.includeDependencies).toBe(true)
    expect(options.includeNotificationSettings).toBe(true)
  })
})
