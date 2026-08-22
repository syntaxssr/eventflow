import { describe, expect, it } from "vitest"

import {
  EMPTY_EMPLOYEE_FILTERS,
  filterEmployees,
  getEmployeeFullName,
  getEmployeeLocalizedName,
  listDepartments,
  sortEmployees,
  summariseEmployees,
  yearsOfService,
} from "@/lib/employee"
import type { Employee } from "@/types/employee"

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: "emp-1",
    employeeCode: "EMP-0001",
    firstName: { th: "สมชาย", en: "Somchai" },
    lastName: { th: "ใจดี", en: "Jaidee" },
    nickname: { th: "ต้น", en: "Ton" },
    department: { th: "ฝ่ายขาย", en: "Sales" },
    position: { th: "เจ้าหน้าที่", en: "Officer" },
    email: "somchai.j@company.co.th",
    phone: "081-111-2222",
    startDate: "2019-03-25",
    status: "active",
    note: { th: "", en: "" },
    ...overrides,
  }
}

const EMPLOYEES: Employee[] = [
  makeEmployee(),
  makeEmployee({
    id: "emp-2",
    employeeCode: "EMP-0010",
    firstName: { th: "อารยา", en: "Araya" },
    lastName: { th: "เก่งมาก", en: "Kengmak" },
    nickname: { th: "", en: "" },
    department: { th: "ฝ่ายบัญชี", en: "Accounting" },
    position: { th: "ผู้จัดการแผนก", en: "Department Manager" },
    email: "araya.k@company.co.th",
    startDate: "2015-06-01",
    status: "on_leave",
  }),
  makeEmployee({
    id: "emp-3",
    employeeCode: "EMP-0002",
    firstName: { th: "บดินทร์", en: "Bodin" },
    lastName: { th: "พูดเก่ง", en: "Poodkeng" },
    nickname: { th: "บอส", en: "Boss" },
    department: { th: "ฝ่ายขาย", en: "Sales" },
    position: { th: "นักวิเคราะห์", en: "Analyst" },
    email: "bodin.p@company.co.th",
    phone: "089-999-0000",
    startDate: "2024-02-26",
    status: "resigned",
  }),
]

describe("getEmployeeFullName", () => {
  it("ต่อชื่อ-นามสกุลและชื่อเล่นในวงเล็บตามภาษา", () => {
    expect(getEmployeeFullName(EMPLOYEES[0], "th")).toBe("สมชาย ใจดี (ต้น)")
    expect(getEmployeeFullName(EMPLOYEES[0], "en")).toBe("Somchai Jaidee (Ton)")
  })

  it("ละวงเล็บเมื่อไม่มีชื่อเล่น", () => {
    expect(getEmployeeFullName(EMPLOYEES[1], "th")).toBe("อารยา เก่งมาก")
    expect(getEmployeeFullName(EMPLOYEES[1], "en")).toBe("Araya Kengmak")
  })

  it("ชื่อเล่นที่มีแต่ช่องว่างถือว่าไม่มี", () => {
    const employee = makeEmployee({ nickname: { th: "  ", en: "  " } })
    expect(getEmployeeFullName(employee, "en")).toBe("Somchai Jaidee")
  })

  it("คืนชื่อเต็มทั้งสองภาษาสำหรับ Activity History", () => {
    expect(getEmployeeLocalizedName(EMPLOYEES[0])).toEqual({
      th: "สมชาย ใจดี (ต้น)",
      en: "Somchai Jaidee (Ton)",
    })
  })
})

describe("filterEmployees", () => {
  it("ไม่มีตัวกรอง = ได้ทุกคน", () => {
    expect(
      filterEmployees(EMPLOYEES, EMPTY_EMPLOYEE_FILTERS, "th")
    ).toHaveLength(3)
  })

  it("ค้นหาจากชื่อเต็มทั้งสองภาษา ไม่สนตัวพิมพ์", () => {
    const byThaiFullName = filterEmployees(
      EMPLOYEES,
      { ...EMPTY_EMPLOYEE_FILTERS, query: "สมชาย ใจดี" },
      "en"
    )
    expect(byThaiFullName.map((e) => e.id)).toEqual(["emp-1"])

    const byEnglishName = filterEmployees(
      EMPLOYEES,
      { ...EMPTY_EMPLOYEE_FILTERS, query: "BODIN" },
      "th"
    )
    expect(byEnglishName.map((e) => e.id)).toEqual(["emp-3"])
  })

  it("ค้นหาจากชื่อเล่น รหัสพนักงาน และอีเมล", () => {
    const byNickname = filterEmployees(
      EMPLOYEES,
      { ...EMPTY_EMPLOYEE_FILTERS, query: "boss" },
      "th"
    )
    expect(byNickname.map((e) => e.id)).toEqual(["emp-3"])

    const byCode = filterEmployees(
      EMPLOYEES,
      { ...EMPTY_EMPLOYEE_FILTERS, query: "emp-0010" },
      "th"
    )
    expect(byCode.map((e) => e.id)).toEqual(["emp-2"])

    const byEmail = filterEmployees(
      EMPLOYEES,
      { ...EMPTY_EMPLOYEE_FILTERS, query: "araya.k@" },
      "th"
    )
    expect(byEmail.map((e) => e.id)).toEqual(["emp-2"])
  })

  it("ค้นหาจากแผนกและตำแหน่ง", () => {
    const byDepartment = filterEmployees(
      EMPLOYEES,
      { ...EMPTY_EMPLOYEE_FILTERS, query: "accounting" },
      "th"
    )
    expect(byDepartment.map((e) => e.id)).toEqual(["emp-2"])

    const byPosition = filterEmployees(
      EMPLOYEES,
      { ...EMPTY_EMPLOYEE_FILTERS, query: "นักวิเคราะห์" },
      "en"
    )
    expect(byPosition.map((e) => e.id)).toEqual(["emp-3"])
  })

  it("กรองตามแผนกและสถานะพร้อมกันได้", () => {
    const byDepartment = filterEmployees(
      EMPLOYEES,
      { ...EMPTY_EMPLOYEE_FILTERS, department: "ฝ่ายขาย" },
      "th"
    )
    expect(byDepartment.map((e) => e.id)).toEqual(["emp-1", "emp-3"])

    const byStatus = filterEmployees(
      EMPLOYEES,
      { ...EMPTY_EMPLOYEE_FILTERS, status: "on_leave" },
      "th"
    )
    expect(byStatus.map((e) => e.id)).toEqual(["emp-2"])

    const combined = filterEmployees(
      EMPLOYEES,
      { query: "", department: "ฝ่ายขาย", status: "resigned" },
      "th"
    )
    expect(combined.map((e) => e.id)).toEqual(["emp-3"])
  })

  it("ไม่พบอะไรเมื่อคำค้นไม่ตรงกับฟิลด์ใดเลย", () => {
    expect(
      filterEmployees(
        EMPLOYEES,
        { ...EMPTY_EMPLOYEE_FILTERS, query: "ไม่มีคนนี้" },
        "th"
      )
    ).toHaveLength(0)
  })
})

describe("sortEmployees", () => {
  it("เรียงตามชื่อ asc/desc", () => {
    const asc = sortEmployees(EMPLOYEES, "name", "asc", "en")
    expect(asc.map((e) => e.id)).toEqual(["emp-2", "emp-3", "emp-1"])
    const desc = sortEmployees(EMPLOYEES, "name", "desc", "en")
    expect(desc.map((e) => e.id)).toEqual(["emp-1", "emp-3", "emp-2"])
  })

  it("เรียงตามวันเริ่มงาน", () => {
    const asc = sortEmployees(EMPLOYEES, "startDate", "asc", "th")
    expect(asc.map((e) => e.startDate)).toEqual([
      "2015-06-01",
      "2019-03-25",
      "2024-02-26",
    ])
    const desc = sortEmployees(EMPLOYEES, "startDate", "desc", "th")
    expect(desc.map((e) => e.startDate)).toEqual([
      "2024-02-26",
      "2019-03-25",
      "2015-06-01",
    ])
  })

  it("เรียงรหัสพนักงานแบบตัวเลข: EMP-0002 มาก่อน EMP-0010", () => {
    const sorted = sortEmployees(EMPLOYEES, "employeeCode", "asc", "th")
    expect(sorted.map((e) => e.employeeCode)).toEqual([
      "EMP-0001",
      "EMP-0002",
      "EMP-0010",
    ])
  })

  it("เรียงตามสถานะ: ทำงานอยู่ → ลาพัก → ลาออก", () => {
    const sorted = sortEmployees(EMPLOYEES, "status", "asc", "th")
    expect(sorted.map((e) => e.status)).toEqual([
      "active",
      "on_leave",
      "resigned",
    ])
  })

  it("แผนกเดียวกันผูกผลเสมอด้วยชื่อ", () => {
    const sorted = sortEmployees(EMPLOYEES, "department", "asc", "en")
    expect(sorted.map((e) => e.id)).toEqual(["emp-2", "emp-3", "emp-1"])
  })

  it("ไม่แก้ไข array ต้นฉบับ", () => {
    const before = EMPLOYEES.map((e) => e.id)
    sortEmployees(EMPLOYEES, "position", "desc", "th")
    expect(EMPLOYEES.map((e) => e.id)).toEqual(before)
  })
})

describe("yearsOfService", () => {
  it("นับเต็มปีแบบปัดลง", () => {
    expect(yearsOfService("2019-03-25", "2026-07-31")).toBe(7)
    expect(yearsOfService("2024-02-26", "2026-07-31")).toBe(2)
  })

  it("ยังไม่ถึงวันครบรอบในปีนี้ ยังไม่นับปีนั้น", () => {
    expect(yearsOfService("2019-09-01", "2026-07-31")).toBe(6)
    expect(yearsOfService("2019-07-31", "2026-07-30")).toBe(6)
    expect(yearsOfService("2019-07-31", "2026-07-31")).toBe(7)
  })

  it("เริ่มงานปีเดียวกันหรือยังไม่เริ่มได้ 0", () => {
    expect(yearsOfService("2026-01-12", "2026-07-31")).toBe(0)
    expect(yearsOfService("2026-09-01", "2026-07-31")).toBe(0)
  })
})

describe("listDepartments", () => {
  it("ไม่ซ้ำ เรียงตามตัวอักษร และใช้ภาษาที่เลือก", () => {
    expect(listDepartments(EMPLOYEES, "en")).toEqual([
      { key: "ฝ่ายบัญชี", label: "Accounting" },
      { key: "ฝ่ายขาย", label: "Sales" },
    ])
  })

  it("ข้ามแผนกว่าง", () => {
    const withBlank = [
      ...EMPLOYEES,
      makeEmployee({ id: "emp-4", department: { th: " ", en: " " } }),
    ]
    expect(listDepartments(withBlank, "th")).toHaveLength(2)
  })
})

describe("summariseEmployees", () => {
  it("นับทั้งหมด ทำงานอยู่ ลาพัก และจำนวนแผนก", () => {
    expect(summariseEmployees(EMPLOYEES)).toEqual({
      total: 3,
      active: 1,
      onLeave: 1,
      departments: 2,
    })
  })

  it("ทะเบียนว่างได้ศูนย์ทุกช่อง", () => {
    expect(summariseEmployees([])).toEqual({
      total: 0,
      active: 0,
      onLeave: 0,
      departments: 0,
    })
  })
})
