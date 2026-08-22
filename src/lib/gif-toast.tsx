"use client"

import { toast, type ExternalToast } from "sonner"

import { pickToastGif, type ToastGifCategory } from "@/constants/toast-gif"

/** หมวดที่มีพลุกระดาษ — เรื่องน่ายินดีเท่านั้น ลบ/ผิดพลาดไม่ต้องฉลอง */
const CELEBRATES: ToastGifCategory[] = ["welcome", "success"]

/**
 * ชิ้นกระดาษของพลุ — ค่าตายตัวเพื่อให้ผลลัพธ์เหมือนกันทุกครั้ง (ไม่สุ่มตอน render)
 * สีใช้เฉด Version 3 ชุดเดียวกับช่องไอคอนทั้งระบบ
 */
const CONFETTI = [
  { left: "2%", delay: "0s", duration: "2.6s", color: "var(--icon-tile-blue)", size: 8 },
  { left: "9%", delay: "0.9s", duration: "3.1s", color: "var(--icon-tile-red)", size: 6 },
  { left: "15%", delay: "0.4s", duration: "2.3s", color: "var(--icon-tile-yellow)", size: 7 },
  { left: "22%", delay: "1.4s", duration: "2.9s", color: "var(--icon-tile-green)", size: 9 },
  { left: "29%", delay: "0.2s", duration: "3.3s", color: "var(--icon-tile-purple)", size: 6 },
  { left: "35%", delay: "1.1s", duration: "2.5s", color: "var(--icon-tile-orange)", size: 8 },
  { left: "42%", delay: "0.6s", duration: "3s", color: "var(--icon-tile-blue)", size: 7 },
  { left: "48%", delay: "1.7s", duration: "2.4s", color: "var(--icon-tile-yellow)", size: 9 },
  { left: "55%", delay: "0.35s", duration: "2.8s", color: "var(--icon-tile-green)", size: 6 },
  { left: "61%", delay: "1.25s", duration: "3.2s", color: "var(--icon-tile-red)", size: 8 },
  { left: "68%", delay: "0.75s", duration: "2.6s", color: "var(--icon-tile-purple)", size: 7 },
  { left: "74%", delay: "1.55s", duration: "3.1s", color: "var(--icon-tile-orange)", size: 9 },
  { left: "81%", delay: "0.15s", duration: "2.7s", color: "var(--icon-tile-blue)", size: 6 },
  { left: "87%", delay: "1s", duration: "2.35s", color: "var(--icon-tile-green)", size: 8 },
  { left: "93%", delay: "0.5s", duration: "3s", color: "var(--icon-tile-yellow)", size: 7 },
  { left: "98%", delay: "1.35s", duration: "2.55s", color: "var(--icon-tile-red)", size: 6 },
]

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-2 bottom-0 overflow-hidden">
      {CONFETTI.map((piece, index) => (
        <span
          key={index}
          className="toast-confetti-piece absolute top-0 block rounded-[2px]"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size * 1.6,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

type GifToastOptions = Omit<ExternalToast, "icon" | "description"> & {
  description?: string
}

/**
 * Toast ที่มีภาพเคลื่อนไหวเป็นตัวสื่อสารหลัก
 *
 * พื้นหลังโปร่งใส — ภาพกับข้อความลอยบนหน้าจอตรง ๆ โดยมีพลุกระดาษร่วงอยู่ข้างหลัง
 * ภาพสุ่มใหม่ทุกครั้งจากหมวดที่ระบุ และไม่ซ้ำกับครั้งก่อนหน้า (ดู toast-gif.ts)
 * ถ้าหมวดนั้นยังไม่มีไฟล์ จะเหลือแค่ข้อความ ไม่พังและไม่เว้นช่องว่างทิ้งไว้
 */
export function gifToast(
  category: ToastGifCategory,
  message: string,
  { description, ...options }: GifToastOptions = {}
) {
  const src = pickToastGif(category)
  const celebrates = CELEBRATES.includes(category)

  return toast.custom(
    (id) => (
      <div
        className="relative flex w-full flex-col items-center gap-2 bg-transparent px-2 py-3"
        role="status"
        onClick={() => toast.dismiss(id)}
      >
        {celebrates ? <Confetti /> : null}

        {/* ภาพล้วน ไม่มีข้อความ — ข้อความยังอยู่ให้ screen reader อ่านเท่านั้น */}
        <div className="relative w-[92%] overflow-hidden rounded-xl shadow-lg">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element -- ไฟล์ WebP/GIF เคลื่อนไหว ไม่ต้องผ่านตัวปรับขนาดของ next/image
            <img
              src={src}
              alt=""
              aria-hidden="true"
              width={320}
              height={200}
              loading="eager"
              decoding="async"
              // ภาพมีทั้งแนวตั้งและแนวนอน จึงครอบให้เต็มกรอบเดียวกันเสมอ
              className="block h-44 w-full object-cover"
            />
          ) : null}
        </div>

        <span className="sr-only">
          {message}
          {description ? ` — ${description}` : ""}
        </span>
      </div>
    ),
    // unstyled: ตัดพื้น/เส้นขอบ/เงาเริ่มต้นของ Sonner ออก ให้เหลือแต่ภาพกับข้อความ
    { unstyled: true, ...options }
  )
}

/** ทางลัดของแต่ละหมวด ใช้แทน toast.success / toast.error เดิมได้ตรง ๆ */
export const appToast = {
  welcome: (message: string, options?: GifToastOptions) =>
    gifToast("welcome", message, options),
  success: (message: string, options?: GifToastOptions) =>
    gifToast("success", message, options),
  delete: (message: string, options?: GifToastOptions) =>
    gifToast("delete", message, options),
  error: (message: string, options?: GifToastOptions) =>
    gifToast("error", message, options),
}
