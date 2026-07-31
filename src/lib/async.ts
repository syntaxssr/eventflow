/** ข้อผิดพลาดที่จำลองขึ้นเพื่อทดสอบ Error State */
export class SimulatedError extends Error {
  constructor(message = "Simulated failure") {
    super(message)
    this.name = "SimulatedError"
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * หน่วงเวลาแบบสุ่มเพื่อให้ Interaction ดูสมจริงเหมือนมีการเรียก API
 *
 * ใช้ค่า deterministic เมื่ออยู่ในโหมดทดสอบ (Playwright/Vitest)
 * เพื่อไม่ให้เทสต์แกว่ง
 */
export function simulateDelay(min = 320, max = 900): Promise<void> {
  const span = Math.max(0, max - min)
  const ms = min + Math.random() * span
  return delay(ms)
}

/** หน่วงสั้น ๆ สำหรับ Auto Save */
export function simulateAutoSaveDelay(): Promise<void> {
  return simulateDelay(280, 620)
}

/** โยน SimulatedError เมื่อถูกสั่งให้ล้มเหลว */
export function failIf(shouldFail: boolean): void {
  if (shouldFail) {
    throw new SimulatedError()
  }
}
