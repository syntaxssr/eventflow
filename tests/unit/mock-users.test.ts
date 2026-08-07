import { describe, expect, it } from "vitest"

import { isNavItemActive } from "@/components/layout/nav-items"
import { createInitialState } from "@/mock"
import {
  MOCK_PASSWORD,
  MOCK_USERS,
  authenticate,
  findUserById,
} from "@/mock/users"

describe("mock users", () => {
  it("มีสมาชิกทีมครบ 14 คน เป็น admin หนึ่งคน ที่เหลือเป็น staff", () => {
    expect(MOCK_USERS).toHaveLength(14)

    const admins = MOCK_USERS.filter((user) => user.role === "admin")
    expect(admins).toHaveLength(1)
    expect(admins[0].email).toBe("peerapon.c@company.co.th")

    expect(
      MOCK_USERS.filter((user) => user.role === "staff")
    ).toHaveLength(13)
  })

  it("id และอีเมลไม่ซ้ำกัน", () => {
    expect(new Set(MOCK_USERS.map((user) => user.id)).size).toBe(
      MOCK_USERS.length
    )
    expect(new Set(MOCK_USERS.map((user) => user.email)).size).toBe(
      MOCK_USERS.length
    )
  })

  it("ทุกคนมีข้อมูลสองภาษาครบถ้วน", () => {
    for (const user of MOCK_USERS) {
      for (const field of [
        user.firstName,
        user.lastName,
        user.initials,
        user.position,
        user.team,
      ]) {
        expect(field.th.trim(), user.id).not.toBe("")
        expect(field.en.trim(), user.id).not.toBe("")
      }
    }
  })
})

describe("authenticate", () => {
  it("เข้าสู่ระบบสำเร็จด้วยอีเมลและรหัสผ่านที่ถูกต้อง", () => {
    const user = MOCK_USERS[0]
    expect(authenticate(user.email, MOCK_PASSWORD)?.userId).toBe(user.id)
  })

  it("ไม่สนตัวพิมพ์เล็ก–ใหญ่และช่องว่างของอีเมล", () => {
    const user = MOCK_USERS[1]
    expect(
      authenticate(`  ${user.email.toUpperCase()}  `, MOCK_PASSWORD)?.userId
    ).toBe(user.id)
  })

  it("ปฏิเสธเมื่อรหัสผ่านผิด", () => {
    expect(authenticate(MOCK_USERS[0].email, "wrong-password")).toBeUndefined()
  })

  it("ปฏิเสธเมื่อไม่มีอีเมลนี้ในระบบ", () => {
    expect(authenticate("nobody@company.co.th", MOCK_PASSWORD)).toBeUndefined()
  })

  it("findUserById คืนผู้ใช้ที่ถูกต้อง", () => {
    expect(findUserById("u-3")?.email).toBe(MOCK_USERS[2].email)
    expect(findUserById("u-999")).toBeUndefined()
  })
})

describe("createInitialState", () => {
  it("โหลด Mock Users เข้ามาและยังไม่มี session", () => {
    const state = createInitialState()
    expect(state.users).toHaveLength(MOCK_USERS.length)
    expect(state.session).toBeNull()
  })

  it("สร้าง Notification Settings เริ่มต้นให้ผู้ใช้ทุกคน", () => {
    const state = createInitialState()
    for (const user of MOCK_USERS) {
      expect(state.notificationSettings[user.id]).toEqual({
        assignedTask: true,
        dueSoon: true,
        fileChange: true,
        mention: true,
        timelineChange: true,
      })
    }
  })

  it("ไม่แชร์ reference ของ user object กับ MOCK_USERS ต้นฉบับ", () => {
    const state = createInitialState()
    expect(state.users[0]).not.toBe(MOCK_USERS[0])
    expect(state.users[0]).toEqual(MOCK_USERS[0])
  })
})

describe("isNavItemActive", () => {
  it("ตรงกันแบบเป๊ะ ๆ", () => {
    expect(isNavItemActive("/events", "/events")).toBe(true)
  })

  it("ไฮไลต์เมนูแม่เมื่ออยู่ในหน้าลูก", () => {
    expect(isNavItemActive("/events/e-1", "/events")).toBe(true)
  })

  it("ไม่ไฮไลต์เมนูที่ชื่อขึ้นต้นเหมือนกันแต่คนละเส้นทาง", () => {
    expect(isNavItemActive("/events-archive", "/events")).toBe(false)
  })

  it("ไม่ไฮไลต์เมนูอื่น", () => {
    expect(isNavItemActive("/dashboard", "/events")).toBe(false)
  })
})
