import { describe, expect, it } from "vitest"

import { AVATAR_OPTIONS } from "@/constants/avatar-options"
import { MOCK_USERS } from "@/mock/users"

describe("avatar options", () => {
  it("มีตัวเลือกทั้งหมด 34 รูป โดย id และ path ไม่ซ้ำกัน", () => {
    expect(AVATAR_OPTIONS).toHaveLength(34)
    expect(new Set(AVATAR_OPTIONS.map((option) => option.id)).size).toBe(34)
    expect(new Set(AVATAR_OPTIONS.map((option) => option.src)).size).toBe(34)
  })

  it("มาสคอตเริ่มต้นของผู้ใช้ทุกคนอยู่ในคลังและไม่ซ้ำกัน", () => {
    const available = new Set(AVATAR_OPTIONS.map((option) => option.src))
    const assigned = MOCK_USERS.map((user) => user.avatarUrl)

    expect(assigned.every((src) => available.has(src))).toBe(true)
    expect(new Set(assigned).size).toBe(MOCK_USERS.length)
  })

  it("มีตัวเลือกใหม่ที่ยังไม่ถูกใช้ 20 รูป", () => {
    const assigned = new Set(MOCK_USERS.map((user) => user.avatarUrl))
    expect(
      AVATAR_OPTIONS.filter((option) => !assigned.has(option.src))
    ).toHaveLength(20)
  })
})
