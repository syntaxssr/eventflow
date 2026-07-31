import type { Page } from "@playwright/test"

export const DEMO_EMAIL = "paweena.s@company.co.th"
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
