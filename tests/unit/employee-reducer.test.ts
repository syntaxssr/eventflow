import { describe, expect, it } from "vitest"

import { createInitialState } from "@/mock"
import { appReducer } from "@/store/reducer"
import type { Employee } from "@/types/employee"

const NEW_EMPLOYEE: Employee = {
  id: "emp-901",
  employeeCode: "EMP-0901",
  firstName: { th: "ทดสอบ", en: "Test" },
  lastName: { th: "ระบบ", en: "System" },
  nickname: { th: "เทส", en: "Tess" },
  department: { th: "ฝ่ายเทคโนโลยีสารสนเทศ", en: "Information Technology" },
  position: { th: "เจ้าหน้าที่", en: "Officer" },
  email: "test.s@company.co.th",
  phone: "091-000-0000",
  startDate: "2026-01-05",
  status: "active",
  note: { th: "", en: "" },
}

describe("appReducer — employee", () => {
  it("employee/add แทรกพนักงานใหม่ไว้บนสุดของทะเบียน", () => {
    const initial = createInitialState()
    const state = appReducer(initial, {
      type: "employee/add",
      employee: NEW_EMPLOYEE,
    })

    expect(state.employees).toHaveLength(initial.employees.length + 1)
    expect(state.employees[0]).toEqual(NEW_EMPLOYEE)
    expect(initial.employees.find((e) => e.id === "emp-901")).toBeUndefined()
  })

  it("employee/update แก้เฉพาะฟิลด์ที่ส่งมาและไม่แตะคนอื่น", () => {
    const initial = createInitialState()
    const target = initial.employees[3]
    const state = appReducer(initial, {
      type: "employee/update",
      id: target.id,
      changes: { status: "on_leave", phone: "099-999-9999" },
    })

    const updated = state.employees.find((e) => e.id === target.id)!
    expect(updated.status).toBe("on_leave")
    expect(updated.phone).toBe("099-999-9999")
    expect(updated.firstName).toEqual(target.firstName)
    expect(state.employees.filter((e) => e.id !== target.id)).toEqual(
      initial.employees.filter((e) => e.id !== target.id)
    )
  })

  it("employee/delete ลบได้หลายคนในครั้งเดียว", () => {
    const initial = createInitialState()
    const ids = initial.employees.slice(0, 3).map((e) => e.id)
    const state = appReducer(initial, { type: "employee/delete", ids })

    expect(state.employees).toHaveLength(initial.employees.length - 3)
    for (const id of ids) {
      expect(state.employees.some((e) => e.id === id)).toBe(false)
    }
  })

  it("employee/delete ด้วย id ที่ไม่มีอยู่ ไม่เปลี่ยนทะเบียน", () => {
    const initial = createInitialState()
    const state = appReducer(initial, {
      type: "employee/delete",
      ids: ["emp-does-not-exist"],
    })

    expect(state.employees).toEqual(initial.employees)
  })
})
