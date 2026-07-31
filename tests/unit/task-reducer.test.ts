import { describe, expect, it } from "vitest"

import { fromDateKey } from "@/constants/mock-date"
import { createInitialState } from "@/mock"
import { appReducer } from "@/store/reducer"
import { selectEventProgress } from "@/store/selectors"
import type { AppState } from "@/store/types"

const AT = "2026-07-31T11:00:00+07:00"
const TODAY = fromDateKey("2026-07-31")

/** งานที่มี Checklist ยังติ๊กไม่ครบ (t-4: ติ๊กแล้ว 2 จาก 4) */
const CHECKLIST_TASK_ID = "t-4"

function tickAll(state: AppState, taskId: string): AppState {
  const task = state.tasks.find((item) => item.id === taskId)!
  return task.checklist.reduce(
    (current, item) =>
      appReducer(current, {
        type: "task/updateChecklistItem",
        taskId,
        itemId: item.id,
        changes: { done: true },
      }),
    state
  )
}

describe("appReducer — checklist auto status", () => {
  it("ติ๊กครบทุกข้อแล้วงานเปลี่ยนเป็นเสร็จสิ้นอัตโนมัติ", () => {
    const initial = createInitialState()
    const before = initial.tasks.find((task) => task.id === CHECKLIST_TASK_ID)!
    expect(before.status).not.toBe("completed")

    const state = tickAll(initial, CHECKLIST_TASK_ID)
    const after = state.tasks.find((task) => task.id === CHECKLIST_TASK_ID)!

    expect(after.checklist.every((item) => item.done)).toBe(true)
    expect(after.status).toBe("completed")
  })

  it("ยกเลิกหนึ่งข้อหลังเสร็จแล้ว งานกลับไปกำลังดำเนินการ", () => {
    const completed = tickAll(createInitialState(), CHECKLIST_TASK_ID)
    const firstItem = completed.tasks.find(
      (task) => task.id === CHECKLIST_TASK_ID
    )!.checklist[0]

    const state = appReducer(completed, {
      type: "task/updateChecklistItem",
      taskId: CHECKLIST_TASK_ID,
      itemId: firstItem.id,
      changes: { done: false },
    })

    expect(state.tasks.find((task) => task.id === CHECKLIST_TASK_ID)!.status).toBe(
      "in_progress"
    )
  })

  it("ความคืบหน้าของกิจกรรมเพิ่มขึ้นทันทีเมื่อ Checklist ครบ", () => {
    const initial = createInitialState()
    const before = selectEventProgress(initial, "e-1", TODAY)

    const state = tickAll(initial, CHECKLIST_TASK_ID)
    const after = selectEventProgress(state, "e-1", TODAY)

    expect(after.completedTasks).toBe(before.completedTasks + 1)
    expect(after.percent).toBeGreaterThan(before.percent)
  })

  it("งานที่ไม่มี Checklist เปลี่ยนสถานะเองได้ตามปกติ", () => {
    const initial = createInitialState()
    const plainTask = initial.tasks.find(
      (task) => task.checklist.length === 0 && task.status !== "completed"
    )!

    const state = appReducer(initial, {
      type: "task/setStatus",
      id: plainTask.id,
      status: "completed",
      by: "u-1",
      at: AT,
    })

    expect(state.tasks.find((task) => task.id === plainTask.id)!.status).toBe(
      "completed"
    )
  })

  it("การลบรายการตรวจสอบข้อสุดท้ายที่ยังไม่ติ๊ก ทำให้งานเสร็จสิ้นอัตโนมัติ", () => {
    const initial = createInitialState()
    const task = initial.tasks.find((item) => item.id === CHECKLIST_TASK_ID)!
    const undone = task.checklist.filter((item) => !item.done)

    const state = undone.reduce(
      (current, item) =>
        appReducer(current, {
          type: "task/removeChecklistItem",
          taskId: CHECKLIST_TASK_ID,
          itemId: item.id,
        }),
      initial
    )

    expect(state.tasks.find((item) => item.id === CHECKLIST_TASK_ID)!.status).toBe(
      "completed"
    )
  })
})

describe("appReducer — task", () => {
  it("task/delete ลบงานและตัดความสัมพันธ์ที่ชี้มาหางานนั้น", () => {
    const initial = createInitialState()
    // t-13 ถูก t-14 รออยู่
    const blocked = initial.tasks.find((task) => task.id === "t-14")!
    expect(blocked.dependsOn).toContain("t-13")

    const state = appReducer(initial, { type: "task/delete", id: "t-13" })

    expect(state.tasks.some((task) => task.id === "t-13")).toBe(false)
    expect(
      state.tasks.find((task) => task.id === "t-14")!.dependsOn
    ).not.toContain("t-13")
  })

  it("task/addDependency และ removeDependency อัปเดตทั้งสองฝั่ง", () => {
    const initial = createInitialState()
    const added = appReducer(initial, {
      type: "task/addDependency",
      taskId: "t-18",
      dependencyId: "t-1",
    })

    expect(added.tasks.find((task) => task.id === "t-18")!.dependsOn).toContain(
      "t-1"
    )
    expect(added.tasks.find((task) => task.id === "t-1")!.blocks).toContain("t-18")

    const removed = appReducer(added, {
      type: "task/removeDependency",
      taskId: "t-18",
      dependencyId: "t-1",
    })

    expect(
      removed.tasks.find((task) => task.id === "t-18")!.dependsOn
    ).not.toContain("t-1")
    expect(removed.tasks.find((task) => task.id === "t-1")!.blocks).not.toContain(
      "t-18"
    )
  })

  it("task/overrideBlock บันทึกว่าผู้ใช้ยืนยันข้ามคำเตือนแล้ว", () => {
    const state = appReducer(createInitialState(), {
      type: "task/overrideBlock",
      taskId: "t-14",
    })
    expect(
      state.tasks.find((task) => task.id === "t-14")!.blockOverridden
    ).toBe(true)
  })

  it("task/reorderChecklist เขียนลำดับใหม่ให้ต่อเนื่อง", () => {
    const initial = createInitialState()
    const task = initial.tasks.find((item) => item.id === CHECKLIST_TASK_ID)!
    const reversed = [...task.checklist].map((item) => item.id).reverse()

    const state = appReducer(initial, {
      type: "task/reorderChecklist",
      taskId: CHECKLIST_TASK_ID,
      orderedIds: reversed,
    })

    const updated = state.tasks.find((item) => item.id === CHECKLIST_TASK_ID)!
    expect(updated.checklist.map((item) => item.id)).toEqual(reversed)
    expect(updated.checklist.map((item) => item.order)).toEqual([0, 1, 2, 3])
  })
})
