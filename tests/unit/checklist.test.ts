import { describe, expect, it } from "vitest"

import {
  applyChecklistRules,
  checklistProgress,
  deriveStatusFromChecklist,
  reorderChecklist,
} from "@/lib/checklist"
import type { ChecklistItem, Task } from "@/types/task"

function items(...done: boolean[]): ChecklistItem[] {
  return done.map((isDone, index) => ({
    id: `c-${index + 1}`,
    label: { th: `ข้อ ${index + 1}`, en: `Item ${index + 1}` },
    done: isDone,
    order: index,
  }))
}

describe("checklistProgress", () => {
  it("คืน 0 ทุกค่าเมื่อไม่มีรายการ", () => {
    expect(checklistProgress([])).toEqual({ done: 0, total: 0, percent: 0 })
  })

  it("นับจำนวนและคำนวณเปอร์เซ็นต์ถูกต้อง", () => {
    expect(checklistProgress(items(true, true, false, false))).toEqual({
      done: 2,
      total: 4,
      percent: 50,
    })
  })

  it("ปัดเศษเปอร์เซ็นต์", () => {
    expect(checklistProgress(items(true, false, false)).percent).toBe(33)
  })
})

describe("deriveStatusFromChecklist", () => {
  it("ไม่เปลี่ยนสถานะเมื่องานไม่มี Checklist", () => {
    expect(deriveStatusFromChecklist("in_progress", [])).toBeNull()
    expect(deriveStatusFromChecklist("not_started", [])).toBeNull()
  })

  it("ติ๊กครบทุกข้อ → เสร็จสิ้น", () => {
    expect(deriveStatusFromChecklist("in_progress", items(true, true))).toBe(
      "completed"
    )
    expect(deriveStatusFromChecklist("not_started", items(true))).toBe("completed")
    expect(deriveStatusFromChecklist("blocked", items(true, true, true))).toBe(
      "completed"
    )
  })

  it("ไม่เปลี่ยนซ้ำเมื่อสถานะเป็นเสร็จสิ้นและติ๊กครบอยู่แล้ว", () => {
    expect(deriveStatusFromChecklist("completed", items(true, true))).toBeNull()
  })

  it("เคยเสร็จแล้วยกเลิกหนึ่งข้อ → กลับไปกำลังดำเนินการ", () => {
    expect(deriveStatusFromChecklist("completed", items(true, false))).toBe(
      "in_progress"
    )
  })

  it("ยังติ๊กไม่ครบและยังไม่เคยเสร็จ → ไม่เปลี่ยนสถานะ", () => {
    expect(deriveStatusFromChecklist("not_started", items(true, false))).toBeNull()
    expect(deriveStatusFromChecklist("in_progress", items(false, false))).toBeNull()
    expect(
      deriveStatusFromChecklist("awaiting_review", items(true, false))
    ).toBeNull()
  })
})

describe("applyChecklistRules", () => {
  const base = { id: "t-1", status: "in_progress" } as Task

  it("ปรับสถานะให้เมื่อ Checklist ครบ", () => {
    const task = { ...base, checklist: items(true, true) }
    expect(applyChecklistRules(task).status).toBe("completed")
  })

  it("คืนงานเดิมเมื่อไม่ต้องเปลี่ยนอะไร", () => {
    const task = { ...base, checklist: items(true, false) }
    expect(applyChecklistRules(task)).toBe(task)
  })
})

describe("reorderChecklist", () => {
  it("จัดลำดับตาม id ที่ส่งมาและเขียนค่า order ใหม่ต่อเนื่อง", () => {
    const result = reorderChecklist(items(false, false, false), [
      "c-3",
      "c-1",
      "c-2",
    ])

    expect(result.map((item) => item.id)).toEqual(["c-3", "c-1", "c-2"])
    expect(result.map((item) => item.order)).toEqual([0, 1, 2])
  })

  it("ไม่ทำรายการที่ไม่ได้ระบุใน orderedIds หายไป", () => {
    const result = reorderChecklist(items(false, false, false), ["c-2"])
    expect(result).toHaveLength(3)
    expect(result[0].id).toBe("c-2")
  })
})
