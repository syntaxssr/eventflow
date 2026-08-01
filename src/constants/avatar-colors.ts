/**
 * ชุดสี Avatar — 30 สีตายตัว กำหนดไว้ให้แต่ละคนไม่ซ้ำกันได้ถึง 30 คน
 * ใช้ได้เฉพาะกับ avatar/สีประจำตัวผู้ใช้เท่านั้น ห้ามนำไปใช้แทนสีสถานะ
 * หรือสีทั่วไปหมวดอื่นของระบบ (ดู colors.md)
 */
export interface AvatarColor {
  name: string
  hex: string
}

export const AVATAR_PALETTE_ITEMS: AvatarColor[] = [
  { name: "Charcoal", hex: "#1C1C1C" },
  { name: "Purple", hex: "#7B69CC" },
  { name: "Sky Blue", hex: "#A3DEFE" },
  { name: "Yellow", hex: "#FFCF49" },
  { name: "Salmon", hex: "#F49A7F" },
  { name: "Mint Green", hex: "#73BFA3" },
  { name: "Ruby Red", hex: "#E63946" },
  { name: "Burgundy", hex: "#B23A48" },
  { name: "Bright Orange", hex: "#FF6B35" },
  { name: "Burnt Orange", hex: "#C97B2A" },
  { name: "Cocoa Brown", hex: "#8C5A3C" },
  { name: "Sand", hex: "#D9B382" },
  { name: "Lime Olive", hex: "#B7C957" },
  { name: "Olive Green", hex: "#6B8E23" },
  { name: "Sea Green", hex: "#2E8B57" },
  { name: "Deep Teal", hex: "#0F766E" },
  { name: "Turquoise", hex: "#22C1C3" },
  { name: "Cyan Blue", hex: "#00A6FB" },
  { name: "Bright Blue", hex: "#3A86FF" },
  { name: "Royal Blue", hex: "#2457A7" },
  { name: "Navy Blue", hex: "#1D3557" },
  { name: "Indigo", hex: "#4C3F91" },
  { name: "Violet", hex: "#9B5DE5" },
  { name: "Lavender", hex: "#C77DFF" },
  { name: "Magenta", hex: "#D45087" },
  { name: "Hot Pink", hex: "#FF5DA2" },
  { name: "Dusty Rose", hex: "#C06C84" },
  { name: "Mauve", hex: "#6D597A" },
  { name: "Blue Gray", hex: "#607D8B" },
  { name: "Cool Gray", hex: "#A7B0BE" },
]

/** รายการ hex ล้วน (ใช้วนกำหนดให้ user ไม่ซ้ำ) */
export const AVATAR_PALETTE: string[] = AVATAR_PALETTE_ITEMS.map(
  (item) => item.hex
)
