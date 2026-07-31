"use client"

import * as React from "react"

import { useReducedMotion } from "./use-reduced-motion"

/**
 * นับตัวเลขขึ้นจาก 0 ไปยังค่าเป้าหมายเพื่อให้ตัวเลขบน Dashboard มีชีวิต
 * ปิดอัตโนมัติเมื่อผู้ใช้ตั้งค่า `prefers-reduced-motion`
 */
export function useCountUp(target: number, durationMs = 700): number {
  const reducedMotion = useReducedMotion()
  const [animated, setAnimated] = React.useState(0)

  React.useEffect(() => {
    if (reducedMotion) return

    let frame = 0
    let start: number | null = null

    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const ratio = Math.min(1, elapsed / durationMs)
      // ease-out cubic — เร็วตอนต้นแล้วค่อย ๆ ช้าลง
      const eased = 1 - Math.pow(1 - ratio, 3)
      setAnimated(Math.round(target * eased))
      if (ratio < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs, reducedMotion])

  return reducedMotion ? target : animated
}
