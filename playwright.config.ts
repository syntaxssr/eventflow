import { defineConfig, devices } from "@playwright/test"

// ใช้พอร์ตเดียวกับ `npm run dev` เพื่อให้ Playwright ใช้เซิร์ฟเวอร์ที่เปิดค้างไว้ได้
// (Next.js อนุญาตให้รัน dev server ต่อหนึ่งโปรเจกต์ได้ครั้งละหนึ่งตัวเท่านั้น)
const PORT = Number(process.env.PORT ?? 3001)
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // เผื่อเวลาให้ Next.js dev server คอมไพล์ route ที่ยังไม่เคยถูกเรียก
  timeout: 120_000,
  expect: { timeout: 20_000 },
  // dev server ของ Next คอมไพล์ route ตอนถูกเรียกครั้งแรก การรันหลาย worker
  // พร้อมกันจึงทำให้บาง route ใช้เวลานานผิดปกติ — จำกัดไว้ 3 เพื่อไม่ให้แย่งกันเอง
  workers: process.env.CI ? 1 : 3,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    locale: "th-TH",
    timezoneId: "Asia/Bangkok",
    // ปิดอนิเมชันฝั่งระบบ — ตัวเลขบนการ์ดสรุปใช้ useCountUp ซึ่งข้ามการนับขึ้น
    // เมื่อผู้ใช้ตั้ง prefers-reduced-motion เทสต์จึงอ่านค่าจริงได้ทันที
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
