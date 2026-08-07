import { expect, test, type Page } from "@playwright/test"

import { signIn } from "./helpers"

/** เปิดงานจากหน้า My Tasks ด้วยชื่องาน — สลับเป็นงานทั้งทีมได้เมื่องานไม่ใช่ของผู้ใช้ */
async function openTask(page: Page, title: RegExp, scope: "mine" | "all" = "mine") {
  await page
    .getByTestId("sidebar-nav")
    .getByRole("link", { name: "งานของฉัน", exact: true })
    .click()
  await page.waitForURL("**/my-tasks")
  if (scope === "all") {
    await page.getByTestId("scope-select").click()
    await page.getByRole("option", { name: "งานทั้งทีม" }).click()
  }
  await page.getByRole("button", { name: title }).first().click()
  await expect(page.getByTestId("task-detail")).toBeVisible()
}

async function switchUser(page: Page, name: RegExp) {
  // ปิด sheet/dialog ที่อาจค้างอยู่ก่อน เพื่อให้คลิกเมนูบน topbar ได้
  await page.keyboard.press("Escape")
  await page.getByTestId("user-menu").click()
  await page.getByTestId("switch-user-trigger").click()
  await page.getByRole("menuitemradio", { name }).click()
  await expect(page.getByTestId("user-menu")).toContainText(name)
}

test.describe("Phase 8 — Comment thread", () => {
  test("แสดง thread เดิม: mention highlight, edited indicator, reaction", async ({
    page,
  }) => {
    await signIn(page)
    await openTask(page, /จัดทำลำดับพิธีการ/)

    const section = page.getByTestId("comment-section")
    await expect(section.getByRole("heading", { level: 3 })).toContainText(
      "ความคิดเห็น (3)"
    )
    await expect(section.getByTestId("comment-item")).toHaveCount(3)
    await expect(
      section.getByTestId("mention-highlight").first()
    ).toContainText("@อัณชวิศศ์ ปาร์มวงศ์")
    await expect(section.getByText("แก้ไขแล้ว").first()).toBeVisible()
    await expect(section.getByTestId("reaction-chip").first()).toBeVisible()
  })

  test("reply ใน thread และแก้ไขความคิดเห็นของตัวเอง", async ({ page }) => {
    await signIn(page)
    await openTask(page, /ส่งไฟล์อาร์ตเวิร์กให้โรงพิมพ์/, "all")

    const section = page.getByTestId("comment-section")
    await expect(section.getByTestId("comment-item")).toHaveCount(3)

    // ตอบกลับความคิดเห็นแรก
    await section.getByTestId("reply-comment").first().click()
    await expect(section.getByText(/กำลังตอบกลับ/)).toBeVisible()
    const replyInput = section.locator('[data-testid$="-input"]').last()
    await replyInput.fill("รับทราบ เดี๋ยวตามงานให้ครับ")
    await section.locator('[data-testid$="-submit"]').last().click()
    await expect(page.getByText("เพิ่มความคิดเห็นแล้ว")).toBeVisible()
    await expect(section.getByTestId("comment-item")).toHaveCount(4)

    // แก้ไขความคิดเห็นของตัวเอง (u-1 คือเจ้าของ c-2)
    await section.getByTestId("edit-comment").first().click()
    await expect(section.getByText("กำลังแก้ไขความคิดเห็น")).toBeVisible()
    const editInput = section.locator('textarea').first()
    await editInput.fill("อัปเดต: ยืนยันขนาดแบ็คดรอป 6x3 เมตรแล้วนะคะ")
    await section.locator('[data-testid$="-submit"]').first().click()
    await expect(page.getByText("แก้ไขความคิดเห็นแล้ว")).toBeVisible()
    await expect(
      section.getByText("อัปเดต: ยืนยันขนาดแบ็คดรอป 6x3 เมตรแล้วนะคะ")
    ).toBeVisible()
  })

  test("ลบความคิดเห็นพร้อม reply ผ่านกล่องยืนยัน", async ({ page }) => {
    await signIn(page)
    await openTask(page, /ส่งไฟล์อาร์ตเวิร์กให้โรงพิมพ์/, "all")

    const section = page.getByTestId("comment-section")
    await expect(section.getByTestId("comment-item")).toHaveCount(3)

    // u-1 เป็นเจ้าของ c-2 ซึ่งมี reply 1 รายการ (c-3)
    await section.getByTestId("delete-comment").first().click()
    await expect(page.getByText("ยืนยันการลบความคิดเห็น")).toBeVisible()
    await expect(
      page.getByText("การตอบกลับ 1 รายการจะถูกลบไปด้วย")
    ).toBeVisible()
    await page.getByRole("button", { name: "ลบ", exact: true }).click()
    await expect(page.getByText("ลบความคิดเห็นแล้ว")).toBeVisible()
    await expect(section.getByTestId("comment-item")).toHaveCount(1)
  })

  test("กด reaction สลับได้และมี aria-pressed", async ({ page }) => {
    await signIn(page)
    await openTask(page, /จัดทำลำดับพิธีการ/)

    const chip = page.getByTestId("reaction-chip").first()
    await expect(chip).toHaveAttribute("aria-pressed", "false")
    await expect(chip).toContainText("1")

    await chip.click()
    await expect(chip).toHaveAttribute("aria-pressed", "true")
    await expect(chip).toContainText("2")

    await chip.click()
    await expect(chip).toHaveAttribute("aria-pressed", "false")
    await expect(chip).toContainText("1")
  })

  test("แนบไฟล์ในความคิดเห็น (validation แบบเดียวกับ Phase 6)", async ({
    page,
  }) => {
    await signIn(page)
    await openTask(page, /จัดทำลำดับพิธีการ/)

    const section = page.getByTestId("comment-section")

    // ไฟล์ประเภทที่ไม่รองรับถูกปฏิเสธ
    await section
      .locator('input[type="file"]')
      .first()
      .setInputFiles({
        name: "notes.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("hello"),
      })
    await expect(page.getByText(/เป็นประเภทที่ระบบยังไม่รองรับ/)).toBeVisible()

    // ไฟล์ Excel แนบได้
    await section.locator('input[type="file"]').first().setInputFiles({
      name: "rundown-v3.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.alloc(120 * 1024, 1),
    })
    await expect(section.getByText("rundown-v3.xlsx").first()).toBeVisible()

    await section
      .getByTestId("new-comment-input")
      .fill("แนบ Run Down เวอร์ชันล่าสุดครับ")
    await section.getByTestId("new-comment-submit").click()
    await expect(page.getByText("เพิ่มความคิดเห็นแล้ว")).toBeVisible()
    await expect(
      section.getByTestId("comment-attachment").filter({ hasText: "rundown-v3.xlsx" })
    ).toBeVisible()
  })
})

test.describe("Phase 8 — Mention & notifications", () => {
  test("comment → mention → switch user → เห็น notification → คลิกไปที่งาน", async ({
    page,
  }) => {
    await signIn(page)
    await openTask(page, /จัดทำลำดับพิธีการ/)

    const section = page.getByTestId("comment-section")
    const input = section.getByTestId("new-comment-input")
    await input.fill("ฝากตรวจสคริปต์ช่วงเปิดงานด้วยนะ @หฤ")
    // autocomplete ต้องเปิดและเลือกด้วยเมาส์ได้
    await expect(section.getByTestId("new-comment-mention-list")).toBeVisible()
    await page.getByRole("option", { name: /หฤทัย ทิพยประไพ/ }).click()
    await expect(input).toHaveValue(/@หฤทัย ทิพยประไพ/)

    await section.getByTestId("new-comment-submit").click()
    await expect(page.getByText("เพิ่มความคิดเห็นแล้ว")).toBeVisible()
    await expect(
      section.getByTestId("mention-highlight").filter({
        hasText: "@หฤทัย ทิพยประไพ",
      })
    ).toBeVisible()

    // สลับเป็นผู้ถูก mention แล้วต้องเห็นการแจ้งเตือนทันที
    await switchUser(page, /หฤทัย ทิพยประไพ/)
    await page.getByTestId("notification-bell").click()

    const dropdown = page.getByTestId("notification-dropdown")
    const mentionItem = dropdown
      .locator('[data-testid="notification-item"][data-unread]')
      .filter({ hasText: "มีคนกล่าวถึงคุณในความคิดเห็น" })
      .filter({ hasText: "จัดทำลำดับพิธีการ" })
    await expect(mentionItem).toBeVisible()

    await mentionItem.click()
    await page.waitForURL("**/my-tasks")

    // คลิกแล้วถูกทำเครื่องหมายว่าอ่าน
    await page.getByTestId("notification-bell").click()
    await expect(
      page
        .getByTestId("notification-dropdown")
        .locator('[data-testid="notification-item"][data-unread]')
        .filter({ hasText: "จัดทำลำดับพิธีการ" })
    ).toHaveCount(0)
  })

  test("ปิดรับ mention ใน settings แล้วต้องไม่เกิดการแจ้งเตือนใหม่", async ({
    page,
  }) => {
    // หฤทัยปิดการแจ้งเตือนประเภท mention ของตัวเอง
    await signIn(page, "haruthai.t@company.co.th")
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "ตั้งค่าการแจ้งเตือน", exact: true })
      .click()
    await page.waitForURL("**/settings/notifications")
    await page.getByTestId("setting-mention").click()
    await expect(page.getByTestId("setting-mention")).toHaveAttribute(
      "data-state",
      "unchecked"
    )

    // อลิสา mention หฤทัยในความคิดเห็น
    await switchUser(page, /อลิสา ลีลายุวัฒนกุล/)
    await openTask(page, /จัดทำลำดับพิธีการ/)
    const section = page.getByTestId("comment-section")
    await section.getByTestId("new-comment-input").fill("ทดสอบปิดแจ้งเตือน @หฤ")
    await page.getByRole("option", { name: /หฤทัย ทิพยประไพ/ }).click()
    await section.getByTestId("new-comment-submit").click()
    await expect(page.getByText("เพิ่มความคิดเห็นแล้ว")).toBeVisible()

    // กลับมาเป็นหฤทัย — จำนวนแจ้งเตือน "ถูกกล่าวถึง" ต้องเท่ากับ mock เดิม (1)
    await switchUser(page, /หฤทัย ทิพยประไพ/)
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "การแจ้งเตือน", exact: true })
      .click()
    await page.waitForURL("**/notifications")
    await page.getByLabel("ประเภทการแจ้งเตือน").click()
    await page.getByRole("option", { name: "ถูกกล่าวถึง" }).click()
    await expect(page.getByText("พบ 1 รายการ")).toBeVisible()
    await expect(
      page.getByTestId("notification-list").getByText("จัดทำลำดับพิธีการ")
    ).toHaveCount(0)
  })

  test("หน้า Notifications: กรองตามประเภท/สถานะ และ Mark all as read", async ({
    page,
  }) => {
    await signIn(page)
    await page.getByTestId("notification-bell").click()
    await page.getByTestId("bell-view-all").click()
    await page.waitForURL("**/notifications")

    // กรองยังไม่อ่าน
    await page.getByLabel("สถานะการอ่าน").click()
    await page.getByRole("option", { name: "ยังไม่อ่าน", exact: true }).click()
    const unreadBefore = await page
      .locator('[data-testid="notification-item"]')
      .count()
    expect(unreadBefore).toBeGreaterThan(0)

    // อ่านทั้งหมด → รายการที่ยังไม่อ่านหมดไป และกระดิ่งไม่มี badge
    await page.getByTestId("mark-all-read").click()
    await expect(
      page.getByText("ทำเครื่องหมายว่าอ่านทั้งหมดแล้ว")
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="notification-item"]')
    ).toHaveCount(0)
    await expect(page.getByTestId("notification-bell")).toHaveAttribute(
      "aria-label",
      "ไม่มีการแจ้งเตือนใหม่"
    )
  })

  test("Settings แสดงสถานะบันทึกอัตโนมัติเมื่อสลับปุ่ม", async ({ page }) => {
    await signIn(page)
    await page
      .getByTestId("sidebar-nav")
      .getByRole("link", { name: "ตั้งค่าการแจ้งเตือน", exact: true })
      .click()
    await page.waitForURL("**/settings/notifications")

    await page.getByTestId("setting-dueSoon").click()
    await expect(page.getByTestId("save-indicator")).toBeVisible()
    await expect(page.getByTestId("setting-dueSoon")).toHaveAttribute(
      "data-state",
      "unchecked"
    )
  })
})
