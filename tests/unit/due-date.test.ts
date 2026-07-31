import { describe, expect, it } from "vitest"

import { fromDateKey, getToday } from "@/constants/mock-date"
import {
  daysUntilDue,
  getDueStatus,
  isDueSoon,
  isIncomplete,
  isOverdue,
} from "@/lib/due-date"
import type { Task } from "@/types/task"

const TODAY = fromDateKey("2026-07-31")

function task(status: Task["status"], dueDate: string | null) {
  return { status, dueDate }
}

describe("daysUntilDue", () => {
  it("คืน null เมื่อไม่ได้กำหนดวันส่ง", () => {
    expect(daysUntilDue({ dueDate: null }, TODAY)).toBeNull()
  })

  it("คืน 0 เมื่อครบกำหนดวันนี้", () => {
    expect(daysUntilDue({ dueDate: "2026-07-31" }, TODAY)).toBe(0)
  })

  it("คืนค่าบวกเมื่อยังไม่ถึงกำหนด และค่าลบเมื่อเลยกำหนด", () => {
    expect(daysUntilDue({ dueDate: "2026-08-05" }, TODAY)).toBe(5)
    expect(daysUntilDue({ dueDate: "2026-07-24" }, TODAY)).toBe(-7)
  })
})

describe("isOverdue", () => {
  it("เป็นจริงเมื่อเลยกำหนดและยังไม่เสร็จ", () => {
    expect(isOverdue(task("in_progress", "2026-07-30"), TODAY)).toBe(true)
    expect(isOverdue(task("not_started", "2026-07-01"), TODAY)).toBe(true)
    expect(isOverdue(task("blocked", "2026-07-29"), TODAY)).toBe(true)
  })

  it("เป็นเท็จเมื่องานเสร็จสิ้นแล้ว แม้เลยกำหนดไปนานแล้ว", () => {
    expect(isOverdue(task("completed", "2026-01-01"), TODAY)).toBe(false)
  })

  it("เป็นเท็จในวันครบกำหนดพอดี", () => {
    expect(isOverdue(task("in_progress", "2026-07-31"), TODAY)).toBe(false)
  })

  it("เป็นเท็จเมื่อไม่ได้กำหนดวันส่ง", () => {
    expect(isOverdue(task("in_progress", null), TODAY)).toBe(false)
  })
})

describe("isDueSoon", () => {
  it("เป็นจริงในวันครบกำหนดและก่อนหน้า 1 วัน", () => {
    expect(isDueSoon(task("in_progress", "2026-07-31"), TODAY)).toBe(true)
    expect(isDueSoon(task("in_progress", "2026-08-01"), TODAY)).toBe(true)
  })

  it("เป็นเท็จเมื่อเหลือมากกว่า 1 วัน", () => {
    expect(isDueSoon(task("in_progress", "2026-08-02"), TODAY)).toBe(false)
  })

  it("เป็นเท็จเมื่อเลยกำหนดไปแล้ว (นับเป็นเกินกำหนดแทน)", () => {
    expect(isDueSoon(task("in_progress", "2026-07-30"), TODAY)).toBe(false)
  })

  it("เป็นเท็จเมื่องานเสร็จแล้ว", () => {
    expect(isDueSoon(task("completed", "2026-07-31"), TODAY)).toBe(false)
  })
})

describe("getDueStatus", () => {
  it("จัดลำดับความสำคัญให้ 'เกินกำหนด' มาก่อน 'ใกล้ครบกำหนด'", () => {
    expect(getDueStatus(task("in_progress", "2026-07-20"), TODAY)).toBe("overdue")
    expect(getDueStatus(task("in_progress", "2026-08-01"), TODAY)).toBe("due_soon")
    expect(getDueStatus(task("in_progress", "2026-09-01"), TODAY)).toBe("none")
    expect(getDueStatus(task("completed", "2026-07-01"), TODAY)).toBe("none")
  })
})

describe("isIncomplete", () => {
  it("นับทุกสถานะยกเว้นเสร็จสิ้น", () => {
    expect(isIncomplete({ status: "not_started" })).toBe(true)
    expect(isIncomplete({ status: "in_progress" })).toBe(true)
    expect(isIncomplete({ status: "awaiting_review" })).toBe(true)
    expect(isIncomplete({ status: "blocked" })).toBe(true)
    expect(isIncomplete({ status: "completed" })).toBe(false)
  })
})

describe("ค่าเริ่มต้นของวันนี้", () => {
  it("ใช้ MOCK_TODAY เมื่อไม่ได้ส่งวันเข้ามา", () => {
    expect(getToday().getTime()).toBe(TODAY.getTime())
    expect(isOverdue(task("in_progress", "2026-07-24"))).toBe(true)
  })
})
