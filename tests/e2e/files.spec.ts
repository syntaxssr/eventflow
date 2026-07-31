import { expect, test, type Page } from "@playwright/test"

import { signIn } from "./helpers"

async function gotoFiles(page: Page) {
  await signIn(page)
  await page
    .getByTestId("sidebar-nav")
    .getByRole("link", { name: "ไฟล์", exact: true })
    .click()
  await page.waitForURL("**/files")
  await expect(page.getByTestId("file-grid")).toBeVisible()
}

async function gotoTrash(page: Page) {
  await signIn(page)
  await page
    .getByTestId("sidebar-nav")
    .getByRole("link", { name: "ถังขยะ", exact: true })
    .click()
  await page.waitForURL("**/trash")
}

/** ไฟล์จำลองในหน่วยความจำ ไม่ต้องมีไฟล์จริงบนดิสก์ */
function fakeFile(name: string, sizeKb: number, mimeType: string) {
  return {
    name,
    mimeType,
    buffer: Buffer.alloc(sizeKb * 1024, 1),
  }
}

test.describe("Phase 6 — File list", () => {
  test("แสดงไฟล์ของกิจกรรมพร้อมหมวดหมู่และตัวกรอง", async ({ page }) => {
    await gotoFiles(page)

    await expect(page.getByText("พบ 10 ไฟล์")).toBeVisible()
    await expect(
      page.getByRole("button", { name: /สไลด์เปิดงาน Golden Night/ })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "กำหนดการ", exact: true })
    ).toBeVisible()
  })

  test("กรองตามหมวดหมู่และประเภทไฟล์ได้", async ({ page }) => {
    await gotoFiles(page)

    await page.getByRole("button", { name: "PowerPoint", exact: true }).click()
    await expect(page.getByTestId("filter-chips")).toContainText("PowerPoint")
    await expect(page.getByText("พบ 1 ไฟล์")).toBeVisible()

    await page.getByRole("button", { name: "ล้างทั้งหมด" }).click()
    await expect(page.getByText("พบ 10 ไฟล์")).toBeVisible()

    await page.getByLabel("ประเภทไฟล์").click()
    await page.getByRole("option", { name: "Excel" }).click()
    await expect(page.getByText("พบ 3 ไฟล์")).toBeVisible()
  })

  test("สลับเป็นมุมมองรายการได้", async ({ page }) => {
    await gotoFiles(page)

    await page.getByRole("button", { name: "มุมมองรายการ" }).click()
    await expect(page.getByTestId("file-list")).toBeVisible()
    await expect(page.getByRole("table")).toBeVisible()
  })

  test("เพิ่มหมวดหมู่ใหม่ได้", async ({ page }) => {
    await gotoFiles(page)

    await page.getByTestId("add-category").click()
    await page.getByLabel("ชื่อหมวดหมู่ใหม่").fill("เอกสารสัญญา")
    await page.getByTestId("confirm-add-category").click()

    await expect(page.getByText("เพิ่มหมวดหมู่แล้ว")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "เอกสารสัญญา", exact: true })
    ).toBeVisible()
  })
})

test.describe("Phase 6 — Upload", () => {
  test("อัปโหลดไฟล์สำเร็จแล้วเห็นในรายการ", async ({ page }) => {
    await gotoFiles(page)

    await page
      .getByTestId("file-input")
      .setInputFiles(
        fakeFile("แผนการตลาดใหม่.pdf", 120, "application/pdf")
      )

    await expect(page.getByTestId("upload-list")).toContainText("อัปโหลดสำเร็จ")
    await expect(page.getByText("อัปโหลดไฟล์เรียบร้อยแล้ว")).toBeVisible()
    await expect(page.getByText("พบ 11 ไฟล์")).toBeVisible()
    await expect(
      page.getByRole("button", { name: /แผนการตลาดใหม่\.pdf/ })
    ).toBeVisible()
  })

  test("ปฏิเสธไฟล์ที่ประเภทไม่รองรับ", async ({ page }) => {
    await gotoFiles(page)

    await page
      .getByTestId("file-input")
      .setInputFiles(fakeFile("วิดีโองาน.mp4", 10, "video/mp4"))

    await expect(
      page.getByText(/เป็นประเภทที่ระบบยังไม่รองรับ/)
    ).toBeVisible()
    await expect(page.getByText("พบ 10 ไฟล์")).toBeVisible()
  })

  test("อัปโหลดล้มเหลวแล้วกดลองใหม่ได้", async ({ page }) => {
    await gotoFiles(page)

    // สั่งให้การกระทำถัดไปล้มเหลวผ่านเครื่องมือทดสอบ
    await page.getByTestId("dev-tools-trigger").click()
    await page.getByLabel("ให้การกระทำถัดไปล้มเหลว").click()
    await page.keyboard.press("Escape")

    await page
      .getByTestId("file-input")
      .setInputFiles(fakeFile("รายงานสรุป.docx", 80, "application/msword"))

    await expect(page.getByTestId("upload-list")).toContainText("อัปโหลดไม่สำเร็จ")
    await expect(page.getByText("พบ 10 ไฟล์")).toBeVisible()

    await page.getByTestId("upload-retry").click()
    await expect(page.getByTestId("upload-list")).toContainText("อัปโหลดสำเร็จ")
    await expect(page.getByText("พบ 11 ไฟล์")).toBeVisible()
  })
})

test.describe("Phase 6 — File detail & versions", () => {
  test("เปิดรายละเอียดแล้วเห็นตัวอย่างและประวัติเวอร์ชัน", async ({ page }) => {
    await gotoFiles(page)

    await page
      .getByRole("button", { name: /สไลด์เปิดงาน Golden Night/ })
      .click()

    await expect(page.getByTestId("file-detail")).toBeVisible()
    await expect(page.getByText(/สไลด์ที่ 1 จาก 6/)).toBeVisible()

    await page.getByRole("tab", { name: /ประวัติเวอร์ชัน/ }).click()
    await expect(page.getByTestId("version-list")).toContainText("เวอร์ชันปัจจุบัน")
    await expect(page.getByTestId("version-list")).toContainText(
      "ใส่ภาพกิจกรรมตลอดปีและตัวเลขผลประกอบการ"
    )
  })

  test("กู้คืนเวอร์ชันเก่าแล้วได้เวอร์ชันใหม่โดยประวัติยังครบ", async ({ page }) => {
    await gotoFiles(page)

    await page
      .getByRole("button", { name: /สไลด์เปิดงาน Golden Night/ })
      .click()
    await page.getByRole("tab", { name: /ประวัติเวอร์ชัน/ }).click()
    await page.getByTestId("restore-version-1").click()

    await expect(page.getByText("ยืนยันการกู้คืนเวอร์ชัน")).toBeVisible()
    await expect(
      page.getByText(/สร้างเวอร์ชันปัจจุบันใหม่จากเนื้อหาของเวอร์ชันที่เลือก/)
    ).toBeVisible()

    await page.getByRole("button", { name: "กู้คืนเวอร์ชันนี้" }).last().click()

    await expect(page.getByText("กู้คืนเวอร์ชันแล้ว")).toBeVisible()
    await expect(page.getByRole("tab", { name: /ประวัติเวอร์ชัน \(3\)/ })).toBeVisible()
    await expect(page.getByTestId("version-list")).toContainText(
      "กู้คืนจากเวอร์ชัน 1"
    )
  })

  test("เปลี่ยนชื่อไฟล์ได้", async ({ page }) => {
    await gotoFiles(page)

    await page.getByRole("button", { name: /Script พิธีกร \(ร่าง\)/ }).click()
    await page.getByRole("button", { name: "เปลี่ยนชื่อ" }).click()
    await page.getByLabel("ชื่อไฟล์ใหม่").fill("Script พิธีกร (ฉบับสมบูรณ์).docx")
    await page.getByRole("button", { name: "บันทึก" }).click()

    await expect(page.getByText("เปลี่ยนชื่อไฟล์แล้ว")).toBeVisible()

    // ปิดกล่องรายละเอียดก่อน เพราะ Radix ซ่อนเนื้อหาด้านหลังจาก accessibility tree
    await expect(page.getByTestId("file-detail")).toContainText(
      "Script พิธีกร (ฉบับสมบูรณ์).docx"
    )
    await page
      .getByTestId("file-detail")
      .getByRole("button", { name: "Close" })
      .click()
    await expect(page.getByTestId("file-detail")).toBeHidden()
    await expect(
      page.getByRole("button", { name: /Script พิธีกร \(ฉบับสมบูรณ์\)/ })
    ).toBeVisible()
  })

  test("ลบไฟล์แล้วไปอยู่ในถังขยะ", async ({ page }) => {
    await gotoFiles(page)

    await page.getByRole("button", { name: /ผังที่นั่งและผังห้องจัดงาน/ }).click()
    await page.getByTestId("delete-file").click()

    await expect(page.getByText("ยืนยันการย้ายไฟล์ไปถังขยะ")).toBeVisible()
    await page.getByRole("button", { name: "ลบไฟล์" }).last().click()

    await expect(page.getByText("ย้ายไฟล์ไปถังขยะแล้ว")).toBeVisible()
    await expect(page.getByText("พบ 9 ไฟล์")).toBeVisible()

    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "ถังขยะ", exact: true })
      .click()
    await expect(page.getByTestId("trash-table")).toContainText(
      "ผังที่นั่งและผังห้องจัดงาน"
    )
  })
})

test.describe("Phase 6 — Trash", () => {
  test("แสดงไฟล์ที่ถูกลบพร้อมวันคงเหลือ", async ({ page }) => {
    await gotoTrash(page)

    await expect(page.getByText("พบ 5 ไฟล์ในถังขยะ")).toBeVisible()
    await expect(page.getByTestId("trash-table")).toContainText(/เหลืออีก \d+ วัน/)
    await expect(page.getByTestId("trash-table")).toContainText("ใกล้ถูกลบถาวร")
  })

  test("กู้คืนไฟล์จากถังขยะได้", async ({ page }) => {
    await gotoTrash(page)

    await page.getByTestId("restore-f-16").click()
    await expect(page.getByText("ยืนยันการกู้คืนไฟล์")).toBeVisible()
    await page.getByRole("button", { name: "กู้คืน", exact: true }).last().click()

    await expect(page.getByText("กู้คืนไฟล์เรียบร้อยแล้ว")).toBeVisible()
    await expect(page.getByText("พบ 4 ไฟล์ในถังขยะ")).toBeVisible()
  })

  test("ลบถาวรต้องผ่านกล่องยืนยันที่บอกผลกระทบ", async ({ page }) => {
    await gotoTrash(page)

    await page.getByTestId("purge-f-17").click()

    await expect(page.getByText("ยืนยันการลบถาวร")).toBeVisible()
    await expect(page.getByText(/ประวัติเวอร์ชัน 1 เวอร์ชันจะหายไปด้วย/)).toBeVisible()

    await page.getByRole("button", { name: "ลบถาวร" }).last().click()
    await expect(page.getByText("ลบไฟล์ถาวรแล้ว")).toBeVisible()
    await expect(page.getByText("พบ 4 ไฟล์ในถังขยะ")).toBeVisible()
  })

  test("ไม่มี console error ตลอดการใช้งานไฟล์และถังขยะ", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })

    await gotoFiles(page)
    await page.getByRole("button", { name: "มุมมองรายการ" }).click()
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "ถังขยะ", exact: true })
      .click()
    await page.waitForLoadState("networkidle")

    expect(errors).toEqual([])
  })
})
