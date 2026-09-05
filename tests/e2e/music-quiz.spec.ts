import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { signIn } from "./helpers"

async function openMusicQuiz(page: Parameters<typeof signIn>[0]) {
  await signIn(page)
  await page.goto("/games/music-quiz")
  await expect(page.getByTestId("music-quiz-page")).toBeVisible()
}

test.describe("Music quiz", () => {
  test("ฟังซ้ำได้ไม่จำกัดจนกว่าจะกดเฉลย แล้วไปรอบถัดไปได้", async ({ page }) => {
    await openMusicQuiz(page)

    const veryHard = page.getByTestId("music-quiz-difficulty-very-hard")
    const normal = page.getByTestId("music-quiz-difficulty-normal")
    const reveal = page.getByTestId("music-quiz-reveal")

    await expect(page.getByTestId("music-quiz-difficulties").getByRole("button")).toHaveCount(4)
    await expect(veryHard).toContainText("VERY HARD")
    await expect(normal).toContainText("ฟัง 10 วินาที")
    await veryHard.click()

    await expect(page.getByTestId("music-quiz-timer")).toContainText("/ 0:01")

    // เล่นจบแล้วปุ่มความยากต้องยังกดได้ ไม่ล็อก จนกว่าจะกดเฉลยเอง
    await expect(reveal).toBeVisible({ timeout: 2_500 })
    await expect(normal).toBeEnabled()
    await normal.click()
    await expect(page.getByTestId("music-quiz-timer")).toContainText("/ 0:10")
    await expect(veryHard).toBeEnabled()

    await reveal.click()
    await expect(page.getByTestId("music-quiz-answer")).toContainText("หมอกหรือควัน")
    // เฉลยแล้ว การ์ดสลับไปโชว์คำตอบตัวใหญ่แทน ปุ่มความยากเลยหายไปทั้งชุด ไม่ใช่แค่ล็อก
    await expect(normal).toBeHidden()
    await expect(page.getByTestId("music-quiz-next-round")).toBeVisible()
    await page.getByTestId("music-quiz-next-round").click()
    await expect(page.getByText("รอบ 02")).toBeVisible()
    await expect(normal).toBeEnabled()
  })

  test("หน้าจอไม่ล้นทั้งมือถือแนวตั้งและแนวนอน", async ({ page }) => {
    await openMusicQuiz(page)

    for (const viewport of [
      { width: 375, height: 812 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport)
      await expect(page.getByTestId("music-quiz-difficulty-normal")).toBeVisible()
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

test.describe("โซนเกมส์ — 3 การ์ดตายตัว", () => {
  test("เลือกเกมแล้วกลับไปเลือกใหม่ได้ โดยห้องกับ PIN ไม่รีเซ็ต", async ({
    page,
  }) => {
    await signIn(page)
    await page.goto("/games")

    await expect(page.getByTestId("games-picker")).toBeVisible()
    const pin = await page.getByTestId("quiz-room-pin").textContent()

    await page.getByRole("link", { name: /เกมส์ทายเพลง/ }).click()
    await expect(page.getByTestId("music-quiz-page")).toBeVisible()
    await expect(page.getByTestId("games-picker")).toBeHidden()
    await expect(page.getByTestId("quiz-room-pin")).toHaveText(pin ?? "")

    await page.getByRole("link", { name: "กลับไปเลือกเกมส์" }).click()
    await expect(page.getByTestId("games-picker")).toBeVisible()
    await expect(page.getByTestId("music-quiz-page")).toBeHidden()
    await expect(page.getByTestId("quiz-room-pin")).toHaveText(pin ?? "")
  })

  test("รายชื่อเกมแสดง 4 ต่อแถว 4 แถว รวม 16 ช่อง และการ์ดสูงเท่ากันเสมอ", async ({
    page,
  }) => {
    await signIn(page)
    await page.goto("/games")

    const picker = page.getByTestId("games-picker")
    await expect(picker).toBeVisible()
    await expect(picker.locator(".grid > *")).toHaveCount(16)

    const heights = await page.evaluate(() => {
      const picker = document
        .querySelector('[data-testid="games-picker"]')!
        .getBoundingClientRect()
      const room = document
        .querySelector('[data-testid="quiz-room-panel"]')!
        .getBoundingClientRect()
      return {
        pickerHeight: Math.round(picker.height),
        roomHeight: Math.round(room.height),
        pickerTop: Math.round(picker.top),
        roomTop: Math.round(room.top),
        overflowY:
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight,
      }
    })
    expect(heights.pickerHeight).toBe(heights.roomHeight)
    expect(heights.pickerTop).toBe(heights.roomTop)
    expect(heights.overflowY).toBe(0)
  })

  test("โหมดเต็มจอซ่อนปุ่มเต็มจอ และออกได้ด้วย Esc เท่านั้น", async ({ page }) => {
    await openMusicQuiz(page)

    const fullscreen = page.getByTestId("games-fullscreen")
    await expect(fullscreen).toBeVisible()
    await expect(page.getByTestId("games-back")).toHaveCount(0)
    await fullscreen.click()

    // ไม่มีปุ่มออกจากเต็มจอให้กด — ใช้ Esc เท่านั้น
    await expect(page.getByTestId("games-fullscreen")).toBeHidden()
    await expect(page.getByTestId("music-quiz-page")).toBeVisible()
    await expect(page.getByTestId("quiz-room-panel")).toBeVisible()

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
    await page.getByTestId("music-quiz-difficulty-normal").click()
    await expect(page.getByTestId("music-quiz-timer")).toContainText("/ 0:10")

    // ออกจากเต็มจอได้ทางเดียวคือกด Esc
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("games-back")).toHaveCount(0)
    await expect(page.getByTestId("games-fullscreen")).toBeVisible()
    await expect(page.getByTestId("music-quiz-page")).toBeVisible()
    await expect(page.getByTestId("quiz-room-panel")).toBeVisible()
  })

  test("ระยะขอบซ้ายขวาของ 3 การ์ดเท่ากันเสมอ ไม่ว่าเนื้อหาการ์ดเกมจะสูงแค่ไหน", async ({
    page,
  }) => {
    await signIn(page)
    await page.goto("/games")
    await page.getByTestId("games-fullscreen").click()

    // เนื้อหาสั้น (รายการเกม) ต้องไม่มี scrollbar มาแย่งพื้นที่ฝั่งขวา
    const pickerGutters = await page.evaluate(() => {
      const left = document
        .querySelector('[data-testid="games-picker"]')!
        .getBoundingClientRect()
      const right = document
        .querySelector('[data-testid="quiz-room-panel"]')!
        .getBoundingClientRect()
      return {
        left: Math.round(left.left),
        right: Math.round(window.innerWidth - right.right),
      }
    })
    expect(pickerGutters.left).toBe(pickerGutters.right)

    // เนื้อหายาว (การ์ดเกมทายเพลง) ต้องได้ระยะขอบเท่าเดิม แม้เนื้อหาจะสูงจน scroll
    await page.getByRole("link", { name: /เกมส์ทายเพลง/ }).click()
    await expect(page.getByTestId("music-quiz-page")).toBeVisible()

    const quizGutters = await page.evaluate(() => {
      const left = document
        .querySelector('[data-testid="music-quiz-page"]')!
        .getBoundingClientRect()
      const right = document
        .querySelector('[data-testid="quiz-room-panel"]')!
        .getBoundingClientRect()
      return {
        left: Math.round(left.left),
        right: Math.round(window.innerWidth - right.right),
      }
    })
    expect(quizGutters.left).toBe(quizGutters.right)
    expect(quizGutters.left).toBe(pickerGutters.left)
  })

  test("ปุ่มขยายเปิด modal แสดง QR แล้ว PIN แล้วลิงก์ตามลำดับ", async ({
    page,
  }) => {
    await signIn(page)
    await page.goto("/games")

    const pin = await page.getByTestId("quiz-room-pin").textContent()
    await page.getByRole("button", { name: "ขยาย" }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect(dialog.locator("svg").last()).toBeVisible()
    await expect(dialog.getByText(pin ?? "", { exact: true })).toBeVisible()
    await expect(dialog.getByText(`play?pin=${pin}`)).toBeVisible()

    const order = await dialog.evaluate((el) => {
      const svg = el.querySelector("svg")
      const pinEl = [...el.querySelectorAll("p")].find((p) =>
        /^\d{6}$/.test(p.textContent ?? "")
      )
      const linkEl = [...el.querySelectorAll("p")].find((p) =>
        p.textContent?.includes("play?pin=")
      )
      if (!svg || !pinEl || !linkEl) return null
      const svgTop = svg.getBoundingClientRect().top
      const pinTop = pinEl.getBoundingClientRect().top
      const linkTop = linkEl.getBoundingClientRect().top
      return svgTop < pinTop && pinTop < linkTop
    })
    expect(order).toBe(true)

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
  })
})

test.describe("ห้องเล่นสด", () => {
  test("สองแท็บในเบราว์เซอร์เดียวกัน join คนละชื่อ ต้องนับเป็นคนละคน ไม่ทับกัน", async ({
    page,
    context,
  }) => {
    await signIn(page)
    await page.goto("/games")
    const pin = await page.getByTestId("quiz-room-pin").textContent()

    const player1 = await context.newPage()
    await player1.goto(`/play?pin=${pin}`)
    await player1.getByLabel("ชื่อที่จะให้คนอื่นเห็น").fill("UU")
    await player1.getByTestId("play-join").click()

    const player2 = await context.newPage()
    await player2.goto(`/play?pin=${pin}`)
    await player2.getByLabel("ชื่อที่จะให้คนอื่นเห็น").fill("WW")
    await player2.getByTestId("play-join").click()

    await expect(page.getByTestId("quiz-room-count")).toHaveText("2")
    const players = page.getByTestId("quiz-room-players")
    await expect(players).toContainText("UU")
    await expect(players).toContainText("WW")

    await player1.close()
    await player2.close()
  })

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
