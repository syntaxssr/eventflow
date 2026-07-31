import type { BlockedInfo, DependencyValidation, Task } from "@/types/task"

function indexTasks(tasks: Task[]): Map<string, Task> {
  return new Map(tasks.map((task) => [task.id, task]))
}

/**
 * หาเส้นทางจาก `fromId` ไปยัง `targetId` ตามสาย `dependsOn`
 * ใช้ตรวจว่าการเพิ่มความสัมพันธ์ใหม่จะทำให้เกิดวงกลมหรือไม่
 */
function findDependencyPath(
  byId: Map<string, Task>,
  fromId: string,
  targetId: string,
  visited = new Set<string>()
): string[] | null {
  if (fromId === targetId) return [fromId]
  if (visited.has(fromId)) return null
  visited.add(fromId)

  for (const nextId of byId.get(fromId)?.dependsOn ?? []) {
    const path = findDependencyPath(byId, nextId, targetId, visited)
    if (path) return [fromId, ...path]
  }
  return null
}

/**
 * ตรวจสอบก่อนสร้างความสัมพันธ์ "งาน A ต้องรองาน B ให้เสร็จก่อน"
 *
 * @param taskId  งานที่กำลังจะรอ (A)
 * @param dependencyId งานที่ต้องเสร็จก่อน (B)
 */
export function validateDependency(
  tasks: Task[],
  taskId: string,
  dependencyId: string
): DependencyValidation {
  if (taskId === dependencyId) {
    return { valid: false, reason: "self_reference" }
  }

  const byId = indexTasks(tasks)
  const task = byId.get(taskId)
  const dependency = byId.get(dependencyId)

  if (!task || !dependency) {
    return { valid: false, reason: "self_reference" }
  }

  if (task.eventId !== dependency.eventId) {
    return { valid: false, reason: "cross_event" }
  }

  if (task.dependsOn.includes(dependencyId)) {
    return { valid: false, reason: "duplicate" }
  }

  // ถ้า B รอ A อยู่แล้ว (ทางตรงหรือทางอ้อม) การให้ A รอ B จะกลายเป็นวงกลม
  const cyclePath = findDependencyPath(byId, dependencyId, taskId)
  if (cyclePath) {
    return { valid: false, reason: "circular", cyclePath: [taskId, ...cyclePath] }
  }

  return { valid: true }
}

/**
 * งานนี้ถูกบล็อกอยู่หรือไม่ — ถือว่าถูกบล็อกเมื่อยังมีงานที่ต้องเสร็จก่อนค้างอยู่
 */
export function getBlockedInfo(task: Task, tasks: Task[]): BlockedInfo {
  const byId = indexTasks(tasks)
  const blockingTaskIds = task.dependsOn.filter(
    (id) => byId.get(id)?.status !== "completed"
  )
  return { isBlocked: blockingTaskIds.length > 0, blockingTaskIds }
}

/** งานที่ถูกบล็อกโดยงานนี้ และยังทำต่อไม่ได้ */
export function getBlockedTasks(task: Task, tasks: Task[]): Task[] {
  const byId = indexTasks(tasks)
  return task.blocks
    .map((id) => byId.get(id))
    .filter((item): item is Task => Boolean(item))
}

/**
 * เริ่มงานนี้ได้เลยหรือไม่
 * งานที่ถูกบล็อกยังเริ่มได้ถ้าผู้ใช้ยืนยัน Override หลังเห็นคำเตือนแล้ว
 */
export function canStartTask(task: Task, tasks: Task[]): boolean {
  if (task.blockOverridden) return true
  return !getBlockedInfo(task, tasks).isBlocked
}

/** เพิ่มความสัมพันธ์สองทางให้สอดคล้องกัน */
export function linkDependency(
  tasks: Task[],
  taskId: string,
  dependencyId: string
): Task[] {
  return tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, dependsOn: [...task.dependsOn, dependencyId] }
    }
    if (task.id === dependencyId) {
      return { ...task, blocks: [...task.blocks, taskId] }
    }
    return task
  })
}

/** ตัดความสัมพันธ์สองทางออกพร้อมกัน */
export function unlinkDependency(
  tasks: Task[],
  taskId: string,
  dependencyId: string
): Task[] {
  return tasks.map((task) => {
    if (task.id === taskId) {
      return {
        ...task,
        dependsOn: task.dependsOn.filter((id) => id !== dependencyId),
      }
    }
    if (task.id === dependencyId) {
      return { ...task, blocks: task.blocks.filter((id) => id !== taskId) }
    }
    return task
  })
}

/** ลบงานออกจากความสัมพันธ์ทั้งหมด ใช้ตอนลบงาน */
export function detachTask(tasks: Task[], taskId: string): Task[] {
  return tasks
    .filter((task) => task.id !== taskId)
    .map((task) => ({
      ...task,
      dependsOn: task.dependsOn.filter((id) => id !== taskId),
      blocks: task.blocks.filter((id) => id !== taskId),
    }))
}
