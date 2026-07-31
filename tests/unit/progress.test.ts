import { describe, expect, it } from "vitest"

import { fromDateKey } from "@/constants/mock-date"
import { calculateEventProgress, countTasksByStatus } from "@/lib/progress"
import type { Task, TaskStatus } from "@/types/task"

const TODAY = fromDateKey("2026-07-31")

function task(
  status: TaskStatus,
  dueDate: string | null = null
): Pick<Task, "status" | "dueDate"> {
  return { status, dueDate }
}

describe("calculateEventProgress", () => {
  it("คืน 0% เมื่อยังไม่มีงานย่อย", () => {
    expect(calculateEventProgress([] as Task[], TODAY)).toEqual({
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      percent: 0,
    })
  })

  it("คำนวณจากงานที่เสร็จสิ้นหารด้วยงานทั้งหมด", () => {
    const tasks = [
      task("completed"),
      task("completed"),
      task("in_progress"),
      task("not_started"),
    ] as Task[]

    const progress = calculateEventProgress(tasks, TODAY)
    expect(progress.totalTasks).toBe(4)
    expect(progress.completedTasks).toBe(2)
    expect(progress.percent).toBe(50)
  })

  it("ปัดเศษเป็นจำนวนเต็ม", () => {
    const tasks = [task("completed"), task("in_progress"), task("blocked")] as Task[]
    expect(calculateEventProgress(tasks, TODAY).percent).toBe(33)
  })

  it("คืน 100% เมื่อทุกงานเสร็จสิ้น", () => {
    const tasks = [task("completed"), task("completed")] as Task[]
    expect(calculateEventProgress(tasks, TODAY).percent).toBe(100)
  })

  it("นับงานเกินกำหนดแยกจาก Progress", () => {
    const tasks = [
      task("in_progress", "2026-07-20"),
      task("not_started", "2026-07-25"),
      task("completed", "2026-07-01"),
      task("in_progress", "2026-08-30"),
    ] as Task[]

    const progress = calculateEventProgress(tasks, TODAY)
    expect(progress.overdueTasks).toBe(2)
    expect(progress.percent).toBe(25)
  })

  it("งานที่เสร็จแล้วไม่ถูกนับว่าเกินกำหนดแม้เลย Due Date", () => {
    const tasks = [task("completed", "2026-01-01")] as Task[]
    expect(calculateEventProgress(tasks, TODAY).overdueTasks).toBe(0)
  })
})

describe("countTasksByStatus", () => {
  it("นับครบทุกสถานะแม้ค่าเป็นศูนย์", () => {
    const counts = countTasksByStatus([
      task("completed"),
      task("completed"),
      task("blocked"),
    ] as Task[])

    expect(counts).toEqual({
      not_started: 0,
      in_progress: 0,
      awaiting_review: 0,
      completed: 2,
      blocked: 1,
    })
  })
})
