import { describe, expect, it } from "vitest"

import {
  MAIN_NAV,
  MISC_NAV,
  MISC_NAV_GROUP,
  MOBILE_MORE_NAV,
  isNavGroup,
  isNavGroupActive,
  isNavItemActive,
} from "@/components/layout/nav-items"
import { ROUTES } from "@/constants/app"

describe("nav-items — โครงเมนูหลัก", () => {
  it("เบ็ดเตล็ดเป็นเมนูที่ 3 และอยู่ก่อนถังขยะ", () => {
    expect(isNavGroup(MAIN_NAV[2])).toBe(true)
    expect(MAIN_NAV[2]).toBe(MISC_NAV_GROUP)

    const trash = MAIN_NAV[3]
    expect(isNavGroup(trash)).toBe(false)
    if (!isNavGroup(trash)) expect(trash.href).toBe(ROUTES.trash)
  })

  it("เบ็ดเตล็ดมีเมนูย่อยครบ 3 หน้า", () => {
    expect(MISC_NAV.map((item) => item.href)).toEqual([
      ROUTES.employees,
      ROUTES.forms,
      ROUTES.games,
    ])
  })

  it("เมนู More บนมือถือคลี่เมนูย่อยของเบ็ดเตล็ดออกมาเป็นรายการเดี่ยว", () => {
    const hrefs = MOBILE_MORE_NAV.map((item) => item.href)
    for (const item of MISC_NAV) {
      expect(hrefs).toContain(item.href)
    }
    expect(hrefs.indexOf(ROUTES.trash)).toBeGreaterThan(
      hrefs.indexOf(ROUTES.forms)
    )
  })
})

describe("isNavGroupActive", () => {
  it("active เมื่อ pathname อยู่ใต้เมนูย่อยตัวใดตัวหนึ่ง", () => {
    expect(isNavGroupActive(ROUTES.employees, MISC_NAV_GROUP)).toBe(true)
    expect(isNavGroupActive(ROUTES.employeeDirectory, MISC_NAV_GROUP)).toBe(true)
    expect(isNavGroupActive(ROUTES.employeeLockers, MISC_NAV_GROUP)).toBe(true)
    expect(isNavGroupActive(ROUTES.spinWheel, MISC_NAV_GROUP)).toBe(true)
    expect(isNavGroupActive(ROUTES.forms, MISC_NAV_GROUP)).toBe(true)
    expect(isNavGroupActive(ROUTES.eventFeedback, MISC_NAV_GROUP)).toBe(true)
  })

  it("ไม่ active บนหน้าที่ไม่เกี่ยวกับกลุ่ม", () => {
    expect(isNavGroupActive(ROUTES.dashboard, MISC_NAV_GROUP)).toBe(false)
    expect(isNavGroupActive(ROUTES.trash, MISC_NAV_GROUP)).toBe(false)
  })

  it("ไม่จับ prefix ที่บังเอิญขึ้นต้นเหมือนกัน", () => {
    expect(isNavItemActive("/hr-section-archive", ROUTES.employees)).toBe(false)
  })
})
