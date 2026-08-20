import type { Locator, Page } from "@playwright/test"

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

/** เมนูที่เหลืออยู่บน Sidebar จริง ๆ (ที่เหลือถูกย้ายไปจุดอื่นแล้ว) */
const SIDEBAR_LINKS: Partial<Record<AppRoute, string>> = {
  dashboard: "แดชบอร์ด",
  events: "กิจกรรม",
  trash: "ถังขยะ",
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
