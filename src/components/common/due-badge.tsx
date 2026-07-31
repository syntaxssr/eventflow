"use client"

import { StatusBadge } from "@/components/common/status-badge"
import { DUE_SOON_STYLE, OVERDUE_STYLE } from "@/constants/status"
import { getDueStatus } from "@/lib/due-date"
import type { Task } from "@/types/task"

/**
 * ป้าย "เกินกำหนด" / "ใกล้ครบกำหนด"
 *
 * เป็นป้ายที่เพิ่มเข้ามาต่างหาก ไม่ได้แทนที่สถานะเดิมของงาน
 * เช่น งานยังเป็น "กำลังดำเนินการ" แต่มีป้าย "เกินกำหนด" กำกับ
 */
export function DueBadge({
  task,
  today,
  size = "sm",
}: {
  task: Pick<Task, "dueDate" | "status">
  today?: Date
  size?: "sm" | "default"
}) {
  const status = getDueStatus(task, today)
  if (status === "none") return null

  return (
    <StatusBadge
      style={status === "overdue" ? OVERDUE_STYLE : DUE_SOON_STYLE}
      size={size}
    />
  )
}
