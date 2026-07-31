import { expect, test } from "@playwright/test"

test.describe("Phase 0 — Design System smoke", () => {
  test("หน้าแรกเปิดได้และเข้าสู่ Design System ได้", async ({ page }) => {
    await page.goto("/")

    await expect(
      page.getByRole("heading", { level: 1, name: "EventFlow" })
    ).toBeVisible()

    await page.getByRole("link", { name: "เปิด Design System" }).click()

    await expect(page).toHaveURL(/\/design-system$/)
    await expect(
      page.getByRole("heading", { level: 1, name: "Design System" })
    ).toBeVisible()
  })

  test("สลับธีมได้จริง", async ({ page }) => {
    await page.goto("/design-system")

    const html = page.locator("html")

    await page.getByTestId("theme-toggle").click()
    await page.getByRole("menuitemradio", { name: "มืด" }).click()
    await expect(html).toHaveClass(/dark/)

    await page.getByTestId("theme-toggle").click()
    await page.getByRole("menuitemradio", { name: "สว่าง" }).click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test("สลับภาษาไทย/อังกฤษได้จริง", async ({ page }) => {
    await page.goto("/design-system")

    await expect(page.getByText("โทนสี", { exact: true })).toBeVisible()

    await page.getByTestId("language-toggle").click()
    await page.getByRole("menuitemradio", { name: "English" }).click()

    await expect(page.getByText("Colors", { exact: true })).toBeVisible()
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
  })

  test("ไม่มี console error ในหน้า Design System", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })

    await page.goto("/design-system")
    await page.waitForLoadState("networkidle")

    expect(errors).toEqual([])
  })
})
