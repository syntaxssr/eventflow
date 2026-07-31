import {
  BellIcon,
  CalendarDaysIcon,
  ChartGanttIcon,
  FolderIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  SettingsIcon,
  Trash2Icon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { ROUTES } from "@/constants/app"
import type { TranslationKey } from "@/i18n/types"

export interface NavItem {
  href: string
  labelKey: TranslationKey
  icon: LucideIcon
}

/** เมนูหลักบน Sidebar (Desktop) */
export const MAIN_NAV: NavItem[] = [
  { href: ROUTES.dashboard, labelKey: "nav.dashboard", icon: LayoutDashboardIcon },
  { href: ROUTES.events, labelKey: "nav.events", icon: CalendarDaysIcon },
  { href: ROUTES.myTasks, labelKey: "nav.myTasks", icon: ListChecksIcon },
  { href: ROUTES.files, labelKey: "nav.files", icon: FolderIcon },
  { href: ROUTES.timeline, labelKey: "nav.timeline", icon: ChartGanttIcon },
  { href: ROUTES.participants, labelKey: "nav.participants", icon: UsersIcon },
  { href: ROUTES.notifications, labelKey: "nav.notifications", icon: BellIcon },
  { href: ROUTES.activity, labelKey: "nav.activity", icon: HistoryIcon },
  { href: ROUTES.trash, labelKey: "nav.trash", icon: Trash2Icon },
]

/** เมนูส่วนบัญชีผู้ใช้ (อยู่ท้าย Sidebar) */
export const ACCOUNT_NAV: NavItem[] = [
  { href: ROUTES.profile, labelKey: "nav.profile", icon: UserIcon },
  {
    href: ROUTES.notificationSettings,
    labelKey: "shell.notificationSettings",
    icon: SettingsIcon,
  },
]

/** เมนูหลัก 4 ปุ่มบน Bottom Navigation (Mobile) — ปุ่มที่ 5 คือ "เพิ่มเติม" */
export const MOBILE_NAV: NavItem[] = [
  { href: ROUTES.dashboard, labelKey: "nav.home", icon: LayoutDashboardIcon },
  { href: ROUTES.events, labelKey: "nav.events", icon: CalendarDaysIcon },
  { href: ROUTES.myTasks, labelKey: "nav.myTasks", icon: ListChecksIcon },
  { href: ROUTES.notifications, labelKey: "nav.notifications", icon: BellIcon },
]

/** เมนูที่เหลือ แสดงในหน้า More/Drawer ของ Mobile */
export const MOBILE_MORE_NAV: NavItem[] = [
  { href: ROUTES.files, labelKey: "nav.files", icon: FolderIcon },
  { href: ROUTES.timeline, labelKey: "nav.timeline", icon: ChartGanttIcon },
  { href: ROUTES.participants, labelKey: "nav.participants", icon: UsersIcon },
  { href: ROUTES.activity, labelKey: "nav.activity", icon: HistoryIcon },
  { href: ROUTES.trash, labelKey: "nav.trash", icon: Trash2Icon },
  ...ACCOUNT_NAV,
]

/** เมนูจะถูกไฮไลต์เมื่อ pathname ตรงหรืออยู่ภายใต้เส้นทางนั้น */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
