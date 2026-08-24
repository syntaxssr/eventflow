import type { LocalizedText } from "@/types/common"
import type { Employee, EmployeeStatus } from "@/types/employee"
import { IMPORTED_EMPLOYEES } from "./employees.generated"
import {
  DEPARTMENTS,
  FIRST_NAMES,
  LAST_NAMES,
  type NamePair,
} from "./participants"
import { MOCK_USERS } from "./users"

/** ชื่อเล่นวนใช้กับพนักงานที่สร้างจากสูตร */
const NICKNAMES: NamePair[] = [
  ["ต้น", "Ton"],
  ["แพร", "Prae"],
  ["เบียร์", "Beer"],
  ["ฟ้า", "Fah"],
  ["กอล์ฟ", "Golf"],
  ["มิ้นท์", "Mint"],
  ["บอส", "Boss"],
  ["พลอย", "Ploy"],
  ["เจมส์", "James"],
  ["แนน", "Nan"],
  ["ไอซ์", "Ice"],
  ["เมย์", "May"],
  ["ปอ", "Por"],
  ["จูน", "June"],
  ["ต่อ", "Tor"],
  ["นิว", "New"],
  ["ออม", "Aom"],
  ["บีม", "Beam"],
  ["เฟิร์น", "Fern"],
  ["ก้อง", "Kong"],
  ["มุก", "Mook"],
  ["ไนซ์", "Nice"],
  ["ปาล์ม", "Palm"],
  ["เอิร์ธ", "Earth"],
]

const POSITIONS: LocalizedText[] = [
  { th: "เจ้าหน้าที่", en: "Officer" },
  { th: "เจ้าหน้าที่อาวุโส", en: "Senior Officer" },
  { th: "ผู้ประสานงาน", en: "Coordinator" },
  { th: "นักวิเคราะห์", en: "Analyst" },
  { th: "ผู้เชี่ยวชาญ", en: "Specialist" },
  { th: "หัวหน้าทีม", en: "Team Lead" },
  { th: "ผู้ช่วยผู้จัดการ", en: "Assistant Manager" },
  { th: "ผู้จัดการแผนก", en: "Department Manager" },
]

/**
 * วันเริ่มงานกระจายตั้งแต่ปี 2015 ถึงต้นปี 2026 (ก่อน ANCHOR_TODAY_ISO เสมอ)
 * ใช้ชุดคงที่แทนการสุ่มเพื่อให้ข้อมูลเหมือนเดิมทุกครั้งที่โหลด
 */
const START_DATES: string[] = [
  "2015-06-01",
  "2016-02-15",
  "2017-09-04",
  "2018-01-08",
  "2018-11-19",
  "2019-03-25",
  "2019-10-14",
  "2020-07-01",
  "2021-01-18",
  "2021-08-02",
  "2022-04-11",
  "2022-12-05",
  "2023-05-22",
  "2023-10-09",
  "2024-02-26",
  "2024-09-16",
  "2025-03-03",
  "2025-11-17",
  "2026-01-12",
  "2026-04-20",
]

/** ส่วนใหญ่ทำงานอยู่ มีลาพักและลาออกประปรายเพื่อให้ตัวกรองมีอะไรให้ลอง */
const STATUS_PATTERN: EmployeeStatus[] = [
  "active",
  "active",
  "active",
  "active",
  "active",
  "on_leave",
  "active",
  "active",
  "active",
  "resigned",
  "active",
  "active",
  "active",
  "on_leave",
  "active",
  "active",
  "active",
  "active",
  "resigned",
  "active",
]

const NOTES: LocalizedText[] = [
  { th: "", en: "" },
  { th: "", en: "" },
  { th: "ประจำสาขาเชียงใหม่", en: "Based at the Chiang Mai branch" },
  { th: "", en: "" },
  { th: "", en: "" },
  { th: "ทำงานจากบ้านวันจันทร์และศุกร์", en: "Works from home on Mondays and Fridays" },
  { th: "", en: "" },
  { th: "", en: "" },
  { th: "ผู้ประสานงานกิจกรรมของแผนก", en: "Department event coordinator" },
  { th: "", en: "" },
]

function employeeCode(index: number): string {
  return `EMP-${String(index).padStart(4, "0")}`
}

function makePhone(index: number): string {
  const line = `${6_200_0000 + index * 2467}`.slice(-7)
  return `09${line.slice(0, 1)}-${line.slice(1, 4)}-${line.slice(4)}`
}

/** อีเมลไม่ซ้ำจากชื่อภาษาอังกฤษ — เติมเลขต่อท้ายเมื่อชนกัน */
function makeEmailFactory(reserved: Iterable<string>) {
  const used = new Set(reserved)
  return (firstEn: string, lastEn: string): string => {
    const base = `${firstEn.toLowerCase()}.${lastEn[0].toLowerCase()}`
    let candidate = `${base}@company.co.th`
    let suffix = 2
    while (used.has(candidate)) {
      candidate = `${base}${suffix}@company.co.th`
      suffix += 1
    }
    used.add(candidate)
    return candidate
  }
}

function buildEmployees(generatedCount: number): Employee[] {
  const employees: Employee[] = []
  let index = 0

  // ทีมจัดงาน (บัญชีที่ล็อกอินได้) อยู่ในทะเบียนด้วย — ใช้อีเมลเดิมเพื่อให้จับคู่กับ User ได้
  for (const user of MOCK_USERS) {
    index += 1
    employees.push({
      id: `emp-${index}`,
      employeeCode: employeeCode(index),
      firstName: { ...user.firstName },
      lastName: { ...user.lastName },
      nickname: { ...user.nickname },
      department: { ...user.team },
      position: { ...user.position },
      email: user.email,
      phone: user.phone,
      startDate: START_DATES[(index * 3) % START_DATES.length],
      status: "active",
      note: { th: "", en: "" },
    })
  }

  const nextEmail = makeEmailFactory(MOCK_USERS.map((user) => user.email))

  for (let i = 0; i < generatedCount; i += 1) {
    index += 1
    const first = FIRST_NAMES[i % FIRST_NAMES.length]
    const last = LAST_NAMES[(i * 5 + 2) % LAST_NAMES.length]
    const nickname = NICKNAMES[i % NICKNAMES.length]
    employees.push({
      id: `emp-${index}`,
      employeeCode: employeeCode(index),
      firstName: { th: first[0], en: first[1] },
      lastName: { th: last[0], en: last[1] },
      nickname: { th: nickname[0], en: nickname[1] },
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      position: POSITIONS[(i * 3) % POSITIONS.length],
      email: nextEmail(first[1], last[1]),
      phone: makePhone(index),
      startDate: START_DATES[(i * 7) % START_DATES.length],
      status: STATUS_PATTERN[i % STATUS_PATTERN.length],
      note: NOTES[i % NOTES.length],
    })
  }

  return employees
}

export const MOCK_EMPLOYEES: Employee[] =
  IMPORTED_EMPLOYEES.length > 0 ? IMPORTED_EMPLOYEES : buildEmployees(34)
