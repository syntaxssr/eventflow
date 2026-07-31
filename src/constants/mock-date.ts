/**
 * "วันนี้" ของ Prototype
 *
 * ทั้งระบบต้องอ้างอิงเวลาจากไฟล์นี้เท่านั้น ห้ามเรียก `new Date()` ตรง ๆ ใน business logic
 * เพื่อให้การคำนวณ Overdue / Due Soon / Trash Countdown / Playwright E2E
 * ได้ผลลัพธ์เหมือนเดิมทุกครั้ง (deterministic)
 */
export const MOCK_TODAY_ISO = "2026-07-31"

/** เวลาอ้างอิงของ "ตอนนี้" (โซนเวลาไทย +07:00) */
export const MOCK_NOW_ISO = "2026-07-31T09:30:00+07:00"

/** วันที่จัดงานหลัก — งานเลี้ยงประจำปีของบริษัท */
export const MAIN_EVENT_DATE_ISO = "2026-09-18"

/** คืนค่า Date ของ "ตอนนี้" (object ใหม่ทุกครั้ง กันการแก้ไขข้ามที่) */
export function getNow(): Date {
  return new Date(MOCK_NOW_ISO)
}

/** คืนค่า Date ของ "วันนี้" ที่เวลา 00:00 ตามเวลาท้องถิ่น */
export function getToday(): Date {
  const [year, month, day] = MOCK_TODAY_ISO.split("-").map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

/** แปลง Date เป็น `YYYY-MM-DD` โดยใช้เวลาท้องถิ่น (ไม่ใช้ toISOString ที่เป็น UTC) */
export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** แปลง `YYYY-MM-DD` เป็น Date ที่เวลา 00:00 ตามเวลาท้องถิ่น */
export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

/**
 * แปลง Date เป็นสตริง ISO โซนเวลาไทย (`+07:00`)
 *
 * Mock Data ทั้งระบบใช้รูปแบบเดียวกันนี้ เพื่อให้เรียงลำดับด้วยการเทียบสตริงได้ถูกต้อง
 * (การผสม `Z` กับ `+07:00` จะทำให้เรียงผิดแม้เป็นเวลาเดียวกัน)
 */
export function toBangkokIso(date: Date): string {
  const shifted = new Date(date.getTime() + 7 * 3_600_000)
  const pad = (value: number) => `${value}`.padStart(2, "0")
  return (
    `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}` +
    `T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}+07:00`
  )
}

/** เลื่อนเวลาจากสตริง ISO ไปข้างหน้า/ถอยหลังตามจำนวนชั่วโมง */
export function shiftIsoHours(iso: string, hours: number): string {
  return toBangkokIso(new Date(new Date(iso).getTime() + hours * 3_600_000))
}

/** จำนวนวันเต็มระหว่างสองวัน (b - a) โดยไม่สนใจเวลา */
export function daysBetween(a: Date, b: Date): number {
  const startA = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const startB = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.round((startB - startA) / 86_400_000)
}
