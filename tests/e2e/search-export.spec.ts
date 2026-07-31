import { expect, test, type Page } from "@playwright/test"

import { signIn } from "./helpers"

async function openPalette(page: Page) {
  await page.keyboard.press("Control+k")
  await expect(page.getByTestId("global-search-input")).toBeVisible()
}

test.describe("Phase 9 — Global Search", () => {
  test("เปิดด้วย Ctrl+K ค้นหาแบบแบ่งกลุ่มพร้อม highlight", async ({ page }) => {
    await signIn(page)
    await openPalette(page)

    await page.getByTestId("global-search-input").fill("โปสเตอร์")
    const list = page.getByTestId("global-search-list")
    await expect(list.getByText("ออกแบบโปสเตอร์ประชาสัมพันธ์")).toBeVisible()
    await expect(
      list.getByText("โปสเตอร์ประชาสัมพันธ์ Golden Night.png")
    ).toBeVisible()
    // คำค้นถูก highlight ในผลลัพธ์
    await expect(list.locator("mark").first()).toBeVisible()
  })

  test("คลิกผลลัพธ์งานแล้วเปิดรายละเอียดงานนั้นทันที", async ({ page }) => {
    await signIn(page)
    await openPalette(page)

    await page.getByTestId("global-search-input").fill("ออกแบบโปสเตอร์")
    await page
      .getByTestId("global-search-list")
      .getByText("ออกแบบโปสเตอร์ประชาสัมพันธ์")
      .click()

    await page.waitForURL("**/my-tasks?scope=all&task=t-4")
    await expect(page.getByTestId("task-detail")).toBeVisible()
    await expect(page.getByTestId("task-detail")).toContainText(
      "ออกแบบโปสเตอร์ประชาสัมพันธ์"
    )
  })

  test("ค้นหาผู้เข้าร่วมจากอีเมลแล้วพาไปหน้ารายชื่อพร้อมกรองให้", async ({
    page,
  }) => {
    await signIn(page)
    await openPalette(page)

    await page.getByTestId("global-search-input").fill("somchai.w@company")
    await page
      .getByTestId("global-search-list")
      .getByText("สมชาย วรกิจไพศาล")
      .click()

    await page.waitForURL("**/participants?event=e-1&q=*")
    await expect(page.getByText("พบ 1 คน")).toBeVisible()
    await expect(
      page.getByTestId("participant-table").getByText("สมชาย วรกิจไพศาล")
    ).toBeVisible()
  })

  test("ไม่พบผลลัพธ์ + ประวัติค้นหาล่าสุดจำภายใน session", async ({ page }) => {
    await signIn(page)
    await openPalette(page)

    await page.getByTestId("global-search-input").fill("ไม่มีทางเจอคำนี้แน่นอน")
    await expect(
      page.getByText(/ไม่พบผลลัพธ์สำหรับ/)
    ).toBeVisible()

    // ค้นแล้วเลือกผลลัพธ์ → คำค้นถูกจำไว้ใน recent
    await page.getByTestId("global-search-input").fill("Golden Night")
    await page
      .getByTestId("global-search-list")
      .getByText("สไลด์เปิดงาน Golden Night.pptx")
      .click()
    await page.waitForURL("**/files?file=*")

    await openPalette(page)
    await expect(page.getByText("ค้นหาล่าสุด")).toBeVisible()
    await expect(
      page.getByTestId("global-search-list").getByText("Golden Night")
    ).toBeVisible()
  })

  test("ผลลัพธ์ไฟล์เปิดกล่องรายละเอียดไฟล์ทันที", async ({ page }) => {
    await signIn(page)
    await openPalette(page)

    await page.getByTestId("global-search-input").fill("Script พิธีกร")
    await page
      .getByTestId("global-search-list")
      .getByText("Script พิธีกร (ร่าง).docx")
      .click()

    await page.waitForURL("**/files?file=*")
    await expect(
      page.getByRole("dialog").filter({ hasText: "Script พิธีกร (ร่าง).docx" })
    ).toBeVisible()
  })
})

test.describe("Phase 9 — Activity History", () => {
  test("แสดงรายการพร้อม before → after และกรองตามผู้ดำเนินการ/ประเภท/ช่วงวันที่", async ({
    page,
  }) => {
    await signIn(page)
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "ประวัติการใช้งาน", exact: true })
      .click()
    await page.waitForURL("**/activity")

    await expect(page.getByText(/พบ \d+ รายการ/)).toBeVisible()
    const before = await page.getByTestId("activity-item").count()
    expect(before).toBeGreaterThan(50)

    // กรองตามประเภท action
    await page.getByLabel("ประเภทการกระทำ").click()
    await page.getByRole("option", { name: "อัปโหลดไฟล์", exact: true }).click()
    const afterAction = await page.getByTestId("activity-item").count()
    expect(afterAction).toBeLessThan(before)
    await expect(page.getByTestId("filter-chips")).toContainText("อัปโหลดไฟล์")

    // กรองผู้ดำเนินการเพิ่ม
    await page.getByLabel("ผู้ดำเนินการ").click()
    await page
      .getByRole("option", { name: /ธนกฤต วงศ์อนันต์/ })
      .click()
    await expect(page.getByText(/พบ \d+ รายการ/)).toBeVisible()

    // ล้างตัวกรองทั้งหมด
    await page.getByRole("button", { name: "ล้างทั้งหมด" }).click()
    await expect(page.getByTestId("activity-item")).toHaveCount(before)

    // ช่วงวันที่
    await page.getByLabel("ตั้งแต่วันที่").fill("2026-07-29")
    await page.getByLabel("ถึงวันที่").fill("2026-07-31")
    const inRange = await page.getByTestId("activity-item").count()
    expect(inRange).toBeGreaterThan(0)
    expect(inRange).toBeLessThan(before)
  })

  test("ค้นหาจากชื่อข้อมูลได้", async ({ page }) => {
    await signIn(page)
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "ประวัติการใช้งาน", exact: true })
      .click()
    await page.waitForURL("**/activity")

    await page.getByTestId("activity-search").fill("Golden Night")
    await expect(page.getByText(/พบ \d+ รายการ/)).toBeVisible()
    const results = page.getByTestId("activity-item")
    await expect(results.first()).toContainText("Golden Night")
  })
})

test.describe("Phase 9 — Export", () => {
  test("ส่งออก PDF สรุปกิจกรรมได้ไฟล์จริง", async ({ page }) => {
    await signIn(page)
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "กิจกรรม", exact: true })
      .click()
    await page.waitForURL("**/events")
    await page
      .getByRole("link", { name: /งานเลี้ยงประจำปีของบริษัท 2569/ })
      .first()
      .click()
    await page.waitForURL("**/events/e-1")

    await page.getByTestId("open-event-export").click()
    // โหมด PDF ไม่มีตัวเลือก Activity
    await expect(page.getByTestId("export-section-activity")).toHaveCount(0)

    const downloadPromise = page.waitForEvent("download")
    await page.getByTestId("confirm-event-export").click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe("eventflow-e-1-summary.pdf")
    await expect(page.getByText("ส่งออกไฟล์แล้ว")).toBeVisible()
  })

  test("ส่งออก Excel เลือกเฉพาะบางชีตได้", async ({ page }) => {
    await signIn(page)
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "กิจกรรม", exact: true })
      .click()
    await page.waitForURL("**/events")
    await page
      .getByRole("link", { name: /งานเลี้ยงประจำปีของบริษัท 2569/ })
      .first()
      .click()
    await page.waitForURL("**/events/e-1")

    await page.getByTestId("open-event-export").click()
    await page.getByLabel("Excel — ข้อมูลรายละเอียดแยกชีต").click()
    await expect(page.getByTestId("export-section-activity")).toBeVisible()

    // เอา timeline ออก เหลือชีตอื่น
    await page.getByTestId("export-section-timeline").click()

    const downloadPromise = page.waitForEvent("download")
    await page.getByTestId("confirm-event-export").click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe("eventflow-e-1-export.xlsx")
  })

  test("ไม่เลือกข้อมูลเลยจะส่งออกไม่ได้", async ({ page }) => {
    await signIn(page)
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "กิจกรรม", exact: true })
      .click()
    await page.waitForURL("**/events")
    await page
      .getByRole("link", { name: /งานเลี้ยงประจำปีของบริษัท 2569/ })
      .first()
      .click()
    await page.waitForURL("**/events/e-1")

    await page.getByTestId("open-event-export").click()
    for (const section of ["overview", "tasks", "timeline", "participants", "files"]) {
      await page.getByTestId(`export-section-${section}`).click()
    }
    await expect(
      page.getByText("กรุณาเลือกข้อมูลอย่างน้อยหนึ่งรายการ")
    ).toBeVisible()
    await expect(page.getByTestId("confirm-event-export")).toBeDisabled()
  })

  test("ดาวน์โหลดไฟล์จากหน้า Files ได้ไฟล์จริง", async ({ page }) => {
    await signIn(page)
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "ไฟล์", exact: true })
      .click()
    await page.waitForURL("**/files")

    await page
      .getByRole("button", { name: /กำหนดการงานเลี้ยงประจำปี 2569/ })
      .click()
    const downloadPromise = page.waitForEvent("download")
    await page.getByTestId("download-file").click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain("กำหนดการงานเลี้ยงประจำปี")
  })
})

test.describe("Phase 9 — Profile", () => {
  test("แสดงข้อมูลผู้ใช้ งาน 3 หมวด และกิจกรรมล่าสุด + เปลี่ยนตาม switch user", async ({
    page,
  }) => {
    await signIn(page)
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "โปรไฟล์", exact: true })
      .click()
    await page.waitForURL("**/profile")

    const card = page.getByTestId("profile-card")
    await expect(card).toContainText("ปวีณา ศรีสุวรรณ")
    await expect(card).toContainText("paweena.s@company.co.th")
    await expect(page.getByTestId("profile-assigned")).toBeVisible()
    await expect(page.getByTestId("profile-due-soon")).toBeVisible()
    await expect(page.getByTestId("profile-completed")).toBeVisible()
    await expect(page.getByTestId("recent-activity")).toBeVisible()

    // เปลี่ยนตามผู้ใช้ที่สลับ
    await page.getByTestId("user-menu").click()
    await page.getByTestId("switch-user-trigger").click()
    await page.getByRole("menuitemradio", { name: /ธนกฤต วงศ์อนันต์/ }).click()
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "โปรไฟล์", exact: true })
      .click()
    await expect(page.getByTestId("profile-card")).toContainText(
      "ธนกฤต วงศ์อนันต์"
    )

    // คลิกงานในหมวดแล้วเปิดรายละเอียดงาน
    const firstTask = page
      .getByTestId("profile-assigned")
      .getByRole("link")
      .first()
    await firstTask.click()
    await page.waitForURL("**/my-tasks?task=*")
    await expect(page.getByTestId("task-detail")).toBeVisible()
  })
})
