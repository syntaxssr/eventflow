import { expect, test } from "@playwright/test"

import { forceScreenState, signIn } from "./helpers"

/** อ่านตัวเลขในการ์ดสรุปจากชื่อการ์ด */
async function statValue(
  page: import("@playwright/test").Page,
  label: string
): Promise<number> {
  const card = page.getByRole("link").filter({ hasText: label }).first()
  const text = await card.innerText()
  const digits = text.replace(/[^\d]/g, "")
  return Number(digits)
}

test.describe("Phase 2 — Dashboard", () => {
  test("ทักทายด้วยชื่อผู้ใช้ที่เข้าสู่ระบบ", async ({ page }) => {
    await signIn(page)
    await expect(
      page.getByRole("heading", { level: 1, name: /สวัสดี ปวีณา ศรีสุวรรณ/ })
    ).toBeVisible()
  })

  test("แสดงการ์ดสรุปครบทั้ง 5 ใบพร้อมตัวเลข", async ({ page }) => {
    await signIn(page)

    for (const label of [
      "กิจกรรมที่กำลังจะมาถึง",
      "งานใกล้ครบกำหนด",
      "งานเกินกำหนด",
      "งานที่ยังไม่เสร็จ",
      "การแจ้งเตือนที่ยังไม่อ่าน",
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }

    // ข้อมูลจำลองต้องมีทั้งงานเกินกำหนดและงานใกล้ครบกำหนดให้เห็น
    expect(await statValue(page, "งานเกินกำหนด")).toBeGreaterThan(0)
    expect(await statValue(page, "งานใกล้ครบกำหนด")).toBeGreaterThan(0)
  })

  test("การ์ดกิจกรรมหลักแสดงงานเลี้ยงประจำปีพร้อมความคืบหน้า", async ({
    page,
  }) => {
    await signIn(page)

    await expect(
      page.getByRole("heading", { name: "งานเลี้ยงประจำปีของบริษัท 2569" })
    ).toBeVisible()
    await expect(page.getByText("18 ก.ย. 2569")).toBeVisible()
    await expect(page.getByText("17:00 – 22:00")).toBeVisible()
    await expect(page.getByText(/อีก \d+ วัน/)).toBeVisible()
    await expect(page.getByText(/เสร็จแล้ว \d+ จาก \d+ งาน/)).toBeVisible()
    await expect(
      page.getByRole("progressbar", { name: "ความคืบหน้า" })
    ).toBeVisible()
  })

  test("สรุปงานตามสถานะรวมกันเท่ากับจำนวนงานทั้งหมด", async ({ page }) => {
    await signIn(page)

    const totalText = await page
      .getByText(/งานทั้งหมด: \d+ งาน/)
      .innerText()
    const total = Number(totalText.replace(/[^\d]/g, ""))

    const statuses = [
      "ยังไม่เริ่ม",
      "กำลังดำเนินการ",
      "รอตรวจสอบ",
      "เสร็จสิ้น",
      "ถูกบล็อก",
    ]

    let sum = 0
    for (const status of statuses) {
      const row = page
        .getByRole("link")
        .filter({ hasText: new RegExp(`^${status}\\d+$`) })
        .first()
      sum += Number((await row.innerText()).replace(/[^\d]/g, ""))
    }

    expect(sum).toBe(total)
  })

  test("สรุปสถานะตอบรับรวมกันเท่ากับจำนวนผู้เข้าร่วม", async ({ page }) => {
    await signIn(page)

    const totalText = await page.getByText(/ผู้เข้าร่วม: \d+ คน/).innerText()
    const total = Number(totalText.replace(/[^\d]/g, ""))

    let sum = 0
    for (const status of ["เข้าร่วม", "ไม่เข้าร่วม", "ยังไม่ตอบรับ"]) {
      const row = page
        .getByRole("link")
        .filter({ hasText: new RegExp(`^${status}\\d+$`) })
        .first()
      sum += Number((await row.innerText()).replace(/[^\d]/g, ""))
    }

    expect(sum).toBe(total)
  })

  test("คลิกการ์ดงานเกินกำหนดแล้วไปหน้างานพร้อมตัวกรอง", async ({ page }) => {
    await signIn(page)

    await page
      .getByRole("link")
      .filter({ hasText: "งานเกินกำหนด" })
      .first()
      .click()

    await expect(page).toHaveURL(/\/my-tasks\?scope=all&due=overdue$/)
  })

  test("คลิกการ์ดการแจ้งเตือนแล้วไปหน้าการแจ้งเตือน", async ({ page }) => {
    await signIn(page)

    await page
      .getByRole("link")
      .filter({ hasText: "การแจ้งเตือนที่ยังไม่อ่าน" })
      .first()
      .click()

    await expect(page).toHaveURL(/\/notifications$/)
  })

  test("สลับผู้ใช้แล้วคำทักทายและงานเร่งด่วนเปลี่ยนตาม", async ({ page }) => {
    await signIn(page)

    const urgentTasks = page.getByTestId("urgent-tasks")
    await expect(urgentTasks).toContainText("จัดทำลำดับพิธีการ (Run Down)")

    await page.getByTestId("user-menu").click()
    await page.getByTestId("switch-user-trigger").click()
    await page.getByRole("menuitemradio", { name: /สิริพร ใจดี/ }).click()

    await expect(
      page.getByRole("heading", { level: 1, name: /สวัสดี สิริพร ใจดี/ })
    ).toBeVisible()

    // งานของสิริพร (u-3) ต้องเข้ามาแทน และงานของปวีณาต้องหายไป
    await expect(urgentTasks).toContainText("สรุปยอดจองโต๊ะรอบแรก")
    await expect(urgentTasks).not.toContainText("จัดทำลำดับพิธีการ (Run Down)")
  })

  test("แสดงไฟล์ล่าสุดและความเคลื่อนไหวล่าสุด", async ({ page }) => {
    await signIn(page)

    const files = page.getByTestId("recent-files")
    await expect(files).toContainText("สไลด์เปิดงาน Golden Night.pptx")
    await expect(files).toContainText("PowerPoint")

    await expect(page.getByTestId("recent-activity")).toBeVisible()
  })

  test("ไม่มีเวลาในอนาคตปรากฏในความเคลื่อนไหวล่าสุด", async ({ page }) => {
    await signIn(page)

    const card = page.getByTestId("recent-activity")
    await expect(card).toBeVisible()

    // ภาษาไทยใช้คำว่า "ใน..." สำหรับเวลาในอนาคต เช่น "ในอีก 3 สัปดาห์"
    await expect(card).not.toContainText(/ในอีก/)
    await expect(card).not.toContainText(/เดือนหน้า|สัปดาห์หน้า|ปีหน้า|พรุ่งนี้/)
  })

  test("เครื่องมือทดสอบบังคับให้แสดง Error State พร้อมปุ่มลองใหม่", async ({
    page,
  }) => {
    await signIn(page)
    await forceScreenState(page, "ผิดพลาด")

    await expect(page.getByTestId("error-state")).toContainText("เกิดข้อผิดพลาด")
    await expect(page.getByRole("button", { name: "ลองอีกครั้ง" })).toBeVisible()
  })

  test("เครื่องมือทดสอบบังคับให้แสดง Empty State พร้อม CTA", async ({ page }) => {
    await signIn(page)
    await forceScreenState(page, "ไม่มีข้อมูล")

    await expect(page.getByTestId("empty-state")).toContainText(
      "ยังไม่มีกิจกรรมที่กำลังจะมาถึง"
    )
    await expect(
      page.getByRole("link", { name: "สร้างกิจกรรมแรก" })
    ).toBeVisible()
  })

  test("ไม่มี console error บนหน้า Dashboard", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })

    await signIn(page)
    await page.waitForLoadState("networkidle")

    expect(errors).toEqual([])
  })
})
