import { fromDateKey, toDateKey } from "@/constants/mock-date"
import type { Task } from "@/types/task"
import {
  TIMELINE_PHASES,
  type TimelineItem,
  type TimelinePhase,
} from "@/types/timeline"

/** `HH:mm` → จำนวนนาทีตั้งแต่เที่ยงคืน */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

/** เรียงตามวันแล้วตามเวลาเริ่ม เพื่อให้ทุกมุมมองเห็นลำดับเดียวกัน */
export function sortTimeline(items: TimelineItem[]): TimelineItem[] {
  return [...items].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    if (a.startTime !== b.startTime)
      return a.startTime.localeCompare(b.startTime)
    return a.order - b.order
  })
}

/** จัดกลุ่มเป็น 3 ช่วง: ก่อนวันงาน · วันจัดงาน · หลังจบงาน */
export function groupByPhase(
  items: TimelineItem[]
): Record<TimelinePhase, TimelineItem[]> {
  const groups: Record<TimelinePhase, TimelineItem[]> = {
    before: [],
    during: [],
    after: [],
  }
  for (const item of sortTimeline(items)) {
    groups[item.phase].push(item)
  }
  return groups
}

/**
 * ช่วงเวลาที่รายการนี้ควรอยู่ เมื่อเทียบกับวันจัดงาน
 * ใช้จัดช่วงให้อัตโนมัติเมื่อผู้ใช้เปลี่ยนวันที่
 */
export function derivePhase(
  date: string,
  eventStartDate: string,
  eventEndDate: string
): TimelinePhase {
  if (date < eventStartDate) return "before"
  if (date > eventEndDate) return "after"
  return "during"
}

/** รายการที่เวลาเหลื่อมกันภายในวันเดียวกัน */
export function findOverlaps(items: TimelineItem[]): [string, string][] {
  const sorted = sortTimeline(items)
  const overlaps: [string, string][] = []

  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      const a = sorted[i]
      const b = sorted[j]
      if (a.date !== b.date) break
      if (timeToMinutes(b.startTime) < timeToMinutes(a.endTime)) {
        overlaps.push([a.id, b.id])
      }
    }
  }
  return overlaps
}

export interface GanttBar {
  item: TimelineItem
  /** ตำแหน่งซ้ายเป็นสัดส่วน 0–1 ของช่วงเวลาทั้งหมด */
  left: number
  /** ความกว้างเป็นสัดส่วน 0–1 */
  width: number
}

export interface GanttLayout {
  bars: GanttBar[]
  /** รายการวันทั้งหมดในช่วง ใช้วาดเส้นแบ่งวัน */
  days: string[]
  /** เส้นเชื่อมความสัมพันธ์ (จาก id → ไป id) ตาม dependency ของงานที่ผูกไว้ */
  links: [string, string][]
}

/**
 * คำนวณตำแหน่งแถบบน Gantt Chart
 *
 * ใช้สเกลระดับวันเป็นหลัก แต่วางตำแหน่งย่อยตามเวลาในวันนั้น
 * รายการในวันจัดงานจึงยังเรียงตามลำดับพิธีการได้ถูกต้อง
 */
export function buildGanttLayout(
  items: TimelineItem[],
  tasks: Task[] = []
): GanttLayout {
  const sorted = sortTimeline(items)
  if (sorted.length === 0) return { bars: [], days: [], links: [] }

  const firstDay = fromDateKey(sorted[0].date)
  const lastDay = fromDateKey(sorted[sorted.length - 1].date)

  const days: string[] = []
  for (
    const cursor = new Date(firstDay);
    cursor <= lastDay;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    days.push(toDateKey(cursor))
  }

  const totalMinutes = days.length * 1440
  const dayIndex = new Map(days.map((day, index) => [day, index]))

  const bars: GanttBar[] = sorted.map((item) => {
    const offsetDays = dayIndex.get(item.date) ?? 0
    const start = offsetDays * 1440 + timeToMinutes(item.startTime)
    const end = offsetDays * 1440 + timeToMinutes(item.endTime)
    return {
      item,
      left: start / totalMinutes,
      width: Math.max((end - start) / totalMinutes, 0.004),
    }
  })

  /** เส้นเชื่อม: ถ้างานที่ผูกกับรายการ B ต้องรองานที่ผูกกับรายการ A */
  const taskById = new Map(tasks.map((task) => [task.id, task]))
  const itemByTaskId = new Map<string, string>()
  for (const item of sorted) {
    if (item.linkedTaskId) itemByTaskId.set(item.linkedTaskId, item.id)
  }

  const links: [string, string][] = []
  for (const item of sorted) {
    if (!item.linkedTaskId) continue
    const task = taskById.get(item.linkedTaskId)
    if (!task) continue

    for (const dependencyId of task.dependsOn) {
      const fromItemId = itemByTaskId.get(dependencyId)
      if (fromItemId && fromItemId !== item.id) {
        links.push([fromItemId, item.id])
      }
    }
  }

  return { bars, days, links }
}

export { TIMELINE_PHASES }
