/**
 * ชุดสี Avatar — ใช้ 8 สีสถานะชุดเดียวกับ Design System (เฉด Version 3)
 * ไม่รวม Default และ Gray เพราะความต่างจากพื้นผิวน้อยเกินไปจนแยกคนไม่ออก
 * (เหตุผลเดียวกับสีประจำกิจกรรมใน event-colors.ts)
 *
 * ตัวอักษรย่อบน avatar ใช้ "สีคู่ของสีนั้น" ตามที่กำหนดไว้ในระบบสถานะ
 * ไม่ใช่ดำ/ขาวกลางๆ — ดู AVATAR_TEXT_COLOR
 *
 * มี 8 สี ทีมเกิน 8 คนเมื่อไหร่จะเริ่มวนซ้ำ
 */
export interface AvatarColor {
  name: string
  /** สีพื้นหลังของ avatar */
  hex: string
  /** สีตัวอักษรย่อ — คู่ประจำของสีนั้นในระบบสถานะ */
  foreground: string
}

export const AVATAR_PALETTE_ITEMS: AvatarColor[] = [
  { name: "Brown", hex: "#B68A49", foreground: "#332714" },
  { name: "Orange", hex: "#FFB78F", foreground: "#702D00" },
  { name: "Yellow", hex: "#FFD67B", foreground: "#6B4900" },
  { name: "Green", hex: "#67C567", foreground: "#143414" },
  { name: "Blue", hex: "#95C1FF", foreground: "#00337C" },
  { name: "Purple", hex: "#CB9EFF", foreground: "#490080" },
  { name: "Pink", hex: "#FF9CC0", foreground: "#7A003D" },
  { name: "Red", hex: "#FF9DA1", foreground: "#7E0500" },
]

/** รายการ hex ล้วน (ใช้วนกำหนดให้ user) */
export const AVATAR_PALETTE: string[] = AVATAR_PALETTE_ITEMS.map(
  (item) => item.hex
)

/** ค้นสีตัวอักษรคู่ของสีพื้น avatar (คีย์เป็นตัวพิมพ์เล็ก) */
const AVATAR_FOREGROUND_BY_HEX = new Map(
  AVATAR_PALETTE_ITEMS.map((item) => [
    item.hex.toLowerCase(),
    item.foreground,
  ])
)

/**
 * สีตัวอักษรย่อสำหรับพื้น avatar ที่กำหนด
 * คืน null ถ้าสีนั้นไม่ได้อยู่ในพาเลต (ให้ผู้เรียกไป fallback เอง)
 */
export function getAvatarForegroundColor(background: string): string | null {
  return AVATAR_FOREGROUND_BY_HEX.get(background.trim().toLowerCase()) ?? null
}
