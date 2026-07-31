"use client"

import { useMediaQuery } from "./use-media-query"

/** Breakpoint ที่ถือว่าเป็นหน้าจอมือถือ (ตรงกับ `md` ของ Tailwind) */
export const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}
