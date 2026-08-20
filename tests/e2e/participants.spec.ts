import path from "node:path"

import { expect, test, type Page } from "@playwright/test"

import { gotoRoute, signIn } from "./helpers"

const SAMPLE_FILE = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "samples",
  "participants-sample.xlsx"
)

async function gotoParticipants(page: Page) {
  await signIn(page)
  await gotoRoute(page, "participants")
  await expect(page.getByTestId("participant-summary")).toBeVisible()
}

test.describe("Phase 7 — Participants list", () => {
  test("แสดงการ์ดสรุปและตารางรายชื่อของงานเลี้ยงประจำปี", async ({ page }) => {
    await gotoParticipants(page)

    await expect(page.getByTestId("participant-summary-total")).toHaveText("90")
    await expect(page.getByTestId("participant-summary-attending")).toHaveText(
      "60"
    )
    await expect(
      page.getByTestId("participant-summary-notAttending")
    ).toHaveText("11")
    await expect(page.getByTestId("participant-summary-pending")).toHaveText(
      "19"
    )
    await expect(page.getByText("พบ 90 คน")).toBeVisible()
    await expect(page.getByTestId("participant-table")).toBeVisible()
  })

  test("ค้นหาและกรองรายชื่อ พร้อมชิปตัวกรองและล้างทั้งหมด", async ({ page }) => {
    await gotoParticipants(page)

    await page.getByTestId("participant-search").fill("กฤษณะ")
    await expect(page.getByText("พบ 1 คน")).toBeVisible()
    await page.getByTestId("participant-search").fill("")

    await page.getByLabel("ประเภทผู้เข้าร่วม", { exact: true }).click()
    await page.getByRole("option", { name: "ผู้บริหาร" }).click()
    await expect(page.getByText("พบ 6 คน")).toBeVisible()
    await expect(page.getByTestId("filter-chips")).toContainText("ผู้บริหาร")

    await page.getByLabel("สถานะตอบรับ", { exact: true }).click()
    await page.getByRole("option", { name: "เข้าร่วม", exact: true }).click()
    await expect(page.getByText("พบ 4 คน")).toBeVisible()

    await page.getByRole("button", { name: "ล้างทั้งหมด" }).click()
    await expect(page.getByText("พบ 90 คน")).toBeVisible()
  })

  test("เพิ่มรายชื่อใหม่ + ตรวจอีเมลซ้ำ", async ({ page }) => {
    await gotoParticipants(page)

    await page.getByTestId("add-participant").click()
    await page.getByLabel("ชื่อ", { exact: true }).fill("ทดสอบ")
    await page.getByLabel("นามสกุล", { exact: true }).fill("อีทูอี")
    // อีเมลซ้ำกับรายชื่อเดิม → ต้องเห็นข้อความเตือน
    await page
      .getByLabel("อีเมล", { exact: true })
      .fill("kritsana.b@company.co.th")
    await page.getByRole("button", { name: "เพิ่ม", exact: true }).click()
    await expect(
      page.getByText("อีเมลนี้มีอยู่ในรายชื่อของกิจกรรมแล้ว")
    ).toBeVisible()

    await page
      .getByLabel("อีเมล", { exact: true })
      .fill("test.e2e@company.co.th")
    await page.getByRole("button", { name: "เพิ่ม", exact: true }).click()
    await expect(page.getByText("เพิ่มผู้เข้าร่วมแล้ว")).toBeVisible()
    await expect(page.getByTestId("participant-summary-total")).toHaveText("91")
  })

  test("Bulk เปลี่ยนสถานะตอบรับพร้อมกล่องยืนยัน", async ({ page }) => {
    await gotoParticipants(page)

    await page.getByTestId("participant-search").fill("เกวลิน")
    await expect(page.getByText("พบ 3 คน")).toBeVisible()
    await page.getByTestId("select-all-participants").click()
    await expect(page.getByTestId("participant-bulk-bar")).toContainText(
      "เลือกแล้ว 3 รายการ"
    )

    await page.getByTestId("bulk-rsvp-trigger").click()
    await page
      .getByRole("menuitem", { name: "เข้าร่วม", exact: true })
      .click()
    await expect(
      page.getByText("ผู้เข้าร่วม 3 คนจะได้รับผลกระทบ")
    ).toBeVisible()
    await page.getByRole("button", { name: "ยืนยัน", exact: true }).click()

    await expect(page.getByText("เปลี่ยนสถานะตอบรับ 3 รายการแล้ว")).toBeVisible()
    // เดิม: เข้าร่วม 60 + เกวลินที่ยังไม่ตอบ/ตอบรับแล้วรวมเป็น 55
    await expect(page.getByTestId("participant-summary-attending")).toHaveText(
      "62"
    )
  })

  test("ลบรายชื่อจากเมนูแถวพร้อมกล่องยืนยัน", async ({ page }) => {
    await gotoParticipants(page)

    await page.getByTestId("participant-search").fill("กฤษณะ")
    await expect(page.getByText("พบ 1 คน")).toBeVisible()
    await page
      .getByRole("button", { name: /การดำเนินการ: กฤษณะ/ })
      .click()
    await page.getByRole("menuitem", { name: "ลบ", exact: true }).click()
    await expect(
      page.getByText("ผู้เข้าร่วม 1 คนจะถูกลบออกจากรายชื่อ")
    ).toBeVisible()
    await page.getByRole("button", { name: "ลบ", exact: true }).click()

    await expect(page.getByText("ลบ 1 รายชื่อแล้ว")).toBeVisible()
    await expect(page.getByTestId("participant-summary-total")).toHaveText("89")
  })
})

test.describe("Phase 7 — Excel import", () => {
  test("นำเข้าไฟล์ตัวอย่างครบทุกขั้น: error รายแถว → conflict → apply to all → ยืนยัน", async ({
    page,
  }) => {
    await gotoParticipants(page)

    await page.getByTestId("open-import").click()

    // ขั้น 1 — อัปโหลด
    await page
      .locator('input[type="file"][accept=".xlsx,.xls"]')
      .setInputFiles(SAMPLE_FILE)
    await expect(
      page.getByText("participants-sample.xlsx")
    ).toBeVisible()
    await page.getByTestId("wizard-next").click()

    // ขั้น 2 — mapping ถูกเดาให้ครบจากหัวตารางภาษาไทย
    await expect(page.getByTestId("mapping-firstName")).toContainText("ชื่อ")
    await expect(page.getByTestId("mapping-email")).toContainText("อีเมล")
    await page.getByTestId("wizard-next").click()

    // ขั้น 3 — ตรวจสอบข้อมูล: valid 5 / error 4 / conflict 2
    await expect(page.getByText("พร้อมนำเข้า 5 แถว")).toBeVisible()
    await expect(
      page.getByText("พบข้อผิดพลาด 4 แถว — แถวเหล่านี้จะถูกข้ามตอนนำเข้า")
    ).toBeVisible()
    await expect(
      page.getByText("อีเมลซ้ำกับรายชื่อเดิม 2 รายการ", { exact: false })
    ).toBeVisible()
    await expect(page.getByTestId("preview-row-error")).toHaveCount(4)
    await expect(
      page.getByText("นามสกุล: จำเป็นต้องกรอก")
    ).toBeVisible()
    await expect(
      page.getByText("อีเมล: รูปแบบอีเมลไม่ถูกต้อง")
    ).toBeVisible()
    await page.getByTestId("wizard-next").click()

    // ขั้น 4 — conflict: เลือกทั้งชุดเท่านั้น + apply to all
    await expect(page.getByTestId("conflict-progress")).toHaveText("1 จาก 2")
    await expect(page.getByText("ข้อมูลเดิมในระบบ")).toBeVisible()
    await expect(page.getByText("ข้อมูลใหม่จากไฟล์")).toBeVisible()
    // ปุ่มถัดไปของ wizard ถูกปิดจนกว่าจะเลือกครบ
    await expect(page.getByTestId("wizard-next")).toBeDisabled()

    await page.getByTestId("choose-new").click()
    await page.getByTestId("apply-to-all").click()
    await expect(page.getByTestId("wizard-next")).toBeEnabled()
    await page.getByTestId("wizard-next").click()

    // ขั้น 5 — สรุป: เพิ่มใหม่ 3 / อัปเดต 2 / ข้าม (error) 4
    await expect(page.getByTestId("summary-create")).toHaveText("3")
    await expect(page.getByTestId("summary-update")).toHaveText("2")
    await expect(page.getByTestId("summary-skip")).toHaveText("0")
    await expect(page.getByTestId("summary-error")).toHaveText("4")
    await page.getByTestId("wizard-confirm").click()

    await expect(
      page.getByText("นำเข้าสำเร็จ — เพิ่มใหม่ 3 คน อัปเดต 2 คน")
    ).toBeVisible()

    // ตารางและการ์ดสรุปอัปเดตทันที: 90 + 3 = 93, สมชายเปลี่ยนเป็นไม่เข้าร่วม (11 + เกศรา + สมชาย = 13)
    await expect(page.getByTestId("participant-summary-total")).toHaveText("93")
    await expect(
      page.getByTestId("participant-summary-notAttending")
    ).toHaveText("13")

    await page.getByTestId("participant-search").fill("สมหญิง")
    await expect(page.getByText("พบ 1 คน")).toBeVisible()
    await expect(
      page
        .getByTestId("participant-table")
        .getByText("somying.test@company.co.th")
    ).toBeVisible()
  })

  test("ไฟล์ที่ไม่ใช่ Excel ถูกปฏิเสธ", async ({ page }) => {
    await gotoParticipants(page)

    await page.getByTestId("open-import").click()
    await page
      .locator('input[type="file"][accept=".xlsx,.xls"]')
      .setInputFiles({
        name: "not-excel.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("hello"),
      })
    await expect(
      page.getByText("รองรับเฉพาะไฟล์ .xlsx และ .xls").first()
    ).toBeVisible()
    await expect(page.getByTestId("wizard-next")).toBeDisabled()
  })

  test("ดาวน์โหลด Template ได้ไฟล์จริง", async ({ page }) => {
    await gotoParticipants(page)

    await page.getByTestId("open-import").click()
    const downloadPromise = page.waitForEvent("download")
    await page.getByTestId("download-template").click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe(
      "eventflow-participants-template.xlsx"
    )
  })
})

test.describe("Phase 7 — Excel export", () => {
  test("ส่งออกรายชื่อเป็นไฟล์ Excel ได้จริง", async ({ page }) => {
    await gotoParticipants(page)

    await page.getByTestId("open-export").click()
    await expect(
      page.getByText("รายชื่อทั้งหมด (90 คน)")
    ).toBeVisible()

    const downloadPromise = page.waitForEvent("download")
    await page.getByTestId("confirm-export").click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe("eventflow-participants.xlsx")
    await expect(page.getByText("ส่งออกไฟล์แล้ว")).toBeVisible()
  })
})

test.describe("Phase 7 — Event detail tab", () => {
  test("แท็บผู้เข้าร่วมในหน้ากิจกรรมใช้ข้อมูลเดียวกัน", async ({ page }) => {
    await signIn(page)
    await gotoRoute(page, "events")
    await page
      .getByRole("link", { name: /งานเลี้ยงประจำปีของบริษัท 2569/ })
      .first()
      .click()
    await page.waitForURL("**/events/e-1")

    await page.getByRole("tab", { name: "ผู้เข้าร่วม" }).click()
    await expect(page.getByTestId("participant-summary-total")).toHaveText("90")
    // ในแท็บของกิจกรรมต้องไม่มีตัวเลือกกิจกรรมซ้ำ
    await expect(
      page.getByTestId("participant-event-select")
    ).toHaveCount(0)
  })
})
