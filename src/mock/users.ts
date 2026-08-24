import type { MockCredential, User } from "@/types/user"

// สี fallback ใช้สีพื้นเดียวกับมาสคอตของแต่ละคน ระหว่างที่รูปกำลังโหลด

/**
 * รหัสผ่านเดียวกันทุกบัญชีเพื่อให้ทดลองใช้งานได้ง่าย
 * แสดงไว้บนหน้า Login อยู่แล้ว ไม่ใช่ความลับ
 */
export const MOCK_PASSWORD = "eventflow"

/** ตำแหน่งกลางที่ใช้ร่วมกันทุกคน — ทีมนี้ไม่ได้แบ่งหน้าที่รายบุคคล */
const STAFF_POSITION = {
  th: "เจ้าหน้าที่จัดงาน",
  en: "Event Staff",
} as const

const ADMIN_POSITION = {
  th: "ผู้ดูแลระบบ",
  en: "System Administrator",
} as const

const TEAM = {
  th: "ทีมจัดงาน",
  en: "Event Team",
} as const

/** ทีมจัดงานเลี้ยงประจำปีของบริษัท */
export const MOCK_USERS: User[] = [
  {
    id: "u-1",
    firstName: { th: "อลิสา", en: "Alisa" },
    lastName: { th: "ลีลายุวัฒนกุล", en: "Leelayuwattanakul" },
    nickname: { th: "นุ่น", en: "Nun" },
    initials: { th: "อล", en: "AL" },
    avatarUrl: "/avatars/ip-as-logo/u-01-fennec-fox.png",
    avatarColor: "#C96852",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "alisa.l@company.co.th",
    phone: "02-555-0101",
  },
  {
    id: "u-2",
    firstName: { th: "หฤทัย", en: "Haruthai" },
    lastName: { th: "ทิพยประไพ", en: "Tipprapai" },
    nickname: { th: "บัว", en: "Bua" },
    initials: { th: "หท", en: "HT" },
    avatarUrl: "/avatars/ip-as-logo/u-02-floppy-puppy.png",
    avatarColor: "#2457E6",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "haruthai.t@company.co.th",
    phone: "02-555-0102",
  },
  {
    id: "u-3",
    firstName: { th: "กิตติคุณ", en: "Kittikoon" },
    lastName: { th: "เจริญพานิช", en: "Charoenphanich" },
    nickname: { th: "กบ", en: "Kero" },
    initials: { th: "กจ", en: "KC" },
    avatarUrl: "/avatars/ip-as-logo/u-10-frog.png",
    avatarColor: "#6A5BA8",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "kittikoon.c@company.co.th",
    phone: "02-555-0103",
  },
  {
    id: "u-4",
    firstName: { th: "ธีรดา", en: "Teerada" },
    lastName: { th: "ศิริสัมพันธ์", en: "Sirisumphandh" },
    nickname: { th: "จ๊ะจ๋า", en: "Jaja" },
    initials: { th: "ธศ", en: "TS" },
    avatarUrl: "/avatars/ip-as-logo/u-04-polar-bear.png",
    avatarColor: "#1E2E68",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "teerada.s@company.co.th",
    phone: "02-555-0104",
  },
  {
    id: "u-5",
    firstName: { th: "ภัทรพร", en: "Pattaraporn" },
    lastName: { th: "เทพบุญ", en: "Tepboon" },
    nickname: { th: "หญิง", en: "Ying" },
    initials: { th: "ภท", en: "PT" },
    avatarUrl: "/avatars/ip-as-logo/u-05-whale.png",
    avatarColor: "#3D918B",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "pattaraporn.t@company.co.th",
    phone: "02-555-0105",
  },
  {
    id: "u-6",
    firstName: { th: "อัณชวิศศ์", en: "Aunchawis" },
    lastName: { th: "ปาร์มวงศ์", en: "Parmwong" },
    nickname: { th: "ไอซ์", en: "Ice" },
    initials: { th: "อป", en: "AP" },
    avatarUrl: "/avatars/ip-as-logo/u-06-lion.png",
    avatarColor: "#C49A34",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "aunchawis.p@company.co.th",
    phone: "02-555-0106",
  },
  {
    id: "u-7",
    firstName: { th: "พีรพล", en: "Peerapon" },
    lastName: { th: "จันทะแจ่ม", en: "Chanthachaem" },
    nickname: { th: "บาส", en: "Bas" },
    initials: { th: "พจ", en: "PC" },
    avatarUrl: "/avatars/ip-as-logo/u-07-snail.png",
    avatarColor: "#477BC2",
    role: "admin",
    position: ADMIN_POSITION,
    team: TEAM,
    email: "peerapon.c@company.co.th",
    phone: "02-555-0107",
  },
  {
    id: "u-8",
    firstName: { th: "ชณิตา", en: "Chanita" },
    lastName: { th: "ลีลาศุภกร", en: "Leelasupakorn" },
    nickname: { th: "แฟง", en: "Faeng" },
    initials: { th: "ชล", en: "CL" },
    avatarUrl: "/avatars/ip-as-logo/u-08-axolotl.png",
    avatarColor: "#6477C8",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "chanita.l@company.co.th",
    phone: "02-555-0108",
  },
  {
    id: "u-9",
    firstName: { th: "สิริชัย", en: "Sirichai" },
    lastName: { th: "ซ้ายโพธิ์กลาง", en: "Sayphoklang" },
    nickname: { th: "บอย", en: "Boy" },
    initials: { th: "สซ", en: "SS" },
    avatarUrl: "/avatars/ip-as-logo/u-09-seal.png",
    avatarColor: "#617B9B",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "sirichai.s@company.co.th",
    phone: "02-555-0109",
  },
  {
    id: "u-10",
    firstName: { th: "ตรีศิลป์ชัย", en: "Trisinchai" },
    lastName: { th: "คำจำนงค์", en: "Kamjamnong" },
    nickname: { th: "ดนตรี", en: "Dontri" },
    initials: { th: "ตค", en: "TK" },
    avatarUrl: "/avatars/ip-as-logo/u-03-elephant.png",
    avatarColor: "#B8AEF1",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "trisinchai.k@company.co.th",
    phone: "02-555-0110",
  },
  {
    id: "u-11",
    firstName: { th: "ชาญวิทย์", en: "Chanvit" },
    lastName: { th: "ไพโรจน์", en: "Pairoj" },
    nickname: { th: "เล็ก", en: "Lek" },
    initials: { th: "ชพ", en: "CP" },
    avatarUrl: "/avatars/ip-as-logo/u-11-penguin.png",
    avatarColor: "#7442DE",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "chanvit.p@company.co.th",
    phone: "02-555-0111",
  },
  {
    id: "u-12",
    firstName: { th: "ณิรินทร์ญา", en: "Nirynya" },
    lastName: { th: "ศิระนิธิกุลภรณ์", en: "Siranithikulporn" },
    nickname: { th: "จิ๊บ", en: "Jib" },
    initials: { th: "ณศ", en: "NS" },
    avatarUrl: "/avatars/ip-as-logo/u-12-manta-ray.png",
    avatarColor: "#F06A4F",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "nirynya.s@company.co.th",
    phone: "02-555-0112",
  },
  {
    id: "u-13",
    firstName: { th: "ยุพารัตน์", en: "Yuparat" },
    lastName: { th: "ปาณาราช", en: "Panarach" },
    nickname: { th: "ฝน", en: "Fon" },
    initials: { th: "ยป", en: "YP" },
    avatarUrl: "/avatars/ip-as-logo/u-13-rabbit.png",
    avatarColor: "#6E8878",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "yuparat.p@company.co.th",
    phone: "02-555-0113",
  },
  {
    id: "u-14",
    firstName: { th: "ภาพิชมนทน์", en: "Papitchamon" },
    lastName: { th: "แสนกัน", en: "Sankan" },
    nickname: { th: "เพียว", en: "Pure" },
    initials: { th: "ภส", en: "PS" },
    avatarUrl: "/avatars/ip-as-logo/u-14-cat.png",
    avatarColor: "#75507E",
    role: "staff",
    position: STAFF_POSITION,
    team: TEAM,
    email: "papitchamon.s@company.co.th",
    phone: "02-555-0114",
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
