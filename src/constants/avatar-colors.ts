/**
 * สีพื้นของมาสคอตประจำผู้ใช้ และสีตัวอักษรสำรองกรณีภาพโหลดไม่สำเร็จ
 * แต่ละคู่ผ่าน WCAG AA เพื่อให้ fallback ยังอ่านได้ชัดเจน
 */
export interface AvatarColor {
  name: string
  /** สีพื้นหลังของ avatar */
  hex: string
  /** สีตัวอักษรย่อ — คู่ประจำของสีนั้นในระบบสถานะ */
  foreground: string
}

export const AVATAR_PALETTE_ITEMS: AvatarColor[] = [
  { name: "Terracotta", hex: "#C96852", foreground: "#1C1C1C" },
  { name: "Cobalt", hex: "#2457E6", foreground: "#F2F2F0" },
  { name: "Lilac", hex: "#B8AEF1", foreground: "#1C1C1C" },
  { name: "Midnight Indigo", hex: "#1E2E68", foreground: "#F2F2F0" },
  { name: "Teal", hex: "#3D918B", foreground: "#1C1C1C" },
  { name: "Mustard", hex: "#C49A34", foreground: "#1C1C1C" },
  { name: "Sapphire", hex: "#477BC2", foreground: "#000000" },
  { name: "Periwinkle", hex: "#6477C8", foreground: "#000000" },
  { name: "Steel Blue", hex: "#617B9B", foreground: "#000000" },
  { name: "Violet", hex: "#6A5BA8", foreground: "#F2F2F0" },
  { name: "Grape", hex: "#7442DE", foreground: "#F2F2F0" },
  { name: "Coral", hex: "#F06A4F", foreground: "#1C1C1C" },
  { name: "Sage", hex: "#6E8878", foreground: "#000000" },
  { name: "Plum", hex: "#75507E", foreground: "#F2F2F0" },
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
