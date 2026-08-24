import type { AuthSession } from "@/types"

/**
 * เก็บเฉพาะ session ของผู้ที่ติ๊ก "จดจำฉันไว้" ใน `localStorage`
 * เพื่อให้กลับมาใช้งานได้หลังปิดแล้วเปิดเบราว์เซอร์ใหม่
 *
 * ข้อมูลนี้มีเพียง userId, เวลาเข้าสู่ระบบ และตัวเลือก rememberMe — ไม่มีอีเมล
 * หรือรหัสผ่าน ทุกฟังก์ชันกลืน error เพราะเบราว์เซอร์อาจปิด storage ไว้ ซึ่งไม่
 * ควรทำให้แอปพัง
 */
const SESSION_KEY = "eventflow.session"

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== "object" || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.userId === "string" &&
    typeof candidate.signedInAt === "string" &&
    candidate.rememberMe === true
  )
}

export function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isAuthSession(parsed)) return parsed
      window.localStorage.removeItem(SESSION_KEY)
    }
  } catch {
    // localStorage ใช้งานไม่ได้ — ลองกู้ค่ารูปแบบเดิมจาก sessionStorage ต่อ
    try {
      window.localStorage.removeItem(SESSION_KEY)
    } catch {
      /* localStorage ถูกปิดใช้งาน */
    }
  }

  // ย้าย session ที่สร้างโดยเวอร์ชันเดิมจาก sessionStorage ไป localStorage
  try {
    const legacyRaw = window.sessionStorage.getItem(SESSION_KEY)
    if (!legacyRaw) return null

    const parsed: unknown = JSON.parse(legacyRaw)
    if (!isAuthSession(parsed)) {
      window.sessionStorage.removeItem(SESSION_KEY)
      return null
    }

    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(parsed))
      window.sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // ยังคืน session ให้แอปใช้ได้ แม้ย้ายไป localStorage ไม่สำเร็จ
    }
    return parsed
  } catch {
    try {
      window.sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* sessionStorage ถูกปิดใช้งาน */
    }
    return null
  }
}

/** เขียนเฉพาะ session ที่ติ๊ก "จดจำฉันไว้" — นอกนั้นถือเป็นการล้างค่า */
export function writeStoredSession(session: AuthSession | null): void {
  if (typeof window === "undefined") return

  try {
    if (session?.rememberMe) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(SESSION_KEY)
    }
  } catch {
    /* storage ถูกปิดใช้งาน — ปล่อยให้ session อยู่ใน memory ตามเดิม */
  }

  // ล้างคีย์รูปแบบเดิมเสมอ เพื่อไม่ให้ session ที่หมดอายุฟื้นกลับมาอีก
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* sessionStorage ถูกปิดใช้งาน */
  }
}
