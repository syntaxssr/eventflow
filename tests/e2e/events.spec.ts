import { expect, test, type Page } from "@playwright/test"

import { gotoRoute, signIn } from "./helpers"

async function gotoEvents(page: Page) {
  await signIn(page)
  await gotoRoute(page, "events")
  await expect(page.getByTestId("event-grid")).toBeVisible()
}

async function openMainEvent(page: Page) {
  await page
    .getByRole("link", { name: /งานเลี้ยงประจำปีของบริษัท 2569/ })
    .first()
    .click()
  await page.waitForURL("**/events/e-1")
}

test.describe("Phase 3 — Event list", () => {
  test("แสดงกิจกรรมทั้งหมดพร้อมความคืบหน้า", async ({ page }) => {
    await gotoEvents(page)

    await expect(page.getByText("พบ 6 กิจกรรม")).toBeVisible()
    await expect(
      page.getByRole("link", { name: /งานเลี้ยงประจำปีของบริษัท 2569/ })
    ).toBeVisible()
    await expect(page.getByText("เสร็จแล้ว 8 จาก 29 งาน")).toBeVisible()
  })

  test("กรองตามสถานะแล้วแสดง chip และล้างได้", async ({ page }) => {
    await gotoEvents(page)

    await page.getByTestId("status-filter").click()
    await page.getByRole("menuitemcheckbox", { name: "เสร็จสิ้น" }).click()
    await page.keyboard.press("Escape")

    await expect(page.getByText("พบ 1 กิจกรรม")).toBeVisible()
    await expect(page.getByTestId("filter-chips")).toContainText("เสร็จสิ้น")

    await page.getByRole("button", { name: "ล้างทั้งหมด" }).click()
    await expect(page.getByText("พบ 6 กิจกรรม")).toBeVisible()
    await expect(page.getByTestId("filter-chips")).toBeHidden()
  })

  test("กรองแล้วไม่พบผลลัพธ์ แสดง Empty State พร้อมปุ่มล้างตัวกรอง", async ({
    page,
  }) => {
    await gotoEvents(page)

    await page.getByTestId("status-filter").click()
    await page.getByRole("menuitemcheckbox", { name: "ร่าง" }).click()
    await page.keyboard.press("Escape")

    // จำกัดช่วงวันที่ให้ไม่ตรงกับกิจกรรมสถานะร่าง
    await page.locator("#event-from").fill("2026-01-01")
    await page.locator("#event-to").fill("2026-01-31")

    await expect(page.getByTestId("empty-state")).toContainText(
      "ไม่พบกิจกรรมที่ตรงกับตัวกรอง"
    )
  })

  test("สลับไปมุมมองตารางได้", async ({ page }) => {
    await gotoEvents(page)

    await page.getByRole("button", { name: "มุมมองตาราง" }).click()
    await expect(page.getByRole("table")).toBeVisible()
    await expect(
      page.getByRole("cell", { name: /งานเลี้ยงประจำปีของบริษัท 2569/ })
    ).toBeVisible()

    await page.getByRole("button", { name: "มุมมองการ์ด" }).click()
    await expect(page.getByTestId("event-grid")).toBeVisible()
  })

  test("จัดเรียงตามชื่อกิจกรรมได้", async ({ page }) => {
    await gotoEvents(page)

    await page.getByRole("button", { name: "วันจัดงาน" }).click()
    await page.getByRole("menuitemradio", { name: "ชื่อกิจกรรม" }).click()

    await expect(page.getByRole("button", { name: "ชื่อกิจกรรม" })).toBeVisible()
    await expect(page.getByTestId("event-grid")).toBeVisible()
  })
})

test.describe("Phase 3 — Create & edit", () => {
  test("สร้างกิจกรรมใหม่แล้วเห็นในรายการ", async ({ page }) => {
    await gotoEvents(page)

    await page.getByTestId("create-event").click()
    const dialog = page.getByRole("dialog")
    await dialog.getByLabel("ชื่อกิจกรรม").fill("งานทดสอบระบบ EventFlow")
    await dialog.getByLabel("วันที่เริ่มต้น").fill("2026-11-20")
    await dialog.getByLabel("วันที่สิ้นสุด").fill("2026-11-20")
    await dialog.getByLabel("สถานที่").fill("ห้องประชุมใหญ่ ชั้น 3")
    await dialog.getByRole("button", { name: "บันทึก" }).click()

    await expect(page.getByText("สร้างกิจกรรมเรียบร้อยแล้ว")).toBeVisible()
    await expect(page.getByText("พบ 7 กิจกรรม")).toBeVisible()
    await expect(
      page.getByRole("link", { name: /งานทดสอบระบบ EventFlow/ })
    ).toBeVisible()
  })

  test("แสดง validation เมื่อกรอกข้อมูลไม่ครบ", async ({ page }) => {
    await gotoEvents(page)

    await page.getByTestId("create-event").click()
    await page.getByRole("button", { name: "บันทึก" }).click()

    await expect(page.getByText("กรุณากรอกชื่อกิจกรรม")).toBeVisible()
    await expect(page.getByText("กรุณากรอกสถานที่")).toBeVisible()
  })

  test("เตือนเมื่อวันที่สิ้นสุดมาก่อนวันที่เริ่มต้น", async ({ page }) => {
    await gotoEvents(page)

    await page.getByTestId("create-event").click()
    const dialog = page.getByRole("dialog")
    await dialog.getByLabel("ชื่อกิจกรรม").fill("งานทดสอบวันที่")
    await dialog.getByLabel("สถานที่").fill("ที่ไหนสักแห่ง")
    await dialog.getByLabel("วันที่เริ่มต้น").fill("2026-12-10")
    await dialog.getByLabel("วันที่สิ้นสุด").fill("2026-12-01")
    await dialog.getByRole("button", { name: "บันทึก" }).click()

    await expect(
      page.getByText("วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มต้น")
    ).toBeVisible()
  })

  test("เตือนเมื่อปิดฟอร์มทั้งที่ยังไม่ได้บันทึก", async ({ page }) => {
    await gotoEvents(page)

    await page.getByTestId("create-event").click()
    const dialog = page.getByRole("dialog")
    await dialog.getByLabel("ชื่อกิจกรรม").fill("ร่างที่ยังไม่บันทึก")
    await dialog.getByRole("button", { name: "ยกเลิก" }).click()

    await expect(page.getByText("ยังไม่ได้บันทึกการเปลี่ยนแปลง")).toBeVisible()

    await page.getByRole("button", { name: "แก้ไขต่อ" }).click()
    await expect(dialog.getByLabel("ชื่อกิจกรรม")).toHaveValue(
      "ร่างที่ยังไม่บันทึก"
    )

    await dialog.getByRole("button", { name: "ยกเลิก" }).click()
    await page.getByRole("button", { name: "ปิดโดยไม่บันทึก" }).click()
    await expect(page.getByText("พบ 6 กิจกรรม")).toBeVisible()
  })

  test("แก้ไขกิจกรรมแล้วชื่อเปลี่ยนทันที", async ({ page }) => {
    await gotoEvents(page)
    await openMainEvent(page)

    await page.getByRole("button", { name: "แก้ไข" }).click()
    const dialog = page.getByRole("dialog")
    await dialog.getByLabel("ชื่อกิจกรรม").fill("งานเลี้ยงประจำปี (แก้ไขแล้ว)")
    await dialog.getByRole("button", { name: "บันทึก" }).click()

    await expect(page.getByText("บันทึกการเปลี่ยนแปลงแล้ว")).toBeVisible()
    await expect(
      page.getByRole("heading", { level: 1, name: /แก้ไขแล้ว/ })
    ).toBeVisible()
  })
})

test.describe("Phase 3 — Event detail", () => {
  test("แสดงข้อมูลกิจกรรมและแท็บครบถ้วน", async ({ page }) => {
    await gotoEvents(page)
    await openMainEvent(page)

    await expect(
      page.getByRole("heading", { level: 1, name: /งานเลี้ยงประจำปีของบริษัท 2569/ })
    ).toBeVisible()
    await expect(page.getByText("ห้องแกรนด์บอลรูม โรงแรมเซ็นเตอร์พอยต์ ราชดำริ")).toBeVisible()
    await expect(page.getByText("เสร็จแล้ว 8 จาก 29 งาน")).toBeVisible()

    for (const tab of [
      "ภาพรวม",
      "งานของฉัน",
      "ไทม์ไลน์",
      "ไฟล์",
      "ผู้เข้าร่วม",
      "ประวัติการใช้งาน",
    ]) {
      await expect(page.getByRole("tab", { name: tab })).toBeVisible()
    }
  })

  test("เปิดแท็บประวัติการใช้งานแล้วเห็นความเคลื่อนไหวของกิจกรรมนี้", async ({
    page,
  }) => {
    await gotoEvents(page)
    await openMainEvent(page)

    await page.getByRole("tab", { name: "ประวัติการใช้งาน" }).click()
    await expect(page.getByTestId("recent-activity")).toBeVisible()
  })
})

test.describe("Phase 3 — Duplicate, cancel & delete", () => {
  test("คัดลอกกิจกรรมแล้วได้กิจกรรมใหม่ที่ความคืบหน้าเป็น 0%", async ({
    page,
  }) => {
    await gotoEvents(page)
    await openMainEvent(page)

    await page.getByTestId("event-actions").click()
    await page.getByRole("menuitem", { name: "คัดลอกกิจกรรม" }).click()

    await expect(page.getByText("ข้อมูลที่จะถูกคัดลอก")).toBeVisible()
    await expect(page.getByText("งานย่อย 29 งาน")).toBeVisible()
    await expect(page.getByText("รายชื่อผู้เข้าร่วมเดิม")).toBeVisible()

    await page.getByTestId("confirm-duplicate").click()

    await expect(page.getByText("คัดลอกกิจกรรมเรียบร้อยแล้ว")).toBeVisible()
    await expect(page).toHaveURL(/\/events\/e-\d+$/)
    await expect(
      page.getByRole("heading", { level: 1, name: /\(สำเนา\)/ })
    ).toBeVisible()
    await expect(page.getByText("เสร็จแล้ว 0 จาก 29 งาน")).toBeVisible()
  })

  test("ยกเลิกกิจกรรมต้องผ่านกล่องยืนยันก่อน", async ({ page }) => {
    await gotoEvents(page)
    await openMainEvent(page)

    await page.getByTestId("event-actions").click()
    await page.getByRole("menuitem", { name: "ยกเลิกกิจกรรม" }).click()

    await expect(page.getByText("ยืนยันการยกเลิกกิจกรรม")).toBeVisible()
    await expect(
      page.getByText("งานเลี้ยงประจำปีของบริษัท 2569", { exact: true })
    ).toBeVisible()

    await page.getByRole("button", { name: "ยกเลิกกิจกรรม" }).click()
    await expect(page.getByText("เปลี่ยนสถานะกิจกรรมแล้ว")).toBeVisible()
    await expect(page.getByText("ยกเลิก", { exact: true }).first()).toBeVisible()
  })

  test("ลบกิจกรรมแสดงผลกระทบและนำออกจากรายการ", async ({ page }) => {
    await gotoEvents(page)
    await openMainEvent(page)

    await page.getByTestId("event-actions").click()
    await page.getByTestId("delete-event").click()

    await expect(page.getByText("ยืนยันการลบกิจกรรม")).toBeVisible()
    await expect(page.getByText("งานย่อย 29 งานจะถูกซ่อนไปพร้อมกัน")).toBeVisible()
    await expect(
      page.getByText("รายชื่อผู้เข้าร่วม 90 คนจะไม่แสดงอีก")
    ).toBeVisible()

    await page.getByRole("button", { name: "ลบกิจกรรม" }).click()

    await expect(page.getByText("ลบกิจกรรมแล้ว")).toBeVisible()
    await page.waitForURL("**/events")
    await expect(page.getByText("พบ 5 กิจกรรม")).toBeVisible()
  })

  test("ไม่มี console error ตลอดการจัดการกิจกรรม", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })

    await gotoEvents(page)
    await openMainEvent(page)
    await page.getByRole("tab", { name: "ผู้เข้าร่วม" }).click()
    await page.getByRole("tab", { name: "ภาพรวม" }).click()
    await page.waitForLoadState("networkidle")

    expect(errors).toEqual([])
  })
})
