import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    // ใช้ path alias "@/*" จาก tsconfig.json โดยตรง
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
})
