/**
 * สีประจำกิจกรรม — ใช้ 8 สีสถานะจาก Design System Version 2
 * ไม่รวม Default และ Gray เพราะความต่างจากพื้นผิวน้อยเกินไปสำหรับการแยกกิจกรรม
 */
export const EVENT_COLOR_OPTIONS = [
  { name: "Brown", value: "#D0B48A" },
  { name: "Orange", value: "#FED5BE" },
  { name: "Yellow", value: "#FFE4A9" },
  { name: "Green", value: "#AFE1AF" },
  { name: "Blue", value: "#C3DCFF" },
  { name: "Purple", value: "#E4D0FB" },
  { name: "Pink", value: "#FCCDDE" },
  { name: "Red", value: "#FFCBCD" },
] as const

export const EVENT_COLORS = EVENT_COLOR_OPTIONS.map((option) => option.value)

export type EventColor = (typeof EVENT_COLOR_OPTIONS)[number]["value"]
