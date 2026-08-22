/**
 * ภาพเคลื่อนไหวประกอบ Toast แยกตามหมวด
 *
 * ไฟล์อยู่ที่ `public/toast-gifs/<หมวด>/` เพิ่มภาพใหม่แค่วางไฟล์ลงโฟลเดอร์
 * รายชื่อไฟล์มาจาก toast-gif-manifest.ts ซึ่งสร้างอัตโนมัติก่อน dev/build
 * (`npm run toast-gifs` ถ้าต้องการอัปเดตทันทีระหว่างที่ dev server รันอยู่)
 *
 * รองรับทั้ง .gif / .webp / .apng / .png / .svg เพราะเรนเดอร์ผ่าน <img> เหมือนกันหมด
 */
import { TOAST_GIF_FILES } from "./toast-gif-manifest"

export const TOAST_GIF_CATEGORIES = [
  "welcome",
  "success",
  "delete",
  "error",
] as const

export type ToastGifCategory = (typeof TOAST_GIF_CATEGORIES)[number]

export const TOAST_GIFS = TOAST_GIF_FILES

/** ไฟล์ที่หยิบไปล่าสุดของแต่ละหมวด — ใช้กันไม่ให้สุ่มได้ภาพเดิมซ้ำติดกัน */
const lastPicked = new Map<ToastGifCategory, string>()

/**
 * สุ่มภาพของหมวดนั้น โดยไม่ซ้ำกับครั้งก่อนหน้า
 * คืน null ถ้าหมวดนั้นยังไม่มีไฟล์ (Toast จะแสดงแบบไม่มีภาพแทน)
 */
export function pickToastGif(category: ToastGifCategory): string | null {
  const files = TOAST_GIFS[category]
  if (files.length === 0) return null

  const previous = lastPicked.get(category)
  const pool =
    files.length > 1 ? files.filter((file) => file !== previous) : files
  const file = pool[Math.floor(Math.random() * pool.length)]

  lastPicked.set(category, file)
  // ชื่อไฟล์จริงมีเว้นวรรคและวงเล็บได้ จึง encode ก่อนใช้เป็น URL
  return `/toast-gifs/${category}/${encodeURIComponent(file)}`
}
