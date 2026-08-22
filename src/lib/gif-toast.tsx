"use client"

import * as React from "react"
import { toast, type ExternalToast } from "sonner"

import { pickToastGif, type ToastGifCategory } from "@/constants/toast-gif"

/** หมวดที่มีพลุกระดาษ — เรื่องน่ายินดีเท่านั้น ลบ/ผิดพลาดไม่ต้องฉลอง */
const CELEBRATES: ToastGifCategory[] = ["welcome", "success"]

/**
 * ชิ้นกระดาษของพลุ — ค่าตายตัวเพื่อให้ผลลัพธ์เหมือนกันทุกครั้ง (ไม่สุ่มตอน render)
 * สีใช้เฉด Version 3 ชุดเดียวกับช่องไอคอนทั้งระบบ
 */
const CONFETTI = [
  { tx: "175px", ty: "0px", delay: "0.0s", duration: "2.2s", color: "var(--icon-tile-blue)", size: 6 },
  { tx: "178px", ty: "75px", delay: "0.28s", duration: "2.55s", color: "var(--icon-tile-yellow)", size: 7 },
  { tx: "157px", ty: "80px", delay: "0.56s", duration: "2.9s", color: "var(--icon-tile-green)", size: 8 },
  { tx: "60px", ty: "141px", delay: "0.84s", duration: "3.25s", color: "var(--icon-tile-purple)", size: 9 },
  { tx: "36px", ty: "123px", delay: "1.12s", duration: "2.2s", color: "var(--icon-tile-red)", size: 6 },
  { tx: "-70px", ty: "141px", delay: "1.4s", duration: "2.55s", color: "var(--icon-tile-orange)", size: 7 },
  { tx: "-87px", ty: "108px", delay: "0.0s", duration: "2.9s", color: "var(--icon-tile-blue)", size: 8 },
  { tx: "-178px", ty: "75px", delay: "0.28s", duration: "3.25s", color: "var(--icon-tile-yellow)", size: 9 },
  { tx: "-193px", ty: "43px", delay: "0.56s", duration: "2.2s", color: "var(--icon-tile-green)", size: 6 },
  { tx: "-172px", ty: "-26px", delay: "0.84s", duration: "2.55s", color: "var(--icon-tile-purple)", size: 7 },
  { tx: "-193px", ty: "-43px", delay: "1.12s", duration: "2.9s", color: "var(--icon-tile-red)", size: 8 },
  { tx: "-132px", ty: "-115px", delay: "1.4s", duration: "3.25s", color: "var(--icon-tile-orange)", size: 9 },
  { tx: "-88px", ty: "-108px", delay: "0.0s", duration: "2.2s", color: "var(--icon-tile-blue)", size: 6 },
  { tx: "0px", ty: "-150px", delay: "0.28s", duration: "2.55s", color: "var(--icon-tile-yellow)", size: 7 },
  { tx: "36px", ty: "-123px", delay: "0.56s", duration: "2.9s", color: "var(--icon-tile-green)", size: 8 },
  { tx: "112px", ty: "-115px", delay: "0.84s", duration: "3.25s", color: "var(--icon-tile-purple)", size: 9 },
  { tx: "157px", ty: "-80px", delay: "1.12s", duration: "2.2s", color: "var(--icon-tile-red)", size: 6 },
  { tx: "202px", ty: "-26px", delay: "1.4s", duration: "2.55s", color: "var(--icon-tile-orange)", size: 7 },
]

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {CONFETTI.map((piece, index) => (
        <span
          key={index}
          className="toast-confetti-piece absolute top-1/2 left-1/2 block rounded-[2px]"
          style={
            {
              width: piece.size,
              height: piece.size * 1.6,
              backgroundColor: piece.color,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              "--tx": piece.tx,
              "--ty": piece.ty,
            } as React.CSSProperties
          }
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
