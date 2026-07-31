"use client"

import { useMediaQuery } from "./use-media-query"

/**
 * คืนค่า `true` เมื่อผู้ใช้ตั้งค่าให้ลดการเคลื่อนไหว
 * ใช้ปิด Animation ที่เด่นชัด เช่น count-up, drag preview, gantt transition
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)")
}
