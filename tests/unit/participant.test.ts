import { describe, expect, it } from "vitest"

import * as XLSX from "xlsx"

import { buildTemplateWorkbook, readWorkbookRows } from "@/lib/excel"
import { guessColumnMapping } from "@/lib/import"
import {
  EMPTY_PARTICIPANT_FILTERS,
  filterParticipants,
  getParticipantFullName,
  listDepartments,
  sortParticipants,
} from "@/lib/participant"
import type { Participant } from "@/types/participant"

function makeParticipant(overrides: Partial<Participant> = {}): Participant {
  return {
    id: "p-1",
    eventId: "e-1",
    firstName: { th: "สมชาย", en: "Somchai" },
    lastName: { th: "ใจดี", en: "Jaidee" },
    email: "somchai.j@company.co.th",
    department: { th: "ฝ่ายขาย", en: "Sales" },
    phone: "081-111-2222",
    rsvpStatus: "attending",
    type: "employee",
    note: { th: "", en: "" },
    ...overrides,
  }
}

const PARTICIPANTS: Participant[] = [
  makeParticipant(),
  makeParticipant({
    id: "p-2",
    firstName: { th: "อารยา", en: "Araya" },
    lastName: { th: "เก่งมาก", en: "Kengmak" },
    email: "araya.k@company.co.th",
    department: { th: "ฝ่ายบัญชี", en: "Accounting" },
    rsvpStatus: "pending",
    type: "executive",
  }),
  makeParticipant({
    id: "p-3",
    firstName: { th: "บดินทร์", en: "Bodin" },
    lastName: { th: "พูดเก่ง", en: "Poodkeng" },
    email: "bodin.p@company.co.th",
    department: { th: "ฝ่ายขาย", en: "Sales" },
    phone: "089-999-0000",
    rsvpStatus: "not_attending",
    type: "speaker",
  }),
]

describe("filterParticipants", () => {
  it("ไม่มีตัวกรอง = ได้ทุกคน", () => {
    expect(
      filterParticipants(PARTICIPANTS, EMPTY_PARTICIPANT_FILTERS)
    ).toHaveLength(3)
  })

  it("ค้นหาจากชื่อ (ทั้งสองภาษา) อีเมล และเบอร์โทร", () => {
    const byThaiName = filterParticipants(PARTICIPANTS, {
      ...EMPTY_PARTICIPANT_FILTERS,
      query: "อารยา",
    })
    expect(byThaiName.map((p) => p.id)).toEqual(["p-2"])

    const byEnglishName = filterParticipants(PARTICIPANTS, {
      ...EMPTY_PARTICIPANT_FILTERS,
      query: "bodin",
    })
    expect(byEnglishName.map((p) => p.id)).toEqual(["p-3"])

    const byEmail = filterParticipants(PARTICIPANTS, {
      ...EMPTY_PARTICIPANT_FILTERS,
      query: "araya.k@",
    })
    expect(byEmail.map((p) => p.id)).toEqual(["p-2"])

    const byPhone = filterParticipants(PARTICIPANTS, {
      ...EMPTY_PARTICIPANT_FILTERS,
      query: "089-999",
    })
    expect(byPhone.map((p) => p.id)).toEqual(["p-3"])
  })

  it("กรองตามประเภท สถานะตอบรับ และแผนกพร้อมกันได้", () => {
    const result = filterParticipants(PARTICIPANTS, {
      query: "",
      type: "employee",
      rsvpStatus: "attending",
      department: "ฝ่ายขาย",
    })
    expect(result.map((p) => p.id)).toEqual(["p-1"])
  })
})

describe("sortParticipants", () => {
  it("เรียงตามชื่อ asc/desc", () => {
    const asc = sortParticipants(PARTICIPANTS, "name", "asc", "en")
    expect(asc.map((p) => p.id)).toEqual(["p-2", "p-3", "p-1"])
    const desc = sortParticipants(PARTICIPANTS, "name", "desc", "en")
    expect(desc.map((p) => p.id)).toEqual(["p-1", "p-3", "p-2"])
  })

  it("เรียงตามสถานะตอบรับ: เข้าร่วม → ยังไม่ตอบ → ไม่เข้าร่วม", () => {
    const sorted = sortParticipants(PARTICIPANTS, "rsvpStatus", "asc", "th")
    expect(sorted.map((p) => p.rsvpStatus)).toEqual([
      "attending",
      "pending",
      "not_attending",
    ])
  })

  it("ไม่แก้ไข array ต้นฉบับ", () => {
    const before = PARTICIPANTS.map((p) => p.id)
    sortParticipants(PARTICIPANTS, "email", "desc", "th")
    expect(PARTICIPANTS.map((p) => p.id)).toEqual(before)
  })
})

describe("listDepartments", () => {
  it("ไม่ซ้ำ เรียงตามตัวอักษร และใช้ภาษาที่เลือก", () => {
    const departments = listDepartments(PARTICIPANTS, "en")
    expect(departments).toEqual([
      { key: "ฝ่ายบัญชี", label: "Accounting" },
      { key: "ฝ่ายขาย", label: "Sales" },
    ])
  })
})

describe("getParticipantFullName", () => {
  it("ต่อชื่อ-นามสกุลตามภาษา", () => {
    expect(getParticipantFullName(PARTICIPANTS[0], "th")).toBe("สมชาย ใจดี")
    expect(getParticipantFullName(PARTICIPANTS[0], "en")).toBe("Somchai Jaidee")
  })
})

describe("excel round-trip", () => {
  it("Template ที่ระบบสร้าง อ่านกลับแล้วเดา mapping ได้ครบทุกฟิลด์", () => {
    const workbook = buildTemplateWorkbook()
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" })
    const { headers, rows } = readWorkbookRows(buffer)

    const mapping = guessColumnMapping(headers)
    expect(Object.keys(mapping)).toHaveLength(8)
    expect(rows).toHaveLength(1)
    expect(rows[0]["อีเมล"]).toBe("somying.j@company.co.th")
  })
})
