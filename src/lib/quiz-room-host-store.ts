"use client"

import { generateRoomPin, readHostPin, writeHostPin } from "./quiz-room"

/**
 * PIN ของห้องที่แท็บนี้เป็นโฮสต์ — เก็บนอก React แล้วอ่านผ่าน `useSyncExternalStore`
 *
 * ทำแบบนี้เพราะ PIN ต้องสร้างฝั่ง client เท่านั้น (crypto + sessionStorage)
 * ถ้าไปสร้างใน effect แล้ว setState จะได้ render รอบพิเศษทุกครั้งที่เปิดหน้า
 */

let pin: string | null = null
const listeners = new Set<() => void>()

export function subscribeHostPin(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

export function getHostPin() {
  if (!pin) {
    const stored = readHostPin()
    pin = stored ?? generateRoomPin()
    if (!stored) writeHostPin(pin)
  }
  return pin
}

/** ตอน SSR ยังไม่มี PIN — หน้าเว็บจะแสดงที่ว่างไว้ก่อนแล้วเติมตอน hydrate */
export function getHostPinOnServer() {
  return ""
}

export function regenerateHostPin() {
  pin = generateRoomPin()
  writeHostPin(pin)
  for (const listener of listeners) listener()
}
