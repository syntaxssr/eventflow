import type { LocalizedText } from "@/types/common"
import type {
  ColumnMapping,
  ConflictChoice,
  ImportConflict,
  ImportField,
  ImportRow,
  ImportRowError,
  ImportSummary,
  Participant,
  ParticipantType,
  RsvpStatus,
} from "@/types/participant"
import { REQUIRED_IMPORT_FIELDS } from "@/types/participant"

/**
 * ตรรกะการนำเข้ารายชื่อจาก Excel ทั้งหมดเป็น pure function
 * เพื่อให้เขียน unit test ได้ครบทุกกรณีโดยไม่ต้องพึ่ง UI
 */

/** เทียบอีเมลแบบไม่สนตัวพิมพ์ใหญ่เล็กและช่องว่างหัวท้าย */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim())
}

/* -------------------------------------------------------------------------
   Column Mapping — เดาคอลัมน์จากหัวตาราง รองรับทั้งไทยและอังกฤษ
   ------------------------------------------------------------------------- */

const COLUMN_ALIASES: Record<ImportField, string[]> = {
  firstName: ["ชื่อ", "ชื่อจริง", "first name", "firstname", "first"],
  lastName: ["นามสกุล", "last name", "lastname", "surname", "last"],
  email: ["อีเมล", "อีเมล์", "email", "e-mail", "corporate email"],
  department: ["แผนก", "ฝ่าย", "department", "division"],
  phone: [
    "เบอร์โทร",
    "เบอร์โทรศัพท์",
    "โทรศัพท์",
    "phone",
    "phone number",
    "tel",
    "mobile",
  ],
  rsvpStatus: [
    "สถานะตอบรับ",
    "การตอบรับ",
    "rsvp",
    "rsvp status",
    "response",
  ],
  type: [
    "ประเภท",
    "ประเภทผู้เข้าร่วม",
    "type",
    "participant type",
    "category",
  ],
  note: ["หมายเหตุ", "โน้ต", "note", "notes", "remark", "remarks"],
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase()
}

/** เดา mapping อัตโนมัติจากชื่อหัวคอลัมน์ — ผู้ใช้ปรับแก้ต่อได้ในขั้น Mapping */
export function guessColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  const used = new Set<string>()

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [
    ImportField,
    string[],
  ][]) {
    const match = headers.find(
      (header) =>
        !used.has(header) && aliases.includes(normalizeHeader(header))
    )
    if (match) {
      mapping[field] = match
      used.add(match)
    }
  }
  return mapping
}

/* -------------------------------------------------------------------------
   แปลงค่าในไฟล์เป็นค่าในระบบ
   ------------------------------------------------------------------------- */

const RSVP_VALUES: Record<string, RsvpStatus> = {
  pending: "pending",
  "ยังไม่ตอบรับ": "pending",
  attending: "attending",
  "เข้าร่วม": "attending",
  not_attending: "not_attending",
  "not attending": "not_attending",
  "ไม่เข้าร่วม": "not_attending",
}

const TYPE_VALUES: Record<string, ParticipantType> = {
  employee: "employee",
  "พนักงาน": "employee",
  executive: "executive",
  "ผู้บริหาร": "executive",
  speaker: "speaker",
  "วิทยากร": "speaker",
  external_guest: "external_guest",
  "external guest": "external_guest",
  "แขกภายนอก": "external_guest",
  organizer: "organizer",
  "ทีมงานจัดงาน": "organizer",
  "ทีมงาน": "organizer",
}

export function parseRsvpStatus(value: string): RsvpStatus | null {
  return RSVP_VALUES[value.trim().toLowerCase()] ?? null
}

export function parseParticipantType(value: string): ParticipantType | null {
  return TYPE_VALUES[value.trim().toLowerCase()] ?? null
}

/* -------------------------------------------------------------------------
   Validation รายแถว
   ------------------------------------------------------------------------- */

/**
 * ตรวจค่าของหนึ่งแถว — คืนรายการ error พร้อม key ข้อความ i18n
 * (การตรวจอีเมลซ้ำภายในไฟล์ทำใน `parseImportRows` เพราะต้องเห็นทุกแถว)
 */
export function validateImportRow(
  values: Record<ImportField, string>
): ImportRowError[] {
  const errors: ImportRowError[] = []

  for (const field of REQUIRED_IMPORT_FIELDS) {
    if (values[field].trim() === "") {
      errors.push({ field, messageKey: "participant.errRequired" })
    }
  }

  const email = values.email.trim()
  if (email !== "" && !isValidEmail(email)) {
    errors.push({ field: "email", messageKey: "participant.errEmailInvalid" })
  }

  if (values.rsvpStatus.trim() !== "" && !parseRsvpStatus(values.rsvpStatus)) {
    errors.push({
      field: "rsvpStatus",
      messageKey: "participant.errRsvpInvalid",
    })
  }

  if (values.type.trim() !== "" && !parseParticipantType(values.type)) {
    errors.push({ field: "type", messageKey: "participant.errTypeInvalid" })
  }

  return errors
}

/**
 * แปลงข้อมูลดิบจากไฟล์ (หลัง map คอลัมน์แล้ว) เป็น ImportRow ที่ตรวจสอบแล้ว
 *
 * - แถวว่างทั้งแถวจะถูกข้าม
 * - อีเมลที่ซ้ำกันเองภายในไฟล์ นับแถวแรกเป็นหลัก แถวถัดไปเป็น error
 * - `rowNumber` นับตามไฟล์จริง (แถวแรกของข้อมูลคือ 2 เพราะแถว 1 เป็น header)
 */
export function parseImportRows(
  rawRows: Record<string, string>[],
  mapping: ColumnMapping
): ImportRow[] {
  const rows: ImportRow[] = []
  const seenEmails = new Set<string>()

  rawRows.forEach((raw, index) => {
    const values = {} as Record<ImportField, string>
    for (const field of Object.keys(COLUMN_ALIASES) as ImportField[]) {
      const column = mapping[field]
      values[field] = column ? String(raw[column] ?? "").trim() : ""
    }

    // แถวที่ไม่มีข้อมูลเลย ไม่ต้องรายงานเป็น error
    if (Object.values(values).every((value) => value === "")) return

    const errors = validateImportRow(values)

    const email = normalizeEmail(values.email)
    if (email !== "" && isValidEmail(values.email)) {
      if (seenEmails.has(email)) {
        errors.push({
          field: "email",
          messageKey: "participant.errDuplicateInFile",
        })
      } else {
        seenEmails.add(email)
      }
    }

    rows.push({
      rowNumber: index + 2,
      raw,
      values,
      errors,
      conflictWithId: null,
    })
  })

  return rows
}

/* -------------------------------------------------------------------------
   อีเมลซ้ำกับข้อมูลเดิม → Conflict
   ------------------------------------------------------------------------- */

/**
 * ทำเครื่องหมายแถวที่อีเมลตรงกับผู้เข้าร่วมเดิมของกิจกรรม
 * คืน rows ชุดใหม่ที่เติม `conflictWithId` แล้ว
 */
export function detectDuplicateEmails(
  rows: ImportRow[],
  existing: Participant[]
): ImportRow[] {
  const byEmail = new Map(
    existing.map((participant) => [normalizeEmail(participant.email), participant.id])
  )
  return rows.map((row) => ({
    ...row,
    conflictWithId:
      row.errors.length === 0
        ? (byEmail.get(normalizeEmail(row.values.email)) ?? null)
        : null,
  }))
}

/** ข้อความเดียวกันทั้งสองภาษา — ผู้ใช้กรอกมาชุดเดียวเช่นเดียวกับฟอร์มอื่นในระบบ */
function asLocalized(value: string): LocalizedText {
  return { th: value, en: value }
}

/** แปลงค่าที่ผ่านการตรวจแล้วเป็นข้อมูลผู้เข้าร่วม (ยังไม่มี id/eventId) */
export function toIncomingParticipant(
  values: Record<ImportField, string>
): Omit<Participant, "id" | "eventId"> {
  return {
    firstName: asLocalized(values.firstName.trim()),
    lastName: asLocalized(values.lastName.trim()),
    email: values.email.trim(),
    department: asLocalized(values.department.trim()),
    phone: values.phone.trim(),
    rsvpStatus: parseRsvpStatus(values.rsvpStatus) ?? "pending",
    type: parseParticipantType(values.type) ?? "employee",
    note: asLocalized(values.note.trim()),
  }
}

/** ฟิลด์ localized ถือว่าต่างเมื่อค่าใหม่ไม่ตรงทั้งไทยและอังกฤษของค่าเดิม */
function localizedDiffers(existing: LocalizedText, incoming: LocalizedText) {
  return (
    incoming.th.trim() !== existing.th.trim() &&
    incoming.th.trim() !== existing.en.trim()
  )
}

export function findDifferentFields(
  existing: Participant,
  incoming: Omit<Participant, "id" | "eventId">
): ImportField[] {
  const fields: ImportField[] = []
  if (localizedDiffers(existing.firstName, incoming.firstName))
    fields.push("firstName")
  if (localizedDiffers(existing.lastName, incoming.lastName))
    fields.push("lastName")
  if (normalizeEmail(existing.email) !== normalizeEmail(incoming.email))
    fields.push("email")
  if (localizedDiffers(existing.department, incoming.department))
    fields.push("department")
  if (existing.phone.trim() !== incoming.phone.trim()) fields.push("phone")
  if (existing.rsvpStatus !== incoming.rsvpStatus) fields.push("rsvpStatus")
  if (existing.type !== incoming.type) fields.push("type")
  if (localizedDiffers(existing.note, incoming.note)) fields.push("note")
  return fields
}

/** สร้างรายการ conflict จากแถวที่ชนกับข้อมูลเดิม */
export function buildConflicts(
  rows: ImportRow[],
  existing: Participant[]
): ImportConflict[] {
  const byId = new Map(existing.map((participant) => [participant.id, participant]))
  const conflicts: ImportConflict[] = []

  for (const row of rows) {
    if (!row.conflictWithId || row.errors.length > 0) continue
    const current = byId.get(row.conflictWithId)
    if (!current) continue

    const incoming = toIncomingParticipant(row.values)
    conflicts.push({
      rowNumber: row.rowNumber,
      existing: current,
      incoming,
      differentFields: findDifferentFields(current, incoming),
      choice: null,
    })
  }
  return conflicts
}

/** เลือกคำตอบเดียวกันให้ทุก conflict ที่ยังไม่ได้ตัดสินใจ */
export function applyChoiceToAll(
  conflicts: ImportConflict[],
  choice: ConflictChoice
): ImportConflict[] {
  return conflicts.map((conflict) => ({ ...conflict, choice }))
}

export interface ImportResolution {
  /** รายการที่จะเพิ่มใหม่ (ยังไม่มี id/eventId) */
  toCreate: Omit<Participant, "id" | "eventId">[]
  /** รายการที่จะเขียนทับข้อมูลเดิมทั้งชุด */
  toUpdate: { id: string; changes: Omit<Participant, "id" | "eventId"> }[]
  /** จำนวนที่ผู้ใช้เลือกเก็บข้อมูลเดิมไว้ */
  skipped: number
}

/**
 * รวมผลการตัดสินใจทั้งหมดเป็นชุดคำสั่งสุดท้าย
 * แถวที่มี error จะไม่ถูกนำเข้าเสมอ
 */
export function resolveConflicts(
  rows: ImportRow[],
  conflicts: ImportConflict[]
): ImportResolution {
  const conflictByRow = new Map(
    conflicts.map((conflict) => [conflict.rowNumber, conflict])
  )
  const resolution: ImportResolution = { toCreate: [], toUpdate: [], skipped: 0 }

  for (const row of rows) {
    if (row.errors.length > 0) continue

    const conflict = conflictByRow.get(row.rowNumber)
    if (!conflict) {
      resolution.toCreate.push(toIncomingParticipant(row.values))
      continue
    }

    if (conflict.choice === "use_new") {
      resolution.toUpdate.push({
        id: conflict.existing.id,
        changes: conflict.incoming,
      })
    } else {
      // keep_existing หรือยังไม่เลือก = เก็บข้อมูลเดิม
      resolution.skipped += 1
    }
  }
  return resolution
}

export function buildImportSummary(
  rows: ImportRow[],
  conflicts: ImportConflict[]
): ImportSummary {
  const errorRows = rows.filter((row) => row.errors.length > 0).length
  const resolution = resolveConflicts(rows, conflicts)

  return {
    totalRows: rows.length,
    validRows: rows.length - errorRows,
    errorRows,
    toCreate: resolution.toCreate.length,
    toUpdate: resolution.toUpdate.length,
    toSkip: resolution.skipped,
  }
}
