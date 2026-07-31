import type { ChecklistItem, Task, TaskStatus } from "@/types/task"

export interface ChecklistProgress {
  done: number
  total: number
  /** 0–100 */
  percent: number
}

export function checklistProgress(items: ChecklistItem[]): ChecklistProgress {
  const total = items.length
  const done = items.filter((item) => item.done).length
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

/**
 * สถานะงานที่ควรเปลี่ยนไปหลัง Checklist ถูกแก้ไข
 *
 * - ติ๊กครบทุกข้อ → เสร็จสิ้น
 * - เคยเสร็จสิ้นแล้วยกเลิกอย่างน้อยหนึ่งข้อ → กลับไปกำลังดำเนินการ
 * - กรณีอื่น ๆ หรือไม่มี Checklist → ไม่เปลี่ยนสถานะ (คืน null)
 *
 * งานที่ไม่มี Checklist ผู้ใช้ยังเปลี่ยนสถานะเองได้ตามปกติ
 */
export function deriveStatusFromChecklist(
  currentStatus: TaskStatus,
  items: ChecklistItem[]
): TaskStatus | null {
  if (items.length === 0) return null

  const allDone = items.every((item) => item.done)

  if (allDone) {
    return currentStatus === "completed" ? null : "completed"
  }

  if (currentStatus === "completed") {
    return "in_progress"
  }

  return null
}

/** ใช้กฎ Checklist กับงานหนึ่งงาน แล้วคืนงานที่สถานะถูกปรับให้ถูกต้องแล้ว */
export function applyChecklistRules(task: Task): Task {
  const nextStatus = deriveStatusFromChecklist(task.status, task.checklist)
  return nextStatus ? { ...task, status: nextStatus } : task
}

/** จัดลำดับใหม่ตามรายการ id ที่ส่งเข้ามา แล้วเขียนค่า `order` ให้ต่อเนื่อง */
export function reorderChecklist(
  items: ChecklistItem[],
  orderedIds: string[]
): ChecklistItem[] {
  const byId = new Map(items.map((item) => [item.id, item]))
  const reordered = orderedIds
    .map((id) => byId.get(id))
    .filter((item): item is ChecklistItem => Boolean(item))

  // เผื่อกรณีมีรายการที่ไม่ได้อยู่ใน orderedIds จะได้ไม่หายไป
  for (const item of items) {
    if (!orderedIds.includes(item.id)) reordered.push(item)
  }

  return reordered.map((item, index) => ({ ...item, order: index }))
}
