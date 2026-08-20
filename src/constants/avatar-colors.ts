/**
 * ชุดสี Avatar — ใช้ 8 สีสถานะชุดเดียวกับ Design System (Version 2)
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
  { name: "Brown", hex: "#D0B48A", foreground: "#332714" },
  { name: "Orange", hex: "#FED5BE", foreground: "#702D00" },
  { name: "Yellow", hex: "#FFE4A9", foreground: "#6B4900" },
  { name: "Green", hex: "#AFE1AF", foreground: "#205520" },
  { name: "Blue", hex: "#C3DCFF", foreground: "#00337C" },
  { name: "Purple", hex: "#E4D0FB", foreground: "#470B75" },
  { name: "Pink", hex: "#FCCDDE", foreground: "#71093D" },
  { name: "Red", hex: "#FFCBCD", foreground: "#770B07" },
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
