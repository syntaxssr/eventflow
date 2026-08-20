import path from "node:path"

import { expect, test } from "@playwright/test"

import { gotoRoute, signIn } from "./helpers"

const SAMPLE_FILE = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "samples",
  "participants-sample.xlsx"
)

/**
 * Main Flow 15 ขั้นตาม concept ข้อ 33 — เดินต่อเนื่องใน session เดียว
 * (ข้อมูลอยู่ใน memory การ refresh จะรีเซ็ต จึงห้ามแบ่งเป็นหลาย test)
 */
test("Main Flow: login → สร้างกิจกรรม → งาน+checklist → ไฟล์ → timeline → comment/mention → notification → import → export", async ({
  page,
}) => {
  test.setTimeout(420_000)

  /* ---- 1. Login ---- */
  await signIn(page)

  /* ---- 2. สร้างกิจกรรมใหม่ ---- */
  await gotoRoute(page, "events")
  await page.getByTestId("create-event").click()

  const eventDialog = page.getByRole("dialog")
  await eventDialog.getByLabel("ชื่อกิจกรรม").fill("งานสัมมนาประจำไตรมาส Q4")
  await eventDialog.getByLabel("วันที่เริ่มต้น").fill("2026-11-20")
  await eventDialog.getByLabel("วันที่สิ้นสุด").fill("2026-11-20")
  await eventDialog.getByLabel("สถานที่").fill("ห้องประชุมใหญ่ สำนักงานใหญ่")
  await eventDialog.getByRole("button", { name: "บันทึก" }).click()
  await expect(page.getByText("สร้างกิจกรรมเรียบร้อยแล้ว")).toBeVisible()

  await page
    .getByRole("link", { name: /งานสัมมนาประจำไตรมาส Q4/ })
    .first()
    .click()
  await page.waitForURL("**/events/*")

  /* ---- 3.–4. เพิ่มงานย่อย + ผู้รับผิดชอบหลายคน ---- */
  await page.getByRole("tab", { name: "งานของฉัน" }).click()
  await page.getByTestId("create-task").click()

  const taskDialog = page.getByRole("dialog")
  await taskDialog.getByLabel("ชื่องาน").fill("เตรียมเอกสารประกอบสัมมนา")
  await taskDialog.getByLabel("กำหนดส่ง").fill("2026-11-10")
  // ผู้รับผิดชอบ 3 คน (อลิสาถูกเลือกไว้เป็นค่าเริ่มต้น)
  await taskDialog.getByLabel(/หฤทัย ทิพยประไพ/).check()
  await taskDialog.getByLabel(/กิตติคุณ เจริญพานิช/).check()
  await taskDialog.getByRole("button", { name: "บันทึก" }).click()
  await expect(page.getByText("เพิ่มงานเรียบร้อยแล้ว")).toBeVisible()

  /* ---- 5. เพิ่ม Checklist ---- */
  await page
    .getByRole("button", { name: "เตรียมเอกสารประกอบสัมมนา" })
    .first()
    .click()
  const detail = page.getByTestId("task-detail")
  await expect(detail).toBeVisible()

  await page.getByTestId("checklist-input").fill("รวบรวมสไลด์จากวิทยากร")
  await page.getByTestId("checklist-add").click()
  await expect(page.getByTestId("checklist-progress")).toHaveText("0/1")
  await page.getByTestId("checklist-input").fill("จัดพิมพ์เอกสารแจกผู้เข้าร่วม")
  await page.getByTestId("checklist-add").click()
  await expect(page.getByTestId("checklist-progress")).toHaveText("0/2")

  /* ---- 6.–7. ติ๊ก Checklist จนครบ → งานเสร็จอัตโนมัติ ---- */
  // ใช้ click + รอ assertion แทน check() เพราะสถานะเปลี่ยนหลัง simulated delay
  const boxes = page.getByTestId("checklist").getByRole("checkbox")
  await boxes.nth(0).click()
  await expect(boxes.nth(0)).toBeChecked()
  await boxes.nth(1).click()
  await expect(boxes.nth(1)).toBeChecked()
  await expect(
    page.getByText("ติ๊กรายการตรวจสอบครบแล้ว งานนี้ถูกทำเครื่องหมายว่าเสร็จสิ้น")
  ).toBeVisible()
  await expect(page.getByTestId("task-status-select")).toContainText("เสร็จสิ้น")
  await page.keyboard.press("Escape")

  /* ---- 8. Event Progress อัปเดตทันที ---- */
  await page.getByRole("tab", { name: "ภาพรวม" }).click()
  await expect(page.getByText("100%").first()).toBeVisible()
  await expect(page.getByText("เสร็จแล้ว 1 จาก 1 งาน")).toBeVisible()

  /* ---- 9. Upload File ---- */
  await page.getByRole("tab", { name: "ไฟล์" }).click()
  await page.getByTestId("file-input").setInputFiles({
    name: "กำหนดการสัมมนา Q4.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(96 * 1024, 1),
  })
  await expect(page.getByTestId("upload-list")).toContainText("อัปโหลดสำเร็จ")
  await expect(
    page.getByRole("button", { name: /กำหนดการสัมมนา Q4\.pdf/ })
  ).toBeVisible()

  /* ---- 10. Add Timeline ---- */
  await page.getByRole("tab", { name: "ไทม์ไลน์" }).click()
  await page.getByTestId("create-timeline").click()
  const timelineDialog = page.getByRole("dialog")
  await timelineDialog.getByLabel("ชื่อรายการ").fill("ลงทะเบียนหน้างาน")
  await timelineDialog.getByLabel("วันที่").fill("2026-11-20")
  await timelineDialog.getByLabel("เวลาเริ่ม").fill("08:30")
  await timelineDialog.getByLabel("เวลาสิ้นสุด").fill("09:00")
  await timelineDialog.getByLabel("สถานที่").fill("หน้าห้องประชุมใหญ่")
  await timelineDialog.getByLabel(/อลิสา ลีลายุวัฒนกุล/).check()
  await timelineDialog.getByRole("button", { name: "บันทึก" }).click()
  await expect(page.getByText("เพิ่มรายการไทม์ไลน์แล้ว")).toBeVisible()
  await expect(page.getByTestId("timeline-phase-during")).toContainText(
    "ลงทะเบียนหน้างาน"
  )

  /* ---- 11. Comment และ Mention ---- */
  await page.getByRole("tab", { name: "งานของฉัน" }).click()
  await page
    .getByRole("button", { name: "เตรียมเอกสารประกอบสัมมนา" })
    .first()
    .click()
  await expect(page.getByTestId("task-detail")).toBeVisible()

  const commentInput = page.getByTestId("new-comment-input")
  await commentInput.fill("เอกสารพร้อมแล้ว ฝากตรวจอีกรอบนะ @หฤ")
  await page.getByRole("option", { name: /หฤทัย ทิพยประไพ/ }).click()
  await expect(commentInput).toHaveValue(/@หฤทัย ทิพยประไพ/)
  await page.getByTestId("new-comment-submit").click()
  await expect(page.getByText("เพิ่มความคิดเห็นแล้ว")).toBeVisible()
  await page.keyboard.press("Escape")

  /* ---- 12. เปิด Notification (ในมุมมองผู้ถูก mention) ---- */
  await page.getByTestId("user-menu").click()
  await page.getByTestId("switch-user-trigger").click()
  await page.getByRole("menuitemradio", { name: /หฤทัย ทิพยประไพ/ }).click()
  await expect(page.getByTestId("user-menu")).toContainText("หฤทัย ทิพยประไพ")

  await page.getByTestId("notification-bell").click()
  const mentionItem = page
    .getByTestId("notification-dropdown")
    .locator('[data-testid="notification-item"][data-unread]')
    .filter({ hasText: "มีคนกล่าวถึงคุณในความคิดเห็น" })
    .filter({ hasText: "เตรียมเอกสารประกอบสัมมนา" })
  await expect(mentionItem).toBeVisible()
  await page.keyboard.press("Escape")

  /* ---- 13.–14. Import Participants + Resolve Duplicate Email ---- */
  await gotoRoute(page, "participants")
  // กิจกรรมที่สร้างใหม่อยู่บนสุดของรายการ — เลือกงานเลี้ยงประจำปีที่มีรายชื่อเดิม
  await page.getByTestId("participant-event-select").click()
  await page
    .getByRole("option", { name: /งานเลี้ยงประจำปีของบริษัท 2569/ })
    .click()
  await expect(page.getByTestId("participant-summary-total")).toHaveText("90")

  await page.getByTestId("open-import").click()
  await page
    .locator('input[type="file"][accept=".xlsx,.xls"]')
    .setInputFiles(SAMPLE_FILE)
  await expect(page.getByText("participants-sample.xlsx")).toBeVisible()
  await page.getByTestId("wizard-next").click()
  await page.getByTestId("wizard-next").click() // mapping ถูกเดาให้ครบแล้ว

  await expect(page.getByText("พร้อมนำเข้า 5 แถว")).toBeVisible()
  await page.getByTestId("wizard-next").click()

  // Conflict Resolution — เลือกใช้ข้อมูลใหม่ทั้งชุดกับทุกรายการ
  await expect(page.getByTestId("conflict-progress")).toHaveText("1 จาก 2")
  await page.getByTestId("choose-new").click()
  await page.getByTestId("apply-to-all").click()
  await page.getByTestId("wizard-next").click()

  await expect(page.getByTestId("summary-create")).toHaveText("3")
  await expect(page.getByTestId("summary-update")).toHaveText("2")
  await page.getByTestId("wizard-confirm").click()
  await expect(
    page.getByText("นำเข้าสำเร็จ — เพิ่มใหม่ 3 คน อัปเดต 2 คน")
  ).toBeVisible()
  await expect(page.getByTestId("participant-summary-total")).toHaveText("93")

  /* ---- 15. Export PDF ---- */
  await gotoRoute(page, "events")
  await page
    .getByRole("link", { name: /งานเลี้ยงประจำปีของบริษัท 2569/ })
    .first()
    .click()
  await page.waitForURL("**/events/e-1")

  await page.getByTestId("open-event-export").click()
  const downloadPromise = page.waitForEvent("download")
  await page.getByTestId("confirm-event-export").click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe("eventflow-e-1-summary.pdf")
  await expect(page.getByText("ส่งออกไฟล์แล้ว")).toBeVisible()
})
