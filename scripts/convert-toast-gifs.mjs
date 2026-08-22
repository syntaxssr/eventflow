/**
 * แปลง GIF ของ Toast เป็น WebP เคลื่อนไหว (เล็กกว่า GIF ราว 5–10 เท่า)
 *
 * ต้องมี `gif2webp` จาก libwebp:  brew install webp
 *
 * วิธีใช้
 *   node scripts/convert-toast-gifs.mjs                 # แปลงทุกหมวด เก็บ GIF เดิมไว้
 *   node scripts/convert-toast-gifs.mjs welcome         # เฉพาะหมวดที่ระบุ
 *   node scripts/convert-toast-gifs.mjs --delete-source # แปลงแล้วลบ GIF ต้นฉบับ
 *   node scripts/convert-toast-gifs.mjs --quality 70 --width 320
 *
 * ค่าเริ่มต้นย่อความกว้างเหลือ 320px เพราะ Toast แสดงภาพแค่ 64px
 * ไฟล์ที่มี .webp อยู่แล้วและใหม่กว่า GIF ต้นฉบับจะถูกข้าม
 */
import { execFileSync } from "node:child_process"
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
  unlinkSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const CATEGORIES = ["welcome", "success", "delete", "error"]
const ROOT = join(process.cwd(), "public", "toast-gifs")

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}
const quality = Number(flag("quality", 75))
const width = Number(flag("width", 320))
const deleteSource = args.includes("--delete-source")
const only = args.filter((arg) => CATEGORIES.includes(arg))
const categories = only.length > 0 ? only : CATEGORIES

function requireBinary(name) {
  try {
    execFileSync("which", [name], { stdio: "pipe" })
  } catch {
    console.error(
      `ไม่พบคำสั่ง ${name} — ติดตั้งด้วย: brew install webp` +
        (name === "gifsicle" ? " gifsicle" : "")
    )
    process.exit(1)
  }
}

requireBinary("gif2webp")
const canResize = (() => {
  try {
    execFileSync("which", ["gifsicle"], { stdio: "pipe" })
    return true
  } catch {
    return false
  }
})()

if (!canResize && width > 0) {
  console.warn(
    "ไม่พบ gifsicle จึงข้ามการย่อขนาด (brew install gifsicle ถ้าต้องการย่อด้วย)"
  )
}

const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)}MB`

let totalBefore = 0
let totalAfter = 0
let converted = 0
let skipped = 0

for (const category of categories) {
  const dir = join(ROOT, category)
  if (!existsSync(dir)) continue

  const gifs = readdirSync(dir).filter((name) => name.toLowerCase().endsWith(".gif"))

  for (const gif of gifs) {
    const source = join(dir, gif)
    const target = join(dir, gif.replace(/\.gif$/i, ".webp"))

    if (
      existsSync(target) &&
      statSync(target).mtimeMs >= statSync(source).mtimeMs
    ) {
      skipped += 1
      continue
    }

    const before = statSync(source).size
    let input = source
    let workDir = null

    // ย่อขนาดก่อนแปลง — gif2webp ไม่มีตัวเลือก resize ในตัว
    if (canResize && width > 0) {
      workDir = mkdtempSync(join(tmpdir(), "toast-gif-"))
      const resized = join(workDir, gif)
      try {
        execFileSync(
          "gifsicle",
          ["--resize-fit-width", String(width), "-o", resized, source],
          { stdio: "pipe" }
        )
        input = resized
      } catch {
        // ย่อไม่ได้ (บาง GIF โครงสร้างแปลก) ก็แปลงจากไฟล์เต็มไปเลย
        input = source
      }
    }

    try {
      execFileSync(
        "gif2webp",
        ["-q", String(quality), "-m", "6", "-mixed", input, "-o", target],
        { stdio: "pipe" }
      )
    } catch (error) {
      console.error(`แปลงไม่สำเร็จ: ${category}/${gif}`, error.message)
      if (workDir) rmSync(workDir, { recursive: true, force: true })
      continue
    }

    if (workDir) rmSync(workDir, { recursive: true, force: true })

    const after = statSync(target).size
    totalBefore += before
    totalAfter += after
    converted += 1

    if (deleteSource) unlinkSync(source)

    console.log(
      `${category}/${gif}: ${formatSize(before)} → ${formatSize(after)}`
    )
  }
}

console.log(
  `\nแปลงแล้ว ${converted} ไฟล์ (ข้าม ${skipped}) — ` +
    `${formatSize(totalBefore)} → ${formatSize(totalAfter)}`
)
console.log("อย่าลืมรัน: npm run toast-gifs เพื่ออัปเดตรายชื่อไฟล์")
