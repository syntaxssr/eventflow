/**
 * แปลงทะเบียนพนักงานจาก CSV เป็น TypeScript สำหรับ client-side prototype
 *
 * CSV ต้นฉบับยังเป็น source of truth และเก็บทุกคอลัมน์ไว้ใน data/employees
 * ไฟล์ generated นี้สร้างใหม่อัตโนมัติก่อน dev/build เพื่อให้หน้าเว็บไม่ต้อง
 * อ่านไฟล์จาก filesystem ระหว่างใช้งาน
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const SOURCE = join(process.cwd(), "data", "employees", "contact-all.csv")
const OUTPUT = join(process.cwd(), "src", "mock", "employees.generated.ts")

const REQUIRED_HEADERS = [
  "No.",
  "Name-Surname",
  "NickName",
  "Name-Surname(Thai)",
  "NickName (Thai)",
  "Gender",
  "Position",
  "Company Section",
  "Email",
  "Tel No.",
]

function parseCsv(input) {
  const text = input.replace(/^\uFEFF/, "")
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
  if (quoted) throw new Error("Employee CSV contains an unclosed quoted field")
  return rows
}

function splitName(primary, fallback) {
  const value = primary.trim() || fallback.trim()
  const [firstName = "", ...lastName] = value.split(/\s+/)
  return [firstName, lastName.join(" ")]
}

function toEmailPart(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

/**
 * สร้างอีเมลจำลองจากชื่ออังกฤษ เช่น Peerapon Chanthachaem ->
 * peerapon.c@company.co.th และขยายอักษรนามสกุลเมื่อชื่อย่อซ้ำกัน
 */
function buildSyntheticEmails(names) {
  const used = new Set()

  return names.map((fullName, index) => {
    const [firstName = "", ...lastNameParts] = fullName.trim().split(/\s+/)
    const first = toEmailPart(firstName)
    const last = toEmailPart(lastNameParts.join(" "))
    let localPart = `employee${index + 1}`

    if (first && last) {
      let lastLength = 1
      localPart = `${first}.${last.slice(0, lastLength)}`
      while (used.has(localPart) && lastLength < last.length) {
        lastLength += 1
        localPart = `${first}.${last.slice(0, lastLength)}`
      }

      if (used.has(localPart)) {
        let suffix = 2
        while (used.has(`${first}.${last}${suffix}`)) suffix += 1
        localPart = `${first}.${last}${suffix}`
      }
    }

    used.add(localPart)
    return `${localPart}@company.co.th`
  })
}

const rows = parseCsv(readFileSync(SOURCE, "utf8"))
const [headers = [], ...dataRows] = rows

if (JSON.stringify(headers) !== JSON.stringify(REQUIRED_HEADERS)) {
  throw new Error("Employee CSV headers do not match the expected schema")
}

const records = dataRows
  .filter((row) => row.some((value) => value.trim() !== ""))
  .map((row) =>
    Object.fromEntries(
      REQUIRED_HEADERS.map((header, column) => [header, row[column] ?? ""])
    )
  )
const syntheticEmails = buildSyntheticEmails(
  records.map((record) => record["Name-Surname"].trim())
)

const employees = records.map((record, index) => {
    const englishName = record["Name-Surname"].trim()
    const thaiName = record["Name-Surname(Thai)"].trim()
    const [firstNameEn, lastNameEn] = splitName(englishName, thaiName)
    const [firstNameTh, lastNameTh] = splitName(thaiName, englishName)
    const department = record["Company Section"].trim()
    const position = record.Position.trim()

    return {
      id: `emp-contact-${index + 1}`,
      employeeCode: record["No."].trim() || String(index + 1),
      firstName: { th: firstNameTh, en: firstNameEn },
      lastName: { th: lastNameTh, en: lastNameEn },
      nickname: {
        th: record["NickName (Thai)"].trim() || record.NickName.trim(),
        en: record.NickName.trim() || record["NickName (Thai)"].trim(),
      },
      department: { th: department, en: department },
      position: { th: position, en: position },
      // สร้างใหม่จากชื่อเสมอ ป้องกันอีเมลจริงใน CSV หลุดเข้า client bundle
      email: syntheticEmails[index],
      phone: "0912345678",
      startDate: "",
      status: "active",
      note: { th: "", en: "" },
    }
  })

if (employees.length === 0) throw new Error("Employee CSV has no data rows")

writeFileSync(
  OUTPUT,
  `// ไฟล์นี้สร้างอัตโนมัติโดย scripts/generate-employee-data.mjs — ห้ามแก้ด้วยมือ
import type { Employee } from "@/types/employee"

export const IMPORTED_EMPLOYEES = ${JSON.stringify(employees, null, 2)} satisfies Employee[]
`,
  "utf8"
)

console.log(`employee data: ${employees.length} records, ${headers.length} source columns`)
