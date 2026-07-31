import { describe, expect, it } from "vitest"

import {
  MOCK_TODAY_ISO,
  daysBetween,
  fromDateKey,
  getToday,
  toDateKey,
} from "@/constants/mock-date"

describe("mock date helpers", () => {
  it('getToday() ตรงกับ MOCK_TODAY_ISO และเวลาเป็น 00:00', () => {
    const today = getToday()
    expect(toDateKey(today)).toBe(MOCK_TODAY_ISO)
    expect(today.getHours()).toBe(0)
    expect(today.getMinutes()).toBe(0)
  })

  it("toDateKey ใช้เวลาท้องถิ่น ไม่เพี้ยนข้ามวันจาก UTC", () => {
    // 31 ธ.ค. 23:30 ตามเวลาท้องถิ่น ต้องยังเป็นวันที่ 31 ไม่ใช่ 1 ม.ค.
    const lateNight = new Date(2026, 11, 31, 23, 30)
    expect(toDateKey(lateNight)).toBe("2026-12-31")
  })

  it("fromDateKey แปลงกลับได้ตรงกับ toDateKey", () => {
    const key = "2026-09-18"
    expect(toDateKey(fromDateKey(key))).toBe(key)
  })

  it("daysBetween นับเป็นจำนวนวันเต็มและมีเครื่องหมายถูกต้อง", () => {
    expect(daysBetween(fromDateKey("2026-07-31"), fromDateKey("2026-08-01"))).toBe(1)
    expect(daysBetween(fromDateKey("2026-08-01"), fromDateKey("2026-07-31"))).toBe(-1)
    expect(daysBetween(fromDateKey("2026-07-31"), fromDateKey("2026-07-31"))).toBe(0)
    expect(daysBetween(fromDateKey("2026-07-31"), fromDateKey("2026-09-18"))).toBe(49)
  })

  it("daysBetween ไม่ผิดพลาดเมื่อข้ามช่วงเปลี่ยนเวลา (DST)", () => {
    expect(daysBetween(new Date(2026, 2, 7, 12), new Date(2026, 2, 9, 12))).toBe(2)
  })
})
