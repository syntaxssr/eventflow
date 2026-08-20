import { expect, test, type Page } from "@playwright/test"

import { gotoRoute, signIn } from "./helpers"

async function gotoMyTasks(page: Page) {
  await signIn(page)
  await gotoRoute(page, "myTasks")
  await expect(page.getByTestId("task-table")).toBeVisible()
}

async function useTeamScope(page: Page) {
  await page.getByTestId("scope-select").click()
  await page.getByRole("option", { name: "งานทั้งทีม" }).click()
}

async function openTask(page: Page, name: RegExp) {
  await page.getByRole("button", { name }).first().click()
  await expect(page.getByTestId("task-detail")).toBeVisible()
}

test.describe("Phase 4 — Task views", () => {
  test("แสดงงานของฉันและสลับดูงานทั้งทีมได้", async ({ page }) => {
    await gotoMyTasks(page)

    const mineCount = await page.getByText(/พบ \d+ งาน/).innerText()
    await useTeamScope(page)
    const allCount = await page.getByText(/พบ \d+ งาน/).innerText()

    expect(Number(allCount.replace(/\D/g, ""))).toBeGreaterThan(
      Number(mineCount.replace(/\D/g, ""))
    )
  })

  test("สลับสามมุมมองแล้วเห็นข้อมูลชุดเดียวกัน", async ({ page }) => {
    await gotoMyTasks(page)

    await page.getByRole("button", { name: "มุมมองคัมบัง" }).click()
    await expect(page.getByTestId("task-kanban")).toBeVisible()
    await expect(page.getByTestId("kanban-column-completed")).toBeVisible()

    await page.getByRole("button", { name: "มุมมองปฏิทิน" }).click()
    await expect(page.getByTestId("task-calendar")).toBeVisible()

    await page.getByRole("button", { name: "มุมมองตาราง" }).click()
    await expect(page.getByTestId("task-table")).toBeVisible()
  })

  test("ลากการ์ดใน Kanban แล้วสถานะเปลี่ยนตามในมุมมองตาราง", async ({
    page,
  }) => {
    await gotoMyTasks(page)
    await useTeamScope(page)

    await page.getByRole("button", { name: "มุมมองคัมบัง" }).click()
    await expect(page.getByTestId("task-kanban")).toBeVisible()

    // ใช้การ์ดใบบนสุดของทั้งสองคอลัมน์ เพื่อให้อยู่ในจอเสมอไม่ว่าจะสูงเท่าไร
    const card = page
      .getByTestId("kanban-column-not_started")
      .locator("article")
      .first()
    const targetCard = page
      .getByTestId("kanban-column-in_progress")
      .locator("article")
      .first()

    const movingTitle = (await card.innerText()).split("\n")[0].trim()

    await card.scrollIntoViewIfNeeded()
    const from = await card.boundingBox()
    const to = await targetCard.boundingBox()
    if (!from || !to) throw new Error("ไม่พบตำแหน่งของการ์ดต้นทางหรือปลายทาง")

    // dnd-kit เริ่มลากเมื่อขยับเกิน 6px จึงต้องขยับเป็นหลายก้าวและเว้นจังหวะ
    await page.mouse.move(from.x + from.width / 2, from.y + 12)
    await page.mouse.down()
    await page.mouse.move(from.x + from.width / 2, from.y + 40, { steps: 8 })
    await page.waitForTimeout(150)
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 15 })
    await page.waitForTimeout(200)
    await page.mouse.up()

    await expect(page.getByText(/ย้าย .* ไปยัง กำลังดำเนินการ/)).toBeVisible()
    await expect(
      page.getByTestId("kanban-column-in_progress").getByText(movingTitle)
    ).toBeVisible()

    // มุมมองตารางต้องเห็นสถานะใหม่ทันที เพราะใช้ข้อมูลชุดเดียวกัน
    await page.getByRole("button", { name: "มุมมองตาราง" }).click()
    const row = page
      .getByTestId("task-table")
      .getByRole("row")
      .filter({ hasText: movingTitle })
    await expect(row).toContainText("กำลังดำเนินการ")
  })

  test("กรองตามสถานะแล้วแสดง chip และล้างได้", async ({ page }) => {
    await gotoMyTasks(page)
    await useTeamScope(page)

    const before = Number(
      (await page.getByText(/พบ \d+ งาน/).innerText()).replace(/\D/g, "")
    )

    await page.getByTestId("task-status-filter").click()
    await page.getByRole("menuitemcheckbox", { name: "งานติดขัด" }).click()
    await page.keyboard.press("Escape")

    await expect(page.getByTestId("filter-chips")).toContainText("งานติดขัด")
    const after = Number(
      (await page.getByText(/พบ \d+ งาน/).innerText()).replace(/\D/g, "")
    )
    expect(after).toBeLessThan(before)

    await page.getByRole("button", { name: "ล้างทั้งหมด" }).click()
    await expect(page.getByTestId("filter-chips")).toBeHidden()
  })

  test("กรองเฉพาะงานเกินกำหนดแล้วทุกแถวมีป้ายเกินกำหนด", async ({ page }) => {
    await gotoMyTasks(page)
    await useTeamScope(page)

    await page.getByLabel("กำหนดส่ง").click()
    await page.getByRole("option", { name: "เกินกำหนด" }).click()

    const rows = page.getByTestId("task-table").getByRole("row")
    const count = await rows.count()
    expect(count).toBeGreaterThan(1)

    for (let index = 1; index < count; index += 1) {
      await expect(rows.nth(index)).toContainText("เกินกำหนด")
    }
  })
})

test.describe("Phase 4 — Checklist", () => {
  test("ติ๊ก Checklist ครบแล้วงานเปลี่ยนเป็นเสร็จสิ้นอัตโนมัติ", async ({
    page,
  }) => {
    await gotoMyTasks(page)
    await useTeamScope(page)
    await openTask(page, /ออกแบบโปสเตอร์ประชาสัมพันธ์/)

    await expect(page.getByTestId("checklist-progress")).toHaveText("2/4")

    const boxes = page.getByTestId("checklist").getByRole("checkbox")
    const total = await boxes.count()
    for (let index = 0; index < total; index += 1) {
      const box = boxes.nth(index)
      if ((await box.getAttribute("data-state")) !== "checked") {
        await box.click()
        await expect(page.getByTestId("save-indicator").first()).toBeVisible()
      }
    }

    await expect(page.getByTestId("checklist-progress")).toHaveText("4/4")
    await expect(
      page.getByText("ติ๊กรายการตรวจสอบครบแล้ว งานนี้ถูกทำเครื่องหมายว่าเสร็จสิ้น")
    ).toBeVisible()
    await expect(page.getByTestId("task-status-select")).toContainText("เสร็จสิ้น")
  })

  test("ยกเลิก Checklist หนึ่งข้อแล้วงานกลับเป็นกำลังดำเนินการ", async ({
    page,
  }) => {
    await gotoMyTasks(page)
    await useTeamScope(page)
    await openTask(page, /ออกแบบโปสเตอร์ประชาสัมพันธ์/)

    const boxes = page.getByTestId("checklist").getByRole("checkbox")
    const total = await boxes.count()
    for (let index = 0; index < total; index += 1) {
      const box = boxes.nth(index)
      if ((await box.getAttribute("data-state")) !== "checked") await box.click()
    }
    await expect(page.getByTestId("task-status-select")).toContainText("เสร็จสิ้น")

    await boxes.first().click()
    await expect(page.getByTestId("task-status-select")).toContainText(
      "กำลังดำเนินการ"
    )
  })

  test("เพิ่มรายการตรวจสอบใหม่ได้", async ({ page }) => {
    await gotoMyTasks(page)
    await useTeamScope(page)
    await openTask(page, /ออกแบบโปสเตอร์ประชาสัมพันธ์/)

    await page.getByTestId("checklist-input").fill("ตรวจไฟล์ก่อนส่งโรงพิมพ์")
    await page.getByTestId("checklist-add").click()

    await expect(page.getByTestId("checklist-progress")).toHaveText("2/5")
    await expect(
      page.getByTestId("checklist").getByText("ตรวจไฟล์ก่อนส่งโรงพิมพ์")
    ).toBeVisible()
  })

  test("ความคืบหน้าของกิจกรรมอัปเดตตามหลังติ๊ก Checklist ครบ", async ({
    page,
  }) => {
    await gotoMyTasks(page)
    await useTeamScope(page)
    await openTask(page, /ออกแบบโปสเตอร์ประชาสัมพันธ์/)

    const boxes = page.getByTestId("checklist").getByRole("checkbox")
    const total = await boxes.count()
    for (let index = 0; index < total; index += 1) {
      const box = boxes.nth(index)
      if ((await box.getAttribute("data-state")) !== "checked") await box.click()
    }
    await expect(page.getByTestId("task-status-select")).toContainText("เสร็จสิ้น")

    await page.keyboard.press("Escape")
    await gotoRoute(page, "dashboard")
    // เดิมเสร็จ 8 จาก 29 งาน — ติ๊ก checklist ครบทำให้เพิ่มเป็น 9
    await expect(page.getByText("เสร็จแล้ว 9 จาก 29 งาน")).toBeVisible()
  })
})

test.describe("Phase 4 — Dependency & status", () => {
  test("งานที่ถูกบล็อกแสดงงานที่ต้องรอ และเตือนก่อนเริ่ม", async ({ page }) => {
    await gotoMyTasks(page)
    await useTeamScope(page)
    await openTask(page, /จัดทำป้ายชื่อผู้เข้าร่วม/)

    await expect(page.getByTestId("task-dependencies")).toContainText(
      "สรุปรายชื่อผู้เข้าร่วมทั้งหมด"
    )

    await page.getByTestId("task-status-select").click()
    await page.getByRole("option", { name: "กำลังดำเนินการ" }).click()

    await expect(page.getByText("งานนี้ยังติดขัดอยู่")).toBeVisible()
    await page.getByRole("button", { name: "เริ่มงานนี้เลย" }).click()

    await expect(page.getByTestId("task-status-select")).toContainText(
      "กำลังดำเนินการ"
    )
  })

  test("ตัวเลือกงานที่ต้องเสร็จก่อนไม่มีงานที่ทำให้เกิดวงกลม", async ({ page }) => {
    await gotoMyTasks(page)
    await useTeamScope(page)
    await openTask(page, /ส่งไฟล์อาร์ตเวิร์กให้โรงพิมพ์/)

    await page.getByTestId("dependency-select").click()

    // ตัวงานเอง และงานที่รองานนี้อยู่ ต้องไม่อยู่ในตัวเลือก
    await expect(
      page.getByRole("option", { name: "ส่งไฟล์อาร์ตเวิร์กให้โรงพิมพ์" })
    ).toBeHidden()
    await expect(
      page.getByRole("option", { name: "สรุปธีมงานและคอนเซปต์" })
    ).toBeVisible()
  })

  test("เพิ่มและนำความสัมพันธ์ระหว่างงานออกได้", async ({ page }) => {
    await gotoMyTasks(page)
    await useTeamScope(page)
    await openTask(page, /ประสานงานรถรับส่งพนักงาน/)

    await expect(page.getByText("ไม่มีงานที่ต้องรอ")).toBeVisible()

    await page.getByTestId("dependency-select").click()
    await page.getByRole("option", { name: "จองสถานที่จัดงานและยืนยันสัญญา" }).click()
    await page.getByTestId("dependency-add").click()

    await expect(page.getByText("เพิ่มความสัมพันธ์ระหว่างงานแล้ว")).toBeVisible()
    await expect(page.getByTestId("task-dependencies")).toContainText(
      "จองสถานที่จัดงานและยืนยันสัญญา"
    )
  })

  test("เปลี่ยนสถานะจากรายละเอียดงานแล้วตารางอัปเดตตาม", async ({ page }) => {
    await gotoMyTasks(page)
    await useTeamScope(page)
    await openTask(page, /ประสานงานทีมถ่ายภาพและวิดีโอ/)

    await page.getByTestId("task-status-select").click()
    await page.getByRole("option", { name: "รอตรวจสอบ" }).click()
    await expect(page.getByText("เปลี่ยนสถานะงานแล้ว")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.getByTestId("task-detail")).toBeHidden()

    const row = page
      .getByTestId("task-table")
      .getByRole("row")
      .filter({ hasText: "ประสานงานทีมถ่ายภาพและวิดีโอ" })
    await expect(row).toContainText("รอตรวจสอบ")
  })
})

test.describe("Phase 4 — Create & delete", () => {
  test("เพิ่มงานใหม่แล้วเห็นในตาราง", async ({ page }) => {
    await gotoMyTasks(page)

    await page.getByTestId("create-task").click()
    const dialog = page.getByRole("dialog")
    await dialog.getByLabel("ชื่องาน").fill("ทดสอบเพิ่มงานใหม่")
    await dialog.getByLabel("กำหนดส่ง").fill("2026-09-10")
    await dialog.getByRole("button", { name: "บันทึก" }).click()

    await expect(page.getByText("เพิ่มงานเรียบร้อยแล้ว")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "ทดสอบเพิ่มงานใหม่" })
    ).toBeVisible()
  })

  test("แสดง validation เมื่อไม่กรอกชื่องานและกำหนดส่ง", async ({ page }) => {
    await gotoMyTasks(page)

    await page.getByTestId("create-task").click()
    await page.getByRole("dialog").getByRole("button", { name: "บันทึก" }).click()

    await expect(page.getByText("กรุณากรอกชื่องาน")).toBeVisible()
    await expect(page.getByText("กรุณาเลือกกำหนดส่ง")).toBeVisible()
  })

  test("ลบงานต้องผ่านกล่องยืนยันที่บอกผลกระทบ", async ({ page }) => {
    await gotoMyTasks(page)
    await useTeamScope(page)
    await openTask(page, /สรุปรายชื่อผู้เข้าร่วมทั้งหมด/)

    await page.getByTestId("delete-task").click()

    await expect(page.getByText("ยืนยันการลบงาน")).toBeVisible()
    await expect(
      page.getByText("งาน 1 งานที่รองานนี้อยู่จะไม่ติดขัดอีกต่อไป")
    ).toBeVisible()

    await page.getByRole("button", { name: "ลบ", exact: true }).click()
    await expect(page.getByText("ลบงานแล้ว")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "สรุปรายชื่อผู้เข้าร่วมทั้งหมด" })
    ).toBeHidden()
  })

  test("ไม่มี console error ตลอดการใช้งานหน้างาน", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })

    await gotoMyTasks(page)
    await useTeamScope(page)
    await page.getByRole("button", { name: "มุมมองคัมบัง" }).click()
    await page.getByRole("button", { name: "มุมมองปฏิทิน" }).click()
    await page.getByRole("button", { name: "มุมมองตาราง" }).click()
    await page.waitForLoadState("networkidle")

    expect(errors).toEqual([])
  })
})
