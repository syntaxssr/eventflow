import type { SortDirection } from "@/lib/participant"
import type { DateKey, Locale, LocalizedText } from "@/types/common"
import type { Employee, EmployeeStatus } from "@/types/employee"

export type { SortDirection }

/** ชื่อ-นามสกุลโดยไม่รวมชื่อเล่น ใช้ในตารางที่แยกชื่อเล่นเป็นอีกคอลัมน์ */
export function getEmployeeName(employee: Employee, locale: Locale): string {
  return `${employee.firstName[locale]} ${employee.lastName[locale]}`.trim()
}

/**
 * ชื่อเต็มพร้อมชื่อเล่นในวงเล็บ เช่น "สมชาย ใจดี (ต้น)"
 * ละวงเล็บเมื่อไม่มีชื่อเล่น — รูปแบบเดียวกับ getFullName ของ User
 */
export function getEmployeeFullName(
  employee: Employee,
  locale: Locale
): string {
  const full = getEmployeeName(employee, locale)
  const nickname = employee.nickname[locale].trim()
  return nickname ? `${full} (${nickname})` : full
}

/** ชื่อเต็มทั้งสองภาษา สำหรับบันทึกลง Activity History */
export function getEmployeeLocalizedName(employee: Employee): LocalizedText {
  return {
    th: getEmployeeFullName(employee, "th"),
    en: getEmployeeFullName(employee, "en"),
  }
}

/** จำกัดชื่อแผนกบนหน้าจอ โดยไม่เปลี่ยนค่าจริงที่ใช้ค้นหาและเรียงลำดับ */
export function formatDepartmentName(name: string, maxLength = 30): string {
  const characters = Array.from(name)
  return characters.length > maxLength
    ? `${characters.slice(0, maxLength).join("")}...`
    : name
}

export interface EmployeeFilters {
  /** ค้นจากชื่อ ชื่อเล่น รหัสพนักงาน อีเมล แผนก และตำแหน่ง */
  query: string
  /** เทียบกับชื่อแผนกภาษาไทย (ใช้เป็นค่าอ้างอิงของตัวกรอง) */
  department: string | "all"
  status: EmployeeStatus | "all"
}

export const EMPTY_EMPLOYEE_FILTERS: EmployeeFilters = {
  query: "",
  department: "all",
  status: "all",
}

/** รายชื่อแผนกไม่ซ้ำ เรียงตามตัวอักษร ใช้เติมตัวเลือกของตัวกรอง */
export function listDepartments(
  employees: Employee[],
  locale: Locale
): { key: string; label: string }[] {
  const byKey = new Map<string, string>()
  for (const employee of employees) {
    const key = employee.department.th
    if (key.trim() !== "" && !byKey.has(key)) {
      byKey.set(key, employee.department[locale])
    }
  }
  return [...byKey.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label, locale))
}

export function filterEmployees(
  employees: Employee[],
  filters: EmployeeFilters,
  locale: Locale
): Employee[] {
  const query = filters.query.trim().toLowerCase()
  const otherLocale: Locale = locale === "th" ? "en" : "th"

  return employees.filter((employee) => {
    if (filters.status !== "all" && employee.status !== filters.status)
      return false
    if (
      filters.department !== "all" &&
      employee.department.th !== filters.department
    )
      return false

    if (query === "") return true
    // ชื่อเต็มรวมชื่อเล่นไว้แล้ว จึงค้นคำติดกันอย่าง "สมชาย ใจดี" ได้ทั้งสองภาษา
    const haystack = [
      getEmployeeFullName(employee, locale),
      getEmployeeFullName(employee, otherLocale),
      employee.employeeCode,
      employee.email,
      employee.department.th,
      employee.department.en,
      employee.position.th,
      employee.position.en,
    ]
      .join(" ")
      .toLowerCase()
    return haystack.includes(query)
  })
}

export const EMPLOYEE_SORT_KEYS = [
  "name",
  "nickname",
  "employeeCode",
  "department",
  "position",
  "startDate",
  "status",
] as const

export type EmployeeSortKey = (typeof EMPLOYEE_SORT_KEYS)[number]

const STATUS_ORDER: Record<EmployeeStatus, number> = {
  active: 0,
  on_leave: 1,
  resigned: 2,
}

export function sortEmployees(
  employees: Employee[],
  key: EmployeeSortKey,
  direction: SortDirection,
  locale: Locale
): Employee[] {
  const factor = direction === "asc" ? 1 : -1
  const byName = (a: Employee, b: Employee) =>
    getEmployeeName(a, locale).localeCompare(
      getEmployeeName(b, locale),
      locale
    )

  return [...employees].sort((a, b) => {
    let result = 0
    switch (key) {
      case "name":
        result = byName(a, b)
        break
      case "nickname":
        result = a.nickname[locale].localeCompare(b.nickname[locale], locale)
        break
      case "employeeCode":
        // numeric เพื่อให้ EMP-0002 มาก่อน EMP-0010 แม้รหัสที่ผู้ใช้กรอกจะไม่เติมศูนย์
        result = a.employeeCode.localeCompare(b.employeeCode, undefined, {
          numeric: true,
        })
        break
      case "department":
        result = a.department[locale].localeCompare(b.department[locale], locale)
        break
      case "position":
        result = a.position[locale].localeCompare(b.position[locale], locale)
        break
      case "startDate":
        result = a.startDate.localeCompare(b.startDate)
        break
      case "status":
        result = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
        break
    }
    // ผูกผลเสมอด้วยชื่อ เพื่อให้ลำดับคงที่ทุกครั้ง
    if (result === 0) result = byName(a, b)
    return result * factor
  })
}

/**
 * อายุงานเต็มปี (ปัดลง) จากวันเริ่มงานถึงวันที่กำหนด
 * เทียบจากสตริง `YYYY-MM-DD` ตรง ๆ จึงไม่ขึ้นกับโซนเวลา — ยังไม่ถึงวันเริ่มงานนับเป็น 0
 */
export function yearsOfService(startDate: DateKey, todayKey: DateKey): number {
  let years = Number(todayKey.slice(0, 4)) - Number(startDate.slice(0, 4))
  if (todayKey.slice(5) < startDate.slice(5)) years -= 1
  return Math.max(0, years)
}

export interface EmployeeSummary {
  total: number
  active: number
  onLeave: number
  departments: number
}

/** ตัวเลขสรุปบนการ์ด — นับแผนกจากชื่อภาษาไทยเช่นเดียวกับตัวกรอง */
export function summariseEmployees(employees: Employee[]): EmployeeSummary {
  const departments = new Set<string>()
  let active = 0
  let onLeave = 0
  for (const employee of employees) {
    if (employee.status === "active") active += 1
    else if (employee.status === "on_leave") onLeave += 1
    if (employee.department.th.trim() !== "") {
      departments.add(employee.department.th)
    }
  }
  return { total: employees.length, active, onLeave, departments: departments.size }
}
