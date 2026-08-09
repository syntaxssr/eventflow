/**
 * สีประจำกิจกรรม — ใช้ 8 สีสถานะจาก Design System Version 3
 * ไม่รวม Default และ Gray เพราะความต่างจากพื้นผิวน้อยเกินไปสำหรับการแยกกิจกรรม
 */
export const EVENT_COLOR_OPTIONS = [
  { name: "Brown", value: "#B68A49" },
  { name: "Orange", value: "#FFB78F" },
  { name: "Yellow", value: "#FFD67B" },
  { name: "Green", value: "#67C567" },
  { name: "Blue", value: "#95C1FF" },
  { name: "Purple", value: "#CB9EFF" },
  { name: "Pink", value: "#FF9CC0" },
  { name: "Red", value: "#FF9DA1" },
] as const

export const EVENT_COLORS = EVENT_COLOR_OPTIONS.map((option) => option.value)

export type EventColor = (typeof EVENT_COLOR_OPTIONS)[number]["value"]
