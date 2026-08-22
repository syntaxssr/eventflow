"use client"

import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleXIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { StatCard } from "@/features/dashboard/stat-card"
import type { TranslationKey } from "@/i18n/types"
import type { RsvpSummary } from "@/types/participant"

/**
 * การ์ดสรุปสถานะตอบรับ 4 ใบ: ทั้งหมด / เข้าร่วม / ไม่เข้าร่วม / ยังไม่ตอบรับ
 *
 * ใช้ StatCard ใบเดียวกับการ์ดสรุปบน Dashboard เพื่อให้แถบตัวเลขสรุปทั้งแอป
 * อ่านเหมือนกัน แต่ไม่ส่ง href เพราะการ์ดชุดนี้อยู่บนหน้าปลายทางอยู่แล้ว
 */
export function ParticipantSummaryCards({ summary }: { summary: RsvpSummary }) {
  const cards: {
    key: string
    labelKey: TranslationKey
    value: number
    icon: LucideIcon
    tone: React.ComponentProps<typeof StatCard>["tone"]
  }[] = [
    {
      key: "total",
      labelKey: "participant.summaryTotal",
      value: summary.total,
      icon: UsersIcon,
      tone: "brand",
    },
    {
      key: "attending",
      labelKey: "rsvp.attending",
      value: summary.attending,
      icon: CircleCheckIcon,
      tone: "success",
    },
    {
      key: "notAttending",
      labelKey: "rsvp.notAttending",
      value: summary.notAttending,
      icon: CircleXIcon,
      tone: "danger",
    },
    {
      key: "pending",
      labelKey: "rsvp.pending",
      value: summary.pending,
      icon: CircleHelpIcon,
      tone: "warning",
    },
  ]

  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      data-testid="participant-summary"
    >
      {cards.map((card) => (
        <StatCard
          key={card.key}
          labelKey={card.labelKey}
          value={card.value}
          icon={card.icon}
          tone={card.tone}
          valueTestId={`participant-summary-${card.key}`}
        />
      ))}
    </div>
  )
}
