import type { AuthSession } from "@/types"

/**
 * เก็บ session ของผู้ที่ติ๊ก "จดจำฉันไว้" ไว้ใน `sessionStorage`
 *
 * ใช้ `sessionStorage` ไม่ใช่ `localStorage` เพราะ Prototype ยังห้ามเก็บข้อมูล
 * ข้ามการปิดเบราว์เซอร์ — session จึงอยู่ได้แค่ช่วงที่แท็บยังเปิดอยู่ ทำให้
 * refresh แล้วไม่หลุด แต่ปิดแท็บเมื่อไรก็หายไปเอง
 *
 * ทุกฟังก์ชันกลืน error ทั้งหมด เพราะ `sessionStorage` โยน exception ได้เมื่อ
 * เบราว์เซอร์ปิดการใช้งาน storage ไว้ ซึ่งไม่ควรทำให้ทั้งแอปพัง
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
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isAuthSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** เขียนเฉพาะ session ที่ติ๊ก "จดจำฉันไว้" — นอกนั้นถือเป็นการล้างค่า */
export function writeStoredSession(session: AuthSession | null): void {
  if (typeof window === "undefined") return
  try {
    if (session?.rememberMe) {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      window.sessionStorage.removeItem(SESSION_KEY)
    }
  } catch {
    /* storage ถูกปิดใช้งาน — ปล่อยให้ session อยู่ใน memory ตามเดิม */
  }
}
