/**
 * ตัวสร้าง id สำหรับข้อมูลที่ผู้ใช้สร้างขึ้นระหว่างใช้งาน Prototype
 *
 * ใช้ตัวนับแทนค่าสุ่ม เพื่อให้ id อ่านง่ายและปรากฏใน URL ได้สวยงาม
 * เริ่มที่เลขสูงกว่า Mock Data เดิมเพื่อไม่ให้ชนกัน
 */
const counters = new Map<string, number>()

const START_AT = 900

export function newId(prefix: string): string {
  const next = (counters.get(prefix) ?? START_AT) + 1
  counters.set(prefix, next)
  return `${prefix}-${next}`
}

/** ใช้ในเทสต์เพื่อให้ id เริ่มนับใหม่ทุกครั้ง */
export function resetIdCounters(): void {
  counters.clear()
}
