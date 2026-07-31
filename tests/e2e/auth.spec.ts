import { expect, test, type Page } from "@playwright/test"

const DEMO_EMAIL = "paweena.s@company.co.th"
const DEMO_PASSWORD = "eventflow"

async function signIn(page: Page) {
  await page.goto("/login")
  await page.getByLabel("อีเมลองค์กร", { exact: true }).fill(DEMO_EMAIL)
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(DEMO_PASSWORD)
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click()
  await page.waitForURL("**/dashboard")
}

test.describe("Phase 1 — Authentication", () => {
  test("หน้าแรกส่งต่อไปหน้า Login", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByRole("heading", { level: 1, name: "เข้าสู่ระบบ" })
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
    await page.getByRole("button", { name: "ใช้บัญชีนี้" }).first().click()

    await expect(page.getByLabel("อีเมลองค์กร", { exact: true })).toHaveValue(DEMO_EMAIL)
    await expect(page.getByLabel("รหัสผ่าน", { exact: true })).toHaveValue(DEMO_PASSWORD)

    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByTestId("user-menu")).toContainText("ปวีณา ศรีสุวรรณ")
  })

  test("เข้าหน้าภายในระบบโดยยังไม่ login จะถูกส่งกลับหน้า Login", async ({
    page,
  }) => {
    await page.goto("/events")
    await expect(page).toHaveURL(/\/login$/)
  })

  test("refresh แล้ว session หายและกลับไปหน้า Login (ตามข้อกำหนด Prototype)", async ({
    page,
  }) => {
    await signIn(page)
    await page.reload()
    await expect(page).toHaveURL(/\/login$/)
  })

  test("ออกจากระบบกลับไปหน้า Login", async ({ page }) => {
    await signIn(page)
    await page.getByTestId("user-menu").click()
    await page.getByTestId("sign-out").click()
    await expect(page).toHaveURL(/\/login$/)
  })
})

test.describe("Phase 1 — Application Shell", () => {
  test("สลับผู้ใช้ได้โดยไม่ต้อง login ใหม่", async ({ page }) => {
    await signIn(page)
    await expect(page.getByTestId("user-menu")).toContainText("ปวีณา ศรีสุวรรณ")

    await page.getByTestId("user-menu").click()
    await page.getByTestId("switch-user-trigger").click()
    await page
      .getByRole("menuitemradio", { name: /ธนกฤต วงศ์อนันต์/ })
      .click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByTestId("user-menu")).toContainText(
      "ธนกฤต วงศ์อนันต์"
    )
  })

  test("ทุกเมนูใน Sidebar เปิดได้", async ({ page }) => {
    await signIn(page)
    const nav = page.getByTestId("sidebar-nav")

    const routes = [
      { name: "กิจกรรม", url: /\/events$/ },
      { name: "งานของฉัน", url: /\/my-tasks$/ },
      { name: "ไฟล์", url: /\/files$/ },
      { name: "ไทม์ไลน์", url: /\/timeline$/ },
      { name: "ผู้เข้าร่วม", url: /\/participants$/ },
      { name: "การแจ้งเตือน", url: /\/notifications$/ },
      { name: "ประวัติการใช้งาน", url: /\/activity$/ },
      { name: "ถังขยะ", url: /\/trash$/ },
      { name: "โปรไฟล์", url: /\/profile$/ },
      { name: "ตั้งค่าการแจ้งเตือน", url: /\/settings\/notifications$/ },
      { name: "แดชบอร์ด", url: /\/dashboard$/ },
    ]

    for (const route of routes) {
      const link = nav.getByRole("link", { name: route.name, exact: true })
      await expect(link).toBeVisible()
      await link.click()
      await page.waitForURL(route.url)
      await expect(
        page.getByRole("heading", { level: 1, name: route.name })
      ).toBeVisible()
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
    await expect(nav.getByRole("link", { name: "My Tasks" })).toBeVisible()
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
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
    const nav = page.getByTestId("sidebar-nav")
    await nav.getByRole("link", { name: "กิจกรรม", exact: true }).click()
    await nav.getByRole("link", { name: "ไฟล์", exact: true }).click()
    await page.waitForLoadState("networkidle")

    expect(errors).toEqual([])
  })
})
