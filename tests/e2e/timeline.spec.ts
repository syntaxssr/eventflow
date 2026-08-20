import { expect, test, type Page } from "@playwright/test"

import { gotoRoute, pickTime, signIn } from "./helpers"

async function gotoTimeline(page: Page) {
  await signIn(page)
  await gotoRoute(page, "timeline")
  await expect(page.getByTestId("timeline-vertical")).toBeVisible()
}

test.describe("Phase 5 — Timeline views", () => {
  test("แบ่งไทม์ไลน์เป็นสามช่วงพร้อมจำนวนรายการ", async ({ page }) => {
    await gotoTimeline(page)

    await expect(page.getByText("พบ 23 รายการ")).toBeVisible()
    await expect(page.getByTestId("timeline-phase-before")).toContainText(
      "ก่อนวันงาน"
    )
    await expect(page.getByTestId("timeline-phase-during")).toContainText(
      "วันจัดงาน"
    )
    await expect(page.getByTestId("timeline-phase-after")).toContainText(
      "หลังจบงาน"
    )

    // ลำดับพิธีการในวันงานต้องเรียงตามเวลา
    const during = page.getByTestId("timeline-phase-during")
    await expect(during).toContainText("17:30–17:45")
    await expect(during).toContainText("มอบรางวัลพนักงานดีเด่น")
  })

  test("สลับสามมุมมองได้และใช้ข้อมูลชุดเดียวกัน", async ({ page }) => {
    await gotoTimeline(page)

    await page.getByRole("button", { name: "มุมมองปฏิทิน" }).click()
    await expect(page.getByTestId("timeline-calendar")).toBeVisible()

    await page.getByRole("button", { name: "มุมมองแกนต์" }).click()
    await expect(page.getByTestId("timeline-gantt")).toBeVisible()
    await expect(
      page.getByTestId("timeline-gantt").getByText("มอบรางวัลพนักงานดีเด่น").first()
    ).toBeVisible()

    await page.getByRole("button", { name: "มุมมองไทม์ไลน์" }).click()
    await expect(page.getByTestId("timeline-vertical")).toBeVisible()
  })

  test("เปลี่ยนกิจกรรมแล้วไทม์ไลน์เปลี่ยนตาม", async ({ page }) => {
    await gotoTimeline(page)

    await page.getByTestId("timeline-event-select").click()
    await page.getByRole("option", { name: /ปฐมนิเทศพนักงานใหม่/ }).click()

    await expect(page.getByText("พบ 5 รายการ")).toBeVisible()
    await expect(page.getByTestId("timeline-vertical")).toContainText(
      "ลงทะเบียนและรับเอกสาร"
    )
  })

  test("Gantt มีตารางข้อมูลสำรองสำหรับ screen reader", async ({ page }) => {
    await gotoTimeline(page)
    await page.getByRole("button", { name: "มุมมองแกนต์" }).click()

    const table = page.getByRole("table", { name: "มุมมองแกนต์" })
    await expect(table).toBeAttached()
    await expect(table.getByRole("rowheader").first()).toBeAttached()
  })
})

test.describe("Phase 5 — Timeline editing", () => {
  test("เพิ่มรายการใหม่แล้วเข้าช่วงที่ถูกต้องอัตโนมัติ", async ({ page }) => {
    await gotoTimeline(page)

    await page.getByTestId("create-timeline").click()
    const dialog = page.getByRole("dialog")
    await dialog.getByLabel("ชื่อรายการ").fill("แถลงข่าวก่อนงาน")
    await dialog.getByLabel("วันที่").fill("2026-09-10")
    await pickTime(page, dialog, "เวลาเริ่ม", "10:00")
    await pickTime(page, dialog, "เวลาสิ้นสุด", "11:00")
    await dialog.getByLabel("สถานที่").fill("ห้องแถลงข่าว ชั้น 1")
    await dialog.getByLabel(/อลิสา ลีลายุวัฒนกุล/).check()
    await dialog.getByRole("button", { name: "บันทึก" }).click()

    await expect(page.getByText("เพิ่มรายการไทม์ไลน์แล้ว")).toBeVisible()
    await expect(page.getByText("พบ 24 รายการ")).toBeVisible()
    // วันที่ 10 ก.ย. มาก่อนวันงาน 18 ก.ย. จึงต้องอยู่ช่วง "ก่อนวันงาน"
    await expect(page.getByTestId("timeline-phase-before")).toContainText(
      "แถลงข่าวก่อนงาน"
    )
  })

  test("เลือกเวลาสิ้นสุดก่อนเวลาเริ่มไม่ได้เลย", async ({ page }) => {
    await gotoTimeline(page)

    await page.getByTestId("create-timeline").click()
    const dialog = page.getByRole("dialog")
    await pickTime(page, dialog, "เวลาเริ่ม", "15:00")

    // ตัวเลือกเวลาสิ้นสุดเหลือเฉพาะเวลาหลัง 15:00 พร้อมบอกความยาวของช่วง
    await dialog.getByLabel("เวลาสิ้นสุด").click()
    const list = page.getByRole("listbox")
    await expect(list.getByRole("option", { name: /^14:00/ })).toHaveCount(0)
    await expect(list.getByRole("option").first()).toContainText("15:15")
    await expect(list.getByRole("option").first()).toContainText("15 นาที")
  })

  test("แสดง validation เมื่อยังไม่เลือกผู้รับผิดชอบ", async ({ page }) => {
    await gotoTimeline(page)

    await page.getByTestId("create-timeline").click()
    const dialog = page.getByRole("dialog")
    await dialog.getByLabel("ชื่อรายการ").fill("รายการไม่มีเจ้าภาพ")
    await dialog.getByLabel("สถานที่").fill("เวทีหลัก")
    await dialog.getByRole("button", { name: "บันทึก" }).click()

    await expect(
      page.getByText("กรุณาเลือกผู้รับผิดชอบอย่างน้อยหนึ่งคน")
    ).toBeVisible()
  })

  test("แก้เวลาแล้วสร้างการแจ้งเตือนถึงผู้ที่เกี่ยวข้อง", async ({ page }) => {
    await gotoTimeline(page)

    await page
      .getByRole("button", { name: /แก้ไข: มอบรางวัลพนักงานดีเด่น/ })
      .click()

    const dialog = page.getByRole("dialog")
    await pickTime(page, dialog, "เวลาเริ่ม", "19:30")
    await pickTime(page, dialog, "เวลาสิ้นสุด", "20:15")
    await dialog.getByRole("button", { name: "บันทึก" }).click()

    await expect(page.getByText("บันทึกการเปลี่ยนแปลงแล้ว")).toBeVisible()
    await expect(page.getByTestId("timeline-phase-during")).toContainText(
      "19:30–20:15"
    )

    // กิตติคุณ (u-3) เป็นผู้รับผิดชอบร่วม ต้องได้รับการแจ้งเตือน
    await page.getByTestId("user-menu").click()
    await page.getByTestId("switch-user-trigger").click()
    await page.getByRole("menuitemradio", { name: /กิตติคุณ เจริญพานิช/ }).click()

    await expect(page.getByTestId("notification-bell")).toHaveAttribute(
      "aria-label",
      /การแจ้งเตือนที่ยังไม่อ่าน/
    )
  })

  test("ลบรายการต้องผ่านกล่องยืนยัน", async ({ page }) => {
    await gotoTimeline(page)

    await page.getByRole("button", { name: /ลบ: ถ่ายภาพหมู่/ }).click()

    await expect(page.getByText("ยืนยันการลบรายการไทม์ไลน์")).toBeVisible()
    await expect(
      page.getByText("ถ่ายภาพหมู่", { exact: true }).first()
    ).toBeVisible()

    await page.getByRole("button", { name: "ลบ", exact: true }).click()
    await expect(page.getByText("ลบรายการไทม์ไลน์แล้ว")).toBeVisible()
    await expect(page.getByText("พบ 22 รายการ")).toBeVisible()
  })

  test("ไม่มี console error ตลอดการใช้งานไทม์ไลน์", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })

    await gotoTimeline(page)
    await page.getByRole("button", { name: "มุมมองปฏิทิน" }).click()
    await page.getByRole("button", { name: "มุมมองแกนต์" }).click()
    await page.getByRole("button", { name: "มุมมองไทม์ไลน์" }).click()
    await page.waitForLoadState("networkidle")

    expect(errors).toEqual([])
  })
})
