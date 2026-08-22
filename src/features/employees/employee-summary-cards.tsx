"use client"

import {
  BadgeCheckIcon,
  Building2Icon,
  CircleDashedIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { StatCard } from "@/features/dashboard/stat-card"
import type { TranslationKey } from "@/i18n/types"
import type { EmployeeSummary } from "@/lib/employee"

/**
 * การ์ดสรุปทะเบียน 4 ใบ: ทั้งหมด / ทำงานอยู่ / ลาพัก / จำนวนแผนก
 *
 * ใช้ StatCard ใบเดียวกับแถบสรุปผู้เข้าร่วม และไม่ส่ง href
 * เพราะการ์ดชุดนี้อยู่บนหน้าปลายทางอยู่แล้ว
 */
export function EmployeeSummaryCards({ summary }: { summary: EmployeeSummary }) {
  const cards: {
    key: string
    labelKey: TranslationKey
    value: number
    icon: LucideIcon
    tone: React.ComponentProps<typeof StatCard>["tone"]
  }[] = [
    {
      key: "total",
      labelKey: "employee.summaryTotal",
      value: summary.total,
      icon: UsersIcon,
      tone: "brand",
    },
    {
      key: "active",
      labelKey: "employee.summaryActive",
      value: summary.active,
      icon: BadgeCheckIcon,
      tone: "success",
    },
    {
      key: "onLeave",
      labelKey: "employee.summaryOnLeave",
      value: summary.onLeave,
      icon: CircleDashedIcon,
      tone: "warning",
    },
    {
      key: "departments",
      labelKey: "employee.summaryDepartments",
      value: summary.departments,
      icon: Building2Icon,
      tone: "default",
    },
  ]

  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      data-testid="employee-summary"
    >
      {cards.map((card) => (
        <StatCard
          key={card.key}
          labelKey={card.labelKey}
          value={card.value}
          icon={card.icon}
          tone={card.tone}
          valueTestId={`employee-summary-${card.key}`}
        />
      ))}
    </div>
  )
}
