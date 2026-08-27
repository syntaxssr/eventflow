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
