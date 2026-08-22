/**
 * สีประจำกิจกรรม — ใช้ 8 สีสถานะจาก Design System Version 3
 * ไม่รวม Default และ Gray เพราะความต่างจากพื้นผิวน้อยเกินไปสำหรับการแยกกิจกรรม
 *
 * ใช้ Version 3 ไม่ใช่ Version 2 เพราะสีนี้ไปอยู่บนช่องไอคอนสี่เหลี่ยมเล็ก
 * ที่มีแต่ไอคอนล้วน ๆ เฉดพาสเทลของ Version 2 จึงจางเกินจนแยกกิจกรรมไม่ออก
 */
export const EVENT_COLOR_OPTIONS = [
  { name: "Brown", value: "#B68A49", foreground: "#332714" },
  { name: "Orange", value: "#FFB78F", foreground: "#702D00" },
  { name: "Yellow", value: "#FFD67B", foreground: "#6B4900" },
  { name: "Green", value: "#67C567", foreground: "#143414" },
  { name: "Blue", value: "#95C1FF", foreground: "#00337C" },
  { name: "Purple", value: "#CB9EFF", foreground: "#490080" },
  { name: "Pink", value: "#FF9CC0", foreground: "#7A003D" },
  { name: "Red", value: "#FF9DA1", foreground: "#7E0500" },
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
