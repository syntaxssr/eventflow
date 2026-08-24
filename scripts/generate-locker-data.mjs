/**
 * แปลงทะเบียนล็อกเกอร์จาก CSV เป็น TypeScript สำหรับ client-side prototype
 *
 * CSV ต้นฉบับ (แปลงจาก Locker.xlsx ของ HR) ยังเป็น source of truth
 * ไฟล์ generated นี้สร้างใหม่อัตโนมัติก่อน dev/build เพื่อให้หน้าเว็บไม่ต้อง
 * อ่านไฟล์จาก filesystem ระหว่างใช้งาน
 *
 * สคริปต์นี้ยังจับคู่ผู้ครอบครองกับทะเบียนพนักงาน (contact-all.csv) ด้วยชื่อเต็ม
 * แล้วถอยไปเทียบชื่อจริง + ชื่อเล่น เพราะทะเบียนสองฝั่งสะกดอังกฤษไม่ตรงกันบางคน
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const LOCKER_SOURCE = join(process.cwd(), "data", "lockers", "locker-register.csv")
const EMPLOYEE_SOURCE = join(process.cwd(), "data", "employees", "contact-all.csv")
const OUTPUT = join(process.cwd(), "src", "mock", "lockers.generated.ts")

const LOCKER_HEADERS = [
  "Locker no.",
  "Status",
  "Employee ID",
  "Employee Name",
  "Nickname",
  "Department",
  "Assigned Date",
  "Returned Date",
  "Key No.",
  "Spare Key",
  "Remarks",
]

function parseCsv(input) {
  const text = input.replace(/^﻿/, "")
  const rows = []
  let row = []
  let field = ""
  let quoted = false

  const pushField = () => {
    row.push(field)
    field = ""
  }
  const pushRow = () => {
    pushField()
    rows.push(row)
    row = []
  }

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        field += character
      }
    } else if (character === '"') {
      quoted = true
    } else if (character === ",") {
      pushField()
    } else if (character === "\n") {
      if (field.endsWith("\r")) field = field.slice(0, -1)
      pushRow()
    } else {
      field += character
    }
  }

  if (field !== "" || row.length > 0) pushRow()
  if (quoted) throw new Error("Locker CSV contains an unclosed quoted field")
  return rows
}

const normalize = (value) => value.trim().toLowerCase().replace(/\s+/g, " ")

/** ทะเบียนพนักงานเรียงตามลำดับเดียวกับ generate-employee-data.mjs จึงคำนวณ id ซ้ำได้ */
function buildEmployeeIndex() {
  const rows = parseCsv(readFileSync(EMPLOYEE_SOURCE, "utf8"))
  const dataRows = rows
    .slice(1)
    .filter((row) => row.some((value) => value.trim() !== ""))
  const byFullName = new Map()
  const byFirstAndNickname = new Map()

  dataRows.forEach((row, index) => {
    const id = `emp-contact-${index + 1}`
    const fullName = normalize(row[1] ?? "")
    const nickname = normalize(row[2] ?? "")
    const [firstName = ""] = fullName.split(" ")

    if (fullName && !byFullName.has(fullName)) byFullName.set(fullName, id)

    const fallbackKey = `${firstName}|${nickname}`
    if (firstName && nickname && !byFirstAndNickname.has(fallbackKey)) {
      byFirstAndNickname.set(fallbackKey, id)
    }
  })

  return { byFullName, byFirstAndNickname }
}

/**
 * Remarks เก็บจำนวนกุญแจและของอื่นในช่องรวมกัน เช่น `2 keys`,
 * `1 Key/Office Supply`, `Snack`, `-` จึงต้องแยกทั้งสองส่วนออกจากกัน
 */
function parseRemarks(remarks) {
  const keyMatch = remarks.match(/(\d+)\s*keys?\b/i)
  const keyCount = keyMatch ? Number(keyMatch[1]) : 0
  const contentTags = []

  if (/office\s*supply/i.test(remarks)) contentTags.push("office_supply")
  if (/snack/i.test(remarks)) contentTags.push("snack")

  return { keyCount, contentTags }
}

/** กุญแจดอกเดียวใช้ชื่อช่องตรง ๆ หลายดอกต่อท้ายลำดับเพื่อให้แยกออกจากกันได้ */
function buildKeys(keyNo, keyCount) {
  if (keyCount <= 0) return []
  if (keyCount === 1) return [{ name: keyNo }]

  return Array.from({ length: keyCount }, (_, index) => ({
    name: `${keyNo}-${index + 1}`,
  }))
}

const rows = parseCsv(readFileSync(LOCKER_SOURCE, "utf8"))
const [headers = [], ...dataRows] = rows

if (JSON.stringify(headers) !== JSON.stringify(LOCKER_HEADERS)) {
  throw new Error("Locker CSV headers do not match the expected schema")
}

const employeeIndex = buildEmployeeIndex()
const unmatchedOccupants = new Set()

const lockers = dataRows
  .filter((row) => (row[0] ?? "").trim() !== "")
  .map((row, index) => {
    const record = Object.fromEntries(
      LOCKER_HEADERS.map((header, column) => [header, (row[column] ?? "").trim()])
    )
    const occupantName = record["Employee Name"]
    const occupantNickname = record.Nickname
    const status = record.Status.toLowerCase() === "occupied" ? "occupied" : "available"
    const { keyCount, contentTags } = parseRemarks(record.Remarks)
    const fullNameKey = normalize(occupantName)
    const [firstName = ""] = fullNameKey.split(" ")
    const employeeId =
      employeeIndex.byFullName.get(fullNameKey) ??
      employeeIndex.byFirstAndNickname.get(
        `${firstName}|${normalize(occupantNickname)}`
      ) ??
      null

    if (status === "occupied" && occupantName && !employeeId) {
      unmatchedOccupants.add(occupantName)
    }

    return {
      code: record["Locker no."],
      number: index + 1,
      status,
      registryEmployeeCode: record["Employee ID"] === "-" ? "" : record["Employee ID"],
      occupantName: status === "occupied" ? occupantName : "",
      occupantNickname: status === "occupied" ? occupantNickname : "",
      employeeId: status === "occupied" ? employeeId : null,
      assignedDate: record["Assigned Date"] === "-" ? "" : record["Assigned Date"],
      keyNo: record["Key No."],
      hasSpareKey: record["Spare Key"].toLowerCase() === "yes",
      keys: buildKeys(record["Key No."], keyCount),
      contentTags,
      remarks: record.Remarks === "-" ? "" : record.Remarks,
    }
  })

if (lockers.length === 0) throw new Error("Locker CSV has no data rows")

writeFileSync(
  OUTPUT,
  `// ไฟล์นี้สร้างอัตโนมัติโดย scripts/generate-locker-data.mjs — ห้ามแก้ด้วยมือ
import type { Locker } from "@/types/locker"

export const IMPORTED_LOCKERS = ${JSON.stringify(lockers, null, 2)} satisfies Locker[]
`,
  "utf8"
)

const occupied = lockers.filter((locker) => locker.status === "occupied").length
const totalKeys = lockers.reduce((sum, locker) => sum + locker.keys.length, 0)

console.log(
  `locker data: ${lockers.length} lockers, ${occupied} occupied, ${totalKeys} keys` +
    (unmatchedOccupants.size > 0
      ? `, ${unmatchedOccupants.size} occupants without an employee record (${[...unmatchedOccupants].join(", ")})`
      : "")
)
