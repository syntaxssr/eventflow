import { describe, expect, it } from "vitest"

import { MAX_FILE_SIZE_BYTES } from "@/constants/app"
import { detectFileType } from "@/constants/file-type"
import { fromDateKey } from "@/constants/mock-date"
import {
  appendVersion,
  currentVersion,
  isExpiringSoon,
  restoreVersion,
  trashDaysRemaining,
  validateFile,
} from "@/lib/file"
import { createInitialState } from "@/mock"
import type { FileItem } from "@/types/file"

const MB = 1024 * 1024
const TODAY = fromDateKey("2026-07-31")

function file(overrides: Partial<FileItem> = {}): FileItem {
  return {
    id: "f-test",
    eventId: "e-1",
    name: "เอกสารทดสอบ.pdf",
    categoryId: "fc-agenda",
    type: "pdf",
    versions: [
      {
        id: "f-test-v1",
        versionNumber: 1,
        filename: "เอกสารทดสอบ v1.pdf",
        uploadedBy: "u-1",
        uploadedAt: "2026-07-01T09:00:00+07:00",
        size: MB,
        changeNote: { th: "ฉบับแรก", en: "First" },
        previewUrl: null,
      },
      {
        id: "f-test-v2",
        versionNumber: 2,
        filename: "เอกสารทดสอบ v2.pdf",
        uploadedBy: "u-2",
        uploadedAt: "2026-07-10T09:00:00+07:00",
        size: 2 * MB,
        changeNote: { th: "แก้ไขรอบสอง", en: "Second revision" },
        previewUrl: null,
      },
    ],
    currentVersionId: "f-test-v2",
    uploadedBy: "u-1",
    uploadedAt: "2026-07-01T09:00:00+07:00",
    updatedAt: "2026-07-10T09:00:00+07:00",
    updatedBy: "u-2",
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  }
}

describe("detectFileType", () => {
  it("รู้จักทุกประเภทที่ระบบรองรับ", () => {
    expect(detectFileType("deck.pptx")).toBe("powerpoint")
    expect(detectFileType("budget.xlsx")).toBe("excel")
    expect(detectFileType("list.csv")).toBe("excel")
    expect(detectFileType("agenda.pdf")).toBe("pdf")
    expect(detectFileType("script.docx")).toBe("word")
    expect(detectFileType("poster.PNG")).toBe("image")
  })

  it("คืน null สำหรับประเภทที่ไม่รองรับ", () => {
    expect(detectFileType("archive.zip")).toBeNull()
    expect(detectFileType("noextension")).toBeNull()
  })
})

describe("validateFile", () => {
  it("ยอมรับไฟล์ที่ประเภทและขนาดถูกต้อง", () => {
    expect(validateFile({ name: "deck.pptx", size: 10 * MB })).toEqual({
      valid: true,
      type: "powerpoint",
    })
  })

  it("ปฏิเสธไฟล์ที่เกิน 50 MB", () => {
    const result = validateFile({ name: "big.pdf", size: MAX_FILE_SIZE_BYTES + 1 })
    expect(result.valid).toBe(false)
    expect(result.error).toBe("too_large")
  })

  it("ยอมรับไฟล์ที่ขนาดเท่ากับเพดานพอดี", () => {
    expect(validateFile({ name: "edge.pdf", size: MAX_FILE_SIZE_BYTES }).valid).toBe(
      true
    )
  })

  it("ปฏิเสธประเภทไฟล์ที่ไม่รองรับก่อนตรวจขนาด", () => {
    const result = validateFile({ name: "movie.mp4", size: 1 })
    expect(result.error).toBe("unsupported_type")
  })
})

describe("currentVersion", () => {
  it("คืนเวอร์ชันที่ถูกทำเครื่องหมายว่าเป็นปัจจุบัน", () => {
    expect(currentVersion(file()).versionNumber).toBe(2)
  })

  it("ถอยไปใช้เวอร์ชันล่าสุดเมื่อ currentVersionId ไม่ตรงกับอะไรเลย", () => {
    expect(currentVersion(file({ currentVersionId: "missing" })).versionNumber).toBe(
      2
    )
  })
})

describe("restoreVersion", () => {
  const restored = restoreVersion(
    file(),
    "f-test-v1",
    "u-3",
    "2026-07-31T10:00:00+07:00"
  )

  it("สร้างเวอร์ชันใหม่แทนการย้อนทับของเดิม", () => {
    expect(restored.versions).toHaveLength(3)
    expect(restored.versions[2].versionNumber).toBe(3)
    expect(restored.currentVersionId).toBe("f-test-v3")
  })

  it("ประวัติเดิมยังอยู่ครบ", () => {
    expect(restored.versions[0].id).toBe("f-test-v1")
    expect(restored.versions[1].id).toBe("f-test-v2")
  })

  it("คัดลอกเนื้อหาจากเวอร์ชันที่เลือก แต่บันทึกผู้กู้คืนเป็นคนปัจจุบัน", () => {
    const created = restored.versions[2]
    expect(created.size).toBe(MB)
    expect(created.filename).toBe("เอกสารทดสอบ v1.pdf")
    expect(created.uploadedBy).toBe("u-3")
    expect(created.changeNote.th).toContain("เวอร์ชัน 1")
  })

  it("ไม่ทำอะไรเมื่อไม่พบเวอร์ชันที่ระบุ", () => {
    const source = file()
    expect(restoreVersion(source, "missing", "u-3", "2026-07-31T10:00:00+07:00")).toBe(
      source
    )
  })
})

describe("appendVersion", () => {
  it("เพิ่มเวอร์ชันใหม่และตั้งเป็นเวอร์ชันปัจจุบัน", () => {
    const result = appendVersion(file(), {
      filename: "เอกสารทดสอบ v3.pdf",
      uploadedBy: "u-4",
      uploadedAt: "2026-07-31T11:00:00+07:00",
      size: 3 * MB,
      changeNote: { th: "รอบสาม", en: "Third" },
      previewUrl: null,
    })

    expect(result.versions).toHaveLength(3)
    expect(currentVersion(result).versionNumber).toBe(3)
    expect(result.updatedBy).toBe("u-4")
  })
})

describe("trashDaysRemaining", () => {
  it("คืน null เมื่อไฟล์ไม่ได้อยู่ในถังขยะ", () => {
    expect(trashDaysRemaining({ deletedAt: null }, TODAY)).toBeNull()
  })

  it("นับถอยหลังจากวันที่ลบ", () => {
    expect(
      trashDaysRemaining({ deletedAt: "2026-07-31T09:00:00+07:00" }, TODAY)
    ).toBe(30)
    expect(
      trashDaysRemaining({ deletedAt: "2026-07-21T09:00:00+07:00" }, TODAY)
    ).toBe(20)
  })

  it("ไม่ติดลบเมื่อเลยกำหนด 30 วันไปแล้ว", () => {
    expect(
      trashDaysRemaining({ deletedAt: "2026-05-01T09:00:00+07:00" }, TODAY)
    ).toBe(0)
  })
})

describe("isExpiringSoon", () => {
  it("เตือนเมื่อเหลือไม่เกิน 7 วัน", () => {
    expect(
      isExpiringSoon({ deletedAt: "2026-07-05T09:00:00+07:00" }, TODAY)
    ).toBe(true)
    expect(
      isExpiringSoon({ deletedAt: "2026-07-25T09:00:00+07:00" }, TODAY)
    ).toBe(false)
  })
})

describe("ไฟล์จำลอง", () => {
  const state = createInitialState()

  it("มีไฟล์อยู่ในถังขยะให้สาธิตและเหลือวันต่างกัน", () => {
    const trashed = state.files.filter((entry) => entry.deletedAt !== null)
    expect(trashed.length).toBeGreaterThanOrEqual(3)

    const remaining = trashed.map((entry) => trashDaysRemaining(entry, TODAY))
    expect(new Set(remaining).size).toBeGreaterThan(1)
  })

  it("ทุกไฟล์ในถังขยะยังไม่หมดอายุ", () => {
    for (const entry of state.files.filter((item) => item.deletedAt !== null)) {
      expect(trashDaysRemaining(entry, TODAY), entry.id).toBeGreaterThan(0)
    }
  })

  it("มีไฟล์ที่มีหลายเวอร์ชันให้สาธิตประวัติ", () => {
    expect(
      state.files.filter((entry) => entry.versions.length > 1).length
    ).toBeGreaterThanOrEqual(3)
  })
})
