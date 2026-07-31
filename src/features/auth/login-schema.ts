import { z } from "zod"

/** รูปแบบอีเมลที่ยอมรับ — ครอบคลุมอีเมลองค์กรทั่วไป */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const PASSWORD_MIN_LENGTH = 6

/**
 * ข้อความ error เก็บเป็น "translation key" ไม่ใช่ข้อความจริง
 * เพื่อให้สลับภาษาแล้วข้อความ validation เปลี่ยนตามทันที
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "auth.emailRequired" })
    .regex(EMAIL_PATTERN, { message: "auth.emailInvalid" }),
  password: z
    .string()
    .min(1, { message: "auth.passwordRequired" })
    .min(PASSWORD_MIN_LENGTH, { message: "auth.passwordTooShort" }),
  rememberMe: z.boolean(),
})

export type LoginValues = z.infer<typeof loginSchema>
