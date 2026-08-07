import { describe, expect, it } from "vitest"

import { loginSchema } from "@/features/auth/login-schema"

function firstErrorFor(field: string, data: unknown): string | undefined {
  const result = loginSchema.safeParse(data)
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

const VALID = {
  email: "alisa.l@company.co.th",
  password: "eventflow",
  rememberMe: false,
}

describe("loginSchema", () => {
  it("ยอมรับข้อมูลที่ถูกต้อง", () => {
    expect(loginSchema.safeParse(VALID).success).toBe(true)
  })

  it("แจ้ง key `auth.emailRequired` เมื่ออีเมลว่าง", () => {
    expect(firstErrorFor("email", { ...VALID, email: "" })).toBe(
      "auth.emailRequired"
    )
    expect(firstErrorFor("email", { ...VALID, email: "   " })).toBe(
      "auth.emailRequired"
    )
  })

  it("แจ้ง key `auth.emailInvalid` เมื่อรูปแบบอีเมลผิด", () => {
    for (const email of ["abc", "abc@", "abc@company", "a b@c.co", "@c.co"]) {
      expect(firstErrorFor("email", { ...VALID, email })).toBe(
        "auth.emailInvalid"
      )
    }
  })

  it("ตัดช่องว่างหน้า–หลังอีเมลออกก่อนตรวจ", () => {
    const result = loginSchema.safeParse({
      ...VALID,
      email: "  alisa.l@company.co.th  ",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe("alisa.l@company.co.th")
    }
  })

  it("แจ้ง key `auth.passwordRequired` เมื่อรหัสผ่านว่าง", () => {
    expect(firstErrorFor("password", { ...VALID, password: "" })).toBe(
      "auth.passwordRequired"
    )
  })

  it("แจ้ง key `auth.passwordTooShort` เมื่อรหัสผ่านสั้นเกินไป", () => {
    expect(firstErrorFor("password", { ...VALID, password: "12345" })).toBe(
      "auth.passwordTooShort"
    )
  })

  it("ข้อความ error ทุกอันเป็น translation key ไม่ใช่ข้อความจริง", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "",
      rememberMe: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      for (const issue of result.error.issues) {
        expect(issue.message).toMatch(/^[a-z]+\.[a-zA-Z]+$/)
      }
    }
  })
})
