import {
  BriefcaseIcon,
  CalendarDaysIcon,
  ChartNoAxesColumnIncreasingIcon,
  GraduationCapIcon,
  HandIcon,
  HandshakeIcon,
  HeartIcon,
  MicIcon,
  PartyPopperIcon,
  RocketIcon,
  ShieldCheckIcon,
  SproutIcon,
  TrophyIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

/**
 * ไอคอนประจำกิจกรรม
 *
 * เก็บเป็นชื่อ ไม่ใช่คอมโพเนนต์ เพราะค่านี้ต้องบันทึกลงข้อมูลกิจกรรมได้
 * ชุดแรก 7 ตัวคือชุดที่ `getEventIcon()` เดาจากชื่อกิจกรรมมาแต่เดิม
 * จึงเลือกให้ตรงกับของเก่าได้ทุกกรณี
 */
export const EVENT_ICON_OPTIONS = [
  { name: "calendar", icon: CalendarDaysIcon },
  { name: "party", icon: PartyPopperIcon },
  { name: "shield", icon: ShieldCheckIcon },
  { name: "hand", icon: HandIcon },
  { name: "sprout", icon: SproutIcon },
  { name: "chart", icon: ChartNoAxesColumnIncreasingIcon },
  { name: "rocket", icon: RocketIcon },
  { name: "graduation", icon: GraduationCapIcon },
  { name: "mic", icon: MicIcon },
  { name: "users", icon: UsersIcon },
  { name: "handshake", icon: HandshakeIcon },
  { name: "trophy", icon: TrophyIcon },
  { name: "briefcase", icon: BriefcaseIcon },
  { name: "heart", icon: HeartIcon },
] as const

export const EVENT_ICON_NAMES = EVENT_ICON_OPTIONS.map(
  (option) => option.name
) as unknown as readonly EventIconName[]

export type EventIconName = (typeof EVENT_ICON_OPTIONS)[number]["name"]

const ICON_BY_NAME = new Map<string, LucideIcon>(
  EVENT_ICON_OPTIONS.map((option) => [option.name, option.icon])
)

/** คืน null ถ้าชื่อไม่อยู่ในชุด (ข้อมูลเก่า/ผิดรูป) ให้ผู้เรียกไป fallback เอง */
export function getEventIconByName(name: string | null): LucideIcon | null {
  return name ? (ICON_BY_NAME.get(name) ?? null) : null
}
