/**
 * สีประจำกิจกรรม — ใช้ 8 สีสถานะจาก Design System Version 2
 * ไม่รวม Default และ Gray เพราะความต่างจากพื้นผิวน้อยเกินไปสำหรับการแยกกิจกรรม
 */
export const EVENT_COLOR_OPTIONS = [
  { name: "Brown", value: "#D0B48A", foreground: "#332714" },
  { name: "Orange", value: "#FED5BE", foreground: "#702D00" },
  { name: "Yellow", value: "#FFE4A9", foreground: "#6B4900" },
  { name: "Green", value: "#AFE1AF", foreground: "#205520" },
  { name: "Blue", value: "#C3DCFF", foreground: "#00337C" },
  { name: "Purple", value: "#E4D0FB", foreground: "#470B75" },
  { name: "Pink", value: "#FCCDDE", foreground: "#71093D" },
  { name: "Red", value: "#FFCBCD", foreground: "#770B07" },
] as const

export const EVENT_COLORS = EVENT_COLOR_OPTIONS.map((option) => option.value)

export type EventColor = (typeof EVENT_COLOR_OPTIONS)[number]["value"]

/** ค้นสีคู่ของสีประจำกิจกรรม (คีย์เป็นตัวพิมพ์เล็ก) */
const EVENT_FOREGROUND_BY_VALUE = new Map(
  EVENT_COLOR_OPTIONS.map((option) => [
    option.value.toLowerCase(),
    option.foreground,
  ])
)

/**
 * สีไอคอนบนพื้นสีประจำกิจกรรม
 * คืน null ถ้าสีนั้นไม่ได้อยู่ในพาเลต (ให้ผู้เรียกไป fallback เอง)
 */
export function getEventForegroundColor(background: string): string | null {
  return EVENT_FOREGROUND_BY_VALUE.get(background.trim().toLowerCase()) ?? null
}
