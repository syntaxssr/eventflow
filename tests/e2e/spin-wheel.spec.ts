import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { signIn } from "./helpers"

async function openSpinWheel(page: Parameters<typeof signIn>[0]) {
  await signIn(page)
  await page.goto("/games/spin-wheel")
  await expect(page.getByTestId("wheel-card")).toBeVisible()
}

test.describe("Spin wheel", () => {
  test("ซ่อนหัวเรื่องเดิมและแสดงเวทีวงล้อโดยไม่มีเส้นคั่น", async ({ page }) => {
    await openSpinWheel(page)

    await expect(
      page.getByRole("heading", { level: 1, name: "เกมส์วงล้อ" })
    ).toHaveClass(/sr-only/)
    await expect(
      page.getByText(
        "สุ่มชื่อผู้โชคดีหรือรางวัลในวันงาน — โหลดรายชื่อจากทะเบียนพนักงานหรือผู้ตอบรับกิจกรรม แล้วแก้ไขได้ตามใจ"
      )
    ).toHaveCount(0)
  })

  test("โหลดรายชื่อแล้วหมุนและประกาศผู้ชนะได้ในโหมดลดการเคลื่อนไหว", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await openSpinWheel(page)

    await page.getByTestId("load-names").click()
    await expect(page.getByTestId("spin-wheel")).toBeVisible()
    await expect(page.getByTestId("wheel-pointer-artwork")).toBeVisible()
    await expect(
      page.getByTestId("wheel-entries").getByRole("listitem")
    ).toHaveCount(117)

    await page.getByTestId("spin-button").click()
    await expect(page.getByTestId("winner-dialog")).toBeVisible()
    await expect(page.getByTestId("winner-name")).not.toBeEmpty()
    await expect(page.getByTestId("winner-sign")).toBeVisible()
    await expect(page.locator(".toast-confetti-piece")).toHaveCount(0)
  })

  test("ชื่อผู้ชนะยาวแสดงครบในบรรทัดเดียวและป้ายขยายโดยไม่ล้นจอ", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.setViewportSize({ width: 1440, height: 900 })
    await openSpinWheel(page)
    await page.getByTestId("wheel-source-custom").click()

    for (const name of [
      "คุณชญานิศ พัฒนสิริวัฒนกุล ฝ่ายสร้างสรรค์และนวัตกรรม",
      "คุณธนภัทร เจริญรุ่งเรืองกิจ ฝ่ายบริหารประสบการณ์กิจกรรม",
    ]) {
      await page.getByTestId("wheel-entry-input").fill(name)
      await page.getByTestId("add-entry").click()
    }

    await page.getByTestId("spin-button").click()
    const winnerName = page.getByTestId("winner-name")
    const winnerDialog = page.getByTestId("winner-dialog")
    await expect(winnerDialog).toBeVisible()
    await expect(winnerName).toHaveCSS("white-space", "nowrap")
    let desktopFontSize = 0
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 375, height: 812 },
    ]) {
      await page.setViewportSize(viewport)
      await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(
        viewport.width
      )
      const readFontSize = () =>
        winnerName.evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).fontSize)
        )
      if (viewport.width === 1440) {
        desktopFontSize = await readFontSize()
      } else {
        await expect.poll(readFontSize).toBeLessThan(desktopFontSize)
      }

      const dialogBounds = await winnerDialog.boundingBox()
      expect(dialogBounds).not.toBeNull()
      expect(dialogBounds!.x).toBeGreaterThanOrEqual(0)
      expect(dialogBounds!.x + dialogBounds!.width).toBeLessThanOrEqual(
        viewport.width
      )
      const pageOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      )
      expect(pageOverflow).toBeLessThanOrEqual(1)
    }
  })

  test("เริ่มอนิเมชันจริงและล็อกปุ่มระหว่างวงล้อหมุน", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await openSpinWheel(page)
    await page.getByTestId("load-names").click()
    await page.getByTestId("spin-button").click()

    await expect(page.getByTestId("spin-wheel")).toHaveAttribute(
      "data-spinning",
      "true"
    )
    await expect(page.getByTestId("spin-button")).toBeDisabled()
    await expect(page.getByTestId("spin-button")).toContainText("กำลังหมุน")
  })

  test("โหมดเต็มจอครอบทั้ง viewport และออกได้", async ({ page }) => {
    await openSpinWheel(page)
    await page.getByTestId("load-names").click()
    await page.getByTestId("wheel-fullscreen").click()

    await expect(page.getByTestId("wheel-fullscreen")).toContainText(
      "ออกจากเต็มจอ"
    )
    await expect(page.getByTestId("wheel-stage")).toHaveCSS("position", "fixed")
    await expect(page.getByTestId("circus-backdrop")).toBeVisible()

    const fullscreenOverflow = await page.evaluate(() => ({
      root: getComputedStyle(document.documentElement).overflow,
      body: getComputedStyle(document.body).overflow,
      scrollbarWidth:
        window.innerWidth - document.documentElement.clientWidth,
    }))
    expect(fullscreenOverflow).toEqual({
      root: "hidden",
      body: "hidden",
      scrollbarWidth: 0,
    })

    await page.getByTestId("wheel-fullscreen").click()
    await expect(page.getByTestId("wheel-fullscreen")).toContainText("เต็มจอ")
    await expect(page.getByTestId("circus-backdrop")).toHaveCount(0)
  })

  test("หน้าวงล้อไม่มีปัญหา accessibility ระดับ serious/critical", async ({
    page,
  }) => {
    await openSpinWheel(page)
    await page.getByTestId("load-names").click()

    const results = await new AxeBuilder({ page })
      .include('[data-testid="spin-wheel-page"]')
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()
    const severe = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? "")
    )

    expect(
      severe.flatMap((violation) =>
        violation.nodes.map(
          (node) =>
            `${violation.id} at ${node.target.join(" ")}: ${node.failureSummary}`
        )
      )
    ).toEqual([])
  })

  test("เลย์เอาต์มือถือแนวตั้งและแนวนอนไม่ล้น", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await openSpinWheel(page)
    await page.getByTestId("load-names").click()

    for (const viewport of [
      { width: 375, height: 812 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport)
      await expect(page.getByTestId("spin-button")).toBeVisible()
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      )
      expect(
        overflow,
        `${viewport.width}x${viewport.height}`
      ).toBeLessThanOrEqual(1)
    }
  })
})
