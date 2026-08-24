import { describe, expect, it } from "vitest"

import {
  computeSpinTarget,
  describeWedge,
  employeeEntryLabel,
  entriesFromEmployees,
  entriesFromParticipants,
  isDuplicateLabel,
  normalizeEntryLabel,
  participantEntryLabel,
  pickWinnerIndex,
  polarToCartesian,
  segmentAngle,
  segmentColorIndex,
  truncateLabel,
  truncateWheelLabel,
  WHEEL_MAX_LABELED_ENTRIES,
  WHEEL_COLOR_OPTIONS,
  WHEEL_SEGMENT_COLORS,
  WHEEL_SEGMENT_TEXT_COLORS,
  wheelLabelLayout,
  winnerIndexFromRotation,
  type WheelEntry,
} from "@/lib/spin-wheel"
import type { Employee } from "@/types/employee"
import type { Participant } from "@/types/participant"

function normalize(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: "emp-1",
    employeeCode: "EMP-0001",
    firstName: { th: "สมชาย", en: "Somchai" },
    lastName: { th: "ใจดี", en: "Jaidee" },
    nickname: { th: "ต้น", en: "Ton" },
    department: { th: "ฝ่ายขาย", en: "Sales" },
    position: { th: "เจ้าหน้าที่", en: "Officer" },
    email: "somchai.j@company.co.th",
    phone: "081-111-2222",
    startDate: "2020-01-15",
    status: "active",
    note: { th: "", en: "" },
    ...overrides,
  }
}

function makeParticipant(overrides: Partial<Participant> = {}): Participant {
  return {
    id: "p-1",
    eventId: "e-1",
    firstName: { th: "อารยา", en: "Araya" },
    lastName: { th: "เก่งมาก", en: "Kengmak" },
    email: "araya.k@company.co.th",
    department: { th: "ฝ่ายบัญชี", en: "Accounting" },
    phone: "",
    rsvpStatus: "attending",
    type: "employee",
    note: { th: "", en: "" },
    ...overrides,
  }
}

describe("segmentAngle", () => {
  it("แบ่ง 360 องศาเท่า ๆ กันตามจำนวนช่อง", () => {
    expect(segmentAngle(4)).toBe(90)
    expect(segmentAngle(8)).toBe(45)
    expect(segmentAngle(3)).toBeCloseTo(120)
  })

  it("วงล้อว่างไม่มีมุม", () => {
    expect(segmentAngle(0)).toBe(0)
  })
})

describe("pickWinnerIndex", () => {
  it("แปลงค่าสุ่ม [0,1) เป็นดัชนีในช่วง [0, count)", () => {
    expect(pickWinnerIndex(5, () => 0)).toBe(0)
    expect(pickWinnerIndex(5, () => 0.5)).toBe(2)
    expect(pickWinnerIndex(5, () => 0.999)).toBe(4)
  })

  it("ไม่ชี้เกินช่องสุดท้ายแม้ค่าสุ่มหลุดช่วง", () => {
    expect(pickWinnerIndex(5, () => 1)).toBe(4)
    expect(pickWinnerIndex(5, () => 1.7)).toBe(4)
    expect(pickWinnerIndex(5, () => -0.3)).toBe(0)
  })

  it("วงล้อว่างคืน -1", () => {
    expect(pickWinnerIndex(0)).toBe(-1)
  })

  it("ค่าเริ่มต้นใช้ Math.random และอยู่ในช่วงเสมอ", () => {
    for (let i = 0; i < 200; i += 1) {
      const index = pickWinnerIndex(7)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(7)
    }
  })
})

describe("computeSpinTarget", () => {
  const COUNTS = [2, 3, 5, 7, 8, 12, 24, 37]
  const STARTS = [0, 123.4, 2000, -45, 5 * 360 + 17]

  it("ลงที่กึ่งกลางช่องผู้ชนะ และอ่านกลับได้ดัชนีเดิม (round-trip)", () => {
    for (const count of COUNTS) {
      for (let winnerIndex = 0; winnerIndex < count; winnerIndex += 1) {
        for (const currentRotation of STARTS) {
          const target = computeSpinTarget({
            currentRotation,
            winnerIndex,
            count,
            extraTurns: 4,
          })
          expect(winnerIndexFromRotation(target, count)).toBe(winnerIndex)

          // มุมของวงล้อต้นฉบับที่มาอยู่ใต้ลูกศรต้องเป็นกึ่งกลางช่องพอดี
          const underPointer = normalize(-target)
          expect(underPointer).toBeCloseTo(
            (winnerIndex + 0.5) * segmentAngle(count),
            6
          )
        }
      }
    }
  })

  it("หมุนไปข้างหน้าเสมอ และอย่างน้อยเท่ากับจำนวนรอบที่ขอ", () => {
    for (const count of COUNTS) {
      for (const currentRotation of STARTS) {
        const target = computeSpinTarget({
          currentRotation,
          winnerIndex: 1,
          count,
          extraTurns: 5,
        })
        expect(target).toBeGreaterThan(currentRotation)
        expect(target - currentRotation).toBeGreaterThanOrEqual(5 * 360)
        expect(target - currentRotation).toBeLessThan(6 * 360)
      }
    }
  })

  it("หมุนต่อเนื่องหลายรอบแล้วมุมสะสมเพิ่มขึ้นทางเดียว", () => {
    let rotation = 0
    const sequence = [3, 0, 7, 7, 2]
    for (const winnerIndex of sequence) {
      const next = computeSpinTarget({
        currentRotation: rotation,
        winnerIndex,
        count: 8,
        extraTurns: 3,
      })
      expect(next).toBeGreaterThan(rotation)
      expect(winnerIndexFromRotation(next, 8)).toBe(winnerIndex)
      rotation = next
    }
  })

  it("ขอ 0 รอบแต่ลงช่องเดิมพอดี ก็ยังต้องขยับหนึ่งรอบเต็ม", () => {
    const first = computeSpinTarget({
      currentRotation: 0,
      winnerIndex: 2,
      count: 4,
      extraTurns: 0,
    })
    const again = computeSpinTarget({
      currentRotation: first,
      winnerIndex: 2,
      count: 4,
      extraTurns: 0,
    })
    expect(again).toBeCloseTo(first + 360)
    expect(winnerIndexFromRotation(again, 4)).toBe(2)
  })
})

describe("winnerIndexFromRotation", () => {
  it("มุม 0 ลูกศรอยู่ที่ต้นช่องแรก", () => {
    expect(winnerIndexFromRotation(0, 4)).toBe(0)
  })

  it("หมุนตามเข็มทำให้ช่องท้าย ๆ เลื่อนมาใต้ลูกศร", () => {
    // หมุนไป 45° ช่องสุดท้าย (270°–360°) จะมาอยู่ใต้ลูกศร
    expect(winnerIndexFromRotation(45, 4)).toBe(3)
    // หมุนทวนเข็ม 45° (ค่าลบ) ช่องแรกยังอยู่ใต้ลูกศร
    expect(winnerIndexFromRotation(-45, 4)).toBe(0)
    // รอบเต็มไม่เปลี่ยนผล
    expect(winnerIndexFromRotation(45 + 720, 4)).toBe(3)
  })

  it("วงล้อว่างคืน -1", () => {
    expect(winnerIndexFromRotation(90, 0)).toBe(-1)
  })
})

describe("normalizeEntryLabel", () => {
  it("ตัดช่องว่างหัวท้ายและยุบช่องว่างซ้อน", () => {
    expect(normalizeEntryLabel("  สมชาย   ใจดี ")).toBe("สมชาย ใจดี")
    expect(normalizeEntryLabel("Araya\t\nKengmak")).toBe("Araya Kengmak")
    expect(normalizeEntryLabel("   ")).toBe("")
  })
})

describe("isDuplicateLabel", () => {
  const ENTRIES: WheelEntry[] = [
    { id: "w-1", label: "Somchai Jaidee" },
    { id: "w-2", label: "อารยา เก่งมาก" },
  ]

  it("ไม่สนตัวพิมพ์ใหญ่เล็กและช่องว่างส่วนเกิน", () => {
    expect(isDuplicateLabel(ENTRIES, "somchai jaidee")).toBe(true)
    expect(isDuplicateLabel(ENTRIES, "  SOMCHAI   JAIDEE ")).toBe(true)
    expect(isDuplicateLabel(ENTRIES, "อารยา  เก่งมาก")).toBe(true)
  })

  it("ชื่อที่ต่างกันจริงไม่นับว่าซ้ำ", () => {
    expect(isDuplicateLabel(ENTRIES, "Somchai Jaidi")).toBe(false)
    expect(isDuplicateLabel([], "Somchai Jaidee")).toBe(false)
  })
})

describe("ป้ายชื่อจากแหล่งข้อมูล", () => {
  it("ตัดชื่อจริงยาวบนวงล้อโดยยังเก็บชื่อเล่นในวงเล็บ", () => {
    expect(truncateWheelLabel("อลิสา ลีลายุวัฒนกุล (นุ่น)", 16)).toBe(
      "อลิสา ลี… (นุ่น)"
    )
    expect(truncateWheelLabel("อลิสา ลีลายุวัฒนกุล", 10)).toBe(
      truncateLabel("อลิสา ลีลายุวัฒนกุล", 10)
    )
  })

  it("พนักงาน: ชื่อ นามสกุล (ชื่อเล่น) ตามภาษา", () => {
    const employee = makeEmployee()
    expect(employeeEntryLabel(employee, "th")).toBe("สมชาย ใจดี (ต้น)")
    expect(employeeEntryLabel(employee, "en")).toBe("Somchai Jaidee (Ton)")
  })

  it("พนักงานไม่มีชื่อเล่น ไม่ต้องมีวงเล็บ", () => {
    const employee = makeEmployee({ nickname: { th: "", en: " " } })
    expect(employeeEntryLabel(employee, "th")).toBe("สมชาย ใจดี")
    expect(employeeEntryLabel(employee, "en")).toBe("Somchai Jaidee")
  })

  it("ผู้เข้าร่วมที่มีชื่อเล่นแสดงชื่อเล่นในวงเล็บ", () => {
    const participant = makeParticipant({
      nickname: { th: "โรจน์", en: "Roj" },
    })
    expect(participantEntryLabel(participant, "th")).toBe(
      "อารยา เก่งมาก (โรจน์)"
    )
    expect(participantEntryLabel(participant, "en")).toBe(
      "Araya Kengmak (Roj)"
    )
  })

  it("โหลดพนักงานเฉพาะที่ทำงานอยู่ได้ และผูก sourceId กลับไปหาต้นทาง", () => {
    const employees = [
      makeEmployee(),
      makeEmployee({ id: "emp-2", status: "resigned" }),
      makeEmployee({ id: "emp-3", status: "on_leave" }),
    ]
    const active = entriesFromEmployees(employees, "th", true)
    expect(active.map((entry) => entry.sourceId)).toEqual(["emp-1"])
    expect(active[0].id).toBe("wheel-emp-1")

    expect(entriesFromEmployees(employees, "th", false)).toHaveLength(3)
  })

  it("โหลดผู้เข้าร่วมเฉพาะที่ตอบว่าเข้าร่วมได้", () => {
    const participants = [
      makeParticipant(),
      makeParticipant({ id: "p-2", rsvpStatus: "pending" }),
      makeParticipant({ id: "p-3", rsvpStatus: "not_attending" }),
    ]
    const attending = entriesFromParticipants(participants, "en", true)
    expect(attending).toEqual([
      { id: "wheel-p-1", label: "Araya Kengmak", sourceId: "p-1" },
    ])
    expect(entriesFromParticipants(participants, "en", false)).toHaveLength(3)
  })
})

describe("สีของช่อง", () => {
  it("พาเลตสีพื้นและสีตัวอักษรมี 8 คู่เท่ากัน", () => {
    expect(WHEEL_SEGMENT_COLORS).toHaveLength(8)
    expect(WHEEL_SEGMENT_TEXT_COLORS).toHaveLength(WHEEL_SEGMENT_COLORS.length)
    expect(WHEEL_SEGMENT_COLORS).toEqual(
      WHEEL_COLOR_OPTIONS.map((option) => option.value)
    )
    expect(WHEEL_SEGMENT_TEXT_COLORS).toEqual(
      WHEEL_COLOR_OPTIONS.map((option) => option.foreground)
    )
  })

  it("ช่องสุดท้ายไม่ซ้ำสีกับช่องแรกและช่องก่อนหน้า", () => {
    for (const count of [2, 3, 8, 9, 17, 25]) {
      const first = segmentColorIndex(0, count)
      const last = segmentColorIndex(count - 1, count)
      const beforeLast = segmentColorIndex(count - 2, count)
      expect(last).not.toBe(first)
      if (count > 2) expect(last).not.toBe(beforeLast)
    }
  })
})

describe("ภาพ SVG", () => {
  it("แปลงมุมตามเข็มจาก 12 นาฬิกาเป็นพิกัดหน้าจอ", () => {
    expect(polarToCartesian(100, 0)).toEqual({ x: 200, y: 100 })
    expect(polarToCartesian(100, 90)).toEqual({ x: 300, y: 200 })
    expect(polarToCartesian(100, 180)).toEqual({ x: 200, y: 300 })
    expect(polarToCartesian(100, 270)).toEqual({ x: 100, y: 200 })
  })

  it("ช่องที่กว้างเกินครึ่งวงใช้ large-arc และวาดตามเข็ม", () => {
    expect(describeWedge(0, 4)).toBe("M 200 200 L 200 10 A 190 190 0 0 1 390 200 Z")
    expect(describeWedge(1, 2)).toBe("M 200 200 L 200 390 A 190 190 0 0 1 200 10 Z")
    // ครึ่งวงพอดี (180°) ไม่ถือว่าเป็น large-arc — ช่องแรกของวงล้อสองช่อง
    expect(describeWedge(0, 2)).toContain(" 0 0 1 ")
    expect(describeWedge(0, 1).length).toBeGreaterThan(0)
  })

  it("ตัวอักษรเล็กลงเมื่อช่องเยอะขึ้น และซ่อนชื่อเมื่อเกินขีดจำกัด", () => {
    const few = wheelLabelLayout(4)
    const many = wheelLabelLayout(20)
    expect(few.showLabels).toBe(true)
    expect(many.showLabels).toBe(true)
    expect(many.fontSize).toBeLessThan(few.fontSize)
    expect(many.maxChars).toBeGreaterThan(few.maxChars)
    expect(wheelLabelLayout(WHEEL_MAX_LABELED_ENTRIES + 1).showLabels).toBe(false)
  })

  it("ตัดชื่อยาวแล้วปิดท้ายด้วยจุดไข่ปลา", () => {
    expect(truncateLabel("สมชาย ใจดี", 20)).toBe("สมชาย ใจดี")
    expect(truncateLabel("Somchai Jaidee (Ton)", 10)).toBe("Somchai J…")
    expect(truncateLabel("Somchai", 0)).toBe("Somchai")
  })
})
