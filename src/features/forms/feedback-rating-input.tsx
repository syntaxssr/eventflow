"use client"

import * as React from "react"
import { StarIcon } from "lucide-react"

import { useLocale } from "@/i18n"
import { cn } from "@/lib/utils"
import { FEEDBACK_RATING_MAX, FEEDBACK_RATING_MIN } from "@/types/feedback"

const SCALE = Array.from(
  { length: FEEDBACK_RATING_MAX - FEEDBACK_RATING_MIN + 1 },
  (_, index) => FEEDBACK_RATING_MIN + index
)

/**
 * ให้คะแนนหนึ่งหัวข้อด้วยดาว 1–5
 *
 * ใช้ radiogroup จริงแทนปุ่มเปล่า เพื่อให้เลื่อนด้วยลูกศรและอ่านค่าออกด้วย
 * screen reader ได้ ค่า 0 หมายถึงยังไม่ได้ให้คะแนน
 */
export function FeedbackRatingInput({
  label,
  value,
  onChange,
  disabled,
  testId,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  testId?: string
}) {
  const { t } = useLocale()

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex items-center gap-0.5"
      data-testid={testId}
    >
      {SCALE.map((score) => {
        const filled = score <= value

        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={score === value}
            aria-label={t("eventFeedback.ratingValue", {
              value: score,
              max: FEEDBACK_RATING_MAX,
            })}
            disabled={disabled}
            onClick={() => onChange(score)}
            className={cn(
              "focus-visible:ring-ring rounded-sm p-0.5 transition-transform focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
              !disabled && "hover:scale-110 motion-reduce:hover:scale-100"
            )}
          >
            <StarIcon
              className={cn(
                "size-6",
                filled
                  ? "fill-warning text-warning"
                  : "text-muted-foreground/40"
              )}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}
