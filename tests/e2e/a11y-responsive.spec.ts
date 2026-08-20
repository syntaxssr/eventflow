import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

import { gotoRoute, signIn, type AppRoute } from "./helpers"

/** เส้นทางหลักทั้งหมดที่ต้องตรวจ (ตาม concept ข้อ 6) */
const MAIN_ROUTES: { path: string; route: AppRoute }[] = [
  { path: "/dashboard", route: "dashboard" },
  { path: "/events", route: "events" },
  { path: "/my-tasks", route: "myTasks" },
  { path: "/files", route: "files" },
  { path: "/timeline", route: "timeline" },
  { path: "/participants", route: "participants" },
  { path: "/notifications", route: "notifications" },
  { path: "/activity", route: "activity" },
  { path: "/trash", route: "trash" },
  { path: "/profile", route: "profile" },
]

async function gotoAndSettle(page: Page, route: AppRoute) {
  await gotoRoute(page, route)
  // รอ simulated loading ของหน้าจบก่อนสแกน
  await page.waitForTimeout(1500)
}

/**
 * รอให้ toast หายไปก่อนสแกน
 *
 * toast ต้อนรับหลัง login จะค่อย ๆ จางหายไปเอง ระหว่างจางอยู่ opacity ไม่เต็ม
 * axe จึงคำนวณ contrast จากสีที่ถูกผสมกับพื้นหลังแล้วรายงานผลไม่คงที่
 * (contrast ของ toast ตอนแสดงเต็มผ่าน AA แล้ว — ตรวจแยกไว้ต่างหาก)
 */
async function waitForToastsToClear(page: Page) {
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0, {
    timeout: 15_000,
  })
}

test.describe("Phase 10 — Accessibility (axe)", () => {
  test("หน้า Login ไม่มี violation ระดับ serious/critical", async ({ page }) => {
    await page.goto("/login")
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()
    const severe = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? "")
    )
    expect(
      severe.map((violation) => `${violation.id}: ${violation.description}`)
    ).toEqual([])
  })

  for (const route of MAIN_ROUTES) {
    test(`หน้า ${route.path} ไม่มี violation ระดับ serious/critical`, async ({
      page,
    }) => {
      await signIn(page)
      await gotoAndSettle(page, route.route)
      await waitForToastsToClear(page)

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
      const severe = results.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact ?? "")
      )
      expect(
        severe.map(
          (violation) =>
            `${violation.id} (${violation.nodes.length} nodes): ${violation.description}`
        )
      ).toEqual([])
    })
  }

  test("Dialog ตั้งค่าการแจ้งเตือนไม่มี violation ระดับ serious/critical", async ({
    page,
  }) => {
    await signIn(page)
    await gotoRoute(page, "profile")
    await waitForToastsToClear(page)
    await page.getByTestId("open-notification-settings").click()
    await expect(
      page.getByTestId("notification-settings-dialog")
    ).toBeVisible()

    // สแกนเฉพาะ dialog — เนื้อหาหลังฉาก overlay ถูกหรี่ลง axe จึงวัด contrast
    // ของมันเพี้ยน (หน้าที่อยู่เบื้องหลังถูกตรวจแยกไว้ในเทสต์ของแต่ละ route แล้ว)
    const results = await new AxeBuilder({ page })
      .include('[data-testid="notification-settings-dialog"]')
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()
    const severe = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? "")
    )
    expect(
      severe.map(
        (violation) =>
          `${violation.id} (${violation.nodes.length} nodes): ${violation.description}`
      )
    ).toEqual([])
  })

  test("Toast ขณะแสดงเต็มมี contrast ผ่าน AA", async ({ page }) => {
    // signIn จบเมื่อถึง /dashboard — toast ต้อนรับยังแสดงอยู่ตอนนั้น
    await signIn(page)
    const toast = page.locator("[data-sonner-toast]").first()
    await expect(toast).toBeVisible()
    // รอ animation เข้าจบ เพื่อวัดสีจริงไม่ใช่สีระหว่างจาง
    await page.waitForTimeout(600)
    await expect(toast).toBeVisible()

    const results = await new AxeBuilder({ page })
      .include("[data-sonner-toaster]")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()
    const severe = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? "")
    )
    expect(
      severe.map((violation) => `${violation.id}: ${violation.description}`)
    ).toEqual([])
  })

  test("หน้ารายละเอียดกิจกรรมไม่มี violation ระดับ serious/critical", async ({
    page,
  }) => {
    await signIn(page)
    await gotoRoute(page, "events")
    await page
      .getByRole("link", { name: /งานเลี้ยงประจำปีของบริษัท 2569/ })
      .first()
      .click()
    await page.waitForURL("**/events/e-1")
    await page.waitForTimeout(1500)
    await waitForToastsToClear(page)

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()
    const severe = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? "")
    )
    expect(
      severe.map(
        (violation) =>
          `${violation.id} (${violation.nodes.length} nodes): ${violation.description}`
      )
    ).toEqual([])
  })
})

test.describe("Phase 10 — Responsive & no horizontal overflow", () => {
  for (const width of [360, 414, 768, 1024, 1280, 1920]) {
    test(`ไม่มี horizontal overflow ที่ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await signIn(page)

      for (const route of MAIN_ROUTES) {
        if (width < 768) {
          // mobile ไม่มี sidebar — ใช้ bottom nav + more sheet ไม่ต้องไล่ครบทุกหน้า
          break
        }
        await gotoAndSettle(page, route.route)
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth
        )
        expect(overflow, `${route.path} @${width}px`).toBeLessThanOrEqual(1)
      }

      if (width < 768) {
        // Mobile: bottom nav แสดง และแต่ละหน้าหลักไม่ overflow
        // วัดหน้าแรก (dashboard) ก่อนเพราะอยู่ที่นั่นแล้วหลัง login
        await expect(page.getByTestId("bottom-nav")).toBeVisible()
        for (const path of ["/dashboard", "/events", "/notifications"]) {
          if (path !== "/dashboard") {
            await page.getByTestId("bottom-nav").locator(`a[href="${path}"]`).click()
            await page.waitForURL(`**${path}`)
          }
          await page.waitForTimeout(1200)
          const overflow = await page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth
          )
          expect(overflow, `${path} @${width}px`).toBeLessThanOrEqual(1)
        }
      }
    })
  }

  test("ไม่มีการใช้ localStorage / sessionStorage เลย", async ({ page }) => {
    await signIn(page)
    await gotoRoute(page, "events")

    const storage = await page.evaluate(() => ({
      local: Object.keys(window.localStorage),
      session: Object.keys(window.sessionStorage),
    }))
    expect(storage.local).toEqual([])
    // dev server ของ Next เขียน `__next_*` เอง (ไม่มีใน production) — แอปต้องไม่เขียนคีย์ของตัวเอง
    expect(
      storage.session.filter((key) => !key.startsWith("__next"))
    ).toEqual([])
  })

  test("refresh แล้วข้อมูลกลับเป็น Mock เริ่มต้นและต้อง login ใหม่", async ({
    page,
  }) => {
    await signIn(page)
    await page.reload()
    await page.waitForURL("**/login")
    await expect(page.getByLabel("อีเมลองค์กร", { exact: true })).toBeVisible()
  })
})
