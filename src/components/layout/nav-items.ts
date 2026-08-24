import {
  BellIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  ContactIcon,
  FerrisWheelIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  Trash2Icon,
  UserIcon,
  type LucideIcon,
} from "lucide-react"

import { ROUTES } from "@/constants/app"
import type { TranslationKey } from "@/i18n/types"

export interface NavItem {
  href: string
  labelKey: TranslationKey
  icon: LucideIcon
}

/** เมนูแม่ที่พับ/ขยายได้ ไม่มีหน้าของตัวเอง — มีไว้รวมเมนูย่อย */
export interface NavGroup {
  id: string
  labelKey: TranslationKey
  icon: LucideIcon
  children: NavItem[]
}

export type NavEntry = NavItem | NavGroup

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry
}

/** เมนูย่อยใต้ "เบ็ดเตล็ด" — เครื่องมือเสริมที่ไม่ผูกกับกิจกรรมใดกิจกรรมหนึ่ง */
export const MISC_NAV: NavItem[] = [
  { href: ROUTES.employees, labelKey: "nav.employees", icon: ContactIcon },
  { href: ROUTES.forms, labelKey: "nav.forms", icon: ClipboardListIcon },
  { href: ROUTES.games, labelKey: "nav.games", icon: FerrisWheelIcon },
]

export const MISC_NAV_GROUP: NavGroup = {
  id: "misc",
  labelKey: "nav.misc",
  icon: LayoutGridIcon,
  children: MISC_NAV,
}

/** เมนูหลักบน Sidebar (Desktop) */
export const MAIN_NAV: NavEntry[] = [
  { href: ROUTES.dashboard, labelKey: "nav.dashboard", icon: LayoutDashboardIcon },
  { href: ROUTES.events, labelKey: "nav.events", icon: CalendarDaysIcon },
  MISC_NAV_GROUP,
  { href: ROUTES.trash, labelKey: "nav.trash", icon: Trash2Icon },
]

/** เมนูส่วนบัญชีผู้ใช้ (อยู่ท้าย Sidebar) */
/* ตั้งค่าการแจ้งเตือนไม่อยู่ในเมนูนี้แล้ว — ย้ายไปเป็น dialog เปิดจากโปรไฟล์/เมนูผู้ใช้ */
export const ACCOUNT_NAV: NavItem[] = [
  { href: ROUTES.profile, labelKey: "nav.profile", icon: UserIcon },
]

/** เมนูหลัก 4 ปุ่มบน Bottom Navigation (Mobile) — ปุ่มที่ 5 คือ "เพิ่มเติม" */
export const MOBILE_NAV: NavItem[] = [
  { href: ROUTES.dashboard, labelKey: "nav.home", icon: LayoutDashboardIcon },
  { href: ROUTES.events, labelKey: "nav.events", icon: CalendarDaysIcon },
  { href: ROUTES.notifications, labelKey: "nav.notifications", icon: BellIcon },
]

/** เมนูที่เหลือ แสดงในหน้า More/Drawer ของ Mobile — เมนูย่อยของเบ็ดเตล็ดถูกคลี่ออกมาเป็นการ์ดเดี่ยว */
export const MOBILE_MORE_NAV: NavItem[] = [
  ...MISC_NAV,
  { href: ROUTES.trash, labelKey: "nav.trash", icon: Trash2Icon },
  ...ACCOUNT_NAV,
]

/** เมนูจะถูกไฮไลต์เมื่อ pathname ตรงหรืออยู่ภายใต้เส้นทางนั้น */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** เมนูแม่ถือว่า active เมื่อมีเมนูย่อยตัวใดตัวหนึ่ง active */
export function isNavGroupActive(pathname: string, group: NavGroup): boolean {
  return group.children.some((item) => isNavItemActive(pathname, item.href))
}
