"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * สีของแถบตามเปอร์เซ็นต์ความคืบหน้า — แดง → เหลือง → ฟ้า → เขียว
 *
 * เขียวสงวนไว้ให้ 100% เท่านั้น ช่วง 50–99% จึงใช้ฟ้าแทน
 * เพื่อให้ "ใกล้เสร็จ" กับ "เสร็จแล้ว" แยกออกจากกันได้ในพริบตา
 *
 * ใช้ token `--progress-*` (เฉด Version 3) ซึ่งเข้มกว่าชุด Version 2 ที่ใช้ทั่วระบบ
 * เพราะแถบบางและวางบน track ที่สว่างใกล้กัน — เป็นข้อยกเว้นเฉพาะ progress bar
 */
const COMPLETION_TONES = [
  { min: 100, className: "bg-progress-green" },
  { min: 50, className: "bg-progress-blue" },
  { min: 20, className: "bg-progress-yellow" },
  { min: 0, className: "bg-progress-red" },
] as const

function completionToneClass(value: number): string {
  return (
    COMPLETION_TONES.find((tone) => value >= tone.min)?.className ??
    COMPLETION_TONES[COMPLETION_TONES.length - 1].className
  )
}

function Progress({
  className,
  indicatorClassName,
  value,
  tone = "neutral",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  /**
   * `completion` = แถบ "ทำไปแล้วกี่ %" ของงาน/กิจกรรม สีเปลี่ยนตามเปอร์เซ็นต์
   * `neutral` = ความคืบหน้าที่ไม่ได้สื่อว่าดีหรือแย่ (เช่น อัปโหลดไฟล์) ใช้สีเดียว
   */
  tone?: "neutral" | "completion"
  /**
   * override transition ของแถบ (default 150ms) — เช่น เคาน์ตดาวน์ที่อัปเดตค่าเป็นช่วง ๆ
   * ทุก 1 วินาที ต้องใช้ duration-1000 ease-linear ให้แถบไหลลื่นเต็มช่วงแทนกระตุกทีละก้อน
   */
  indicatorClassName?: string
}) {
  const percent = value ?? 0

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "size-full flex-1 transition-all",
          tone === "completion" ? completionToneClass(percent) : "bg-primary",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - percent}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
