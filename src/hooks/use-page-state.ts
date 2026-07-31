"use client"

import * as React from "react"

import { useDemo } from "@/components/dev/demo-provider"
import { simulateDelay } from "@/lib/async"
import type { LoadState } from "@/types/common"

/**
 * สถานะการโหลดของหน้า
 *
 * จำลอง Loading Delay ตอนเข้าหน้าเพื่อให้ Interaction สมจริง
 * และเคารพการบังคับสถานะจาก Dev Utility Panel เพื่อให้ทดสอบ
 * Loading / Empty / Error State ได้ทุกหน้า
 *
 * @param isEmpty ข้อมูลจริงว่างเปล่าหรือไม่
 */
export function usePageState(isEmpty: boolean): {
  state: LoadState
  retry: () => void
} {
  const { forcedState } = useDemo()
  const [attempt, setAttempt] = React.useState(0)
  const [loadedAttempt, setLoadedAttempt] = React.useState(-1)

  React.useEffect(() => {
    let cancelled = false
    simulateDelay(220, 520).then(() => {
      if (!cancelled) setLoadedAttempt(attempt)
    })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = React.useCallback(() => setAttempt((value) => value + 1), [])

  if (forcedState !== "normal") {
    return { state: forcedState, retry }
  }
  if (loadedAttempt !== attempt) return { state: "loading", retry }
  return { state: isEmpty ? "empty" : "ready", retry }
}
