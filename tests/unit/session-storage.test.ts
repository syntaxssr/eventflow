import { beforeEach, describe, expect, it } from "vitest"

import { readStoredSession, writeStoredSession } from "@/store/session-storage"
import type { AuthSession } from "@/types"

const SESSION_KEY = "eventflow.session"
const rememberedSession: AuthSession = {
  userId: "u-1",
  signedInAt: "2026-07-31T09:00:00.000Z",
  rememberMe: true,
}

describe("remembered auth session", () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it("เก็บ session ที่เลือกจดจำไว้ใน localStorage เท่านั้น", () => {
    writeStoredSession(rememberedSession)

    expect(JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? "null")).toEqual(
      rememberedSession
    )
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it("ไม่เก็บ session เมื่อไม่ได้เลือกจดจำ", () => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(rememberedSession))
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(rememberedSession))

    writeStoredSession({ ...rememberedSession, rememberMe: false })

    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull()
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it("อ่าน session ที่จดจำไว้กลับมาได้", () => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(rememberedSession))

    expect(readStoredSession()).toEqual(rememberedSession)
  })

  it("ย้าย session รูปแบบเดิมจาก sessionStorage ไป localStorage", () => {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(rememberedSession))

    expect(readStoredSession()).toEqual(rememberedSession)
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull()
    expect(JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? "null")).toEqual(
      rememberedSession
    )
  })

  it("ล้างข้อมูลที่รูปแบบไม่ถูกต้อง", () => {
    window.localStorage.setItem(SESSION_KEY, "not-json")

    expect(readStoredSession()).toBeNull()
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull()
  })
})
