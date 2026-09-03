"use client"

/**
 * จำสถานะเปิด/หุบของ Sidebar ข้ามการรีเฟรช — ผู้ใช้ขอเอง
 *
 * ปกติ prototype นี้จงใจไม่เก็บ UI state ข้าม refresh (ดูคอมเมนต์ใน
 * ThemeProvider และ SidebarProvider) แต่ผู้ใช้แจ้งว่ารำคาญที่ต้องหุบ sidebar
 * ใหม่ทุกครั้ง จึงเก็บเฉพาะค่านี้ค่าเดียวไว้ใน localStorage
 *
 * ใช้ useSyncExternalStore เพื่อกัน hydration mismatch — SSR เห็นค่า
 * เริ่มต้น (เปิด) เสมอ แล้วค่อยสลับตามที่จำไว้ทันทีหลัง hydrate
 */

const STORAGE_KEY = "eventflow.sidebar.open"

let cachedOpen: boolean | null = null
const listeners = new Set<() => void>()

function readStored(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "false"
  } catch {
    return true
  }
}

export function subscribeSidebarOpen(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

export function getSidebarOpen() {
  if (cachedOpen === null) cachedOpen = readStored()
  return cachedOpen
}

export function getSidebarOpenOnServer() {
  return true
}

export function setSidebarOpen(open: boolean) {
  cachedOpen = open
  try {
    window.localStorage.setItem(STORAGE_KEY, String(open))
  } catch {
    /* localStorage ถูกปิด — สลับได้ในหน้านี้ แต่จำข้าม refresh ไม่ได้ */
  }
  for (const listener of listeners) listener()
}
