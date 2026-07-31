import { describe, expect, it } from "vitest"

import { createInitialState } from "@/mock"
import { appReducer } from "@/store/reducer"

const SIGNED_IN_AT = "2026-07-31T09:30:00+07:00"

describe("appReducer — auth & system", () => {
  it("auth/signIn สร้าง session ของผู้ใช้ที่ระบุ", () => {
    const state = appReducer(createInitialState(), {
      type: "auth/signIn",
      userId: "u-1",
      rememberMe: true,
      at: SIGNED_IN_AT,
    })

    expect(state.session).toEqual({
      userId: "u-1",
      rememberMe: true,
      signedInAt: SIGNED_IN_AT,
    })
  })

  it("auth/switchUser เปลี่ยนผู้ใช้โดยไม่ต้อง login ใหม่", () => {
    const signedIn = appReducer(createInitialState(), {
      type: "auth/signIn",
      userId: "u-1",
      rememberMe: false,
      at: SIGNED_IN_AT,
    })

    const switched = appReducer(signedIn, {
      type: "auth/switchUser",
      userId: "u-2",
    })

    expect(switched.session?.userId).toBe("u-2")
    expect(switched.session?.signedInAt).toBe(SIGNED_IN_AT)
  })

  it("auth/switchUser ไม่ทำอะไรเมื่อยังไม่ได้เข้าสู่ระบบ", () => {
    const initial = createInitialState()
    const next = appReducer(initial, { type: "auth/switchUser", userId: "u-2" })
    expect(next.session).toBeNull()
  })

  it("auth/signOut ล้าง session", () => {
    const signedIn = appReducer(createInitialState(), {
      type: "auth/signIn",
      userId: "u-1",
      rememberMe: false,
      at: SIGNED_IN_AT,
    })
    expect(appReducer(signedIn, { type: "auth/signOut" }).session).toBeNull()
  })

  it("system/reset คืนค่ากลับเป็น Mock Data เริ่มต้น", () => {
    const signedIn = appReducer(createInitialState(), {
      type: "auth/signIn",
      userId: "u-1",
      rememberMe: false,
      at: SIGNED_IN_AT,
    })

    const reset = appReducer(signedIn, {
      type: "system/reset",
      state: createInitialState(),
    })

    expect(reset).toEqual(createInitialState())
  })

  it("createInitialState คืน object ใหม่ทุกครั้ง (ไม่แชร์ reference)", () => {
    const a = createInitialState()
    const b = createInitialState()
    expect(a).not.toBe(b)
    expect(a.events).not.toBe(b.events)
  })
})
