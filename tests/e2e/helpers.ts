import { expect, type Locator, type Page } from "@playwright/test"

import { MOCK_DATE_SHIFT_DAYS, shiftDateKey } from "@/constants/mock-date"
import { formatDate } from "@/lib/format"

/**
 * ข้อความวันที่ที่หน้าจอแสดงจริง สำหรับวันที่ที่เขียนไว้ใน Mock Data
 *
 * Mock Data ถูกเลื่อนทั้งชุดให้ ANCHOR_TODAY_ISO ตรงกับวันนี้ (ดู mock-date.ts)
 * เทสต์จึงห้ามผูกกับข้อความวันที่ตายตัว ไม่งั้นจะพังทุกวันที่ไม่ใช่วัน anchor
 */
export function mockDateText(anchorDateKey: string): string {
  return formatDate(shiftDateKey(anchorDateKey, MOCK_DATE_SHIFT_DAYS), "th")
}

export const DEMO_EMAIL = "alisa.l@company.co.th"
export const DEMO_PASSWORD = "eventflow"

/** เข้าสู่ระบบด้วยบัญชีทดลองแล้วรอจนถึงหน้า Dashboard */
export async function signIn(page: Page, email = DEMO_EMAIL) {
  await page.goto("/login")
  await page.getByLabel("อีเมลองค์กร", { exact: true }).fill(email)
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(DEMO_PASSWORD)
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click()
  await page.waitForURL("**/dashboard")
}

/** เปิดแผงเครื่องมือทดสอบแล้วบังคับสถานะหน้าจอ */
export async function forceScreenState(
  page: Page,
  label: "ปกติ" | "กำลังโหลด" | "ไม่มีข้อมูล" | "ผิดพลาด"
) {
  await page.getByTestId("dev-tools-trigger").click()
  await page.getByRole("radio", { name: label }).click()
  await page.keyboard.press("Escape")
}

/**
 * เส้นทางที่เทสต์ต้องไปถึง — ชื่อตรงกับ `ROUTES` ใน `src/constants/app.ts`
 */
export type AppRoute =
  | "dashboard"
  | "events"
  | "trash"
  | "profile"
  | "notifications"
  | "myTasks"
  | "files"
  | "activity"
  | "participants"
  | "timeline"
  | "employees"
  | "games"
  | "rsvpForm"

/** เมนูที่เหลืออยู่บน Sidebar จริง ๆ (ที่เหลือถูกย้ายไปจุดอื่นแล้ว) */
const SIDEBAR_LINKS: Partial<Record<AppRoute, string>> = {
  dashboard: "แดชบอร์ด",
  events: "กิจกรรม",
  trash: "ถังขยะ",
}

/** เมนูย่อยใต้กลุ่ม "เบ็ดเตล็ด" บน Sidebar — ต้องคลี่กลุ่มก่อนถ้ายังพับอยู่ */
const MISC_LINKS: Partial<Record<AppRoute, string>> = {
  employees: "HR Section",
  games: "เกมส์",
  rsvpForm: "แบบฟอร์ม RSVP",
}

const ROUTE_PATH: Record<AppRoute, string> = {
  dashboard: "/dashboard",
  events: "/events",
  trash: "/trash",
  profile: "/profile",
  notifications: "/notifications",
  myTasks: "/my-tasks",
  files: "/files",
  activity: "/activity",
  participants: "/participants",
  timeline: "/timeline",
  employees: "/hr-section",
  games: "/games",
  rsvpForm: "/rsvp-form",
}

/** แท็บบนการ์ดกิจกรรมเด่นของ Dashboard ที่มีลิงก์ "ดูทั้งหมด" อยู่ข้างใน */
const DASHBOARD_TAB: Partial<Record<AppRoute, { tab: string; card: string }>> = {
  myTasks: { tab: "งานเร่งด่วนของฉัน", card: "urgent-tasks" },
  files: { tab: "ไฟล์ล่าสุด", card: "recent-files" },
  activity: { tab: "ความเคลื่อนไหวล่าสุด", card: "recent-activity" },
}

/**
 * เปิดเมนู/ป๊อปโอเวอร์บน Topbar แล้วรอจนเนื้อหาข้างในโผล่
 *
 * ถ้าเพิ่งปิดเมนูอันก่อนไป คลิกแรกจะไปโดนจังหวะ animation ปิดแล้วถูกกลืน
 * (Radix ปิด–เปิดสลับกัน) จึงลองคลิกซ้ำอีกครั้งเดียวก่อนยอมแพ้
 */
async function openTopbarMenu(page: Page, triggerTestId: string, content: Locator) {
  const trigger = page.getByTestId(triggerTestId)
  await trigger.click()
  try {
    await content.waitFor({ state: "visible", timeout: 2000 })
  } catch {
    await trigger.click()
    await content.waitFor({ state: "visible", timeout: 10_000 })
  }
}

/**
 * นำทางในแอปโดยไม่โหลดหน้าใหม่
 *
 * สถานะทั้งหมดอยู่ใน memory (โปรโตไทป์นี้ห้ามใช้ localStorage) การ `page.goto()`
 * จึงทำให้ล็อกอินหลุดทุกครั้ง ทุกเทสต์ต้องเดินผ่าน UI จริงเท่านั้น
 *
 * Sidebar เหลือแค่ แดชบอร์ด / กิจกรรม / ถังขยะ หน้าที่เหลือเข้าทางการ์ดบน
 * Dashboard, ปุ่มระฆัง หรือเมนูผู้ใช้ — รวมเส้นทางไว้ที่นี่ที่เดียว เวลาเมนู
 * เปลี่ยนอีกจะได้แก้จุดเดียว
 */
export async function gotoRoute(page: Page, route: AppRoute) {
  // อยู่หน้านั้นอยู่แล้วไม่ต้องเดินเมนูซ้ำ (เมนูที่เพิ่งปิดไปมักกลืนคลิกถัดไป)
  if (new URL(page.url()).pathname === ROUTE_PATH[route]) return

  const sidebarLabel = SIDEBAR_LINKS[route]
  if (sidebarLabel) {
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: sidebarLabel, exact: true })
      .click()
    await page.waitForURL(`**${ROUTE_PATH[route]}`)
    return
  }

  const miscLabel = MISC_LINKS[route]
  if (miscLabel) {
    const nav = page.getByTestId("sidebar-nav")
    const link = nav.getByRole("link", { name: miscLabel, exact: true })
    // กลุ่มที่พับอยู่ไม่ render ลิงก์ย่อยเลย จึงต้องคลี่ก่อน
    if (!(await link.isVisible())) {
      await nav.getByTestId("nav-group-misc").click()
    }
    await link.click()
    await page.waitForURL(`**${ROUTE_PATH[route]}`)
    return
  }

  if (route === "profile") {
    const item = page.getByRole("menuitem", {
      name: "โปรไฟล์ของฉัน",
      exact: true,
    })
    await openTopbarMenu(page, "user-menu", item)
    await item.click()
    await page.waitForURL("**/profile")
    return
  }

  if (route === "notifications") {
    const viewAll = page.getByTestId("bell-view-all")
    await openTopbarMenu(page, "notification-bell", viewAll)
    await viewAll.click()
    await page.waitForURL("**/notifications")
    return
  }

  if (route === "timeline") {
    // ไทม์ไลน์รวมยังไม่มีเมนู เข้าได้ทางการแจ้งเตือน "ไทม์ไลน์เปลี่ยนแปลง" เท่านั้น
    const item = page
      .getByTestId("notification-dropdown")
      .getByTestId("notification-item")
      .filter({ hasText: "ไทม์ไลน์ของกิจกรรมมีการเปลี่ยนแปลง" })
      .first()
    await openTopbarMenu(page, "notification-bell", item)
    await item.click()
    await page.waitForURL("**/timeline")
    return
  }

  // ที่เหลือเริ่มจาก Dashboard เสมอ เพราะลิงก์อยู่บนการ์ดของหน้านั้น
  if (!page.url().includes("/dashboard")) await gotoRoute(page, "dashboard")

  if (route === "participants") {
    // ไม่มีเมนูตรง ๆ — ใช้ลิงก์สถานะตอบรับบนการ์ดสรุป RSVP
    // (`?rsvp=` ไม่ถูกอ่านเป็นตัวกรอง หน้าที่เปิดจึงเป็นรายชื่อทั้งหมด)
    await page
      .getByTestId("dashboard-detail-tabs")
      .getByRole("tab", { name: "สรุปสถานะตอบรับ" })
      .click()
    await page
      .getByTestId("rsvp-summary")
      .getByRole("link")
      .first()
      .click()
    await page.waitForURL("**/participants**")
    return
  }

  const entry = DASHBOARD_TAB[route]
  if (!entry) throw new Error(`ยังไม่มีเส้นทางเข้าหน้า ${route}`)

  await page
    .getByTestId("dashboard-detail-tabs")
    .getByRole("tab", { name: entry.tab })
    .click()
  await page
    .getByTestId(entry.card)
    .getByRole("link", { name: "ดูทั้งหมด" })
    .click()
  await page.waitForURL(`**${ROUTE_PATH[route]}`)
}

/**
 * เลือกเวลาจาก `TimePickerField` (ป๊อปโอเวอร์รายการเวลาทุก 15 นาที)
 *
 * ใช้แทนการ `fill()` ช่อง `input[type="time"]` เดิม — รอให้ป๊อปโอเวอร์ก่อนหน้า
 * ปิดสนิทก่อนเสมอ ไม่งั้นจะเจอ listbox ค้างสองอันระหว่าง animation
 */
export async function pickTime(
  page: Page,
  scope: Locator,
  label: string,
  time: string
) {
  await expect(page.getByRole("listbox")).toHaveCount(0)
  await scope.getByLabel(label).click()
  const list = page.getByRole("listbox")
  await expect(list).toBeVisible()
  await list.getByRole("option", { name: new RegExp(`^${time}`) }).click()
  await expect(page.getByRole("listbox")).toHaveCount(0)
}

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
]

/**
 * เลือกวันที่จาก `DatePickerField` (ปุ่ม + ปฏิทิน) ด้วยคีย์ ISO เช่น "2026-11-20"
 *
 * ใช้แทนการ `fill()` ช่อง `input[type="date"]` เดิม — ปฏิทินเปิดที่เดือนปัจจุบัน
 * จึงกด "เดือนถัดไป" ไล่ไปจนเจอวันเป้าหมาย (aria-label ของปุ่มวันเป็นไทย
 * ปีคริสต์ศักราช เช่น "วันศุกร์ที่ 20 พฤศจิกายน 2026")
 */
export async function pickDate(
  page: Page,
  scope: Locator,
  label: string,
  dateKey: string
) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const dayLabel = new RegExp(`ที่ ${day} ${THAI_MONTHS[month - 1]} ${year}$`)

  await scope.getByLabel(label, { exact: true }).click()
  const calendar = page.locator('[data-slot="popover-content"]')
  await expect(calendar).toBeVisible()

  const target = calendar.getByRole("button", { name: dayLabel })
  for (let hop = 0; hop < 24 && !(await target.count()); hop += 1) {
    await calendar.getByRole("button", { name: "Go to the Next Month" }).click()
  }
  await target.click()
  await expect(calendar).toBeHidden()
}
