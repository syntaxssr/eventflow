import { describe, expect, it } from "vitest"

import {
  canStartTask,
  detachTask,
  getBlockedInfo,
  linkDependency,
  unlinkDependency,
  validateDependency,
} from "@/lib/dependency"
import type { Task, TaskStatus } from "@/types/task"

function task(
  id: string,
  options: {
    dependsOn?: string[]
    blocks?: string[]
    status?: TaskStatus
    eventId?: string
    blockOverridden?: boolean
  } = {}
): Task {
  return {
    id,
    eventId: options.eventId ?? "e-1",
    title: { th: id, en: id },
    description: { th: "", en: "" },
    notes: { th: "", en: "" },
    assigneeIds: ["u-1"],
    startDate: null,
    dueDate: "2026-08-01",
    priority: "normal",
    status: options.status ?? "not_started",
    checklist: [],
    attachmentIds: [],
    dependsOn: options.dependsOn ?? [],
    blocks: options.blocks ?? [],
    blockOverridden: options.blockOverridden ?? false,
    createdAt: "2026-07-01T09:00:00+07:00",
    createdBy: "u-1",
    updatedAt: "2026-07-01T09:00:00+07:00",
    updatedBy: "u-1",
  }
}

describe("validateDependency", () => {
  it("ปฏิเสธเมื่องานรอตัวเอง", () => {
    const tasks = [task("t-1")]
    expect(validateDependency(tasks, "t-1", "t-1")).toEqual({
      valid: false,
      reason: "self_reference",
    })
  })

  it("ปฏิเสธเมื่อมีความสัมพันธ์นี้อยู่แล้ว", () => {
    const tasks = [task("t-1", { dependsOn: ["t-2"] }), task("t-2")]
    expect(validateDependency(tasks, "t-1", "t-2").reason).toBe("duplicate")
  })

  it("ปฏิเสธเมื่ออยู่คนละกิจกรรม", () => {
    const tasks = [task("t-1"), task("t-2", { eventId: "e-2" })]
    expect(validateDependency(tasks, "t-1", "t-2").reason).toBe("cross_event")
  })

  it("ปฏิเสธการรอกันเป็นวงกลมแบบตรง", () => {
    // t-2 รอ t-1 อยู่แล้ว → ให้ t-1 รอ t-2 ไม่ได้
    const tasks = [task("t-1"), task("t-2", { dependsOn: ["t-1"] })]
    const result = validateDependency(tasks, "t-1", "t-2")

    expect(result.valid).toBe(false)
    expect(result.reason).toBe("circular")
    expect(result.cyclePath).toEqual(["t-1", "t-2", "t-1"])
  })

  it("ปฏิเสธการรอกันเป็นวงกลมแบบอ้อม", () => {
    // t-3 → t-2 → t-1 ดังนั้น t-1 รอ t-3 ไม่ได้
    const tasks = [
      task("t-1"),
      task("t-2", { dependsOn: ["t-1"] }),
      task("t-3", { dependsOn: ["t-2"] }),
    ]
    const result = validateDependency(tasks, "t-1", "t-3")

    expect(result.reason).toBe("circular")
    expect(result.cyclePath).toEqual(["t-1", "t-3", "t-2", "t-1"])
  })

  it("อนุญาตความสัมพันธ์ที่ถูกต้อง", () => {
    const tasks = [task("t-1"), task("t-2"), task("t-3", { dependsOn: ["t-2"] })]
    expect(validateDependency(tasks, "t-1", "t-2")).toEqual({ valid: true })
    expect(validateDependency(tasks, "t-1", "t-3")).toEqual({ valid: true })
  })

  it("ไม่ติดกับดักเมื่อกราฟมีหลายเส้นทางไปยังงานเดียวกัน", () => {
    // ทั้ง t-2 และ t-3 รอ t-1; t-4 รอทั้งสอง — ไม่ใช่วงกลม
    const tasks = [
      task("t-1"),
      task("t-2", { dependsOn: ["t-1"] }),
      task("t-3", { dependsOn: ["t-1"] }),
      task("t-4", { dependsOn: ["t-2", "t-3"] }),
    ]
    expect(validateDependency(tasks, "t-4", "t-1").valid).toBe(true)
  })
})

describe("getBlockedInfo", () => {
  it("ถูกบล็อกเมื่อยังมีงานที่ต้องเสร็จก่อนค้างอยู่", () => {
    const tasks = [
      task("t-1", { status: "in_progress" }),
      task("t-2", { dependsOn: ["t-1"] }),
    ]
    expect(getBlockedInfo(tasks[1], tasks)).toEqual({
      isBlocked: true,
      blockingTaskIds: ["t-1"],
    })
  })

  it("ไม่ถูกบล็อกเมื่องานที่รออยู่เสร็จหมดแล้ว", () => {
    const tasks = [
      task("t-1", { status: "completed" }),
      task("t-2", { dependsOn: ["t-1"] }),
    ]
    expect(getBlockedInfo(tasks[1], tasks).isBlocked).toBe(false)
  })

  it("รายงานเฉพาะงานที่ยังไม่เสร็จ", () => {
    const tasks = [
      task("t-1", { status: "completed" }),
      task("t-2", { status: "not_started" }),
      task("t-3", { dependsOn: ["t-1", "t-2"] }),
    ]
    expect(getBlockedInfo(tasks[2], tasks).blockingTaskIds).toEqual(["t-2"])
  })
})

describe("canStartTask", () => {
  it("เริ่มไม่ได้เมื่อยังถูกบล็อก", () => {
    const tasks = [task("t-1"), task("t-2", { dependsOn: ["t-1"] })]
    expect(canStartTask(tasks[1], tasks)).toBe(false)
  })

  it("เริ่มได้เมื่อผู้ใช้ยืนยันข้ามคำเตือนแล้ว", () => {
    const tasks = [
      task("t-1"),
      task("t-2", { dependsOn: ["t-1"], blockOverridden: true }),
    ]
    expect(canStartTask(tasks[1], tasks)).toBe(true)
  })
})

describe("linkDependency / unlinkDependency", () => {
  it("เพิ่มความสัมพันธ์ให้ทั้งสองฝั่งพร้อมกัน", () => {
    const linked = linkDependency([task("t-1"), task("t-2")], "t-1", "t-2")

    expect(linked[0].dependsOn).toEqual(["t-2"])
    expect(linked[1].blocks).toEqual(["t-1"])
  })

  it("ตัดความสัมพันธ์ออกจากทั้งสองฝั่งพร้อมกัน", () => {
    const linked = linkDependency([task("t-1"), task("t-2")], "t-1", "t-2")
    const unlinked = unlinkDependency(linked, "t-1", "t-2")

    expect(unlinked[0].dependsOn).toEqual([])
    expect(unlinked[1].blocks).toEqual([])
  })
})

describe("detachTask", () => {
  it("ลบงานออกและล้างความสัมพันธ์ที่ชี้มาหางานนั้น", () => {
    const tasks = linkDependency(
      [task("t-1"), task("t-2"), task("t-3")],
      "t-1",
      "t-2"
    )
    const result = detachTask(tasks, "t-2")

    expect(result.map((item) => item.id)).toEqual(["t-1", "t-3"])
    expect(result[0].dependsOn).toEqual([])
  })
})
