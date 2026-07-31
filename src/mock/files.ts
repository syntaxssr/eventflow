import type { FileCategory, FileItem, FileType, FileVersion } from "@/types/file"

const MB = 1024 * 1024

/** หมวดหมู่เริ่มต้นของระบบ — ใช้ร่วมกันทุกกิจกรรม */
export const MOCK_FILE_CATEGORIES: FileCategory[] = [
  {
    id: "fc-agenda",
    eventId: null,
    name: { th: "กำหนดการ", en: "Agenda" },
    isDefault: true,
    order: 0,
  },
  {
    id: "fc-slides",
    eventId: null,
    name: { th: "PowerPoint", en: "PowerPoint" },
    isDefault: true,
    order: 1,
  },
  {
    id: "fc-attendees",
    eventId: null,
    name: { th: "รายชื่อผู้เข้าร่วม", en: "Attendee list" },
    isDefault: true,
    order: 2,
  },
  {
    id: "fc-poster",
    eventId: null,
    name: { th: "โปสเตอร์กิจกรรม", en: "Event poster" },
    isDefault: true,
    order: 3,
  },
  {
    id: "fc-script",
    eventId: null,
    name: { th: "Script พิธีกร", en: "MC script" },
    isDefault: true,
    order: 4,
  },
  {
    id: "fc-budget",
    eventId: null,
    name: { th: "งบประมาณและสัญญา", en: "Budget & contracts" },
    isDefault: false,
    order: 5,
  },
]

interface VersionSeed {
  filename: string
  uploadedBy: string
  uploadedAt: string
  sizeMb: number
  changeNote: [string, string]
  previewUrl?: string
}

interface FileSeed {
  id: string
  eventId: string
  name: string
  categoryId: string
  type: FileType
  versions: VersionSeed[]
  /** วันที่ถูกย้ายไป Trash (ถ้ามี) */
  deletedAt?: string
  deletedBy?: string
}

const SEEDS: FileSeed[] = [
  {
    id: "f-1",
    eventId: "e-1",
    name: "กำหนดการงานเลี้ยงประจำปี 2569.pdf",
    categoryId: "fc-agenda",
    type: "pdf",
    versions: [
      {
        filename: "กำหนดการงานเลี้ยงประจำปี 2569 v1.pdf",
        uploadedBy: "u-1",
        uploadedAt: "2026-06-24T10:12:00+07:00",
        sizeMb: 1.2,
        changeNote: ["ร่างกำหนดการฉบับแรก", "First draft of the agenda"],
      },
      {
        filename: "กำหนดการงานเลี้ยงประจำปี 2569 v2.pdf",
        uploadedBy: "u-1",
        uploadedAt: "2026-07-15T14:35:00+07:00",
        sizeMb: 1.4,
        changeNote: [
          "ปรับเวลาช่วงมอบรางวัลตามความเห็นผู้บริหาร",
          "Adjusted the awards slot per executive feedback",
        ],
      },
      {
        filename: "กำหนดการงานเลี้ยงประจำปี 2569 v3.pdf",
        uploadedBy: "u-6",
        uploadedAt: "2026-07-29T09:40:00+07:00",
        sizeMb: 1.5,
        changeNote: [
          "เพิ่มช่วงการแสดงของแผนกปฏิบัติการ",
          "Added the Operations department performance",
        ],
      },
    ],
  },
  {
    id: "f-2",
    eventId: "e-1",
    name: "สไลด์เปิดงาน Golden Night.pptx",
    categoryId: "fc-slides",
    type: "powerpoint",
    versions: [
      {
        filename: "สไลด์เปิดงาน Golden Night v1.pptx",
        uploadedBy: "u-2",
        uploadedAt: "2026-07-18T16:20:00+07:00",
        sizeMb: 18.4,
        changeNote: ["โครงสไลด์เปิดงาน", "Opening deck skeleton"],
      },
      {
        filename: "สไลด์เปิดงาน Golden Night v2.pptx",
        uploadedBy: "u-2",
        uploadedAt: "2026-07-30T11:05:00+07:00",
        sizeMb: 24.7,
        changeNote: [
          "ใส่ภาพกิจกรรมตลอดปีและตัวเลขผลประกอบการ",
          "Added the year's photos and business results",
        ],
      },
    ],
  },
  {
    id: "f-3",
    eventId: "e-1",
    name: "รายชื่อผู้เข้าร่วมงานเลี้ยง.xlsx",
    categoryId: "fc-attendees",
    type: "excel",
    versions: [
      {
        filename: "รายชื่อผู้เข้าร่วมงานเลี้ยง v1.xlsx",
        uploadedBy: "u-3",
        uploadedAt: "2026-07-08T13:50:00+07:00",
        sizeMb: 0.6,
        changeNote: ["รายชื่อรอบแรกจาก 4 แผนก", "First round from four departments"],
      },
      {
        filename: "รายชื่อผู้เข้าร่วมงานเลี้ยง v2.xlsx",
        uploadedBy: "u-3",
        uploadedAt: "2026-07-27T15:15:00+07:00",
        sizeMb: 0.9,
        changeNote: [
          "เพิ่มรายชื่อจากฝ่ายขายและฝ่ายวิจัย",
          "Added Sales and R&D headcount",
        ],
      },
    ],
  },
  {
    id: "f-4",
    eventId: "e-1",
    name: "โปสเตอร์ประชาสัมพันธ์ Golden Night.png",
    categoryId: "fc-poster",
    type: "image",
    versions: [
      {
        filename: "โปสเตอร์ Golden Night ร่าง A.png",
        uploadedBy: "u-2",
        uploadedAt: "2026-07-20T10:00:00+07:00",
        sizeMb: 4.2,
        changeNote: ["ทางเลือกที่ 1 โทนทองเข้ม", "Option 1, deep gold tone"],
        previewUrl: "/covers/annual-party.svg",
      },
      {
        filename: "โปสเตอร์ Golden Night ร่าง B.png",
        uploadedBy: "u-2",
        uploadedAt: "2026-07-26T17:30:00+07:00",
        sizeMb: 4.8,
        changeNote: [
          "ทางเลือกที่ 2 ปรับตัวอักษรให้อ่านง่ายขึ้น",
          "Option 2, improved typography legibility",
        ],
        previewUrl: "/covers/annual-party.svg",
      },
    ],
  },
  {
    id: "f-5",
    eventId: "e-1",
    name: "Script พิธีกร (ร่าง).docx",
    categoryId: "fc-script",
    type: "word",
    versions: [
      {
        filename: "Script พิธีกร ร่าง v1.docx",
        uploadedBy: "u-6",
        uploadedAt: "2026-07-29T14:00:00+07:00",
        sizeMb: 0.4,
        changeNote: ["ร่างบทพิธีกรช่วงเปิดงาน", "Draft of the opening segment"],
      },
    ],
  },
  {
    id: "f-6",
    eventId: "e-1",
    name: "สัญญาเช่าสถานที่จัดงาน.pdf",
    categoryId: "fc-budget",
    type: "pdf",
    versions: [
      {
        filename: "สัญญาเช่าสถานที่จัดงาน.pdf",
        uploadedBy: "u-7",
        uploadedAt: "2026-06-16T09:25:00+07:00",
        sizeMb: 3.1,
        changeNote: ["สัญญาฉบับลงนามแล้ว", "Signed contract"],
      },
    ],
  },
  {
    id: "f-7",
    eventId: "e-1",
    name: "แผนงบประมาณรายละเอียด.xlsx",
    categoryId: "fc-budget",
    type: "excel",
    versions: [
      {
        filename: "แผนงบประมาณรายละเอียด v1.xlsx",
        uploadedBy: "u-5",
        uploadedAt: "2026-06-28T11:45:00+07:00",
        sizeMb: 1.1,
        changeNote: ["แตกงบประมาณรายหมวด", "Budget broken down by category"],
      },
      {
        filename: "แผนงบประมาณรายละเอียด v2.xlsx",
        uploadedBy: "u-5",
        uploadedAt: "2026-07-24T16:10:00+07:00",
        sizeMb: 1.3,
        changeNote: [
          "ปรับงบของรางวัลเพิ่มขึ้น 80,000 บาท",
          "Increased the prize budget by 80,000 THB",
        ],
      },
    ],
  },
  {
    id: "f-8",
    eventId: "e-1",
    name: "ผังที่นั่งและผังห้องจัดงาน.pdf",
    categoryId: "fc-agenda",
    type: "pdf",
    versions: [
      {
        filename: "ผังที่นั่งและผังห้องจัดงาน.pdf",
        uploadedBy: "u-7",
        uploadedAt: "2026-07-22T13:20:00+07:00",
        sizeMb: 2.4,
        changeNote: ["ผังโต๊ะ 22 โต๊ะพร้อมเวที", "22-table layout with the stage"],
      },
    ],
  },
  {
    id: "f-9",
    eventId: "e-1",
    name: "รายการของรางวัลจับฉลาก.xlsx",
    categoryId: "fc-budget",
    type: "excel",
    versions: [
      {
        filename: "รายการของรางวัลจับฉลาก.xlsx",
        uploadedBy: "u-5",
        uploadedAt: "2026-07-25T10:35:00+07:00",
        sizeMb: 0.5,
        changeNote: ["รายการของรางวัล 60 ชิ้น", "List of 60 prizes"],
      },
    ],
  },
  {
    id: "f-10",
    eventId: "e-1",
    name: "แบบฉากเวที Golden Night.png",
    categoryId: "fc-poster",
    type: "image",
    versions: [
      {
        filename: "แบบฉากเวที Golden Night.png",
        uploadedBy: "u-2",
        uploadedAt: "2026-07-28T15:55:00+07:00",
        sizeMb: 6.7,
        changeNote: ["แบบฉากเวทีพร้อมขนาดจริง", "Stage set design with dimensions"],
        previewUrl: "/covers/annual-party.svg",
      },
    ],
  },
  {
    id: "f-11",
    eventId: "e-2",
    name: "กำหนดการปฐมนิเทศ ไตรมาส 3.pdf",
    categoryId: "fc-agenda",
    type: "pdf",
    versions: [
      {
        filename: "กำหนดการปฐมนิเทศ ไตรมาส 3.pdf",
        uploadedBy: "u-3",
        uploadedAt: "2026-07-18T09:30:00+07:00",
        sizeMb: 0.8,
        changeNote: ["กำหนดการฉบับสมบูรณ์", "Final agenda"],
      },
    ],
  },
  {
    id: "f-12",
    eventId: "e-2",
    name: "คู่มือพนักงานใหม่.pdf",
    categoryId: "fc-agenda",
    type: "pdf",
    versions: [
      {
        filename: "คู่มือพนักงานใหม่.pdf",
        uploadedBy: "u-3",
        uploadedAt: "2026-07-20T14:15:00+07:00",
        sizeMb: 9.6,
        changeNote: ["คู่มือฉบับปรับปรุงปี 2569", "2026 revision"],
      },
    ],
  },
  {
    id: "f-13",
    eventId: "e-3",
    name: "สไลด์อบรมความปลอดภัยข้อมูล.pptx",
    categoryId: "fc-slides",
    type: "powerpoint",
    versions: [
      {
        filename: "สไลด์อบรมความปลอดภัยข้อมูล v1.pptx",
        uploadedBy: "u-4",
        uploadedAt: "2026-07-05T11:00:00+07:00",
        sizeMb: 12.3,
        changeNote: ["เนื้อหาจากปีที่แล้ว", "Carried over from last year"],
      },
      {
        filename: "สไลด์อบรมความปลอดภัยข้อมูล v2.pptx",
        uploadedBy: "u-4",
        uploadedAt: "2026-07-10T16:45:00+07:00",
        sizeMb: 15.8,
        changeNote: [
          "เพิ่มกรณีศึกษาฟิชชิงรูปแบบใหม่",
          "Added new phishing case studies",
        ],
      },
    ],
  },
  {
    id: "f-14",
    eventId: "e-3",
    name: "แบบทดสอบท้ายหลักสูตร.docx",
    categoryId: "fc-agenda",
    type: "word",
    versions: [
      {
        filename: "แบบทดสอบท้ายหลักสูตร.docx",
        uploadedBy: "u-4",
        uploadedAt: "2026-07-17T10:20:00+07:00",
        sizeMb: 0.3,
        changeNote: ["ข้อสอบ 20 ข้อ", "20-question assessment"],
      },
    ],
  },
  {
    id: "f-15",
    eventId: "e-5",
    name: "สไลด์สรุปผลครึ่งปีแรก.pptx",
    categoryId: "fc-slides",
    type: "powerpoint",
    versions: [
      {
        filename: "สไลด์สรุปผลครึ่งปีแรก.pptx",
        uploadedBy: "u-5",
        uploadedAt: "2026-06-22T17:40:00+07:00",
        sizeMb: 21.5,
        changeNote: ["ฉบับนำเสนอจริง", "Final presented version"],
      },
    ],
  },

  /* ---- ไฟล์ที่อยู่ในถังขยะ ---- */
  {
    id: "f-16",
    eventId: "e-1",
    name: "โปสเตอร์ร่างเก่า (ไม่ใช้แล้ว).png",
    categoryId: "fc-poster",
    type: "image",
    versions: [
      {
        filename: "โปสเตอร์ร่างเก่า.png",
        uploadedBy: "u-2",
        uploadedAt: "2026-07-12T10:10:00+07:00",
        sizeMb: 3.9,
        changeNote: ["ร่างที่ไม่ผ่านการคัดเลือก", "Rejected concept"],
        previewUrl: "/covers/annual-party.svg",
      },
    ],
    deletedAt: "2026-07-29T11:30:00+07:00",
    deletedBy: "u-2",
  },
  {
    id: "f-17",
    eventId: "e-1",
    name: "รายชื่อรอบทดลอง (ซ้ำ).xlsx",
    categoryId: "fc-attendees",
    type: "excel",
    versions: [
      {
        filename: "รายชื่อรอบทดลอง.xlsx",
        uploadedBy: "u-3",
        uploadedAt: "2026-07-09T09:05:00+07:00",
        sizeMb: 0.4,
        changeNote: ["ไฟล์ทดลองอัปโหลดซ้ำ", "Duplicate test upload"],
      },
    ],
    deletedAt: "2026-07-16T14:00:00+07:00",
    deletedBy: "u-3",
  },
  {
    id: "f-18",
    eventId: "e-6",
    name: "ร่างแนวคิดงานเปิดตัว Aurora.pptx",
    categoryId: "fc-slides",
    type: "powerpoint",
    versions: [
      {
        filename: "ร่างแนวคิดงานเปิดตัว Aurora.pptx",
        uploadedBy: "u-2",
        uploadedAt: "2026-06-30T13:15:00+07:00",
        sizeMb: 8.2,
        changeNote: ["ร่างแนวคิดก่อนงานถูกยกเลิก", "Concept draft before cancellation"],
      },
    ],
    deletedAt: "2026-07-15T10:05:00+07:00",
    deletedBy: "u-1",
  },
  {
    id: "f-20",
    eventId: "e-1",
    name: "ใบเสนอราคาที่ไม่ได้เลือก.pdf",
    categoryId: "fc-budget",
    type: "pdf",
    versions: [
      {
        filename: "ใบเสนอราคาที่ไม่ได้เลือก.pdf",
        uploadedBy: "u-5",
        uploadedAt: "2026-06-20T10:40:00+07:00",
        sizeMb: 1.8,
        changeNote: ["ใบเสนอราคาจากผู้ให้บริการที่ไม่ได้เลือก", "Quote from the caterer we did not pick"],
      },
    ],
    // ลบมานานแล้ว เหลืออีกไม่กี่วันก่อนถูกลบถาวร — ใช้สาธิตสถานะ "ใกล้ถูกลบถาวร"
    deletedAt: "2026-07-05T09:15:00+07:00",
    deletedBy: "u-5",
  },
  {
    id: "f-19",
    eventId: "e-2",
    name: "แบบฟอร์มเก่าไม่ใช้แล้ว.docx",
    categoryId: "fc-agenda",
    type: "word",
    versions: [
      {
        filename: "แบบฟอร์มเก่า.docx",
        uploadedBy: "u-3",
        uploadedAt: "2026-06-11T15:30:00+07:00",
        sizeMb: 0.2,
        changeNote: ["แบบฟอร์มฉบับปีก่อน", "Previous year's form"],
      },
    ],
    deletedAt: "2026-07-30T16:20:00+07:00",
    deletedBy: "u-3",
  },
]

function buildFile(seed: FileSeed): FileItem {
  const versions: FileVersion[] = seed.versions.map((version, index) => ({
    id: `${seed.id}-v${index + 1}`,
    versionNumber: index + 1,
    filename: version.filename,
    uploadedBy: version.uploadedBy,
    uploadedAt: version.uploadedAt,
    size: Math.round(version.sizeMb * MB),
    changeNote: { th: version.changeNote[0], en: version.changeNote[1] },
    previewUrl: version.previewUrl ?? null,
  }))

  const current = versions[versions.length - 1]

  return {
    id: seed.id,
    eventId: seed.eventId,
    name: seed.name,
    categoryId: seed.categoryId,
    type: seed.type,
    versions,
    currentVersionId: current.id,
    uploadedBy: versions[0].uploadedBy,
    uploadedAt: versions[0].uploadedAt,
    updatedAt: current.uploadedAt,
    updatedBy: current.uploadedBy,
    deletedAt: seed.deletedAt ?? null,
    deletedBy: seed.deletedBy ?? null,
  }
}

export const MOCK_FILES: FileItem[] = SEEDS.map(buildFile)
