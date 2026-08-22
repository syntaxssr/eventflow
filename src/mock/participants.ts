import type { LocalizedText } from "@/types/common"
import type {
  Participant,
  ParticipantType,
  RsvpStatus,
} from "@/types/participant"
import { MOCK_USERS } from "./users"

/** [ไทย, English] */
export type NamePair = [string, string]

/** ชุดชื่อ-นามสกุลกลาง — ทะเบียนพนักงานใช้ชุดเดียวกันเพื่อให้ชื่อตรงกันข้ามหน้า */
export const FIRST_NAMES: NamePair[] = [
  ["ชัยวัฒน์", "Chaiwat"],
  ["ณัฐริกา", "Nattarika"],
  ["ภูริช", "Phurich"],
  ["สุทธิดา", "Suttida"],
  ["ก้องภพ", "Kongphop"],
  ["ปิยะฉัตร", "Piyachat"],
  ["ธีรเดช", "Teeradech"],
  ["อรวรรณ", "Orawan"],
  ["วรินทร", "Warinthorn"],
  ["เกวลิน", "Kewalin"],
  ["ศุภกร", "Supakorn"],
  ["มนัสนันท์", "Manatsanan"],
  ["จิรายุ", "Jirayu"],
  ["พัชราภา", "Patcharapa"],
  ["ณรงค์ฤทธิ์", "Narongrit"],
  ["ชนากานต์", "Chanakan"],
  ["ธนวัฒน์", "Thanawat"],
  ["ปรียานุช", "Preeyanuch"],
  ["อัครเดช", "Akkaradech"],
  ["สุพิชญา", "Supitchaya"],
  ["กิตติพงษ์", "Kittipong"],
  ["รวิสรา", "Rawisara"],
  ["เจษฎา", "Jessada"],
  ["ทิพย์สุดา", "Thipsuda"],
]

export const LAST_NAMES: NamePair[] = [
  ["บุญมาก", "Boonmak"],
  ["ทองสุข", "Thongsuk"],
  ["เจริญพร", "Charoenporn"],
  ["สุขสวัสดิ์", "Suksawat"],
  ["พูนทรัพย์", "Poonsap"],
  ["ไชยสิทธิ์", "Chaiyasit"],
  ["รักไทย", "Rakthai"],
  ["ศรีสมบัติ", "Srisombat"],
  ["วัฒนกุล", "Watthanakul"],
  ["ประเสริฐศรี", "Prasertsri"],
  ["อินทรีย์", "Intharee"],
  ["ธรรมรักษ์", "Thammarak"],
  ["ชูเกียรติ", "Chukiat"],
  ["มณีรัตน์", "Maneerat"],
  ["ปานทอง", "Panthong"],
  ["ยิ้มแย้ม", "Yimyam"],
  ["เลิศวิไล", "Lertwilai"],
  ["สายสุนทร", "Saisunthorn"],
  ["ก้าวหน้า", "Kaona"],
  ["พงศ์ภัค", "Pongphak"],
  ["ดวงแก้ว", "Duangkaew"],
  ["ตั้งใจดี", "Tangjaidee"],
  ["ภักดีวงศ์", "Phakdeewong"],
  ["ครองทรัพย์", "Krongsap"],
]

export const DEPARTMENTS: LocalizedText[] = [
  { th: "ฝ่ายขายและการตลาด", en: "Sales & Marketing" },
  { th: "ฝ่ายปฏิบัติการ", en: "Operations" },
  { th: "ฝ่ายบัญชีและการเงิน", en: "Finance & Accounting" },
  { th: "ฝ่ายทรัพยากรบุคคล", en: "Human Resources" },
  { th: "ฝ่ายเทคโนโลยีสารสนเทศ", en: "Information Technology" },
  { th: "ฝ่ายจัดซื้อ", en: "Procurement" },
  { th: "ฝ่ายลูกค้าสัมพันธ์", en: "Customer Relations" },
  { th: "ฝ่ายวิจัยและพัฒนา", en: "Research & Development" },
]

/**
 * กระจายสถานะตอบรับให้ดูสมจริง — ตอบรับประมาณ 60%, ไม่เข้าร่วม 15%, ที่เหลือยังไม่ตอบ
 * ใช้รูปแบบคงที่แทนการสุ่ม เพื่อให้ข้อมูลเหมือนเดิมทุกครั้งที่โหลด
 */
const RSVP_PATTERN: RsvpStatus[] = [
  "attending",
  "attending",
  "pending",
  "attending",
  "not_attending",
  "attending",
  "pending",
  "attending",
  "attending",
  "pending",
  "attending",
  "not_attending",
  "attending",
  "pending",
  "attending",
  "attending",
  "pending",
  "attending",
  "attending",
  "not_attending",
]

const NOTES: LocalizedText[] = [
  { th: "", en: "" },
  { th: "แพ้อาหารทะเล", en: "Allergic to seafood" },
  { th: "", en: "" },
  { th: "ขออาหารมังสวิรัติ", en: "Requests a vegetarian meal" },
  { th: "", en: "" },
  { th: "", en: "" },
  { th: "ขออาหารฮาลาล", en: "Requests a halal meal" },
  { th: "", en: "" },
  { th: "เดินทางมาจากสาขาเชียงใหม่", en: "Travelling from the Chiang Mai branch" },
  { th: "", en: "" },
]

interface SpecialParticipant {
  first: NamePair
  last: NamePair
  type: ParticipantType
  department: LocalizedText
  rsvpStatus: RsvpStatus
  note?: LocalizedText
}

/** ผู้บริหาร วิทยากร และแขกภายนอก ระบุรายชื่อไว้ชัดเจนเพื่อความสมจริง */
const SPECIAL: SpecialParticipant[] = [
  {
    first: ["สมชาย", "Somchai"],
    last: ["วรกิจไพศาล", "Worakitpaisal"],
    type: "executive",
    department: { th: "คณะผู้บริหาร", en: "Executive Office" },
    rsvpStatus: "attending",
    note: { th: "ประธานในพิธีเปิดงาน", en: "Opening ceremony chair" },
  },
  {
    first: ["วิไลวรรณ", "Wilaiwan"],
    last: ["อภิรักษ์กุล", "Apirakkul"],
    type: "executive",
    department: { th: "คณะผู้บริหาร", en: "Executive Office" },
    rsvpStatus: "attending",
  },
  {
    first: ["ปรีชา", "Preecha"],
    last: ["สถิตย์ธรรม", "Sathitthum"],
    type: "executive",
    department: { th: "คณะผู้บริหาร", en: "Executive Office" },
    rsvpStatus: "attending",
  },
  {
    first: ["อารยา", "Araya"],
    last: ["เกษมสุข", "Kasemsuk"],
    type: "executive",
    department: { th: "คณะผู้บริหาร", en: "Executive Office" },
    rsvpStatus: "pending",
  },
  {
    first: ["ธนกร", "Thanakorn"],
    last: ["วิทยาคม", "Wittayakom"],
    type: "executive",
    department: { th: "คณะผู้บริหาร", en: "Executive Office" },
    rsvpStatus: "attending",
  },
  {
    first: ["ศิริพร", "Siriporn"],
    last: ["ธนบดี", "Thanabodee"],
    type: "executive",
    department: { th: "คณะผู้บริหาร", en: "Executive Office" },
    rsvpStatus: "not_attending",
    note: { th: "ติดภารกิจต่างประเทศ", en: "Overseas commitment" },
  },
  {
    first: ["กฤษณะ", "Kritsana"],
    last: ["บวรชัย", "Bowornchai"],
    type: "speaker",
    department: { th: "วิทยากรรับเชิญ", en: "Guest Speaker" },
    rsvpStatus: "attending",
    note: { th: "บรรยายช่วงเปิดงาน 15 นาที", en: "15-minute opening keynote" },
  },
  {
    first: ["นภัสสร", "Napassorn"],
    last: ["ชัยมงคล", "Chaimongkol"],
    type: "speaker",
    department: { th: "วิทยากรรับเชิญ", en: "Guest Speaker" },
    rsvpStatus: "attending",
  },
  {
    first: ["เอกพงศ์", "Ekkapong"],
    last: ["สิริวัฒน์", "Siriwat"],
    type: "speaker",
    department: { th: "วิทยากรรับเชิญ", en: "Guest Speaker" },
    rsvpStatus: "pending",
  },
  {
    first: ["จันทิมา", "Chantima"],
    last: ["โพธิ์ทอง", "Phothong"],
    type: "external_guest",
    department: { th: "บริษัทคู่ค้า", en: "Partner Company" },
    rsvpStatus: "attending",
  },
  {
    first: ["ไพโรจน์", "Pairoj"],
    last: ["สุวรรณภูมิ", "Suwannaphum"],
    type: "external_guest",
    department: { th: "บริษัทคู่ค้า", en: "Partner Company" },
    rsvpStatus: "attending",
  },
  {
    first: ["ดวงใจ", "Duangjai"],
    last: ["รุ่งเรือง", "Rungruang"],
    type: "external_guest",
    department: { th: "บริษัทคู่ค้า", en: "Partner Company" },
    rsvpStatus: "pending",
  },
  {
    first: ["สราวุธ", "Sarawut"],
    last: ["นาคะเสถียร", "Nakhasathian"],
    type: "external_guest",
    department: { th: "สื่อมวลชน", en: "Press" },
    rsvpStatus: "not_attending",
  },
  {
    first: ["พิมพิศา", "Pimpisa"],
    last: ["เรืองศักดิ์", "Ruangsak"],
    type: "external_guest",
    department: { th: "สื่อมวลชน", en: "Press" },
    rsvpStatus: "pending",
  },
]

/** สร้างอีเมลไม่ซ้ำจากชื่อภาษาอังกฤษ เติมตัวเลขต่อท้ายเมื่อชนกัน */
function makeEmailFactory() {
  const used = new Set<string>()
  return (firstEn: string, lastEn: string): string => {
    const base = `${firstEn.toLowerCase()}.${lastEn[0].toLowerCase()}`
    let candidate = `${base}@company.co.th`
    let suffix = 2
    while (used.has(candidate)) {
      candidate = `${base}${suffix}@company.co.th`
      suffix += 1
    }
    used.add(candidate)
    return candidate
  }
}

function makePhone(index: number): string {
  const line = `${8_100_0000 + index * 1379}`.slice(-7)
  return `08${line.slice(0, 1)}-${line.slice(1, 4)}-${line.slice(4)}`
}

function buildEventParticipants(
  eventId: string,
  employeeCount: number,
  options: { includeSpecial: boolean; includeOrganizers: boolean }
): Participant[] {
  const nextEmail = makeEmailFactory()
  const participants: Participant[] = []
  let index = 0

  const push = (
    first: NamePair,
    last: NamePair,
    type: ParticipantType,
    department: LocalizedText,
    rsvpStatus: RsvpStatus,
    note: LocalizedText
  ) => {
    index += 1
    participants.push({
      id: `${eventId}-p-${index}`,
      eventId,
      firstName: { th: first[0], en: first[1] },
      lastName: { th: last[0], en: last[1] },
      email: nextEmail(first[1], last[1]),
      department,
      phone: makePhone(index),
      rsvpStatus,
      type,
      note,
    })
  }

  if (options.includeOrganizers) {
    for (const user of MOCK_USERS) {
      push(
        [user.firstName.th, user.firstName.en],
        [user.lastName.th, user.lastName.en],
        "organizer",
        user.team,
        "attending",
        { th: "", en: "" }
      )
    }
  }

  if (options.includeSpecial) {
    for (const person of SPECIAL) {
      push(
        person.first,
        person.last,
        person.type,
        person.department,
        person.rsvpStatus,
        person.note ?? { th: "", en: "" }
      )
    }
  }

  for (let i = 0; i < employeeCount; i += 1) {
    push(
      FIRST_NAMES[i % FIRST_NAMES.length],
      LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length],
      "employee",
      DEPARTMENTS[i % DEPARTMENTS.length],
      RSVP_PATTERN[i % RSVP_PATTERN.length],
      NOTES[i % NOTES.length]
    )
  }

  return participants
}

export const MOCK_PARTICIPANTS: Participant[] = [
  ...buildEventParticipants("e-1", 62, {
    includeSpecial: true,
    includeOrganizers: true,
  }),
  ...buildEventParticipants("e-2", 32, {
    includeSpecial: false,
    includeOrganizers: false,
  }),
  ...buildEventParticipants("e-3", 24, {
    includeSpecial: false,
    includeOrganizers: false,
  }),
  ...buildEventParticipants("e-5", 40, {
    includeSpecial: false,
    includeOrganizers: false,
  }),
]
