import { fromDateKey, toDateKey } from "@/constants/mock-date"
import type { LocalizedText } from "@/types/common"
import type { ChecklistItem, Priority, Task, TaskStatus } from "@/types/task"

/** [ภาษาไทย, English, ติ๊กแล้วหรือยัง] */
type ChecklistSeed = [string, string, boolean]

interface TaskSeed {
  id: string
  eventId: string
  title: [string, string]
  description: [string, string]
  assigneeIds: string[]
  dueDate: string
  /** ไม่ระบุ = เริ่มก่อนกำหนดส่ง 7 วัน */
  startDate?: string
  priority: Priority
  status: TaskStatus
  dependsOn?: string[]
  checklist?: ChecklistSeed[]
  notes?: [string, string]
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

const EMPTY: LocalizedText = { th: "", en: "" }

function text([th, en]: [string, string]): LocalizedText {
  return { th, en }
}

/** ถอยหลังจากวันครบกำหนดตามจำนวนวันที่กำหนด */
function daysBefore(dateKey: string, days: number): string {
  const date = fromDateKey(dateKey)
  date.setDate(date.getDate() - days)
  return toDateKey(date)
}

function buildChecklist(taskId: string, seeds: ChecklistSeed[]): ChecklistItem[] {
  return seeds.map(([th, en, done], index) => ({
    id: `${taskId}-c${index + 1}`,
    label: { th, en },
    done,
    order: index,
  }))
}

/* -------------------------------------------------------------------------
   งานย่อยของงานเลี้ยงประจำปี (กิจกรรมหลัก)
   วันอ้างอิง "วันนี้" คือ 2026-07-31 และวันจัดงานคือ 2026-09-18
   ------------------------------------------------------------------------- */

const SEEDS: TaskSeed[] = [
  {
    id: "t-1",
    eventId: "e-1",
    title: ["จองสถานที่จัดงานและยืนยันสัญญา", "Book the venue and sign the contract"],
    description: [
      "เปรียบเทียบข้อเสนอจากโรงแรม 3 แห่ง เจรจาราคา และเซ็นสัญญาพร้อมวางมัดจำ",
      "Compare proposals from three hotels, negotiate the rate, then sign and pay the deposit.",
    ],
    assigneeIds: ["u-7", "u-1"],
    dueDate: "2026-06-15",
    startDate: "2026-05-18",
    priority: "urgent",
    status: "completed",
  },
  {
    id: "t-2",
    eventId: "e-1",
    title: ["ขออนุมัติงบประมาณจัดงาน", "Get the event budget approved"],
    description: [
      "จัดทำเอกสารเสนองบประมาณ 1.8 ล้านบาท และนำเสนอต่อคณะผู้บริหาร",
      "Prepare the 1.8M THB budget proposal and present it to the executive committee.",
    ],
    assigneeIds: ["u-5"],
    dueDate: "2026-06-05",
    startDate: "2026-05-15",
    priority: "urgent",
    status: "completed",
  },
  {
    id: "t-3",
    eventId: "e-1",
    title: ["สรุปธีมงานและคอนเซปต์", "Finalise the theme and concept"],
    description: [
      "เลือกธีม Golden Night พร้อมกำหนดโทนสี ชุดแต่งกาย และแนวทางการตกแต่ง",
      "Lock in the Golden Night theme with its colour palette, dress code and decoration direction.",
    ],
    assigneeIds: ["u-1", "u-2"],
    dueDate: "2026-06-20",
    priority: "high",
    status: "completed",
  },
  {
    id: "t-4",
    eventId: "e-1",
    title: ["ออกแบบโปสเตอร์ประชาสัมพันธ์", "Design the announcement poster"],
    description: [
      "ออกแบบโปสเตอร์สำหรับติดบอร์ดภายในและส่งทางอีเมล ให้สอดคล้องกับธีม Golden Night",
      "Design the poster for internal boards and email, matching the Golden Night theme.",
    ],
    assigneeIds: ["u-2"],
    dueDate: "2026-08-08",
    startDate: "2026-07-14",
    priority: "high",
    status: "in_progress",
    dependsOn: ["t-3"],
    checklist: [
      ["ร่างแบบ 3 ทางเลือก", "Draft three concept options", true],
      ["เลือกแบบกับทีมสื่อสารองค์กร", "Pick the direction with Corporate Comms", true],
      ["ปรับแก้ตามความเห็นผู้บริหาร", "Revise based on executive feedback", false],
      ["จัดทำไฟล์ความละเอียดสูง", "Export the high-resolution files", false],
    ],
  },
  {
    id: "t-5",
    eventId: "e-1",
    title: ["ส่งไฟล์อาร์ตเวิร์กให้โรงพิมพ์", "Send artwork to the printer"],
    description: [
      "ส่งไฟล์โปสเตอร์และแบ็คดรอปให้โรงพิมพ์ พร้อมยืนยันขนาดและจำนวนที่สั่งพิมพ์",
      "Send the poster and backdrop files to the printer, confirming sizes and quantities.",
    ],
    assigneeIds: ["u-2"],
    dueDate: "2026-07-31",
    priority: "urgent",
    status: "in_progress",
    dependsOn: ["t-4"],
    notes: [
      "โรงพิมพ์ต้องการไฟล์ก่อน 17:00 เพื่อให้ทันคิวพิมพ์สัปดาห์นี้",
      "The printer needs the files before 5pm to make this week's print run.",
    ],
  },
  {
    id: "t-6",
    eventId: "e-1",
    title: ["สรุปเมนูอาหารกับโรงแรม", "Confirm the dinner menu with the hotel"],
    description: [
      "เลือกเมนูโต๊ะจีน 10 ที่ พร้อมระบุจำนวนมื้อมังสวิรัติและอาหารฮาลาล",
      "Choose the 10-seat Chinese set menu and specify vegetarian and halal counts.",
    ],
    assigneeIds: ["u-7"],
    dueDate: "2026-08-01",
    priority: "high",
    status: "in_progress",
    dependsOn: ["t-1"],
  },
  {
    id: "t-7",
    eventId: "e-1",
    title: ["ส่งหนังสือเชิญผู้บริหาร", "Send invitations to the executives"],
    description: [
      "จัดทำและส่งหนังสือเชิญอย่างเป็นทางการถึงผู้บริหารระดับสูงและกรรมการบริษัท",
      "Prepare and send formal invitations to senior executives and board members.",
    ],
    assigneeIds: ["u-3"],
    dueDate: "2026-07-28",
    priority: "urgent",
    status: "in_progress",
  },
  {
    id: "t-8",
    eventId: "e-1",
    title: ["สรุปยอดจองโต๊ะรอบแรก", "Close the first table booking round"],
    description: [
      "รวบรวมยอดจองโต๊ะจากแต่ละแผนกรอบแรก เพื่อประเมินการจัดผังที่นั่ง",
      "Collect first-round table bookings from each department to plan the seating chart.",
    ],
    assigneeIds: ["u-3"],
    dueDate: "2026-07-24",
    priority: "high",
    status: "not_started",
  },
  {
    id: "t-9",
    eventId: "e-1",
    title: ["ยืนยันวงดนตรีและค่าตัว", "Confirm the band and their fee"],
    description: [
      "เจรจาค่าตัววงดนตรี ตกลงรายการเพลง และทำสัญญาจ้าง",
      "Negotiate the band fee, agree the setlist and complete the engagement contract.",
    ],
    assigneeIds: ["u-6", "u-5"],
    dueDate: "2026-07-30",
    priority: "normal",
    status: "in_progress",
  },
  {
    id: "t-10",
    eventId: "e-1",
    title: ["จัดทำ PowerPoint เปิดงาน", "Build the opening presentation"],
    description: [
      "จัดทำสไลด์เปิดงาน สรุปผลงานปีนี้ และสไลด์ประกาศรางวัลพนักงานดีเด่น",
      "Build the opening deck: this year's highlights and the outstanding employee awards.",
    ],
    assigneeIds: ["u-2", "u-1"],
    dueDate: "2026-09-05",
    startDate: "2026-08-10",
    priority: "high",
    status: "in_progress",
    dependsOn: ["t-3"],
    checklist: [
      ["รวบรวมภาพกิจกรรมตลอดปี", "Gather photos from the year", true],
      ["สรุปตัวเลขผลประกอบการ", "Summarise the business results", true],
      ["ออกแบบเทมเพลตสไลด์", "Design the slide template", true],
      ["ใส่รายชื่อผู้ได้รับรางวัล", "Add the award recipients", false],
      ["ตรวจทานกับฝ่ายสื่อสารองค์กร", "Review with Corporate Comms", false],
    ],
  },
  {
    id: "t-11",
    eventId: "e-1",
    title: ["เขียน Script พิธีกร", "Write the MC script"],
    description: [
      "เขียนบทพิธีกรทั้งภาษาไทยและอังกฤษ ครอบคลุมทุกช่วงของงาน",
      "Write the bilingual MC script covering every segment of the evening.",
    ],
    assigneeIds: ["u-6"],
    dueDate: "2026-09-08",
    startDate: "2026-08-17",
    priority: "high",
    status: "not_started",
    dependsOn: ["t-3"],
  },
  {
    id: "t-12",
    eventId: "e-1",
    title: ["จัดหาของรางวัลจับฉลาก", "Source the lucky draw prizes"],
    description: [
      "จัดหาของรางวัล 60 ชิ้น รวมรางวัลใหญ่ 3 รางวัล ภายในงบที่ได้รับอนุมัติ",
      "Source 60 prizes including three grand prizes, within the approved budget.",
    ],
    assigneeIds: ["u-5", "u-3"],
    dueDate: "2026-08-28",
    startDate: "2026-07-20",
    priority: "normal",
    status: "in_progress",
    dependsOn: ["t-2"],
  },
  {
    id: "t-13",
    eventId: "e-1",
    title: ["สรุปรายชื่อผู้เข้าร่วมทั้งหมด", "Finalise the full guest list"],
    description: [
      "รวบรวมรายชื่อผู้เข้าร่วมจากทุกแผนก พร้อมสถานะตอบรับและข้อจำกัดด้านอาหาร",
      "Consolidate attendees from every department with RSVP status and dietary needs.",
    ],
    assigneeIds: ["u-3"],
    dueDate: "2026-08-22",
    startDate: "2026-07-27",
    priority: "high",
    status: "in_progress",
  },
  {
    id: "t-14",
    eventId: "e-1",
    title: ["จัดทำป้ายชื่อผู้เข้าร่วม", "Produce the guest name badges"],
    description: [
      "ออกแบบและสั่งพิมพ์ป้ายชื่อพร้อมระบุโต๊ะที่นั่งของผู้เข้าร่วมแต่ละคน",
      "Design and print name badges showing each guest's assigned table.",
    ],
    assigneeIds: ["u-2"],
    dueDate: "2026-09-04",
    priority: "normal",
    status: "blocked",
    dependsOn: ["t-13"],
    notes: [
      "รอรายชื่อผู้เข้าร่วมฉบับสมบูรณ์ก่อนจึงจะเริ่มจัดอาร์ตเวิร์กได้",
      "Waiting on the final guest list before artwork can start.",
    ],
  },
  {
    id: "t-15",
    eventId: "e-1",
    title: ["ตรวจสอบระบบเสียงและแสง", "Test the sound and lighting rig"],
    description: [
      "ทดสอบไมโครโฟน ระบบเสียง จอ LED และไฟเวทีร่วมกับทีมเทคนิคของโรงแรม",
      "Test microphones, PA, LED wall and stage lighting with the hotel's technical team.",
    ],
    assigneeIds: ["u-4"],
    dueDate: "2026-09-16",
    startDate: "2026-09-14",
    priority: "high",
    status: "not_started",
    dependsOn: ["t-1"],
  },
  {
    id: "t-16",
    eventId: "e-1",
    title: ["ออกแบบและติดตั้งฉากเวที", "Design and install the stage set"],
    description: [
      "ออกแบบฉากเวทีตามธีม Golden Night และประสานงานติดตั้งในวันก่อนงาน",
      "Design the Golden Night stage set and coordinate installation the day before.",
    ],
    assigneeIds: ["u-2", "u-7"],
    dueDate: "2026-09-15",
    startDate: "2026-08-03",
    priority: "normal",
    status: "in_progress",
    dependsOn: ["t-3"],
  },
  {
    id: "t-17",
    eventId: "e-1",
    title: ["จัดทำลำดับพิธีการ (Run Down)", "Draft the event run-down"],
    description: [
      "จัดทำลำดับพิธีการนาทีต่อนาที ตั้งแต่ลงทะเบียนจนถึงปิดงาน",
      "Build the minute-by-minute run-down from registration through to close.",
    ],
    assigneeIds: ["u-1", "u-6"],
    dueDate: "2026-08-30",
    startDate: "2026-08-10",
    priority: "high",
    status: "awaiting_review",
  },
  {
    id: "t-18",
    eventId: "e-1",
    title: ["ประสานงานรถรับส่งพนักงาน", "Arrange staff shuttle buses"],
    description: [
      "จัดรถรับส่งจากสำนักงานใหญ่ไปสถานที่จัดงาน และรอบส่งกลับหลังจบงาน",
      "Arrange shuttles from head office to the venue and return trips after the party.",
    ],
    assigneeIds: ["u-7"],
    dueDate: "2026-09-10",
    priority: "low",
    status: "not_started",
  },
  {
    id: "t-19",
    eventId: "e-1",
    title: ["จองที่พักผู้บริหารต่างจังหวัด", "Book rooms for upcountry executives"],
    description: [
      "จองห้องพัก 12 ห้องสำหรับผู้บริหารจากสาขาต่างจังหวัดที่เดินทางมาร่วมงาน",
      "Book 12 rooms for executives travelling in from regional branches.",
    ],
    assigneeIds: ["u-7"],
    dueDate: "2026-07-10",
    priority: "normal",
    status: "completed",
  },
  {
    id: "t-20",
    eventId: "e-1",
    title: ["เตรียมของที่ระลึกสำหรับผู้เข้าร่วม", "Prepare guest souvenirs"],
    description: [
      "สั่งทำของที่ระลึก 250 ชิ้น พร้อมโลโก้บริษัทและปีที่จัดงาน",
      "Order 250 souvenirs branded with the company logo and event year.",
    ],
    assigneeIds: ["u-3", "u-5"],
    dueDate: "2026-09-01",
    startDate: "2026-08-04",
    priority: "normal",
    status: "not_started",
    dependsOn: ["t-2"],
  },
  {
    id: "t-21",
    eventId: "e-1",
    title: ["ซ้อมใหญ่ก่อนวันงาน", "Full dress rehearsal"],
    description: [
      "ซ้อมลำดับพิธีการทั้งหมดร่วมกับพิธีกร ทีมเทคนิค และผู้แสดงจากแต่ละแผนก",
      "Run the full programme with the MCs, technical crew and department performers.",
    ],
    assigneeIds: ["u-1", "u-6", "u-4"],
    dueDate: "2026-09-17",
    startDate: "2026-09-17",
    priority: "urgent",
    status: "not_started",
    dependsOn: ["t-11", "t-15"],
  },
  {
    id: "t-22",
    eventId: "e-1",
    title: ["จัดทำแบบประเมินความพึงพอใจ", "Create the satisfaction survey"],
    description: [
      "จัดทำแบบสอบถามออนไลน์พร้อม QR Code สำหรับแจกในงาน",
      "Build the online survey and QR code to hand out during the event.",
    ],
    assigneeIds: ["u-3"],
    dueDate: "2026-09-12",
    priority: "low",
    status: "awaiting_review",
  },
  {
    id: "t-23",
    eventId: "e-1",
    title: ["ประสานงานทีมถ่ายภาพและวิดีโอ", "Brief the photo and video team"],
    description: [
      "ว่าจ้างทีมถ่ายภาพ กำหนดช็อตสำคัญ และตกลงกำหนดส่งไฟล์หลังงาน",
      "Hire the crew, agree the shot list and set the post-event delivery date.",
    ],
    assigneeIds: ["u-2"],
    dueDate: "2026-09-08",
    priority: "normal",
    status: "not_started",
  },
  {
    id: "t-24",
    eventId: "e-1",
    title: ["สรุปค่าใช้จ่ายหลังจบงาน", "Reconcile the post-event costs"],
    description: [
      "รวบรวมใบเสร็จทั้งหมด เทียบกับงบประมาณที่อนุมัติ และจัดทำรายงานส่งฝ่ายการเงิน",
      "Collect every receipt, compare against the approved budget and report to Finance.",
    ],
    assigneeIds: ["u-5"],
    dueDate: "2026-09-30",
    startDate: "2026-09-19",
    priority: "normal",
    status: "not_started",
    dependsOn: ["t-21"],
  },
  {
    id: "t-25",
    eventId: "e-1",
    title: ["จัดทำรายงานสรุปผลการจัดงาน", "Write the event wrap-up report"],
    description: [
      "สรุปผลการจัดงาน จำนวนผู้เข้าร่วม คะแนนความพึงพอใจ และข้อเสนอแนะสำหรับปีหน้า",
      "Summarise turnout, satisfaction scores and recommendations for next year.",
    ],
    assigneeIds: ["u-1"],
    dueDate: "2026-10-05",
    startDate: "2026-09-25",
    priority: "low",
    status: "not_started",
    dependsOn: ["t-24"],
  },
  {
    id: "t-26",
    eventId: "e-1",
    title: ["กำหนดวันและเวลาจัดงาน", "Lock the event date and time"],
    description: [
      "ตรวจสอบปฏิทินองค์กรและวันหยุด เพื่อเลือกวันที่มีผู้เข้าร่วมได้มากที่สุด",
      "Check the company calendar and holidays to pick the highest-turnout date.",
    ],
    assigneeIds: ["u-1"],
    dueDate: "2026-05-22",
    priority: "urgent",
    status: "completed",
  },
  {
    id: "t-27",
    eventId: "e-1",
    title: ["สำรวจความสนใจเข้าร่วมเบื้องต้น", "Run the initial interest survey"],
    description: [
      "ส่งแบบสำรวจความสนใจให้พนักงานทุกคน เพื่อประเมินจำนวนผู้เข้าร่วมคร่าว ๆ",
      "Send an interest survey to all staff to estimate the headcount.",
    ],
    assigneeIds: ["u-3"],
    dueDate: "2026-06-12",
    priority: "normal",
    status: "completed",
  },
  {
    id: "t-28",
    eventId: "e-1",
    title: ["คัดเลือกผู้ให้บริการจัดเลี้ยง", "Select the catering partner"],
    description: [
      "เปรียบเทียบผู้ให้บริการ 4 ราย ทดลองชิมอาหาร และคัดเลือกผู้ชนะ",
      "Compare four caterers, run a tasting and select the winner.",
    ],
    assigneeIds: ["u-7", "u-5"],
    dueDate: "2026-07-04",
    priority: "high",
    status: "completed",
  },
  {
    id: "t-29",
    eventId: "e-1",
    title: ["จัดทำแผนงบประมาณรายละเอียด", "Break down the detailed budget"],
    description: [
      "แตกงบประมาณรายหมวด ทั้งสถานที่ อาหาร การแสดง ของรางวัล และงานพิมพ์",
      "Break the budget down by venue, catering, entertainment, prizes and print.",
    ],
    assigneeIds: ["u-5"],
    dueDate: "2026-06-28",
    priority: "high",
    status: "completed",
  },

  /* ---- ปฐมนิเทศพนักงานใหม่ (e-2) ---- */
  {
    id: "t-30",
    eventId: "e-2",
    title: ["จัดทำกำหนดการอบรม", "Draft the orientation agenda"],
    description: [
      "วางกำหนดการตลอดวัน พร้อมระบุวิทยากรและหัวข้อของแต่ละช่วง",
      "Lay out the full-day agenda with speakers and topics for each session.",
    ],
    assigneeIds: ["u-3"],
    dueDate: "2026-07-18",
    priority: "high",
    status: "completed",
  },
  {
    id: "t-31",
    eventId: "e-2",
    title: ["เตรียมชุดเอกสารต้อนรับ", "Assemble the welcome pack"],
    description: [
      "จัดเตรียมคู่มือพนักงาน ของที่ระลึก และบัตรพนักงานสำหรับผู้เข้าใหม่ 32 คน",
      "Prepare handbooks, souvenirs and staff cards for 32 new joiners.",
    ],
    assigneeIds: ["u-3", "u-5"],
    dueDate: "2026-08-05",
    priority: "normal",
    status: "in_progress",
  },
  {
    id: "t-32",
    eventId: "e-2",
    title: ["เตรียมบัญชีผู้ใช้และอุปกรณ์", "Set up accounts and equipment"],
    description: [
      "สร้างบัญชีอีเมล สิทธิ์เข้าระบบ และเตรียมโน้ตบุ๊กให้พนักงานใหม่ทุกคน",
      "Create email accounts, access rights and laptops for every new joiner.",
    ],
    assigneeIds: ["u-4"],
    dueDate: "2026-07-29",
    priority: "urgent",
    status: "in_progress",
  },
  {
    id: "t-33",
    eventId: "e-2",
    title: ["ยืนยันวิทยากรจากแต่ละฝ่าย", "Confirm speakers from each department"],
    description: [
      "ติดต่อและยืนยันวิทยากรจากฝ่ายบุคคล การเงิน ไอที และฝ่ายปฏิบัติการ",
      "Confirm speakers from HR, Finance, IT and Operations.",
    ],
    assigneeIds: ["u-3"],
    dueDate: "2026-07-25",
    priority: "high",
    status: "completed",
  },
  {
    id: "t-34",
    eventId: "e-2",
    title: ["จองห้องประชุมและอาหารว่าง", "Book the room and refreshments"],
    description: [
      "จองห้องประชุมใหญ่ชั้น 12 และสั่งอาหารว่างสองมื้อพร้อมอาหารกลางวัน",
      "Book the 12th-floor conference room and order two breaks plus lunch.",
    ],
    assigneeIds: ["u-7"],
    dueDate: "2026-08-04",
    priority: "normal",
    status: "not_started",
  },

  /* ---- อบรมความปลอดภัยข้อมูล (e-3) — เตรียมพร้อมครบแล้ว ---- */
  {
    id: "t-35",
    eventId: "e-3",
    title: ["ปรับปรุงเนื้อหาหลักสูตร", "Update the course material"],
    description: [
      "ปรับเนื้อหาให้ครอบคลุมภัยคุกคามรูปแบบใหม่และนโยบายความปลอดภัยฉบับล่าสุด",
      "Refresh the content for new threat patterns and the latest security policy.",
    ],
    assigneeIds: ["u-4"],
    dueDate: "2026-07-10",
    priority: "high",
    status: "completed",
  },
  {
    id: "t-36",
    eventId: "e-3",
    title: ["จัดทำแบบทดสอบท้ายหลักสูตร", "Build the end-of-course assessment"],
    description: [
      "จัดทำข้อสอบ 20 ข้อพร้อมเกณฑ์ผ่านที่ 80 เปอร์เซ็นต์",
      "Create a 20-question assessment with an 80 percent pass mark.",
    ],
    assigneeIds: ["u-4"],
    dueDate: "2026-07-17",
    priority: "normal",
    status: "completed",
  },
  {
    id: "t-37",
    eventId: "e-3",
    title: ["ตั้งค่าระบบอบรมออนไลน์", "Configure the online training platform"],
    description: [
      "ตั้งค่าห้องเรียนออนไลน์ ทดสอบการเชื่อมต่อ และเตรียมลิงก์สำหรับผู้เข้าอบรม",
      "Configure the virtual classroom, test connectivity and prepare attendee links.",
    ],
    assigneeIds: ["u-4"],
    dueDate: "2026-07-24",
    priority: "high",
    status: "completed",
  },
  {
    id: "t-38",
    eventId: "e-3",
    title: ["ส่งอีเมลแจ้งกำหนดการอบรม", "Announce the schedule by email"],
    description: [
      "ส่งอีเมลแจ้งพนักงานทุกคนพร้อมลิงก์ลงทะเบียนและกำหนดวันสุดท้าย",
      "Email all staff with the registration link and the final deadline.",
    ],
    assigneeIds: ["u-3", "u-4"],
    dueDate: "2026-07-22",
    priority: "normal",
    status: "completed",
  },

  /* ---- ประชุมสรุปผลครึ่งปี (e-5) — จบไปแล้ว ---- */
  {
    id: "t-39",
    eventId: "e-5",
    title: ["จัดทำสไลด์สรุปผลประกอบการ", "Prepare the results deck"],
    description: [
      "รวบรวมตัวเลขผลประกอบการครึ่งปีแรกจากทุกหน่วยธุรกิจ",
      "Consolidate first-half results from every business unit.",
    ],
    assigneeIds: ["u-5", "u-1"],
    dueDate: "2026-06-20",
    priority: "urgent",
    status: "completed",
  },
  {
    id: "t-40",
    eventId: "e-5",
    title: ["เตรียมระบบถ่ายทอดสดสาขา", "Set up the branch live stream"],
    description: [
      "ตั้งค่าระบบถ่ายทอดสดไปยังสาขาต่างจังหวัด 6 แห่ง",
      "Configure the live stream to six regional branches.",
    ],
    assigneeIds: ["u-4"],
    dueDate: "2026-06-24",
    priority: "high",
    status: "completed",
  },
  {
    id: "t-41",
    eventId: "e-5",
    title: ["รวบรวมคำถามล่วงหน้าจากพนักงาน", "Collect questions in advance"],
    description: [
      "เปิดช่องทางให้พนักงานส่งคำถามล่วงหน้าและคัดเลือกคำถามสำหรับช่วงถาม–ตอบ",
      "Open a channel for advance questions and curate them for the Q&A.",
    ],
    assigneeIds: ["u-3"],
    dueDate: "2026-06-23",
    priority: "normal",
    status: "completed",
  },

  /* ---- งานเปิดตัวผลิตภัณฑ์ (e-6) — ยกเลิกไปแล้ว ---- */
  {
    id: "t-42",
    eventId: "e-6",
    title: ["ร่างแนวคิดงานเปิดตัว", "Draft the launch concept"],
    description: [
      "ร่างแนวคิดงานเปิดตัวและประมาณการงบประมาณเบื้องต้น",
      "Draft the launch concept and a first budget estimate.",
    ],
    assigneeIds: ["u-2"],
    dueDate: "2026-07-03",
    priority: "normal",
    status: "not_started",
  },
  {
    id: "t-43",
    eventId: "e-6",
    title: ["ติดต่อสถานที่จัดงาน", "Contact the venue"],
    description: [
      "สอบถามคิวว่างและราคาของทรู ไอคอน ฮอลล์",
      "Check availability and pricing at True Icon Hall.",
    ],
    assigneeIds: ["u-7"],
    dueDate: "2026-07-08",
    priority: "normal",
    status: "not_started",
  },
]

/** ช่วงเวลาที่ทีมงานเริ่มวางแผน — วันที่สร้างงานต้องอยู่ในช่วงนี้เสมอ */
const PLANNING_START = "2026-05-20"
const PLANNING_END = "2026-07-29"

/**
 * วันที่สร้างงานต้องเป็นอดีตเสมอ
 *
 * งานที่ครบกำหนดในอนาคตไกลจะได้วันสร้างที่ย้อนหลังเกินช่วงวางแผน
 * จึงกระจายวันที่ให้อยู่ภายในช่วงวางแผนแทน (ไม่ใช้การสุ่มเพื่อให้ข้อมูลคงที่)
 */
function planningDate(dueDate: string, index: number): string {
  const candidate = daysBefore(dueDate, 30)
  if (candidate <= PLANNING_END) return candidate

  const spread = fromDateKey(PLANNING_START)
  spread.setDate(spread.getDate() + ((index * 5) % 68))
  return toDateKey(spread)
}

function buildTask(seed: TaskSeed, index: number): Task {
  const createdAt =
    seed.createdAt ?? `${planningDate(seed.dueDate, index)}T09:00:00+07:00`
  return {
    id: seed.id,
    eventId: seed.eventId,
    title: text(seed.title),
    description: text(seed.description),
    assigneeIds: seed.assigneeIds,
    startDate: seed.startDate ?? daysBefore(seed.dueDate, 7),
    dueDate: seed.dueDate,
    priority: seed.priority,
    status: seed.status,
    notes: seed.notes ? text(seed.notes) : EMPTY,
    checklist: seed.checklist ? buildChecklist(seed.id, seed.checklist) : [],
    attachmentIds: [],
    dependsOn: seed.dependsOn ?? [],
    blocks: [],
    blockOverridden: false,
    createdAt,
    createdBy: seed.createdBy ?? seed.assigneeIds[0],
    updatedAt: seed.updatedAt ?? createdAt,
    updatedBy: seed.assigneeIds[0],
  }
}

/**
 * `blocks` เป็นข้อมูลย้อนกลับของ `dependsOn`
 * คำนวณครั้งเดียวตอนสร้าง Mock Data เพื่อไม่ให้ข้อมูลสองฝั่งขัดกันเอง
 */
function withBlockRelations(tasks: Task[]): Task[] {
  const blocksByTaskId = new Map<string, string[]>()
  for (const task of tasks) {
    for (const dependencyId of task.dependsOn) {
      const existing = blocksByTaskId.get(dependencyId) ?? []
      existing.push(task.id)
      blocksByTaskId.set(dependencyId, existing)
    }
  }
  return tasks.map((task) => ({
    ...task,
    blocks: blocksByTaskId.get(task.id) ?? [],
  }))
}

export const MOCK_TASKS: Task[] = withBlockRelations(
  SEEDS.map((seed, index) => buildTask(seed, index))
)
