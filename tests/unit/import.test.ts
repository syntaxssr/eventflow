import { describe, expect, it } from "vitest"

import {
  applyChoiceToAll,
  buildConflicts,
  buildImportSummary,
  detectDuplicateEmails,
  findDifferentFields,
  guessColumnMapping,
  isValidEmail,
  normalizeEmail,
  parseImportRows,
  parseParticipantType,
  parseRsvpStatus,
  resolveConflicts,
  toIncomingParticipant,
} from "@/lib/import"
import type {
  ColumnMapping,
  ImportField,
  Participant,
} from "@/types/participant"

const THAI_MAPPING: ColumnMapping = {
  firstName: "ชื่อ",
  lastName: "นามสกุล",
  email: "อีเมล",
  department: "แผนก",
  phone: "เบอร์โทร",
  rsvpStatus: "สถานะตอบรับ",
  type: "ประเภทผู้เข้าร่วม",
  note: "หมายเหตุ",
}

function makeRawRow(
  overrides: Partial<Record<string, string>> = {}
): Record<string, string> {
  return {
    "ชื่อ": "สมชาย",
    "นามสกุล": "ทดสอบ",
    "อีเมล": "somchai.t@company.co.th",
    "แผนก": "ฝ่ายขาย",
    "เบอร์โทร": "081-111-2222",
    "สถานะตอบรับ": "เข้าร่วม",
    "ประเภทผู้เข้าร่วม": "พนักงาน",
    "หมายเหตุ": "",
    ...overrides,
  }
}

function makeParticipant(overrides: Partial<Participant> = {}): Participant {
  return {
    id: "p-1",
    eventId: "e-1",
    firstName: { th: "สมชาย", en: "Somchai" },
    lastName: { th: "ทดสอบ", en: "Thodsob" },
    email: "somchai.t@company.co.th",
    department: { th: "ฝ่ายขาย", en: "Sales" },
    phone: "081-111-2222",
    rsvpStatus: "attending",
    type: "employee",
    note: { th: "", en: "" },
    ...overrides,
  }
}

describe("normalizeEmail / isValidEmail", () => {
  it("ตัดช่องว่างและแปลงเป็นตัวพิมพ์เล็ก", () => {
    expect(normalizeEmail("  Somchai.T@Company.CO.TH ")).toBe(
      "somchai.t@company.co.th"
    )
  })

  it("ตรวจรูปแบบอีเมล", () => {
    expect(isValidEmail("a@b.co")).toBe(true)
    expect(isValidEmail("not-an-email")).toBe(false)
    expect(isValidEmail("a@b")).toBe(false)
    expect(isValidEmail("a b@c.co")).toBe(false)
  })
})

describe("guessColumnMapping", () => {
  it("เดาหัวคอลัมน์ภาษาไทยได้ครบ", () => {
    const mapping = guessColumnMapping(Object.values(THAI_MAPPING) as string[])
    expect(mapping).toEqual(THAI_MAPPING)
  })

  it("เดาหัวคอลัมน์ภาษาอังกฤษได้ ไม่สนตัวพิมพ์", () => {
    const mapping = guessColumnMapping([
      "First Name",
      "LAST NAME",
      "Email",
      "Department",
      "Phone",
      "RSVP",
      "Type",
      "Note",
    ])
    expect(mapping.firstName).toBe("First Name")
    expect(mapping.lastName).toBe("LAST NAME")
    expect(mapping.email).toBe("Email")
    expect(mapping.rsvpStatus).toBe("RSVP")
  })

  it("คอลัมน์ที่ไม่รู้จักจะไม่ถูก map", () => {
    const mapping = guessColumnMapping(["ชื่อ", "คอลัมน์ประหลาด"])
    expect(mapping.firstName).toBe("ชื่อ")
    expect(mapping.email).toBeUndefined()
  })
})

describe("parseRsvpStatus / parseParticipantType", () => {
  it("รับได้ทั้งค่า enum ภาษาไทย และอังกฤษ", () => {
    expect(parseRsvpStatus("attending")).toBe("attending")
    expect(parseRsvpStatus("เข้าร่วม")).toBe("attending")
    expect(parseRsvpStatus("Not attending")).toBe("not_attending")
    expect(parseRsvpStatus("ไม่รู้จัก")).toBeNull()

    expect(parseParticipantType("ผู้บริหาร")).toBe("executive")
    expect(parseParticipantType("External Guest")).toBe("external_guest")
    expect(parseParticipantType("อื่น ๆ")).toBeNull()
  })
})

describe("parseImportRows", () => {
  it("แถวข้อมูลถูกต้องไม่มี error และ rowNumber เริ่มที่ 2", () => {
    const rows = parseImportRows([makeRawRow()], THAI_MAPPING)
    expect(rows).toHaveLength(1)
    expect(rows[0].rowNumber).toBe(2)
    expect(rows[0].errors).toEqual([])
    expect(rows[0].values.firstName).toBe("สมชาย")
  })

  it("ข้ามแถวว่างทั้งแถวโดยไม่นับเป็น error", () => {
    const blank = Object.fromEntries(
      Object.values(THAI_MAPPING).map((column) => [column as string, ""])
    )
    const rows = parseImportRows([makeRawRow(), blank], THAI_MAPPING)
    expect(rows).toHaveLength(1)
  })

  it("รายงาน error รายฟิลด์: ขาดฟิลด์บังคับและอีเมลผิดรูปแบบ", () => {
    const rows = parseImportRows(
      [makeRawRow({ "ชื่อ": "", "อีเมล": "ไม่ใช่อีเมล" })],
      THAI_MAPPING
    )
    const fields = rows[0].errors.map((error) => error.field)
    expect(fields).toContain("firstName")
    expect(fields).toContain("email")
  })

  it("ค่า RSVP หรือประเภทที่ไม่รู้จักเป็น error แต่ค่าว่างไม่เป็น", () => {
    const rows = parseImportRows(
      [
        makeRawRow({ "สถานะตอบรับ": "", "ประเภทผู้เข้าร่วม": "" }),
        makeRawRow({
          "อีเมล": "other@company.co.th",
          "สถานะตอบรับ": "อาจจะไป",
          "ประเภทผู้เข้าร่วม": "มนุษย์ต่างดาว",
        }),
      ],
      THAI_MAPPING
    )
    expect(rows[0].errors).toEqual([])
    const fields = rows[1].errors.map((error) => error.field)
    expect(fields).toEqual(["rsvpStatus", "type"])
  })

  it("อีเมลซ้ำกันเองในไฟล์ นับแถวแรกเป็นหลัก แถวถัดไปเป็น error", () => {
    const rows = parseImportRows(
      [
        makeRawRow(),
        makeRawRow({ "ชื่อ": "สมหญิง", "อีเมล": "SOMCHAI.T@company.co.th" }),
      ],
      THAI_MAPPING
    )
    expect(rows[0].errors).toEqual([])
    expect(rows[1].errors).toEqual([
      { field: "email", messageKey: "participant.errDuplicateInFile" },
    ])
  })
})

describe("detectDuplicateEmails", () => {
  it("จับคู่อีเมลกับข้อมูลเดิมแบบไม่สนตัวพิมพ์", () => {
    const rows = parseImportRows(
      [makeRawRow({ "อีเมล": "Somchai.T@COMPANY.co.th" })],
      THAI_MAPPING
    )
    const marked = detectDuplicateEmails(rows, [makeParticipant()])
    expect(marked[0].conflictWithId).toBe("p-1")
  })

  it("แถวที่มี error จะไม่ถูกทำเครื่องหมาย conflict", () => {
    const rows = parseImportRows([makeRawRow({ "ชื่อ": "" })], THAI_MAPPING)
    const marked = detectDuplicateEmails(rows, [makeParticipant()])
    expect(marked[0].conflictWithId).toBeNull()
  })
})

describe("findDifferentFields", () => {
  it("ฟิลด์ localized ถือว่าเหมือนเมื่อค่าใหม่ตรงภาษาใดภาษาหนึ่ง", () => {
    const incoming = toIncomingParticipant({
      firstName: "Somchai",
      lastName: "ทดสอบ",
      email: "somchai.t@company.co.th",
      department: "Sales",
      phone: "081-111-2222",
      rsvpStatus: "เข้าร่วม",
      type: "พนักงาน",
      note: "",
    } as Record<ImportField, string>)
    expect(findDifferentFields(makeParticipant(), incoming)).toEqual([])
  })

  it("ชี้ฟิลด์ที่ต่างออกมาให้ครบ", () => {
    const incoming = toIncomingParticipant({
      firstName: "สมชาย",
      lastName: "ทดสอบ",
      email: "somchai.t@company.co.th",
      department: "ฝ่ายบัญชี",
      phone: "089-999-9999",
      rsvpStatus: "ไม่เข้าร่วม",
      type: "ผู้บริหาร",
      note: "มาสาย",
    } as Record<ImportField, string>)
    expect(findDifferentFields(makeParticipant(), incoming)).toEqual([
      "department",
      "phone",
      "rsvpStatus",
      "type",
      "note",
    ])
  })
})

describe("conflict resolution", () => {
  function setup() {
    const existing = [
      makeParticipant(),
      makeParticipant({
        id: "p-2",
        email: "second@company.co.th",
        firstName: { th: "สอง", en: "Song" },
      }),
    ]
    const rows = detectDuplicateEmails(
      parseImportRows(
        [
          makeRawRow({ "สถานะตอบรับ": "ไม่เข้าร่วม" }), // ชนกับ p-1
          makeRawRow({ "ชื่อ": "ใหม่", "อีเมล": "new@company.co.th" }), // เพิ่มใหม่
          makeRawRow({ "ชื่อ": "", "อีเมล": "broken@company.co.th" }), // error
        ],
        THAI_MAPPING
      ),
      existing
    )
    return { existing, rows }
  }

  it("buildConflicts สร้างเฉพาะแถวที่ชนและไม่มี error", () => {
    const { existing, rows } = setup()
    const conflicts = buildConflicts(rows, existing)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0].existing.id).toBe("p-1")
    expect(conflicts[0].differentFields).toEqual(["rsvpStatus"])
    expect(conflicts[0].choice).toBeNull()
  })

  it("applyChoiceToAll เลือกให้ทุกรายการ", () => {
    const { existing, rows } = setup()
    const conflicts = applyChoiceToAll(buildConflicts(rows, existing), "use_new")
    expect(conflicts.every((conflict) => conflict.choice === "use_new")).toBe(
      true
    )
  })

  it("resolveConflicts: use_new → update, ไม่เลือก/keep → skip, error ไม่ถูกนำเข้า", () => {
    const { existing, rows } = setup()

    const kept = resolveConflicts(rows, buildConflicts(rows, existing))
    expect(kept.toCreate).toHaveLength(1)
    expect(kept.toUpdate).toHaveLength(0)
    expect(kept.skipped).toBe(1)

    const used = resolveConflicts(
      rows,
      applyChoiceToAll(buildConflicts(rows, existing), "use_new")
    )
    expect(used.toUpdate).toEqual([
      { id: "p-1", changes: expect.objectContaining({ rsvpStatus: "not_attending" }) },
    ])
  })

  it("buildImportSummary รวมตัวเลขถูกต้อง", () => {
    const { existing, rows } = setup()
    const summary = buildImportSummary(
      rows,
      applyChoiceToAll(buildConflicts(rows, existing), "use_new")
    )
    expect(summary).toEqual({
      totalRows: 3,
      validRows: 2,
      errorRows: 1,
      toCreate: 1,
      toUpdate: 1,
      toSkip: 0,
    })
  })
})
