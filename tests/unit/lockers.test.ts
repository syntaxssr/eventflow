import { describe, expect, it } from "vitest"

import {
  LOCKER_CABINET_COUNT,
  LOCKERS_PER_CABINET,
  MOCK_LOCKERS,
} from "@/mock/lockers"
import { MOCK_EMPLOYEES } from "@/mock/employees"

describe("locker register", () => {
  it("มีครบ 96 ช่อง เรียงต่อเนื่องและรหัสไม่ซ้ำ", () => {
    expect(MOCK_LOCKERS).toHaveLength(96)
    expect(new Set(MOCK_LOCKERS.map((locker) => locker.code)).size).toBe(96)
    expect(MOCK_LOCKERS.map((locker) => locker.number)).toEqual(
      Array.from({ length: 96 }, (_, index) => index + 1)
    )
  })

  it("จำนวนตู้พอดีกับจำนวนช่อง ไม่มีตู้ที่ว่างเปล่า", () => {
    expect(LOCKER_CABINET_COUNT).toBe(8)
    expect(LOCKER_CABINET_COUNT * LOCKERS_PER_CABINET).toBe(MOCK_LOCKERS.length)
  })

  it("ช่องว่างไม่มีข้อมูลผู้ใช้งานติดมา", () => {
    for (const locker of MOCK_LOCKERS) {
      if (locker.status !== "available") continue
      expect(locker.occupantName).toBe("")
      expect(locker.employeeId).toBeNull()
    }
  })

  it("ช่องที่มีผู้ใช้งานต้องมีชื่อผู้ครอบครองเสมอ", () => {
    const occupied = MOCK_LOCKERS.filter(
      (locker) => locker.status === "occupied"
    )

    expect(occupied).toHaveLength(65)
    expect(occupied.every((locker) => locker.occupantName !== "")).toBe(true)
  })

  it("employeeId ที่จับคู่ไว้ต้องมีอยู่จริงในทะเบียนพนักงาน", () => {
    const employeeIds = new Set(MOCK_EMPLOYEES.map((employee) => employee.id))
    const linked = MOCK_LOCKERS.filter((locker) => locker.employeeId !== null)

    expect(linked.length).toBeGreaterThan(0)
    expect(
      linked.every((locker) => employeeIds.has(locker.employeeId as string))
    ).toBe(true)
  })

  it("ชื่อกุญแจไม่ซ้ำกันในช่องเดียวกันและอ้างอิงรหัสกุญแจของช่อง", () => {
    for (const locker of MOCK_LOCKERS) {
      const names = locker.keys.map((key) => key.name)
      expect(new Set(names).size).toBe(names.length)
      expect(names.every((name) => name.startsWith(locker.keyNo))).toBe(true)
    }
  })

  it("จำนวนกุญแจตรงกับที่ระบุไว้ใน Remarks", () => {
    const byCode = new Map(
      MOCK_LOCKERS.map((locker) => [locker.code, locker] as const)
    )

    expect(byCode.get("L001")?.keys).toEqual([{ name: "K001" }])
    expect(byCode.get("L006")?.keys).toEqual([
      { name: "K006-1" },
      { name: "K006-2" },
    ])
    expect(byCode.get("L046")?.keys).toHaveLength(3)
    // L029 มี Remarks เป็น "-" จึงไม่มีกุญแจเก็บไว้ในช่อง
    expect(byCode.get("L029")?.keys).toEqual([])
  })

  it("แยกของอื่นในช่องออกจาก Remarks ได้", () => {
    const byCode = new Map(
      MOCK_LOCKERS.map((locker) => [locker.code, locker] as const)
    )

    expect(byCode.get("L008")?.contentTags).toEqual(["office_supply"])
    expect(byCode.get("L066")?.contentTags).toEqual(["snack"])
    expect(byCode.get("L001")?.contentTags).toEqual([])
  })
})
