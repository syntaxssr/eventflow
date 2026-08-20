import { describe, expect, it } from "vitest"

import {
  AVATAR_PALETTE,
  AVATAR_PALETTE_ITEMS,
  getAvatarForegroundColor,
} from "@/constants/avatar-colors"
import {
  READABLE_DARK,
  READABLE_LIGHT,
  contrastRatio,
  getReadableTextColor,
  hexToRgb,
} from "@/lib/color"
import { MOCK_USERS } from "@/mock/users"

const BRAND = "#f99b35"
const WHITE = "#ffffff"
const NEAR_BLACK = "#171717"

describe("color utilities", () => {
  it("แปลง HEX เป็น RGB ได้ทั้งแบบ 3 และ 6 หลัก", () => {
    expect(hexToRgb("#fff")).toEqual([255, 255, 255])
    expect(hexToRgb("f99b35")).toEqual([249, 155, 53])
    expect(hexToRgb("not-a-color")).toBeNull()
  })

  it("contrast ของขาว–ดำ เท่ากับ 21:1", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 1)
  })

  it("ยืนยันว่าข้อความสีขาวบนสีแบรนด์ไม่ผ่าน WCAG AA", () => {
    // เหตุผลที่ปุ่ม Primary ต้องใช้ข้อความสีเข้มแทนสีขาว
    expect(contrastRatio(WHITE, BRAND)).toBeLessThan(4.5)
  })

  it("ข้อความสีเข้มบนสีแบรนด์ผ่าน WCAG AA", () => {
    expect(contrastRatio("#2a1705", BRAND)).toBeGreaterThanOrEqual(4.5)
  })

  it("สีแบรนด์บนพื้นมืดผ่าน WCAG AA (ใช้เป็นข้อความใน Dark Mode ได้)", () => {
    expect(contrastRatio(BRAND, NEAR_BLACK)).toBeGreaterThanOrEqual(4.5)
  })

  it("getReadableTextColor เลือกสีที่ contrast สูงกว่าเสมอ", () => {
    expect(getReadableTextColor("#ffffff")).toBe(READABLE_DARK)
    expect(getReadableTextColor("#000000")).toBe(READABLE_LIGHT)
    expect(getReadableTextColor(BRAND)).toBe(READABLE_DARK)
  })

  it("ทุกคู่สีในพาเลต Avatar ผ่าน AA", () => {
    for (const item of AVATAR_PALETTE_ITEMS) {
      expect(
        contrastRatio(item.foreground, item.hex),
        `${item.name} (${item.hex}/${item.foreground})`
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  it("สี Avatar ของ Mock User ทุกคนอยู่ในพาเลตและได้ข้อความที่ผ่าน AA", () => {
    for (const user of MOCK_USERS) {
      expect(AVATAR_PALETTE, `${user.id}`).toContain(user.avatarColor)

      const textColor = getAvatarForegroundColor(user.avatarColor)
      expect(textColor, `${user.id} (${user.avatarColor})`).not.toBeNull()
      expect(
        contrastRatio(textColor as string, user.avatarColor),
        `${user.id} (${user.avatarColor})`
      ).toBeGreaterThanOrEqual(4.5)
    }
  })
})
