"use client"

import * as React from "react"
import { StarIcon } from "lucide-react"
import Image from "next/image"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useLocale } from "@/i18n"
import {
  describeWedge,
  polarToCartesian,
  segmentAngle,
  segmentColorIndex,
  truncateWheelLabel,
  WHEEL_CENTER,
  WHEEL_HUB_RADIUS,
  WHEEL_RADIUS,
  WHEEL_SEGMENT_TEXT_COLORS,
  WHEEL_SIZE,
  WHEEL_SPIN_DURATION_MS,
  wheelLabelLayout,
  type WheelEntry,
} from "@/lib/spin-wheel"
import { cn } from "@/lib/utils"
import styles from "./spin-wheel.module.css"

/** ออกตัวเร็วแล้วค่อย ๆ ช้าลงจนหยุด — ให้ความรู้สึกเหมือนวงล้อจริงที่มีแรงเสียดทาน */
const SPIN_EASING = "cubic-bezier(0.06, 0.72, 0.12, 1)"

/** ตำแหน่งปลายชื่อ — ถอยจากขอบเข้ามาเล็กน้อยไม่ให้ชนเส้นขอบวง */
const LABEL_RADIUS = WHEEL_RADIUS - 16

const RIM_BULBS = Array.from({ length: 28 }, (_, index) => index)

const SEGMENT_GRADIENTS = [
  ["#72b9ff", "#2778e8"],
  ["#ffe66c", "#f5b51b"],
  ["#8ee99a", "#35b95a"],
  ["#c28cff", "#7c3aed"],
  ["#ffbe55", "#f97316"],
  ["#ff8fbd", "#ec3d8f"],
  ["#4ee8d2", "#0ea990"],
  ["#ff8798", "#e93658"],
] as const

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
  const pointerRef = React.useRef<HTMLDivElement>(null)

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

  // เข็มสะบัดตามซี่วงล้อ โดยค่อย ๆ เว้นจังหวะห่างขึ้นเมื่อวงล้อช้าลง
  React.useEffect(() => {
    if (!spinning || reducedMotion || !pointerRef.current) return

    const pointer = pointerRef.current
    const startedAt = performance.now()
    let cancelled = false
    let timer = 0

    const tick = () => {
      if (cancelled) return
      const progress = Math.min(
        1,
        (performance.now() - startedAt) / WHEEL_SPIN_DURATION_MS
      )
      const duration = 72 + progress * 150
      pointer.animate(
        [
          { transform: "translate(-50%, -5%) rotate(0deg)" },
          { transform: "translate(-50%, -5%) rotate(-9deg)" },
          { transform: "translate(-50%, -5%) rotate(2deg)" },
          { transform: "translate(-50%, -5%) rotate(0deg)" },
        ],
        { duration, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
      )

      if (progress < 0.94) {
        timer = window.setTimeout(tick, 58 + progress * 210)
      }
    }

    tick()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      pointer.getAnimations().forEach((animation) => animation.cancel())
    }
  }, [spinning, reducedMotion])

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.propertyName !== "transform") return
    finish()
  }

  return (
    <div
      role="img"
      aria-label={t("spinWheel.wheelAria", { count })}
      className={cn(styles.wheelScene, "mx-auto", className)}
      data-testid="spin-wheel"
      data-spinning={spinning ? "true" : undefined}
    >
      <div
        className={styles.wheelShell}
        data-spinning={spinning ? "true" : undefined}
      >
        <div className={styles.wheelWell}>
          <div
            className={styles.rotor}
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
              className="size-full"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                {SEGMENT_GRADIENTS.map(([start, end], index) => (
                  <linearGradient
                    key={start}
                    id={`wheel-segment-${index}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0" stopColor={start} />
                    <stop offset="1" stopColor={end} />
                  </linearGradient>
                ))}
                <radialGradient id="wheel-gloss" cx="32%" cy="22%" r="72%">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
                  <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
                  <stop offset="1" stopColor="#1b0531" stopOpacity="0.18" />
                </radialGradient>
              </defs>

              {count === 1 ? (
                <circle
                  cx={WHEEL_CENTER}
                  cy={WHEEL_CENTER}
                  r={WHEEL_RADIUS}
                  fill="url(#wheel-segment-0)"
                />
              ) : (
                entries.map((entry, index) => {
                  const colorIndex = segmentColorIndex(index, count)
                  return (
                    <path
                      key={entry.id}
                      d={describeWedge(index, count)}
                      fill={`url(#wheel-segment-${colorIndex})`}
                      stroke="rgba(255,255,255,0.34)"
                      strokeWidth={1.35}
                      strokeLinejoin="round"
                    />
                  )
                })
              )}

              {entries.map((entry, index) => {
                const mid = (index + 0.5) * angle
                const point = polarToCartesian(LABEL_RADIUS, mid)
                const text = layout.showLabels
                  ? truncateWheelLabel(entry.label, layout.maxChars)
                  : String(index + 1)
                return (
                  <text
                    key={entry.id}
                    x={point.x}
                    y={point.y}
                    fill={
                      WHEEL_SEGMENT_TEXT_COLORS[
                        segmentColorIndex(index, count)
                      ]
                    }
                    fontSize={layout.fontSize}
                    fontWeight={800}
                    textAnchor="end"
                    dominantBaseline="middle"
                    transform={`rotate(${mid - 90} ${point.x} ${point.y})`}
                    className="pointer-events-none"
                    style={{
                      paintOrder: "stroke",
                      stroke: "rgba(255,255,255,0.2)",
                      strokeWidth: 0.8,
                    }}
                  >
                    {text}
                  </text>
                )
              })}

              <circle
                cx={WHEEL_CENTER}
                cy={WHEEL_CENTER}
                r={WHEEL_RADIUS}
                fill="url(#wheel-gloss)"
                pointerEvents="none"
              />
              <circle
                cx={WHEEL_CENTER}
                cy={WHEEL_CENTER}
                r={WHEEL_RADIUS - 1.5}
                fill="none"
                stroke="rgba(255,255,255,0.58)"
                strokeWidth={3}
              />
              <circle
                cx={WHEEL_CENTER}
                cy={WHEEL_CENTER}
                r={WHEEL_HUB_RADIUS + 3}
                fill="#58145f"
                stroke="#fff2ad"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>

        {RIM_BULBS.map((index) => (
          <span
            key={index}
            className={styles.bulb}
            style={
              {
                "--bulb-angle": `${(index / RIM_BULBS.length) * 360}deg`,
              } as React.CSSProperties
            }
            aria-hidden="true"
          />
        ))}

        <div className={styles.hub} aria-hidden="true">
          <StarIcon className="size-1/2 fill-current" strokeWidth={2.4} />
        </div>

        <div ref={pointerRef} className={styles.pointer} aria-hidden="true">
          <Image
            src="/spin-wheel-pointer.svg"
            alt=""
            width={120}
            height={180}
            className={styles.pointerArtwork}
            data-testid="wheel-pointer-artwork"
            draggable={false}
            unoptimized
          />
        </div>
      </div>

      <span className={styles.standStem} aria-hidden="true" />
      <span className={styles.standBase} aria-hidden="true" />
    </div>
  )
}
