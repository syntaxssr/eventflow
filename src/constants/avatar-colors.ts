/**
 * ชุดสี Avatar — 14 สีตายตัว กำหนดไว้ให้แต่ละคนไม่ซ้ำกันได้ถึง 14 คน
 * เกิน 14 คนจะเริ่มวนซ้ำสี
 * ใช้ได้เฉพาะกับ avatar/สีประจำตัวผู้ใช้เท่านั้น ห้ามนำไปใช้แทนสีสถานะ
 * หรือสีทั่วไปหมวดอื่นของระบบ (ดู colors.md)
 */
export interface AvatarColor {
  name: string
  hex: string
}

export const AVATAR_PALETTE_ITEMS: AvatarColor[] = [
  { name: "Butter", hex: "#F4D887" },
  { name: "Olive Gold", hex: "#BFAF5A" },
  { name: "Moss", hex: "#647450" },
  { name: "Peach", hex: "#F2B5A2" },
  { name: "Apricot", hex: "#E79C75" },
  { name: "Coral Red", hex: "#E06659" },
  { name: "Mist", hex: "#E4E8EB" },
  { name: "Sage Teal", hex: "#93BDBB" },
  { name: "Deep Ocean", hex: "#21607F" },
  { name: "Orchid", hex: "#AC81AF" },
  { name: "Taupe", hex: "#736353" },
  { name: "Sky", hex: "#80C3E0" },
  { name: "Periwinkle", hex: "#96A2C8" },
  { name: "Linen", hex: "#D5D2C3" },
]

/** รายการ hex ล้วน (ใช้วนกำหนดให้ user) */
export const AVATAR_PALETTE: string[] = AVATAR_PALETTE_ITEMS.map(
  (item) => item.hex
)
