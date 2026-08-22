import type { Locale } from "@/types/common"
import type { Employee } from "@/types/employee"
import type { Participant } from "@/types/participant"
import { getParticipantFullName } from "./participant"

/** หนึ่งช่องบนวงล้อ — `sourceId` ชี้กลับไปยังพนักงาน/ผู้เข้าร่วมต้นทาง (ถ้าโหลดมา) */
export interface WheelEntry {
  id: string
  label: string
  sourceId?: string
}

/** ต้องมีอย่างน้อยสองช่องจึงมีอะไรให้สุ่ม */
export const MIN_WHEEL_ENTRIES = 2

/** จำนวนรอบเต็มขั้นต่ำต่อการหมุนหนึ่งครั้ง — น้อยกว่านี้วงล้อดูเหมือนสะดุดมากกว่าหมุน */
export const WHEEL_EXTRA_TURNS = 5

export const WHEEL_SPIN_DURATION_MS = 5200

/** เกินจำนวนนี้ตัวอักษรเล็กจนอ่านไม่ออก วงล้อจะแสดงเลขลำดับแทนชื่อ */
export const WHEEL_MAX_LABELED_ENTRIES = 24

/* -------------------------------------------------------------------------
   สี
   ------------------------------------------------------------------------- */

/**
 * สีช่องวงล้อ — โทเคนสถานะกลาง 8 สี วนใช้ตามลำดับช่อง
 * ทุกสีมีคู่ foreground ที่ผ่าน WCAG AA ใน Design System อยู่แล้ว
 * และค่าคงที่ทั้งสองธีม วงล้อจึงหน้าตาเหมือนกันบนธีมสว่างและมืด
 */
export const WHEEL_SEGMENT_COLORS = [
  "var(--status-blue)",
  "var(--status-yellow)",
  "var(--status-green)",
  "var(--status-purple)",
  "var(--status-orange)",
  "var(--status-pink)",
  "var(--status-brown)",
  "var(--status-red)",
] as const

/** สีตัวอักษรคู่กับ WHEEL_SEGMENT_COLORS ตำแหน่งต่อตำแหน่ง */
export const WHEEL_SEGMENT_TEXT_COLORS = [
  "var(--status-blue-foreground)",
  "var(--status-yellow-foreground)",
  "var(--status-green-foreground)",
  "var(--status-purple-foreground)",
  "var(--status-orange-foreground)",
  "var(--status-pink-foreground)",
  "var(--status-brown-foreground)",
  "var(--status-red-foreground)",
] as const

/**
 * ลำดับสีของช่องที่ `index`
 * ช่องสุดท้ายอยู่ติดกับช่องแรกเมื่อวงล้อวนครบ ถ้าได้สีเดียวกันให้เลื่อนไปสีถัดไป
 */
export function segmentColorIndex(index: number, count: number): number {
  const palette = WHEEL_SEGMENT_COLORS.length
  const colour = index % palette
  if (count > 2 && index === count - 1 && colour === 0) return 1
  return colour
}

/* -------------------------------------------------------------------------
   เรขาคณิตของการหมุน
   มุมทั้งหมดวัดเป็นองศา "ตามเข็มนาฬิกาจาก 12 นาฬิกา" ช่องที่ 0 เริ่มที่ 12 นาฬิกา
   ลูกศรอยู่นิ่งที่ 12 นาฬิกาเสมอ
   ------------------------------------------------------------------------- */

export function segmentAngle(count: number): number {
  return count > 0 ? 360 / count : 0
}

/** ดัชนีผู้ชนะแบบสุ่ม — รับ `random` เข้ามาเพื่อให้เทสต์กำหนดผลได้ */
export function pickWinnerIndex(
  count: number,
  random: () => number = Math.random
): number {
  if (count <= 0) return -1
  const index = Math.floor(random() * count)
  // กัน random คืนค่า 1 พอดี (หรือนอกช่วง) ไม่ให้ชี้เกินช่องสุดท้าย
  return Math.min(Math.max(index, 0), count - 1)
}

function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

/**
 * มุมปลายทางของวงล้อที่ทำให้ "กึ่งกลาง" ช่องผู้ชนะมาอยู่ใต้ลูกศรพอดี
 *
 * ช่องที่เดิมอยู่มุม θ หลังหมุนตามเข็ม R องศาจะไปอยู่ที่ θ+R
 * ให้ตรงลูกศร (0°) จึงต้องได้ R ≡ −θ (mod 360)
 * ผลลัพธ์มากกว่า `currentRotation` เสมอ (สะสมไปเรื่อย ๆ ไม่ย้อนกลับ)
 * และหมุนเพิ่มอย่างน้อย `extraTurns` รอบเต็ม
 */
export function computeSpinTarget({
  currentRotation,
  winnerIndex,
  count,
  extraTurns,
}: {
  currentRotation: number
  winnerIndex: number
  count: number
  extraTurns: number
}): number {
  const centre = (winnerIndex + 0.5) * segmentAngle(count)
  const landing = normalizeDegrees(360 - centre)
  const minimum = currentRotation + Math.max(0, extraTurns) * 360
  let target = minimum + normalizeDegrees(landing - normalizeDegrees(minimum))
  // ต้องขยับเสมอ — ถ้าลงตรงช่องเดิมพอดีให้หมุนเพิ่มอีกหนึ่งรอบ
  if (target <= currentRotation) target += 360
  return target
}

/** ฟังก์ชันผกผันของ computeSpinTarget — ช่องไหนอยู่ใต้ลูกศรที่มุมหมุนนี้ */
export function winnerIndexFromRotation(rotation: number, count: number): number {
  if (count <= 0) return -1
  const underPointer = normalizeDegrees(-rotation)
  return Math.floor(underPointer / segmentAngle(count)) % count
}

/* -------------------------------------------------------------------------
   เรขาคณิตของภาพ SVG (viewBox 400×400)
   ------------------------------------------------------------------------- */

export const WHEEL_SIZE = 400
export const WHEEL_CENTER = 200
export const WHEEL_RADIUS = 190
export const WHEEL_HUB_RADIUS = 30

function round(value: number): number {
  return Math.round(value * 100) / 100
}

/** มุมตามเข็มจาก 12 นาฬิกา → พิกัดบน SVG (แกน y ชี้ลง) */
export function polarToCartesian(
  radius: number,
  angleDeg: number,
  centre: number = WHEEL_CENTER
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: round(centre + radius * Math.sin(rad)),
    y: round(centre - radius * Math.cos(rad)),
  }
}

/**
 * path ของช่องที่ `index` — เส้นโค้งวาดตามเข็ม (sweep-flag = 1)
 * ใช้ไม่ได้กับวงล้อช่องเดียว เพราะเส้นโค้ง 360° เริ่มและจบจุดเดียวกัน (วาดวงกลมแทน)
 */
export function describeWedge(
  index: number,
  count: number,
  radius: number = WHEEL_RADIUS,
  centre: number = WHEEL_CENTER
): string {
  const angle = segmentAngle(count)
  const start = polarToCartesian(radius, index * angle, centre)
  const end = polarToCartesian(radius, (index + 1) * angle, centre)
  const largeArc = angle > 180 ? 1 : 0
  return `M ${centre} ${centre} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

export interface WheelLabelLayout {
  /** false = ช่องเยอะเกินไป แสดงเลขลำดับแทนชื่อ */
  showLabels: boolean
  fontSize: number
  maxChars: number
}

/** ขนาดตัวอักษรลดลงตามจำนวนช่อง เพื่อให้ชื่อยังอยู่ในช่องของตัวเอง */
export function wheelLabelLayout(count: number): WheelLabelLayout {
  if (count > WHEEL_MAX_LABELED_ENTRIES) {
    return { showLabels: false, fontSize: 9, maxChars: 0 }
  }
  const fontSize = count <= 6 ? 20 : count <= 10 ? 17 : count <= 16 ? 14 : 11
  // ความยาวตามรัศมีที่วางตัวอักษรได้ราว 130px ตัวอักษรกว้างประมาณ 0.55 เท่าของขนาดฟอนต์
  const maxChars = Math.floor(130 / (fontSize * 0.55))
  return { showLabels: true, fontSize, maxChars }
}

/** ตัดชื่อยาวแล้วปิดท้ายด้วย "…" — นับเป็นอักขระ ไม่ใช่ byte เพื่อไม่ตัดกลาง surrogate pair */
export function truncateLabel(label: string, maxChars: number): string {
  const characters = Array.from(label)
  if (maxChars <= 0 || characters.length <= maxChars) return label
  return `${characters.slice(0, Math.max(1, maxChars - 1)).join("")}…`
}

/* -------------------------------------------------------------------------
   รายชื่อ
   ------------------------------------------------------------------------- */

/** ตัดช่องว่างหัวท้ายและยุบช่องว่างซ้อนให้เหลือช่องเดียว */
export function normalizeEntryLabel(text: string): string {
  return text.trim().replace(/\s+/g, " ")
}

/** ชื่อซ้ำหรือไม่ — ไม่สนตัวพิมพ์ใหญ่เล็กและช่องว่างส่วนเกิน */
export function isDuplicateLabel(
  entries: readonly WheelEntry[],
  label: string
): boolean {
  const needle = normalizeEntryLabel(label).toLocaleLowerCase()
  return entries.some(
    (entry) => normalizeEntryLabel(entry.label).toLocaleLowerCase() === needle
  )
}

/** "ชื่อ นามสกุล (ชื่อเล่น)" — วงเล็บหายไปเมื่อไม่มีชื่อเล่น */
export function employeeEntryLabel(employee: Employee, locale: Locale): string {
  const fullName = `${employee.firstName[locale]} ${employee.lastName[locale]}`
  const nickname = employee.nickname[locale].trim()
  return nickname ? `${fullName} (${nickname})` : fullName
}

export function participantEntryLabel(
  participant: Participant,
  locale: Locale
): string {
  return getParticipantFullName(participant, locale)
}

export function entriesFromEmployees(
  employees: readonly Employee[],
  locale: Locale,
  onlyActive: boolean
): WheelEntry[] {
  return employees
    .filter((employee) => !onlyActive || employee.status === "active")
    .map((employee) => ({
      id: `wheel-${employee.id}`,
      label: employeeEntryLabel(employee, locale),
      sourceId: employee.id,
    }))
}

export function entriesFromParticipants(
  participants: readonly Participant[],
  locale: Locale,
  onlyAttending: boolean
): WheelEntry[] {
  return participants
    .filter(
      (participant) => !onlyAttending || participant.rsvpStatus === "attending"
    )
    .map((participant) => ({
      id: `wheel-${participant.id}`,
      label: participantEntryLabel(participant, locale),
      sourceId: participant.id,
    }))
}
