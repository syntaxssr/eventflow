import type { MockCredential, User } from "@/types/user"

/**
 * รหัสผ่านเดียวกันทุกบัญชีเพื่อให้ทดลองใช้งานได้ง่าย
 * แสดงไว้บนหน้า Login อยู่แล้ว ไม่ใช่ความลับ
 */
export const MOCK_PASSWORD = "eventflow"

/** ทีมจัดงานเลี้ยงประจำปีของบริษัท */
export const MOCK_USERS: User[] = [
  {
    id: "u-1",
    firstName: { th: "ปวีณา", en: "Paweena" },
    lastName: { th: "ศรีสุวรรณ", en: "Srisuwan" },
    initials: { th: "ปศ", en: "PS" },
    avatarUrl: "",
    avatarColor: "#f99b35",
    role: "event_manager",
    position: { th: "ผู้จัดการกิจกรรม", en: "Event Manager" },
    team: { th: "ฝ่ายสื่อสารองค์กร", en: "Corporate Communications" },
    email: "paweena.s@company.co.th",
    phone: "02-555-0101",
  },
  {
    id: "u-2",
    firstName: { th: "ธนกฤต", en: "Thanakrit" },
    lastName: { th: "วงศ์อนันต์", en: "Wonganan" },
    initials: { th: "ธว", en: "TW" },
    avatarUrl: "",
    avatarColor: "#7c3aed",
    role: "creative_designer",
    position: { th: "นักออกแบบครีเอทีฟ", en: "Creative Designer" },
    team: { th: "ฝ่ายออกแบบ", en: "Design" },
    email: "thanakrit.w@company.co.th",
    phone: "02-555-0102",
  },
  {
    id: "u-3",
    firstName: { th: "สิริพร", en: "Siriporn" },
    lastName: { th: "ใจดี", en: "Jaidee" },
    initials: { th: "สจ", en: "SJ" },
    avatarUrl: "",
    avatarColor: "#0d9488",
    role: "hr_coordinator",
    position: { th: "เจ้าหน้าที่ประสานงานบุคคล", en: "HR Coordinator" },
    team: { th: "ฝ่ายทรัพยากรบุคคล", en: "Human Resources" },
    email: "siriporn.j@company.co.th",
    phone: "02-555-0103",
  },
  {
    id: "u-4",
    firstName: { th: "อนุชา", en: "Anucha" },
    lastName: { th: "พงษ์ไพบูลย์", en: "Pongpaiboon" },
    initials: { th: "อพ", en: "AP" },
    avatarUrl: "",
    avatarColor: "#2563eb",
    role: "it_support",
    position: { th: "เจ้าหน้าที่สนับสนุนไอที", en: "IT Support" },
    team: { th: "ฝ่ายเทคโนโลยีสารสนเทศ", en: "Information Technology" },
    email: "anucha.p@company.co.th",
    phone: "02-555-0104",
  },
  {
    id: "u-5",
    firstName: { th: "กมลชนก", en: "Kamonchanok" },
    lastName: { th: "เรืองฤทธิ์", en: "Ruangrit" },
    initials: { th: "กร", en: "KR" },
    avatarUrl: "",
    avatarColor: "#c2410c",
    role: "finance_coordinator",
    position: { th: "เจ้าหน้าที่ประสานงานการเงิน", en: "Finance Coordinator" },
    team: { th: "ฝ่ายบัญชีและการเงิน", en: "Finance & Accounting" },
    email: "kamonchanok.r@company.co.th",
    phone: "02-555-0105",
  },
  {
    id: "u-6",
    firstName: { th: "ณัฐวุฒิ", en: "Nattawut" },
    lastName: { th: "แสงทอง", en: "Sangthong" },
    initials: { th: "ณส", en: "NS" },
    avatarUrl: "",
    avatarColor: "#db2777",
    role: "mc_coordinator",
    position: { th: "ผู้ประสานงานพิธีกร", en: "MC Coordinator" },
    team: { th: "ฝ่ายสื่อสารองค์กร", en: "Corporate Communications" },
    email: "nattawut.s@company.co.th",
    phone: "02-555-0106",
  },
  {
    id: "u-7",
    firstName: { th: "พิมพ์ชนก", en: "Pimchanok" },
    lastName: { th: "อารีย์", en: "Aree" },
    initials: { th: "พอ", en: "PA" },
    avatarUrl: "",
    avatarColor: "#0891b2",
    role: "venue_coordinator",
    position: { th: "ผู้ประสานงานสถานที่", en: "Venue Coordinator" },
    team: { th: "ฝ่ายธุรการ", en: "General Affairs" },
    email: "pimchanok.a@company.co.th",
    phone: "02-555-0107",
  },
]

/** บัญชีที่ใช้เข้าสู่ระบบได้จริงใน Prototype */
export const MOCK_CREDENTIALS: MockCredential[] = MOCK_USERS.map((user) => ({
  email: user.email,
  password: MOCK_PASSWORD,
  userId: user.id,
}))

/** ผู้ใช้เริ่มต้นที่แนะนำบนหน้า Login */
export const DEFAULT_USER_ID = "u-1"

export function findUserById(id: string): User | undefined {
  return MOCK_USERS.find((user) => user.id === id)
}

/** ตรวจสอบอีเมล + รหัสผ่าน (ไม่สนตัวพิมพ์เล็ก–ใหญ่ของอีเมล) */
export function authenticate(
  email: string,
  password: string
): MockCredential | undefined {
  const normalized = email.trim().toLowerCase()
  return MOCK_CREDENTIALS.find(
    (credential) =>
      credential.email.toLowerCase() === normalized &&
      credential.password === password
  )
}
