/**
 * ชนิดข้อมูลและ helper ที่ฝั่งหน้าเว็บใช้ร่วมกับห้องเล่นสด (`party/quiz.ts`)
 *
 * PoC: ยังทำแค่ lobby — เข้าห้องด้วย PIN แล้วเห็นรายชื่อผู้เล่น real-time
 */

export type QuizPlayer = {
  id: string
  name: string
  connected: boolean
  joinedAt: number
}

/** รอบที่โฮสต์กำลังเปิดให้ตอบ — ผู้เล่นเห็นแค่ช้อยส์ ไม่เห็นเฉลย */
export type QuizRoomRound = {
  index: number
  choices: string[]
  open: boolean
}

export type QuizRoomServerMessage =
  | {
      type: "state"
      players: QuizPlayer[]
      hostOnline: boolean
      round: QuizRoomRound | null
      answeredPlayerIds: string[]
      myAnswer: number | null
    }
  | { type: "rejected"; reason: "full" | "duplicate-name" | "bad-name" }
  | { type: "kicked" }

/** โฮสต์ของ PartyKit — ตอน dev คือเซิร์ฟเวอร์ที่รันด้วย `npm run party` */
export const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "127.0.0.1:1999"

const PIN_LENGTH = 6
const PIN_ALPHABET = "0123456789"

/** PIN ของห้อง — ตัวเลขล้วนเพื่อให้พิมพ์บนมือถือได้เร็ว */
export function generateRoomPin() {
  const bytes = new Uint32Array(PIN_LENGTH)
  crypto.getRandomValues(bytes)
  return [...bytes]
    .map((value) => PIN_ALPHABET[value % PIN_ALPHABET.length])
    .join("")
}

export function normalizePin(raw: string) {
  return raw.replace(/\D/g, "").slice(0, PIN_LENGTH)
}

export function isValidPin(raw: string) {
  return normalizePin(raw).length === PIN_LENGTH
}

/** id ประจำเครื่องของผู้เล่น — ใช้ join กลับห้องเดิมเมื่อเน็ตหลุดหรือรีเฟรช */
export function getOrCreatePlayerId() {
  const KEY = "eventflow.quiz.playerId"
  try {
    const existing = window.localStorage.getItem(KEY)
    if (existing) return existing
    const created = crypto.randomUUID()
    window.localStorage.setItem(KEY, created)
    return created
  } catch {
    // localStorage ถูกปิด — ใช้ id ชั่วคราวต่อ 1 แท็บแทน
    return crypto.randomUUID()
  }
}

export function parseServerMessage(raw: string): QuizRoomServerMessage | null {
  try {
    return JSON.parse(raw) as QuizRoomServerMessage
  } catch {
    return null
  }
}

/** ลิงก์ที่ผู้เล่นเปิดบนมือถือเพื่อเข้าห้อง */
export function joinUrl(origin: string, pin: string) {
  return `${origin}/play?pin=${pin}`
}

/**
 * PIN ของห้องที่โฮสต์เปิดอยู่ — เก็บใน sessionStorage ของแท็บโฮสต์
 * รีเฟรชจอโปรเจกเตอร์แล้วผู้เล่นที่อยู่ในห้องไม่หลุด
 */
const HOST_PIN_KEY = "eventflow.quiz.hostPin"

export function readHostPin() {
  try {
    const stored = window.sessionStorage.getItem(HOST_PIN_KEY)
    return stored && isValidPin(stored) ? stored : null
  } catch {
    return null
  }
}

export function writeHostPin(pin: string) {
  try {
    window.sessionStorage.setItem(HOST_PIN_KEY, pin)
  } catch {
    /* sessionStorage ถูกปิด — ห้องยังใช้ได้จนกว่าจะรีเฟรช */
  }
}
