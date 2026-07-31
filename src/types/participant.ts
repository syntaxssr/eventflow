import type { Id, LocalizedText } from "./common"

export const RSVP_STATUSES = ["pending", "attending", "not_attending"] as const

export type RsvpStatus = (typeof RSVP_STATUSES)[number]

export const PARTICIPANT_TYPES = [
  "employee",
  "executive",
  "speaker",
  "external_guest",
  "organizer",
] as const

export type ParticipantType = (typeof PARTICIPANT_TYPES)[number]

export interface Participant {
  id: Id
  eventId: Id
  firstName: LocalizedText
  lastName: LocalizedText
  email: string
  department: LocalizedText
  phone: string
  rsvpStatus: RsvpStatus
  type: ParticipantType
  note: LocalizedText
}

export interface RsvpSummary {
  total: number
  attending: number
  notAttending: number
  pending: number
}

/* ---------------------------------------------------------------
   Excel Import
   --------------------------------------------------------------- */

/** ฟิลด์ปลายทางที่ผู้ใช้ต้อง map คอลัมน์จาก Excel เข้ามา */
export const IMPORT_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "department",
  "phone",
  "rsvpStatus",
  "type",
  "note",
] as const

export type ImportField = (typeof IMPORT_FIELDS)[number]

/** ฟิลด์ที่บังคับต้องมี */
export const REQUIRED_IMPORT_FIELDS: ImportField[] = [
  "firstName",
  "lastName",
  "email",
]

/** map: ฟิลด์ปลายทาง → ชื่อคอลัมน์ในไฟล์ Excel */
export type ColumnMapping = Partial<Record<ImportField, string>>

export interface ImportRowError {
  field: ImportField
  messageKey: string
}

export interface ImportRow {
  /** แถวที่เท่าไรในไฟล์ (นับจาก 1 รวม header) */
  rowNumber: number
  raw: Record<string, string>
  values: Record<ImportField, string>
  errors: ImportRowError[]
  /** ซ้ำกับผู้เข้าร่วมที่มีอยู่แล้ว (id) */
  conflictWithId: Id | null
}

export type ConflictChoice = "keep_existing" | "use_new"

export interface ImportConflict {
  rowNumber: number
  existing: Participant
  incoming: Omit<Participant, "id" | "eventId">
  /** ชื่อฟิลด์ที่มีค่าต่างกัน */
  differentFields: ImportField[]
  choice: ConflictChoice | null
}

export interface ImportSummary {
  totalRows: number
  validRows: number
  errorRows: number
  toCreate: number
  toUpdate: number
  toSkip: number
}
