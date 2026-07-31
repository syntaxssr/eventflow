import type { EventProgress } from "@/types/event"
import type { Task } from "@/types/task"
import { isOverdue } from "./due-date"

/**
 * ความคืบหน้าของกิจกรรม = จำนวนงานย่อยที่เสร็จสิ้น ÷ จำนวนงานย่อยทั้งหมด × 100
 *
 * Checklist ไม่ถูกนับเป็น Progress ของกิจกรรมโดยตรง
 * แต่ส่งผลทางอ้อมผ่านการเปลี่ยนสถานะของงานย่อย (ดู `lib/checklist.ts`)
 */
export function calculateEventProgress(
  tasks: Task[],
  today?: Date
): EventProgress {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length
  const overdueTasks = tasks.filter((task) => isOverdue(task, today)).length

  return {
    totalTasks,
    completedTasks,
    overdueTasks,
    percent: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
  }
}

/** นับจำนวนงานแยกตามสถานะ (ใช้กับ Chart สรุปงานตามสถานะ) */
export function countTasksByStatus(
  tasks: Task[]
): Record<Task["status"], number> {
  const counts: Record<Task["status"], number> = {
    not_started: 0,
    in_progress: 0,
    awaiting_review: 0,
    completed: 0,
    blocked: 0,
  }
  for (const task of tasks) {
    counts[task.status] += 1
  }
  return counts
}
