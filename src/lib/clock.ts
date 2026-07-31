import { MOCK_NOW_ISO, toBangkokIso } from "@/constants/mock-date"

/**
 * นาฬิกาของ Session
 *
 * Prototype ตรึงเวลา "ตอนนี้" ไว้ที่ MOCK_NOW เพื่อให้ผลลัพธ์คงที่
 * แต่การกระทำที่ผู้ใช้ทำระหว่างใช้งานควรเรียงลำดับก่อน–หลังได้ถูกต้อง
 * จึงเดินหน้าทีละนาทีจากเวลาอ้างอิงนั้นทุกครั้งที่ถูกเรียก
 */
let elapsedMinutes = 0

export function nowIso(): string {
  elapsedMinutes += 1
  return toBangkokIso(
    new Date(new Date(MOCK_NOW_ISO).getTime() + elapsedMinutes * 60_000)
  )
}

/** ใช้ในเทสต์เพื่อให้เวลาเริ่มนับใหม่ */
export function resetSessionClock(): void {
  elapsedMinutes = 0
}
