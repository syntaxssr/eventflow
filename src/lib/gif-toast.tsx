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
  { left: "4%", delay: "0s", color: "var(--icon-tile-blue)", size: 8 },
  { left: "15%", delay: "0.7s", color: "var(--icon-tile-yellow)", size: 6 },
  { left: "26%", delay: "0.3s", color: "var(--icon-tile-green)", size: 9 },
  { left: "37%", delay: "1.1s", color: "var(--icon-tile-purple)", size: 7 },
  { left: "48%", delay: "0.15s", color: "var(--icon-tile-red)", size: 8 },
  { left: "59%", delay: "0.9s", color: "var(--icon-tile-orange)", size: 6 },
  { left: "70%", delay: "0.45s", color: "var(--icon-tile-blue)", size: 9 },
  { left: "81%", delay: "1.3s", color: "var(--icon-tile-green)", size: 7 },
  { left: "92%", delay: "0.6s", color: "var(--icon-tile-yellow)", size: 8 },
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
  // คำสั้น ๆ อย่าง "WELCOME" ขยายใหญ่และถ่างตัวอักษรได้ ส่วนประโยคยาวต้องลดลง
  // ไม่งั้นจะตัดบรรทัดสามสี่แถวจนอ่านยากกว่าเดิม
  const isHeadline = message.length <= 18

  return toast.custom(
    (id) => (
      <div
        className="relative flex w-full flex-col items-center gap-2 bg-transparent px-2 py-3"
        role="status"
        onClick={() => toast.dismiss(id)}
      >
        {celebrates ? <Confetti /> : null}

        {/* ข้อความวางทับบนภาพพร้อมม่านไล่สีด้านล่าง — เด่นกว่าวางใต้ภาพบนพื้นโปร่งใส
            และอ่านออกเสมอไม่ว่า GIF จะสว่างหรือมืด */}
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

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pt-8 pb-3 text-center">
            <p
              className={`font-black text-balance text-white uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] ${
                isHeadline
                  ? "text-xl leading-none tracking-[0.1em] whitespace-nowrap"
                  : "text-base leading-snug tracking-normal"
              }`}
            >
              {message}
            </p>
            {description ? (
              <p className="mt-1 text-xs text-white/85">{description}</p>
            ) : null}
          </div>
        </div>
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
