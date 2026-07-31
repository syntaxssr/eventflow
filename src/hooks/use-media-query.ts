"use client"

import * as React from "react"

/**
 * อ่านค่า CSS media query แบบ reactive
 *
 * ใช้ `useSyncExternalStore` แทนการ setState ใน effect
 * เพื่อไม่ให้เกิด cascading render และรองรับ SSR ได้อย่างถูกต้อง
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener("change", onStoreChange)
      return () => media.removeEventListener("change", onStoreChange)
    },
    [query]
  )

  const getSnapshot = React.useCallback(
    () => window.matchMedia(query).matches,
    [query]
  )

  // ฝั่งเซิร์ฟเวอร์ไม่มี matchMedia — คืนค่า false เสมอแล้วให้ client แก้ให้ถูกหลัง hydrate
  const getServerSnapshot = React.useCallback(() => false, [])

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
