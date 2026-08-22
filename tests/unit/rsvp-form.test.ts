import { describe, expect, it } from "vitest"

import {
  RSVP_LABEL,
  findParticipantForUser,
  listPendingParticipants,
  responseRate,
  rsvpStatusFromLabel,
  searchParticipants,
  selectRsvpActivities,
  summariseRsvpByDepartment,
} from "@/lib/rsvp-form"
import type { Activity } from "@/types/activity"
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
    email: "Araya.K@company.co.th",
    department: { th: "ฝ่ายบัญชี", en: "Accounting" },
    rsvpStatus: "pending",
  }),
  makeParticipant({
    id: "p-3",
    firstName: { th: "บดินทร์", en: "Bodin" },
    lastName: { th: "พูดเก่ง", en: "Poodkeng" },
    email: "bodin.p@company.co.th",
    department: { th: "ฝ่ายขาย", en: "Sales" },
    rsvpStatus: "not_attending",
  }),
  makeParticipant({
    id: "p-4",
    firstName: { th: "ชนากานต์", en: "Chanakan" },
    lastName: { th: "ยิ้มแย้ม", en: "Yimyam" },
    email: "chanakan.y@company.co.th",
    department: { th: "", en: "" },
    rsvpStatus: "pending",
  }),
]

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "a-1",
    actorId: "u-1",
    action: "rsvp_submitted",
    targetType: "participant",
    targetId: "p-1",
    targetName: { th: "สมชาย ใจดี", en: "Somchai Jaidee" },
    eventId: "e-1",
    createdAt: "2026-07-31T09:00:00+07:00",
    before: RSVP_LABEL.pending,
    after: RSVP_LABEL.attending,
    ...overrides,
  }
}

describe("summariseRsvpByDepartment", () => {
  it("นับแยกตามแผนกในภาษาที่เลือก และเรียงตามชื่อแผนก", () => {
    const rows = summariseRsvpByDepartment(PARTICIPANTS, "en")
    expect(rows).toEqual([
      { department: "", total: 1, attending: 0, notAttending: 0, pending: 1 },
      {
        department: "Accounting",
        total: 1,
        attending: 0,
        notAttending: 0,
        pending: 1,
      },
      { department: "Sales", total: 2, attending: 1, notAttending: 1, pending: 0 },
    ])
  })

  it("ใช้ชื่อแผนกภาษาไทยเมื่อ locale เป็น th", () => {
    const rows = summariseRsvpByDepartment(PARTICIPANTS, "th")
    expect(rows.map((row) => row.department)).toContain("ฝ่ายขาย")
    expect(rows.map((row) => row.department)).toContain("ฝ่ายบัญชี")
  })

  it("ไม่มีผู้เข้าร่วม = ไม่มีแถว", () => {
    expect(summariseRsvpByDepartment([], "th")).toEqual([])
  })
})

describe("responseRate", () => {
  it("ไม่มีผู้เข้าร่วม = 0 ไม่หารด้วยศูนย์", () => {
    expect(
      responseRate({ total: 0, attending: 0, notAttending: 0, pending: 0 })
    ).toBe(0)
  })

  it("นับทั้งเข้าร่วมและไม่เข้าร่วมเป็น 'ตอบแล้ว' และปัดเป็นจำนวนเต็ม", () => {
    expect(
      responseRate({ total: 3, attending: 1, notAttending: 1, pending: 1 })
    ).toBe(67)
    expect(
      responseRate({ total: 3, attending: 1, notAttending: 0, pending: 2 })
    ).toBe(33)
    expect(
      responseRate({ total: 4, attending: 4, notAttending: 0, pending: 0 })
    ).toBe(100)
    expect(
      responseRate({ total: 4, attending: 0, notAttending: 0, pending: 4 })
    ).toBe(0)
  })
})

describe("findParticipantForUser", () => {
  it("เทียบอีเมลโดยไม่สนตัวพิมพ์เล็ก-ใหญ่และช่องว่างหัวท้าย", () => {
    expect(
      findParticipantForUser(PARTICIPANTS, { email: "ARAYA.K@company.co.th" })?.id
    ).toBe("p-2")
    expect(
      findParticipantForUser(PARTICIPANTS, { email: "  somchai.j@company.co.th " })
        ?.id
    ).toBe("p-1")
  })

  it("ไม่พบ = undefined และอีเมลว่างไม่จับคู่กับใคร", () => {
    expect(
      findParticipantForUser(PARTICIPANTS, { email: "nobody@company.co.th" })
    ).toBeUndefined()
    expect(findParticipantForUser(PARTICIPANTS, { email: "" })).toBeUndefined()
  })
})

describe("searchParticipants", () => {
  it("คำค้นว่าง = ได้ทุกคน เรียงตามชื่อในภาษาที่เลือก", () => {
    const result = searchParticipants(PARTICIPANTS, "", "en")
    expect(result.map((p) => p.id)).toEqual(["p-2", "p-3", "p-4", "p-1"])
  })

  it("ค้นจากชื่อภาษาไทยและอังกฤษ", () => {
    expect(searchParticipants(PARTICIPANTS, "อารยา", "th").map((p) => p.id)).toEqual([
      "p-2",
    ])
    expect(searchParticipants(PARTICIPANTS, "bodin", "en").map((p) => p.id)).toEqual([
      "p-3",
    ])
    // พิมพ์อังกฤษขณะแสดงภาษาไทยก็ยังเจอ
    expect(searchParticipants(PARTICIPANTS, "jaidee", "th").map((p) => p.id)).toEqual([
      "p-1",
    ])
  })

  it("ค้นจากอีเมลโดยไม่สนตัวพิมพ์", () => {
    expect(
      searchParticipants(PARTICIPANTS, "araya.k@", "en").map((p) => p.id)
    ).toEqual(["p-2"])
    expect(
      searchParticipants(PARTICIPANTS, "CHANAKAN.Y", "en").map((p) => p.id)
    ).toEqual(["p-4"])
  })

  it("ไม่ตรงใคร = ว่าง และไม่แก้ไข array ต้นฉบับ", () => {
    const before = PARTICIPANTS.map((p) => p.id)
    expect(searchParticipants(PARTICIPANTS, "zzz", "en")).toEqual([])
    searchParticipants(PARTICIPANTS, "", "en")
    expect(PARTICIPANTS.map((p) => p.id)).toEqual(before)
  })
})

describe("listPendingParticipants", () => {
  it("เหลือเฉพาะคนที่ยังไม่ตอบ เรียงตามชื่อ", () => {
    expect(listPendingParticipants(PARTICIPANTS, "en").map((p) => p.id)).toEqual([
      "p-2",
      "p-4",
    ])
  })
})

describe("selectRsvpActivities", () => {
  const ACTIVITIES: Activity[] = [
    makeActivity({ id: "a-old", createdAt: "2026-07-30T08:00:00+07:00" }),
    makeActivity({
      id: "a-bulk",
      action: "participant_rsvp_changed",
      createdAt: "2026-07-31T10:00:00+07:00",
    }),
    makeActivity({ id: "a-other-event", eventId: "e-2" }),
    makeActivity({ id: "a-not-rsvp", action: "participant_updated" }),
    makeActivity({ id: "a-new", createdAt: "2026-07-31T12:00:00+07:00" }),
  ]

  it("เอาเฉพาะการตอบรับของกิจกรรมนั้น เรียงจากใหม่ไปเก่า", () => {
    expect(selectRsvpActivities(ACTIVITIES, "e-1").map((a) => a.id)).toEqual([
      "a-new",
      "a-bulk",
      "a-old",
    ])
  })

  it("กิจกรรมที่ไม่มีคำตอบ = ว่าง และไม่แก้ไขลำดับต้นฉบับ", () => {
    const before = ACTIVITIES.map((a) => a.id)
    expect(selectRsvpActivities(ACTIVITIES, "e-9")).toEqual([])
    selectRsvpActivities(ACTIVITIES, "e-1")
    expect(ACTIVITIES.map((a) => a.id)).toEqual(before)
  })
})

describe("rsvpStatusFromLabel", () => {
  it("แปลงป้ายที่เก็บในประวัติกลับเป็นสถานะได้ทั้งสองภาษา", () => {
    expect(rsvpStatusFromLabel(RSVP_LABEL.attending)).toBe("attending")
    expect(rsvpStatusFromLabel({ th: "", en: "Not attending" })).toBe(
      "not_attending"
    )
    expect(rsvpStatusFromLabel({ th: "ยังไม่ตอบรับ", en: "" })).toBe("pending")
  })

  it("ป้ายที่ไม่รู้จักหรือไม่มี = null", () => {
    expect(rsvpStatusFromLabel({ th: "อื่น ๆ", en: "Other" })).toBeNull()
    expect(rsvpStatusFromLabel(null)).toBeNull()
  })
})
