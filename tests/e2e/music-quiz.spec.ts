import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { signIn } from "./helpers"

async function openMusicQuiz(page: Parameters<typeof signIn>[0]) {
  await signIn(page)
  await page.goto("/games/music-quiz")
  await expect(page.getByTestId("music-quiz-page")).toBeVisible()
}

test.describe("Music quiz", () => {
  test("เริ่มฟัง เลือกคำตอบ และไปยังรอบถัดไปได้", async ({ page }) => {
    await openMusicQuiz(page)

    const play = page.getByTestId("music-quiz-play")
    const correctAnswer = page.getByTestId("music-quiz-answer-1")

    await expect(correctAnswer).toBeDisabled()
    await play.click()
    await expect(correctAnswer).toBeEnabled()
    await correctAnswer.click()

    await expect(
      page.getByText("ตอบถูก! ทีมของคุณได้รับ 100 คะแนน")
    ).toBeVisible()
    await expect(correctAnswer).toBeDisabled()
    await page.getByTestId("music-quiz-next-round").click()
    await expect(page.getByText("รอบ 02")).toBeVisible()
    await expect(correctAnswer).toBeDisabled()
  })

  test("หน้าจอไม่ล้นทั้งมือถือแนวตั้งและแนวนอน", async ({ page }) => {
    await openMusicQuiz(page)

    for (const viewport of [
      { width: 375, height: 812 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport)
      await expect(page.getByTestId("music-quiz-play")).toBeVisible()
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      )
      expect(overflow, `${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(1)
    }
  })

  test("โหมดเต็มจอครอบทั้ง viewport และออกได้", async ({ page }) => {
    await openMusicQuiz(page)

    const fullscreen = page.getByTestId("music-quiz-fullscreen")
    await fullscreen.click()

    await expect(fullscreen).toContainText("ออกจากเต็มจอ")
    await expect(page.getByTestId("music-quiz-page")).toHaveCSS(
      "position",
      "fixed"
    )

    const fullscreenOverflow = await page.evaluate(() => ({
      root: getComputedStyle(document.documentElement).overflow,
      body: getComputedStyle(document.body).overflow,
      scrollbarWidth: window.innerWidth - document.documentElement.clientWidth,
    }))
    expect(fullscreenOverflow).toEqual({
      root: "hidden",
      body: "hidden",
      scrollbarWidth: 0,
    })

    // เล่นต่อได้ระหว่างเต็มจอ
    await page.getByTestId("music-quiz-play").click()
    await expect(page.getByTestId("music-quiz-answer-1")).toBeEnabled()

    await fullscreen.click()
    await expect(fullscreen).toContainText("เต็มจอ")
    await expect(page.getByTestId("music-quiz-page")).not.toHaveCSS(
      "position",
      "fixed"
    )
  })

  test("หน้าเกมส์ทายเพลงไม่มีปัญหา accessibility ระดับ serious/critical", async ({
    page,
  }) => {
    await openMusicQuiz(page)

    const results = await new AxeBuilder({ page })
      .include('[data-testid="music-quiz-page"]')
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
})

test.describe("ห้องเล่นสด", () => {
  test("การ์ด leaderboard แสดง PIN และเริ่มจากศูนย์คน", async ({ page }) => {
    await openMusicQuiz(page)

    const panel = page.getByTestId("quiz-room-panel")
    await expect(panel).toBeVisible()
    // PartyKit อาจไม่ได้รันตอนเทสต์ — PIN กับจำนวนคนต้องขึ้นได้โดยไม่ต้องต่อห้อง
    await expect(page.getByTestId("quiz-room-pin")).toHaveText(/^\d{6}$/)
    await expect(page.getByTestId("quiz-room-count")).toHaveText("0")
    await expect(panel).toContainText("ยังไม่มีใครเข้าห้อง")
  })

  test("จอผู้เล่นขอ PIN กับชื่อก่อนเข้าห้อง", async ({ page }) => {
    await page.goto("/play")
    await expect(page.getByTestId("play-join-form")).toBeVisible()

    await page.getByTestId("play-join").click()
    await expect(page.getByTestId("play-error")).toContainText("PIN ต้องเป็นตัวเลข 6 หลัก")

    await page.getByLabel("PIN ห้อง").fill("123456")
    await page.getByTestId("play-join").click()
    await expect(page.getByTestId("play-error")).toContainText("ใส่ชื่ออย่างน้อย 2 ตัวอักษร")
  })
})
