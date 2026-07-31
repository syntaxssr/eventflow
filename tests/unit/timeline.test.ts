import { describe, expect, it } from "vitest"

import {
  buildGanttLayout,
  derivePhase,
  findOverlaps,
  groupByPhase,
  sortTimeline,
  timeToMinutes,
} from "@/lib/timeline"
import { createInitialState } from "@/mock"
import type { Task } from "@/types/task"
import type { TimelineItem, TimelinePhase } from "@/types/timeline"

function item(
  id: string,
  date: string,
  startTime: string,
  endTime: string,
  options: {
    phase?: TimelinePhase
    order?: number
    linkedTaskId?: string | null
  } = {}
): TimelineItem {
  return {
    id,
    eventId: "e-1",
    phase: options.phase ?? "before",
    date,
    startTime,
    endTime,
    title: { th: id, en: id },
    ownerIds: ["u-1"],
    location: { th: "", en: "" },
    readiness: "not_ready",
    note: { th: "", en: "" },
    linkedTaskId: options.linkedTaskId ?? null,
    order: options.order ?? 0,
    createdAt: "2026-07-01T09:00:00+07:00",
    createdBy: "u-1",
    updatedAt: "2026-07-01T09:00:00+07:00",
    updatedBy: "u-1",
  }
}

describe("timeToMinutes", () => {
  it("แปลง HH:mm เป็นจำนวนนาที", () => {
    expect(timeToMinutes("00:00")).toBe(0)
    expect(timeToMinutes("09:30")).toBe(570)
    expect(timeToMinutes("23:59")).toBe(1439)
  })
})

describe("sortTimeline", () => {
  it("เรียงตามวันก่อน แล้วจึงตามเวลาเริ่ม", () => {
    const sorted = sortTimeline([
      item("c", "2026-09-18", "19:00", "20:00"),
      item("a", "2026-09-17", "15:00", "19:00"),
      item("b", "2026-09-18", "14:00", "16:00"),
    ])
    expect(sorted.map((entry) => entry.id)).toEqual(["a", "b", "c"])
  })

  it("ใช้ order ตัดสินเมื่อวันและเวลาเท่ากัน", () => {
    const sorted = sortTimeline([
      item("second", "2026-09-18", "09:00", "10:00", { order: 1 }),
      item("first", "2026-09-18", "09:00", "10:00", { order: 0 }),
    ])
    expect(sorted.map((entry) => entry.id)).toEqual(["first", "second"])
  })

  it("ไม่แก้ไขอาร์เรย์ต้นฉบับ", () => {
    const input = [
      item("b", "2026-09-18", "10:00", "11:00"),
      item("a", "2026-09-17", "10:00", "11:00"),
    ]
    sortTimeline(input)
    expect(input[0].id).toBe("b")
  })
})

describe("groupByPhase", () => {
  it("แยกเป็น 3 ช่วงและเรียงภายในแต่ละช่วง", () => {
    const groups = groupByPhase([
      item("during-2", "2026-09-18", "19:00", "20:00", { phase: "during" }),
      item("before-1", "2026-09-15", "09:00", "18:00", { phase: "before" }),
      item("during-1", "2026-09-18", "14:00", "16:00", { phase: "during" }),
      item("after-1", "2026-09-19", "09:00", "12:00", { phase: "after" }),
    ])

    expect(groups.before.map((entry) => entry.id)).toEqual(["before-1"])
    expect(groups.during.map((entry) => entry.id)).toEqual([
      "during-1",
      "during-2",
    ])
    expect(groups.after.map((entry) => entry.id)).toEqual(["after-1"])
  })
})

describe("derivePhase", () => {
  it("จัดช่วงอัตโนมัติจากวันที่เทียบกับวันจัดงาน", () => {
    expect(derivePhase("2026-09-10", "2026-09-18", "2026-09-18")).toBe("before")
    expect(derivePhase("2026-09-18", "2026-09-18", "2026-09-18")).toBe("during")
    expect(derivePhase("2026-09-25", "2026-09-18", "2026-09-18")).toBe("after")
  })

  it("รองรับกิจกรรมที่กินเวลาหลายวัน", () => {
    expect(derivePhase("2026-09-19", "2026-09-18", "2026-09-20")).toBe("during")
    expect(derivePhase("2026-09-21", "2026-09-18", "2026-09-20")).toBe("after")
  })
})

describe("findOverlaps", () => {
  it("พบรายการที่เวลาเหลื่อมกันในวันเดียวกัน", () => {
    const overlaps = findOverlaps([
      item("a", "2026-09-18", "14:00", "16:00"),
      item("b", "2026-09-18", "15:00", "17:00"),
    ])
    expect(overlaps).toEqual([["a", "b"]])
  })

  it("ไม่นับรายการที่ต่อกันพอดีว่าเหลื่อม", () => {
    expect(
      findOverlaps([
        item("a", "2026-09-18", "14:00", "16:00"),
        item("b", "2026-09-18", "16:00", "17:00"),
      ])
    ).toEqual([])
  })

  it("ไม่นับรายการคนละวัน", () => {
    expect(
      findOverlaps([
        item("a", "2026-09-18", "14:00", "23:00"),
        item("b", "2026-09-19", "09:00", "12:00"),
      ])
    ).toEqual([])
  })
})

describe("buildGanttLayout", () => {
  it("คืนค่าว่างเมื่อไม่มีรายการ", () => {
    expect(buildGanttLayout([])).toEqual({ bars: [], days: [], links: [] })
  })

  it("สร้างรายวันครบทุกวันในช่วง", () => {
    const layout = buildGanttLayout([
      item("a", "2026-09-01", "09:00", "10:00"),
      item("b", "2026-09-04", "09:00", "10:00"),
    ])
    expect(layout.days).toEqual([
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
    ])
  })

  it("วางตำแหน่งแถบตามวันและเวลาในวันนั้น", () => {
    const layout = buildGanttLayout([
      item("a", "2026-09-01", "00:00", "12:00"),
      item("b", "2026-09-02", "12:00", "18:00"),
    ])

    // ช่วงรวม 2 วัน = 2880 นาที
    expect(layout.bars[0].left).toBeCloseTo(0, 5)
    expect(layout.bars[0].width).toBeCloseTo(720 / 2880, 5)
    expect(layout.bars[1].left).toBeCloseTo((1440 + 720) / 2880, 5)
  })

  it("แถบสั้นมากยังมีความกว้างขั้นต่ำให้มองเห็นได้", () => {
    const layout = buildGanttLayout([
      item("a", "2026-09-01", "09:00", "09:05"),
      item("b", "2026-09-30", "09:00", "10:00"),
    ])
    expect(layout.bars[0].width).toBeGreaterThan(0)
  })

  it("สร้างเส้นเชื่อมจาก dependency ของงานที่ผูกไว้", () => {
    const tasks = [
      { id: "t-1", dependsOn: [] },
      { id: "t-2", dependsOn: ["t-1"] },
    ] as Task[]

    const layout = buildGanttLayout(
      [
        item("a", "2026-09-01", "09:00", "10:00", { linkedTaskId: "t-1" }),
        item("b", "2026-09-04", "09:00", "10:00", { linkedTaskId: "t-2" }),
      ],
      tasks
    )

    expect(layout.links).toEqual([["a", "b"]])
  })

  it("ไม่สร้างเส้นเชื่อมเมื่อรายการไม่ได้ผูกกับงาน", () => {
    const layout = buildGanttLayout(
      [item("a", "2026-09-01", "09:00", "10:00")],
      [{ id: "t-1", dependsOn: [] } as Task]
    )
    expect(layout.links).toEqual([])
  })
})

describe("ข้อมูลไทม์ไลน์จำลอง", () => {
  const state = createInitialState()
  const mainEventItems = state.timeline.filter((entry) => entry.eventId === "e-1")

  it("มีรายการครบทั้งสามช่วงของงานเลี้ยงประจำปี", () => {
    const groups = groupByPhase(mainEventItems)
    expect(groups.before.length).toBeGreaterThanOrEqual(6)
    expect(groups.during.length).toBeGreaterThanOrEqual(10)
    expect(groups.after.length).toBeGreaterThanOrEqual(3)
  })

  it("รายการช่วง 'วันจัดงาน' อยู่ในวันจัดงานจริงทั้งหมด", () => {
    const event = state.events.find((entry) => entry.id === "e-1")!
    for (const entry of mainEventItems.filter(
      (candidate) => candidate.phase === "during"
    )) {
      expect(entry.date >= event.startDate).toBe(true)
      expect(entry.date <= event.endDate).toBe(true)
    }
  })

  it("ช่วงของทุกรายการสอดคล้องกับวันที่จริง", () => {
    const event = state.events.find((entry) => entry.id === "e-1")!
    for (const entry of mainEventItems) {
      expect(
        derivePhase(entry.date, event.startDate, event.endDate),
        entry.id
      ).toBe(entry.phase)
    }
  })

  it("ลำดับพิธีการในวันงานไม่มีเวลาเหลื่อมกัน", () => {
    const during = mainEventItems.filter((entry) => entry.phase === "during")
    expect(findOverlaps(during)).toEqual([])
  })

  it("ทุกรายการมีเวลาสิ้นสุดหลังเวลาเริ่ม", () => {
    for (const entry of state.timeline) {
      expect(
        timeToMinutes(entry.endTime) > timeToMinutes(entry.startTime),
        entry.id
      ).toBe(true)
    }
  })

  it("งานที่ผูกไว้มีอยู่จริงและอยู่กิจกรรมเดียวกัน", () => {
    const taskById = new Map(state.tasks.map((task) => [task.id, task]))
    for (const entry of state.timeline) {
      if (!entry.linkedTaskId) continue
      const task = taskById.get(entry.linkedTaskId)
      expect(task, entry.id).toBeDefined()
      expect(task!.eventId).toBe(entry.eventId)
    }
  })
})
