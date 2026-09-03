import { expect, test, type Page } from "@playwright/test"

import { gotoRoute, type AppRoute } from "./helpers"

const DEMO_EMAIL = "alisa.l@company.co.th"
const DEMO_PASSWORD = "eventflow"

async function signIn(page: Page, rememberMe = true) {
  await page.goto("/login")
  await page.getByLabel("อีเมลองค์กร", { exact: true }).fill(DEMO_EMAIL)
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(DEMO_PASSWORD)
  await page.getByLabel("จดจำฉันไว้", { exact: true }).setChecked(rememberMe)
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click()
  await page.waitForURL("**/dashboard")
}

test.describe("Phase 1 — Authentication", () => {
  test("หน้าแรกส่งต่อไปหน้า Login", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByRole("heading", { level: 1, name: "ยินดีต้อนรับกลับมา" })
    ).toBeVisible()
  })

  test("แสดง validation เมื่อส่งฟอร์มเปล่า", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click()

    await expect(page.getByText("กรุณากรอกอีเมล")).toBeVisible()
    await expect(page.getByText("กรุณากรอกรหัสผ่าน")).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test("แสดง validation เมื่อรูปแบบอีเมลไม่ถูกต้อง", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("อีเมลองค์กร", { exact: true }).fill("not-an-email")
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill(DEMO_PASSWORD)
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click()

    await expect(page.getByText("รูปแบบอีเมลไม่ถูกต้อง")).toBeVisible()
  })

  test("ผูก error message เข้ากับช่องกรอกเพื่อ screen reader", async ({
    page,
  }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click()

    const email = page.getByLabel("อีเมลองค์กร", { exact: true })
    await expect(email).toHaveAttribute("aria-invalid", "true")

    const describedBy = await email.getAttribute("aria-describedby")
    expect(describedBy).toBeTruthy()
    await expect(
      page.locator(`#${describedBy!.split(" ").pop()}`)
    ).toHaveText("กรุณากรอกอีเมล")
  })

  test("แจ้งเตือนเมื่ออีเมลหรือรหัสผ่านไม่ถูกต้อง", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("อีเมลองค์กร", { exact: true }).fill(DEMO_EMAIL)
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill("wrong-password")
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click()

    await expect(page.getByTestId("login-error")).toContainText(
      "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
    )
    await expect(page).toHaveURL(/\/login$/)
  })

  test("ปุ่มแสดง/ซ่อนรหัสผ่านทำงาน", async ({ page }) => {
    await page.goto("/login")
    const password = page.getByLabel("รหัสผ่าน", { exact: true })
    await expect(password).toHaveAttribute("type", "password")

    await page.getByRole("button", { name: "แสดงรหัสผ่าน" }).click()
    await expect(password).toHaveAttribute("type", "text")

    await page.getByRole("button", { name: "ซ่อนรหัสผ่าน" }).click()
    await expect(password).toHaveAttribute("type", "password")
  })

  test("บัญชีทดลองกรอกฟอร์มให้อัตโนมัติแล้วเข้าสู่ระบบได้", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: /บัญชีทดลองใช้งาน/ }).click()
    const accountDialog = page.getByRole("dialog", { name: "บัญชีทดลองใช้งาน" })
    await expect(accountDialog).toBeVisible()
    await expect(accountDialog.getByRole("button", { name: /ใช้บัญชีนี้: นุ่น/ })).toBeVisible()
    await accountDialog.getByRole("button", { name: /ใช้บัญชีนี้: นุ่น/ }).click()

    await expect(page.getByLabel("อีเมลองค์กร", { exact: true })).toHaveValue(DEMO_EMAIL)
    await expect(page.getByLabel("รหัสผ่าน", { exact: true })).toHaveValue(DEMO_PASSWORD)

    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByTestId("user-menu")).toContainText("อลิสา ลีลายุวัฒนกุล")
  })

  test("เข้าหน้าภายในระบบโดยยังไม่ login จะถูกส่งกลับหน้า Login", async ({
    page,
  }) => {
    await page.goto("/events")
    await expect(page).toHaveURL(/\/login$/)
  })

  test("จดจำฉันไว้เป็นค่าเริ่มต้นและ refresh แล้วยังคงเข้าสู่ระบบ", async ({
    page,
  }) => {
    await page.goto("/login")
    await expect(page.getByLabel("จดจำฉันไว้", { exact: true })).toBeChecked()

    await signIn(page)
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("eventflow.session")))
      .not.toBeNull()
    await page.reload()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByTestId("user-menu")).toContainText(
      "อลิสา ลีลายุวัฒนกุล"
    )
  })

  test("ไม่เลือกจดจำฉันไว้แล้ว refresh จะกลับหน้า Login", async ({ page }) => {
    await signIn(page, false)
    await page.reload()
    await expect(page).toHaveURL(/\/login$/)
  })

  test("ออกจากระบบกลับไปหน้า Login", async ({ page }) => {
    await signIn(page)
    await page.getByTestId("user-menu").click()
    await page.getByTestId("sign-out").click()
    await expect(page).toHaveURL(/\/login$/)
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("eventflow.session")))
      .toBeNull()
  })
})

test.describe("Phase 1 — Application Shell", () => {
  test("สลับผู้ใช้ได้โดยไม่ต้อง login ใหม่", async ({ page }) => {
    await signIn(page)
    await expect(page.getByTestId("user-menu")).toContainText("อลิสา ลีลายุวัฒนกุล")

    await page.getByTestId("user-menu").click()
    await page.getByTestId("switch-user-trigger").click()
    await page
      .getByRole("menuitemradio", { name: /หฤทัย ทิพยประไพ/ })
      .click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByTestId("user-menu")).toContainText(
      "หฤทัย ทิพยประไพ"
    )
  })

  test("ทุกเมนูใน Sidebar เปิดได้", async ({ page }) => {
    await signIn(page)
    const nav = page.getByTestId("sidebar-nav")

    // Sidebar เหลือแค่ 3 เมนูหลัก หน้าที่เหลือเข้าทางการ์ด/เมนูอื่น (ดูเทสต์ถัดไป)
    const links = [
      { name: "กิจกรรม", url: /\/events$/ },
      { name: "ถังขยะ", url: /\/trash$/ },
      { name: "แดชบอร์ด", url: /\/dashboard$/ },
    ]

    for (const link of links) {
      const item = nav.getByRole("link", { name: link.name, exact: true })
      await expect(item).toBeVisible()
      await item.click()
      await expect(page).toHaveURL(link.url)
    }
  })

  test("เมนูเบ็ดเตล็ดคลี่แล้วเข้าหน้าย่อยได้ครบ", async ({ page }) => {
    await signIn(page)
    const nav = page.getByTestId("sidebar-nav")
    const group = nav.getByTestId("nav-group-misc")

    await expect(group).toBeVisible()
    await expect(group).toHaveAttribute("aria-expanded", "false")
    await group.click()
    await expect(group).toHaveAttribute("aria-expanded", "true")

    const links = [
      { name: "HR Section", url: /\/hr-section$/ },
      { name: "เกมส์", url: /\/games$/ },
      { name: "แบบฟอร์ม RSVP", url: /\/rsvp-form$/ },
    ]

    for (const link of links) {
      const item = nav.getByRole("link", { name: link.name, exact: true })
      await expect(item).toBeVisible()
      await item.click()
      await expect(page).toHaveURL(link.url)
      await expect(item).toHaveAttribute("aria-current", "page")
      // เข้าหน้าย่อยแล้วกลุ่มต้องยังคลี่อยู่ ไม่พับกลับ
      await expect(group).toHaveAttribute("aria-expanded", "true")
    }

    // เมนูแม่ต้องไม่ถูกนับเป็นลิงก์ — เทสต์เดิมที่ไล่คลิกลิงก์ 3 อันจึงยังใช้ได้
    await expect(nav.getByRole("link", { name: "เบ็ดเตล็ด" })).toHaveCount(0)
  })

  test("ทุกหน้าหลักเปิดได้จากทางเข้าจริงในแอป", async ({ page }) => {
    await signIn(page)

    // ตรวจว่า "ไปถึงได้" เท่านั้น — หัวข้อของแต่ละหน้ามีเทสต์ของตัวเองอยู่แล้ว
    // (และบางหน้า เช่น กิจกรรม ออกแบบใหม่ให้ไม่มีหัวเรื่อง h1)
    const pages: { route: AppRoute; url: RegExp }[] = [
      { route: "events", url: /\/events$/ },
      { route: "myTasks", url: /\/my-tasks$/ },
      { route: "files", url: /\/files$/ },
      { route: "timeline", url: /\/timeline$/ },
      { route: "participants", url: /\/participants/ },
      { route: "notifications", url: /\/notifications$/ },
      { route: "activity", url: /\/activity$/ },
      { route: "trash", url: /\/trash$/ },
      { route: "employees", url: /\/hr-section$/ },
      { route: "games", url: /\/games$/ },
      { route: "rsvpForm", url: /\/rsvp-form$/ },
      { route: "profile", url: /\/profile$/ },
      { route: "dashboard", url: /\/dashboard$/ },
    ]

    for (const item of pages) {
      await gotoRoute(page, item.route)
      await expect(page).toHaveURL(item.url)
    }
  })

  test("เมนูที่กำลังใช้งานถูกทำเครื่องหมายด้วย aria-current", async ({
    page,
  }) => {
    await signIn(page)
    const nav = page.getByTestId("sidebar-nav")

    await nav.getByRole("link", { name: "กิจกรรม", exact: true }).click()
    await expect(
      nav.getByRole("link", { name: "กิจกรรม", exact: true })
    ).toHaveAttribute("aria-current", "page")
    await expect(
      nav.getByRole("link", { name: "แดชบอร์ด", exact: true })
    ).not.toHaveAttribute("aria-current", "page")
  })

  test("ย่อและขยาย Sidebar ได้", async ({ page }) => {
    await signIn(page)
    const sidebar = page.locator('[data-slot="sidebar"]').first()
    await expect(sidebar).toHaveAttribute("data-state", "expanded")

    const trigger = page.locator('[data-sidebar="trigger"]')
    await trigger.click()
    await expect(sidebar).toHaveAttribute("data-state", "collapsed")

    await trigger.click()
    await expect(sidebar).toHaveAttribute("data-state", "expanded")
  })

  test("สลับภาษาแล้วเมนูเปลี่ยนตาม", async ({ page }) => {
    await signIn(page)
    await page.getByTestId("language-toggle").click()
    await page.getByRole("menuitemradio", { name: "English" }).click()

    const nav = page.getByTestId("sidebar-nav")
    await expect(nav.getByRole("link", { name: "Dashboard" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Events" })).toBeVisible()
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
  })

  test("ภาษาที่เลือกจำข้ามการรีเฟรชได้", async ({ page }) => {
    await signIn(page)
    await page.getByTestId("language-toggle").click()
    await page.getByRole("menuitemradio", { name: "English" }).click()
    await expect(page.locator("html")).toHaveAttribute("lang", "en")

    await page.reload()
    await expect(page.locator("html")).toHaveAttribute("lang", "en")

    await page.getByTestId("language-toggle").click()
    await page.getByRole("menuitemradio", { name: "ไทย" }).click()
    await expect(page.locator("html")).toHaveAttribute("lang", "th")

    await page.reload()
    await expect(page.locator("html")).toHaveAttribute("lang", "th")
  })

  test("เครื่องมือทดสอบสั่งให้การกระทำถัดไปล้มเหลวได้", async ({ page }) => {
    await page.goto("/login")

    await page.getByTestId("dev-tools-trigger").click()
    await page.getByLabel("ให้การกระทำถัดไปล้มเหลว").click()
    await page.keyboard.press("Escape")

    await page.getByLabel("อีเมลองค์กร", { exact: true }).fill(DEMO_EMAIL)
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill(DEMO_PASSWORD)
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click()

    await expect(page.getByTestId("login-error")).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test("ไม่มี console error ตลอด main flow", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })

    await signIn(page)
    await gotoRoute(page, "events")
    await gotoRoute(page, "files")
    await page.waitForLoadState("networkidle")

    expect(errors).toEqual([])
  })
})
