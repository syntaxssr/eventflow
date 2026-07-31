import type { LocalizedText } from "@/types/common"
import type {
  ReadinessStatus,
  TimelineItem,
  TimelinePhase,
} from "@/types/timeline"

interface TimelineSeed {
  phase: TimelinePhase
  date: string
  startTime: string
  endTime: string
  title: [string, string]
  ownerIds: string[]
  location: [string, string]
  readiness: ReadinessStatus
  note?: [string, string]
  linkedTaskId?: string
}

function text([th, en]: [string, string]): LocalizedText {
  return { th, en }
}

const EMPTY: LocalizedText = { th: "", en: "" }

/* -------------------------------------------------------------------------
   ไทม์ไลน์ของงานเลี้ยงประจำปี (จัดวันที่ 18 ก.ย. 2569 เวลา 17:00–22:00)
   ------------------------------------------------------------------------- */

const MAIN_EVENT_SEEDS: TimelineSeed[] = [
  /* ---- ก่อนวันงาน ---- */
  {
    phase: "before",
    date: "2026-09-01",
    startTime: "09:00",
    endTime: "17:00",
    title: ["ปิดรับลงทะเบียนเข้าร่วมงาน", "Close event registration"],
    ownerIds: ["u-3"],
    location: ["ระบบลงทะเบียนออนไลน์", "Online registration system"],
    readiness: "not_ready",
    note: [
      "ต้องได้ยอดสุดท้ายก่อนยืนยันจำนวนโต๊ะกับโรงแรม",
      "Final headcount is needed before confirming tables with the hotel",
    ],
    linkedTaskId: "t-13",
  },
  {
    phase: "before",
    date: "2026-09-04",
    startTime: "10:00",
    endTime: "12:00",
    title: ["ส่งไฟล์พิมพ์ป้ายชื่อและป้ายงาน", "Send badge and signage files to print"],
    ownerIds: ["u-2"],
    location: ["โรงพิมพ์", "Print shop"],
    readiness: "not_ready",
    linkedTaskId: "t-14",
  },
  {
    phase: "before",
    date: "2026-09-08",
    startTime: "14:00",
    endTime: "15:30",
    title: ["ยืนยันเมนูและจำนวนโต๊ะกับโรงแรม", "Confirm menu and table count"],
    ownerIds: ["u-7"],
    location: ["โรงแรมเซ็นเตอร์พอยต์ ราชดำริ", "Centre Point Hotel Ratchadamri"],
    readiness: "not_ready",
    linkedTaskId: "t-6",
  },
  {
    phase: "before",
    date: "2026-09-12",
    startTime: "13:30",
    endTime: "15:00",
    title: ["ประชุมเตรียมความพร้อมทีมงาน", "Team readiness briefing"],
    ownerIds: ["u-1", "u-6"],
    location: ["ห้องประชุมใหญ่ ชั้น 12", "Main Conference Room, 12th Floor"],
    readiness: "not_ready",
    note: [
      "ทบทวนลำดับพิธีการและแบ่งหน้าที่หน้างาน",
      "Walk through the run-down and assign on-site roles",
    ],
    linkedTaskId: "t-17",
  },
  {
    phase: "before",
    date: "2026-09-15",
    startTime: "09:00",
    endTime: "18:00",
    title: ["ติดตั้งฉากเวทีและระบบไฟ", "Install the stage set and lighting"],
    ownerIds: ["u-2", "u-7"],
    location: ["ห้องแกรนด์บอลรูม", "Grand Ballroom"],
    readiness: "not_ready",
    linkedTaskId: "t-16",
  },
  {
    phase: "before",
    date: "2026-09-16",
    startTime: "13:00",
    endTime: "17:00",
    title: ["ทดสอบระบบเสียงและจอ LED", "Test the sound system and LED wall"],
    ownerIds: ["u-4"],
    location: ["ห้องแกรนด์บอลรูม", "Grand Ballroom"],
    readiness: "not_ready",
    linkedTaskId: "t-15",
  },
  {
    phase: "before",
    date: "2026-09-17",
    startTime: "15:00",
    endTime: "19:00",
    title: ["ซ้อมใหญ่เต็มรูปแบบ", "Full dress rehearsal"],
    ownerIds: ["u-1", "u-6", "u-4"],
    location: ["ห้องแกรนด์บอลรูม", "Grand Ballroom"],
    readiness: "not_ready",
    note: [
      "ซ้อมพร้อมผู้แสดงจากทุกแผนกและทีมเทคนิค",
      "Run with all department performers and the technical crew",
    ],
    linkedTaskId: "t-21",
  },

  /* ---- วันจัดงาน ---- */
  {
    phase: "during",
    date: "2026-09-18",
    startTime: "14:00",
    endTime: "16:00",
    title: ["ทีมงานเข้าพื้นที่และจัดโต๊ะ", "Crew arrives and sets the tables"],
    ownerIds: ["u-7"],
    location: ["ห้องแกรนด์บอลรูม", "Grand Ballroom"],
    readiness: "not_ready",
  },
  {
    phase: "during",
    date: "2026-09-18",
    startTime: "16:00",
    endTime: "16:45",
    title: ["ตรวจความพร้อมขั้นสุดท้าย", "Final readiness check"],
    ownerIds: ["u-1", "u-4"],
    location: ["ห้องแกรนด์บอลรูม", "Grand Ballroom"],
    readiness: "not_ready",
  },
  {
    phase: "during",
    date: "2026-09-18",
    startTime: "16:45",
    endTime: "17:30",
    title: ["เปิดลงทะเบียนหน้างาน", "On-site registration opens"],
    ownerIds: ["u-3"],
    location: ["โถงหน้าห้องบอลรูม", "Ballroom foyer"],
    readiness: "not_ready",
    note: ["เตรียมป้ายชื่อเรียงตามแผนก", "Badges arranged by department"],
  },
  {
    phase: "during",
    date: "2026-09-18",
    startTime: "17:30",
    endTime: "17:45",
    title: ["พิธีกรกล่าวเปิดงาน", "MC opens the evening"],
    ownerIds: ["u-6"],
    location: ["เวทีหลัก", "Main stage"],
    readiness: "not_ready",
    linkedTaskId: "t-11",
  },
  {
    phase: "during",
    date: "2026-09-18",
    startTime: "17:45",
    endTime: "18:00",
    title: ["ประธานกล่าวเปิดงาน", "Chairman's opening address"],
    ownerIds: ["u-1"],
    location: ["เวทีหลัก", "Main stage"],
    readiness: "not_ready",
    linkedTaskId: "t-10",
  },
  {
    phase: "during",
    date: "2026-09-18",
    startTime: "18:00",
    endTime: "19:00",
    title: ["รับประทานอาหารค่ำ", "Dinner service"],
    ownerIds: ["u-7"],
    location: ["ห้องแกรนด์บอลรูม", "Grand Ballroom"],
    readiness: "not_ready",
    linkedTaskId: "t-6",
  },
  {
    phase: "during",
    date: "2026-09-18",
    startTime: "19:00",
    endTime: "19:30",
    title: ["การแสดงจากฝ่ายปฏิบัติการ", "Operations department performance"],
    ownerIds: ["u-6"],
    location: ["เวทีหลัก", "Main stage"],
    readiness: "not_ready",
  },
  {
    phase: "during",
    date: "2026-09-18",
    startTime: "19:45",
    endTime: "20:20",
    title: ["มอบรางวัลพนักงานดีเด่น", "Outstanding employee awards"],
    ownerIds: ["u-1", "u-3"],
    location: ["เวทีหลัก", "Main stage"],
    readiness: "not_ready",
    note: [
      "เลื่อนจาก 19:30 ตามคำขอของฝ่ายบริหาร",
      "Moved from 19:30 at the executives' request",
    ],
    linkedTaskId: "t-10",
  },
  {
    phase: "during",
    date: "2026-09-18",
    startTime: "20:20",
    endTime: "20:50",
    title: ["การแสดงจากฝ่ายขายและการตลาด", "Sales & Marketing performance"],
    ownerIds: ["u-6"],
    location: ["เวทีหลัก", "Main stage"],
    readiness: "not_ready",
  },
  {
    phase: "during",
    date: "2026-09-18",
    startTime: "20:50",
    endTime: "21:30",
    title: ["จับฉลากของรางวัลใหญ่", "Grand prize draw"],
    ownerIds: ["u-5", "u-6"],
    location: ["เวทีหลัก", "Main stage"],
    readiness: "not_ready",
    linkedTaskId: "t-12",
  },
  {
    phase: "during",
    date: "2026-09-18",
    startTime: "21:30",
    endTime: "21:50",
    title: ["ถ่ายภาพหมู่", "Group photo"],
    ownerIds: ["u-2"],
    location: ["หน้าเวทีหลัก", "In front of the main stage"],
    readiness: "not_ready",
    linkedTaskId: "t-23",
  },
  {
    phase: "during",
    date: "2026-09-18",
    startTime: "21:50",
    endTime: "22:00",
    title: ["กล่าวปิดงาน", "Closing remarks"],
    ownerIds: ["u-1", "u-6"],
    location: ["เวทีหลัก", "Main stage"],
    readiness: "not_ready",
  },

  /* ---- หลังจบงาน ---- */
  {
    phase: "after",
    date: "2026-09-19",
    startTime: "09:00",
    endTime: "12:00",
    title: ["เก็บอุปกรณ์และคืนพื้นที่", "Strike the set and hand back the venue"],
    ownerIds: ["u-7", "u-4"],
    location: ["ห้องแกรนด์บอลรูม", "Grand Ballroom"],
    readiness: "not_ready",
  },
  {
    phase: "after",
    date: "2026-09-22",
    startTime: "10:00",
    endTime: "12:00",
    title: ["รวบรวมภาพถ่ายและวิดีโอ", "Collect photos and video"],
    ownerIds: ["u-2"],
    location: ["ฝ่ายออกแบบ", "Design department"],
    readiness: "not_ready",
    linkedTaskId: "t-23",
  },
  {
    phase: "after",
    date: "2026-09-25",
    startTime: "09:00",
    endTime: "10:00",
    title: ["ส่งแบบประเมินความพึงพอใจ", "Send out the satisfaction survey"],
    ownerIds: ["u-3"],
    location: ["อีเมลองค์กร", "Corporate email"],
    readiness: "not_ready",
    linkedTaskId: "t-22",
  },
  {
    phase: "after",
    date: "2026-09-30",
    startTime: "13:00",
    endTime: "17:00",
    title: ["สรุปค่าใช้จ่ายและรายงานผล", "Reconcile costs and report results"],
    ownerIds: ["u-5", "u-1"],
    location: ["ฝ่ายบัญชีและการเงิน", "Finance & Accounting"],
    readiness: "not_ready",
    linkedTaskId: "t-24",
  },
]

/* ไทม์ไลน์ของงานปฐมนิเทศ เพื่อให้หน้ารวมไทม์ไลน์มีมากกว่าหนึ่งกิจกรรม */
const ORIENTATION_SEEDS: TimelineSeed[] = [
  {
    phase: "before",
    date: "2026-08-11",
    startTime: "09:00",
    endTime: "11:00",
    title: ["เตรียมชุดเอกสารต้อนรับ", "Assemble the welcome packs"],
    ownerIds: ["u-3"],
    location: ["ฝ่ายทรัพยากรบุคคล", "Human Resources"],
    readiness: "preparing",
    linkedTaskId: "t-31",
  },
  {
    phase: "during",
    date: "2026-08-14",
    startTime: "09:00",
    endTime: "09:30",
    title: ["ลงทะเบียนและรับเอกสาร", "Registration and welcome pack"],
    ownerIds: ["u-3"],
    location: ["ห้องประชุมใหญ่ ชั้น 12", "Main Conference Room, 12th Floor"],
    readiness: "not_ready",
  },
  {
    phase: "during",
    date: "2026-08-14",
    startTime: "09:30",
    endTime: "12:00",
    title: ["แนะนำองค์กรและวัฒนธรรมการทำงาน", "Company and culture introduction"],
    ownerIds: ["u-3", "u-1"],
    location: ["ห้องประชุมใหญ่ ชั้น 12", "Main Conference Room, 12th Floor"],
    readiness: "not_ready",
    linkedTaskId: "t-33",
  },
  {
    phase: "during",
    date: "2026-08-14",
    startTime: "13:00",
    endTime: "16:30",
    title: ["อบรมระบบภายในและความปลอดภัยข้อมูล", "Internal systems and security training"],
    ownerIds: ["u-4"],
    location: ["ห้องประชุมใหญ่ ชั้น 12", "Main Conference Room, 12th Floor"],
    readiness: "not_ready",
    linkedTaskId: "t-32",
  },
  {
    phase: "after",
    date: "2026-08-18",
    startTime: "10:00",
    endTime: "11:00",
    title: ["ติดตามผลและตอบข้อสงสัย", "Follow-up and open questions"],
    ownerIds: ["u-3"],
    location: ["ออนไลน์", "Online"],
    readiness: "not_ready",
  },
]

function build(
  eventId: string,
  seeds: TimelineSeed[],
  createdAt: string
): TimelineItem[] {
  let orderInPhase: Record<TimelinePhase, number> = {
    before: 0,
    during: 0,
    after: 0,
  }

  return seeds.map((seed, index) => {
    const order = orderInPhase[seed.phase]
    orderInPhase = { ...orderInPhase, [seed.phase]: order + 1 }

    return {
      id: `${eventId}-tl-${index + 1}`,
      eventId,
      phase: seed.phase,
      date: seed.date,
      startTime: seed.startTime,
      endTime: seed.endTime,
      title: text(seed.title),
      ownerIds: seed.ownerIds,
      location: text(seed.location),
      readiness: seed.readiness,
      note: seed.note ? text(seed.note) : EMPTY,
      linkedTaskId: seed.linkedTaskId ?? null,
      order,
      createdAt,
      createdBy: seed.ownerIds[0],
      updatedAt: createdAt,
      updatedBy: seed.ownerIds[0],
    }
  })
}

export const MOCK_TIMELINE: TimelineItem[] = [
  ...build("e-1", MAIN_EVENT_SEEDS, "2026-07-14T10:00:00+07:00"),
  ...build("e-2", ORIENTATION_SEEDS, "2026-07-20T11:00:00+07:00"),
]
