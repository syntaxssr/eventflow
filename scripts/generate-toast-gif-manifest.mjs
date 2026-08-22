/**
 * สร้างรายชื่อไฟล์ภาพของ Toast จากโฟลเดอร์จริง
 *
 * ฝั่ง client อ่านโฟลเดอร์เองไม่ได้ ไฟล์ manifest จึงถูกสร้างไว้ล่วงหน้า
 * รันอัตโนมัติก่อน `npm run dev` และ `npm run build` (ดู predev / prebuild)
 * เพิ่ม GIF ใหม่แค่วางไฟล์ลง public/toast-gifs/<หมวด>/ แล้วรันใหม่
 */
import { readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const CATEGORIES = ["welcome", "success", "delete", "error"]
const MEDIA = /\.(gif|webp|apng|png|svg)$/i
const PUBLIC_DIR = join(process.cwd(), "public", "toast-gifs")
const OUTPUT = join(process.cwd(), "src", "constants", "toast-gif-manifest.ts")

function listFiles(category) {
  let names
  try {
    names = readdirSync(join(PUBLIC_DIR, category)).filter((name) =>
      MEDIA.test(name)
    )
  } catch {
    return []
  }

  // ถ้าไฟล์เดียวกันมีทั้ง .gif และ .webp ให้ใช้ .webp อย่างเดียว (เล็กกว่ามาก)
  const webpBaseNames = new Set(
    names
      .filter((name) => name.toLowerCase().endsWith(".webp"))
      .map((name) => name.replace(/\.webp$/i, ""))
  )

  return names
    .filter(
      (name) =>
        !name.toLowerCase().endsWith(".gif") ||
        !webpBaseNames.has(name.replace(/\.gif$/i, ""))
    )
    .sort((a, b) => a.localeCompare(b))
}

const entries = CATEGORIES.map((category) => [category, listFiles(category)])

const body = entries
  .map(
    ([category, files]) =>
      `  ${category}: [\n${files
        .map((file) => `    ${JSON.stringify(file)},`)
        .join("\n")}${files.length > 0 ? "\n" : ""}  ],`
  )
  .join("\n")

writeFileSync(
  OUTPUT,
  `// ไฟล์นี้ถูกสร้างอัตโนมัติโดย scripts/generate-toast-gif-manifest.mjs — ห้ามแก้ด้วยมือ
import type { ToastGifCategory } from "./toast-gif"

export const TOAST_GIF_FILES: Record<ToastGifCategory, string[]> = {
${body}
}
`,
  "utf8"
)

const summary = entries
  .map(([category, files]) => `${category}: ${files.length}`)
  .join(", ")
console.log(`toast gif manifest: ${summary}`)
