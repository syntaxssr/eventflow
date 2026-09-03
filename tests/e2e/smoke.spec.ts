import { expect, test } from "@playwright/test"

test.describe("Design System", () => {
  test("หน้า Design System เปิดได้", async ({ page }) => {
    await page.goto("/design-system")

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

    // ต้องรอให้เมนูปิดสนิทก่อนกดซ้ำ ไม่งั้นคลิกจะตกไปในจังหวะที่เมนูกำลังปิดแล้วไม่เปิดใหม่
    await expect(page.getByRole("menu")).toBeHidden()

    await page.getByTestId("theme-toggle").click()
    await page.getByRole("menuitemradio", { name: "สว่าง" }).click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test("ธีมที่เลือกจำข้ามการรีเฟรชได้", async ({ page }) => {
    await page.goto("/design-system")

    const html = page.locator("html")

    await page.getByTestId("theme-toggle").click()
    await page.getByRole("menuitemradio", { name: "มืด" }).click()
    await expect(html).toHaveClass(/dark/)

    await page.reload()
    await expect(html).toHaveClass(/dark/)

    await page.getByTestId("theme-toggle").click()
    await page.getByRole("menuitemradio", { name: "สว่าง" }).click()
    await expect(html).not.toHaveClass(/dark/)

    await page.reload()
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
