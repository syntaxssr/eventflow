"use client"

import * as React from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useLocale } from "@/i18n"
import {
  describeWedge,
  polarToCartesian,
  segmentAngle,
  segmentColorIndex,
  truncateLabel,
  WHEEL_CENTER,
  WHEEL_HUB_RADIUS,
  WHEEL_RADIUS,
  WHEEL_SEGMENT_COLORS,
  WHEEL_SEGMENT_TEXT_COLORS,
  WHEEL_SIZE,
  WHEEL_SPIN_DURATION_MS,
  wheelLabelLayout,
  type WheelEntry,
} from "@/lib/spin-wheel"
import { cn } from "@/lib/utils"

/** ออกตัวเร็วแล้วค่อย ๆ ช้าลงจนหยุด — ให้ความรู้สึกเหมือนวงล้อจริงที่มีแรงเสียดทาน */
const SPIN_EASING = "cubic-bezier(0.12, 0.7, 0.1, 1)"

/** ตำแหน่งปลายชื่อ — ถอยจากขอบเข้ามาเล็กน้อยไม่ให้ชนเส้นขอบวง */
const LABEL_RADIUS = WHEEL_RADIUS - 16

interface WheelProps {
  entries: WheelEntry[]
  /** มุมสะสม (องศา ตามเข็ม) — เพิ่มขึ้นเรื่อย ๆ ไม่รีเซ็ต เพื่อให้หมุนต่อจากตำแหน่งเดิม */
  rotation: number
  spinning: boolean
  onSpinEnd: () => void
  className?: string
}

/**
 * วงล้อ SVG — ช่องละหนึ่งรายชื่อ หมุนด้วย CSS transform
 * ลูกศรอยู่นอกกลุ่มที่หมุน จึงชี้ 12 นาฬิกาเสมอ
 */
export function Wheel({
  entries,
  rotation,
  spinning,
  onSpinEnd,
  className,
}: WheelProps) {
  const { t } = useLocale()
  const reducedMotion = useReducedMotion()
  const count = entries.length
  const angle = segmentAngle(count)
  const layout = wheelLabelLayout(count)

  // เก็บ callback ล่าสุดไว้ใน ref เพื่อให้ตัวจับเวลาด้านล่างไม่ถูกรีเซ็ตทุกครั้งที่ parent render ใหม่
  const onSpinEndRef = React.useRef(onSpinEnd)
  React.useEffect(() => {
    onSpinEndRef.current = onSpinEnd
  }, [onSpinEnd])

  // transitionend กับตัวจับเวลาสำรองอาจยิงทั้งคู่ — จบรอบได้ครั้งเดียวต่อการหมุน
  const finishedRef = React.useRef(false)
  const finish = React.useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    onSpinEndRef.current()
  }, [])

  React.useEffect(() => {
    if (!spinning) {
      finishedRef.current = false
      return
    }
    // ลดการเคลื่อนไหว: ไม่มี transition จึงไม่มี transitionend ให้รอ — จบรอบทันที
    // ปกติ: เผื่อ transitionend ไม่ยิง (เช่นแท็บถูกซ่อน) ให้ตัวจับเวลาสำรองจบรอบแทน
    const delay = reducedMotion ? 0 : WHEEL_SPIN_DURATION_MS + 400
    const timer = window.setTimeout(finish, delay)
    return () => window.clearTimeout(timer)
  }, [spinning, reducedMotion, finish])

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.propertyName !== "transform") return
    finish()
  }

  return (
    <div
      role="img"
      aria-label={t("spinWheel.wheelAria", { count })}
      className={cn(
        "relative mx-auto aspect-square w-full max-w-[420px] select-none",
        className
      )}
      data-testid="spin-wheel"
      data-spinning={spinning ? "true" : undefined}
    >
      <div
        className="size-full will-change-transform"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition:
            spinning && !reducedMotion
              ? `transform ${WHEEL_SPIN_DURATION_MS}ms ${SPIN_EASING}`
              : "none",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <svg
          viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
          className="size-full drop-shadow-md"
          aria-hidden="true"
          focusable="false"
        >
          {count === 1 ? (
            <circle
              cx={WHEEL_CENTER}
              cy={WHEEL_CENTER}
              r={WHEEL_RADIUS}
              fill={WHEEL_SEGMENT_COLORS[0]}
            />
          ) : (
            entries.map((entry, index) => (
              <path
                key={entry.id}
                d={describeWedge(index, count)}
                fill={WHEEL_SEGMENT_COLORS[segmentColorIndex(index, count)]}
                stroke="var(--card)"
                strokeWidth={2}
                strokeLinejoin="round"
              />
            ))
          )}

          {entries.map((entry, index) => {
            const mid = (index + 0.5) * angle
            const point = polarToCartesian(LABEL_RADIUS, mid)
            const text = layout.showLabels
              ? truncateLabel(entry.label, layout.maxChars)
              : String(index + 1)
            return (
              <text
                key={entry.id}
                x={point.x}
                y={point.y}
                fill={WHEEL_SEGMENT_TEXT_COLORS[segmentColorIndex(index, count)]}
                fontSize={layout.fontSize}
                fontWeight={700}
                textAnchor="end"
                dominantBaseline="middle"
                // วางตัวอักษรตามแนวรัศมี อ่านจากกลางวงออกไปหาขอบ
                transform={`rotate(${mid - 90} ${point.x} ${point.y})`}
                className="pointer-events-none"
              >
                {text}
              </text>
            )
          })}

          <circle
            cx={WHEEL_CENTER}
            cy={WHEEL_CENTER}
            r={WHEEL_RADIUS}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={3}
          />
          <circle
            cx={WHEEL_CENTER}
            cy={WHEEL_CENTER}
            r={WHEEL_HUB_RADIUS}
            fill="var(--card)"
            stroke="var(--foreground)"
            strokeWidth={3}
          />
        </svg>
      </div>

      <svg
        viewBox="0 0 40 44"
        className="absolute top-0 left-1/2 h-[11%] w-auto -translate-x-1/2 -translate-y-[10%] drop-shadow-md"
        aria-hidden="true"
        focusable="false"
      >
        <polygon
          points="20,44 2,4 38,4"
          fill="var(--foreground)"
          stroke="var(--background)"
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
