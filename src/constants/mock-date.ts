/**
 * "วันนี้" ของ Prototype
 *
 * ทั้งระบบต้องอ้างอิงเวลาจากไฟล์นี้เท่านั้น ห้ามเรียก `new Date()` ตรง ๆ ใน business logic
 * เพื่อให้การคำนวณ Overdue / Due Soon / Trash Countdown / Playwright E2E
 * ได้ผลลัพธ์เหมือนเดิมทุกครั้ง
 *
 * "เหมือนเดิม" ในที่นี้คือ **ระยะห่างระหว่างวัน** ไม่ใช่ค่าวันที่ตายตัว —
 * Mock Data เขียนไว้โดยอ้างอิง ANCHOR_TODAY_ISO เป็น "วันนี้" แล้วตอนโหลด state
 * จะถูกเลื่อนทั้งชุดด้วย MOCK_DATE_SHIFT_DAYS ให้มาตรงกับวันจริง
 * (ดู shiftMockDates ใน mock/index.ts) จำนวนงานเกินกำหนด/ใกล้ครบกำหนด
 * และระยะถึงงานหลักจึงคงที่เสมอ ขณะที่ "วันนี้" เดินตามปฏิทินจริง
 */

/** วันที่ที่ Mock Data ถูกเขียนขึ้นโดยยึดเป็น "วันนี้" — ห้ามแก้ ไม่งั้นข้อมูลเลื่อนยกชุด */
export const ANCHOR_TODAY_ISO = "2026-07-31"

/** เวลาอ้างอิงของ "ตอนนี้" ณ วัน ANCHOR (โซนเวลาไทย +07:00) */
const ANCHOR_NOW_ISO = "2026-07-31T09:30:00+07:00"

/**
 * วันที่ปัจจุบันตามโซนเวลาไทย ในรูปแบบ `YYYY-MM-DD`
 *
 * บังคับโซนเวลาไว้ที่ Asia/Bangkok เพราะ Server (Node) กับ Browser อาจอยู่คนละโซน
 * ถ้าปล่อยให้ต่างคนต่างคิด จะได้คนละวันตอนคาบเกี่ยวเที่ยงคืน แล้ว hydration ไม่ตรงกัน
 */
function bangkokTodayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

/** "วันนี้" จริง (คำนวณครั้งเดียวตอนโหลดโมดูล เพื่อไม่ให้ค่าขยับกลางการ render) */
export const MOCK_TODAY_ISO = bangkokTodayKey()

/** จำนวนวันที่ต้องเลื่อน Mock Data ให้มาตรงกับวันนี้ (0 = วันที่เขียนข้อมูลไว้พอดี) */
export const MOCK_DATE_SHIFT_DAYS = daysBetween(
  fromDateKey(ANCHOR_TODAY_ISO),
  fromDateKey(MOCK_TODAY_ISO)
)

/** เวลาอ้างอิงของ "ตอนนี้" หลังเลื่อนมาตรงวันจริงแล้ว (โซนเวลาไทย +07:00) */
export const MOCK_NOW_ISO = shiftIsoDays(ANCHOR_NOW_ISO, MOCK_DATE_SHIFT_DAYS)

/** คืนค่า Date ของ "ตอนนี้" (object ใหม่ทุกครั้ง กันการแก้ไขข้ามที่) */
export function getNow(): Date {
  return new Date(MOCK_NOW_ISO)
}

/** คืนค่า Date ของ "วันนี้" ที่เวลา 00:00 ตามเวลาท้องถิ่น */
export function getToday(): Date {
  return fromDateKey(MOCK_TODAY_ISO)
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

/** เลื่อนสตริง ISO เต็มรูปแบบ (`...T..:..:..+07:00`) ไปตามจำนวนวัน */
export function shiftIsoDays(iso: string, days: number): string {
  return shiftIsoHours(iso, days * 24)
}

/**
 * เลื่อน `YYYY-MM-DD` ไปตามจำนวนวัน
 *
 * คำนวณด้วย Date ตามเวลาท้องถิ่น ไม่ใช่บวกมิลลิวินาที เพื่อไม่ให้เพี้ยนข้ามช่วง DST
 */
export function shiftDateKey(dateKey: string, days: number): string {
  const date = fromDateKey(dateKey)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

/** จำนวนวันเต็มระหว่างสองวัน (b - a) โดยไม่สนใจเวลา */
export function daysBetween(a: Date, b: Date): number {
  const startA = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const startB = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.round((startB - startA) / 86_400_000)
}
