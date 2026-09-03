"use client"

import * as React from "react"

const subscribe = () => () => {}

/** origin ของหน้าเว็บปัจจุบัน — ค่าว่างตอน SSR แล้วเติมให้ตอน hydrate */
export function useOrigin() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => ""
  )
}
