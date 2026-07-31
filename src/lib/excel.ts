import * as XLSX from "xlsx"

import type { Locale } from "@/types/common"
import type { ImportField, Participant } from "@/types/participant"

/**
 * ตัวกลางระหว่างระบบกับ SheetJS
 * อ่าน/สร้าง workbook จากข้อมูลในหน่วยความจำ เพื่อให้ unit test ได้โดยไม่ต้องมีไฟล์จริง
 */

export interface SheetData {
  headers: string[]
  rows: Record<string, string>[]
}

/** อ่าน sheet แรกของ workbook เป็นแถวข้อมูลที่ key ตามหัวคอลัมน์ */
export function readWorkbookRows(data: ArrayBuffer | Uint8Array): SheetData {
  const workbook = XLSX.read(data, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return { headers: [], rows: [] }

  const sheet = workbook.Sheets[sheetName]
  const table: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  })
  if (table.length === 0) return { headers: [], rows: [] }

  const headers = table[0].map((cell) => String(cell).trim())
  const rows = table.slice(1).map((cells) => {
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      if (header !== "") row[header] = String(cells[index] ?? "").trim()
    })
    return row
  })
  return { headers, rows }
}

/** หัวคอลัมน์มาตรฐานของ Template (ภาษาไทย — ตรงกับ alias ที่ระบบเดาได้) */
export const TEMPLATE_HEADERS: Record<ImportField, string> = {
  firstName: "ชื่อ",
  lastName: "นามสกุล",
  email: "อีเมล",
  department: "แผนก",
  phone: "เบอร์โทร",
  rsvpStatus: "สถานะตอบรับ",
  type: "ประเภทผู้เข้าร่วม",
  note: "หมายเหตุ",
}

const TEMPLATE_FIELD_ORDER: ImportField[] = [
  "firstName",
  "lastName",
  "email",
  "department",
  "phone",
  "rsvpStatus",
  "type",
  "note",
]

/** สร้าง workbook สำหรับ Template ให้ผู้ใช้ดาวน์โหลดไปกรอกเอง */
export function buildTemplateWorkbook(): XLSX.WorkBook {
  const headers = TEMPLATE_FIELD_ORDER.map((field) => TEMPLATE_HEADERS[field])
  const example = [
    "สมหญิง",
    "ใจดี",
    "somying.j@company.co.th",
    "ฝ่ายขายและการตลาด",
    "081-234-5678",
    "เข้าร่วม",
    "พนักงาน",
    "ขออาหารมังสวิรัติ",
  ]
  const sheet = XLSX.utils.aoa_to_sheet([headers, example])
  sheet["!cols"] = headers.map(() => ({ wch: 22 }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, "Participants")
  return workbook
}

/** สร้าง workbook รายชื่อผู้เข้าร่วมสำหรับ Export (ข้อความตามภาษาที่เลือก) */
export function buildParticipantsWorkbook(
  participants: Participant[],
  locale: Locale,
  labels: {
    headers: Record<ImportField, string>
    rsvp: Record<Participant["rsvpStatus"], string>
    type: Record<Participant["type"], string>
    sheetName: string
  }
): XLSX.WorkBook {
  const headerRow = TEMPLATE_FIELD_ORDER.map((field) => labels.headers[field])
  const dataRows = participants.map((participant) => [
    participant.firstName[locale],
    participant.lastName[locale],
    participant.email,
    participant.department[locale],
    participant.phone,
    labels.rsvp[participant.rsvpStatus],
    labels.type[participant.type],
    participant.note[locale],
  ])

  const sheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows])
  sheet["!cols"] = headerRow.map(() => ({ wch: 22 }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, labels.sheetName)
  return workbook
}

/** ดาวน์โหลด workbook เป็นไฟล์ .xlsx (ใช้ได้เฉพาะฝั่ง browser) */
export function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(workbook, filename)
}
