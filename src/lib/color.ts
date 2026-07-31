/** แปลงสี HEX เป็น RGB (รองรับทั้ง 3 และ 6 หลัก) */
export function hexToRgb(hex: string): [number, number, number] | null {
  const value = hex.trim().replace(/^#/, "")
  const full =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value

  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null

  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

/** ค่าความสว่างสัมพัทธ์ตามสูตรของ WCAG 2.1 */
export function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const scaled = value / 255
    return scaled <= 0.03928
      ? scaled / 12.92
      : Math.pow((scaled + 0.055) / 1.055, 2.4)
  }
  return (
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  )
}

/** อัตราส่วนความต่างของสีสองสี (1–21) */
export function contrastRatio(foreground: string, background: string): number {
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)
  if (!fg || !bg) return 1

  const lighter = Math.max(relativeLuminance(fg), relativeLuminance(bg))
  const darker = Math.min(relativeLuminance(fg), relativeLuminance(bg))
  return (lighter + 0.05) / (darker + 0.05)
}

/** สีข้อความเข้มสำหรับวางบนพื้นหลังสว่าง */
export const READABLE_DARK = "#1c1917"
/** สีข้อความสว่างสำหรับวางบนพื้นหลังเข้ม */
export const READABLE_LIGHT = "#ffffff"

/**
 * เลือกสีข้อความที่อ่านง่ายที่สุดบนพื้นหลังที่กำหนด
 * ใช้กับ Avatar และ Badge ที่สีพื้นหลังมาจากข้อมูล (ไม่ใช่ token คงที่)
 */
export function getReadableTextColor(background: string): string {
  return contrastRatio(READABLE_DARK, background) >=
    contrastRatio(READABLE_LIGHT, background)
    ? READABLE_DARK
    : READABLE_LIGHT
}
