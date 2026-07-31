import { describe, expect, it } from "vitest"

import { en } from "@/i18n/dictionaries/en"
import { th } from "@/i18n/dictionaries/th"

type Flat = Record<string, string>

function flatten(dictionary: Record<string, Record<string, string>>): Flat {
  const result: Flat = {}
  for (const [section, entries] of Object.entries(dictionary)) {
    for (const [key, value] of Object.entries(entries)) {
      result[`${section}.${key}`] = value
    }
  }
  return result
}

describe("i18n dictionaries", () => {
  const flatTh = flatten(th as unknown as Record<string, Record<string, string>>)
  const flatEn = flatten(en as unknown as Record<string, Record<string, string>>)

  it("มี key ครบเท่ากันทั้งภาษาไทยและอังกฤษ", () => {
    expect(Object.keys(flatEn).sort()).toEqual(Object.keys(flatTh).sort())
  })

  it("ไม่มีข้อความว่างในทั้งสองภาษา", () => {
    const emptyTh = Object.entries(flatTh).filter(([, value]) => !value.trim())
    const emptyEn = Object.entries(flatEn).filter(([, value]) => !value.trim())
    expect(emptyTh).toEqual([])
    expect(emptyEn).toEqual([])
  })

  it("ข้อความภาษาอังกฤษต้องไม่มีอักษรไทยหลุดปะปน", () => {
    // ยกเว้น key ที่ตั้งใจแสดงชื่อภาษาในภาษานั้น ๆ
    const allowlist = new Set(["locale.th"])
    const thaiPattern = /[฀-๿]/

    const leaked = Object.entries(flatEn)
      .filter(([key]) => !allowlist.has(key))
      .filter(([, value]) => thaiPattern.test(value))
      .map(([key]) => key)

    expect(leaked).toEqual([])
  })
})
