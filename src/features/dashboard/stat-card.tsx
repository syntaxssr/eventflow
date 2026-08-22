"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useCountUp } from "@/hooks/use-count-up"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

type Tone = "default" | "warning" | "danger" | "blocked" | "brand" | "success"

/** พื้นการ์ดสรุปใช้ surface กลางของระบบ สีอยู่ที่กล่องไอคอนเท่านั้น */
const CARD_TONE: Record<Tone, string> = {
  default: "",
  brand: "dashboard-stat-card--blue",
  danger: "dashboard-stat-card--red",
  blocked: "dashboard-stat-card--orange",
  warning: "dashboard-stat-card--yellow",
  success: "dashboard-stat-card--green",
}

/**
 * กล่องไอคอนใช้ช่องไอคอนเฉด Version 3 ชุดเดียวกับรายการแจ้งเตือน
 * ไม่ใช่สีสถานะ Version 2 เพราะช่องขนาด 48px ที่มีแต่ไอคอนต้องอ่านออกทั้งสองธีม
 */
const TONE_TILE: Record<Tone, string> = {
  default: "bg-muted text-muted-foreground",
  brand: "bg-icon-tile-blue text-icon-tile-blue-foreground",
  warning: "bg-icon-tile-yellow text-icon-tile-yellow-foreground",
  blocked: "bg-icon-tile-orange text-icon-tile-orange-foreground",
  danger: "bg-icon-tile-red text-icon-tile-red-foreground",
  success: "bg-icon-tile-green text-icon-tile-green-foreground",
}

/**
 * การ์ดตัวเลขสรุปบน Dashboard และแถบสรุปผู้เข้าร่วม
 *
 * ถ้าส่ง href มา ทั้งใบเป็นลิงก์ไปยังหน้าที่เกี่ยวข้องพร้อมตัวกรองที่ตรงกัน
 * ถ้าไม่ส่ง (เช่นแถบสรุปที่อยู่บนหน้าปลายทางอยู่แล้ว) จะเป็นการ์ดอ่านอย่างเดียว
 */
export function StatCard({
  labelKey,
  value,
  unitKey,
  icon: Icon,
  href,
  tone = "default",
  valueTestId,
}: {
  labelKey: TranslationKey
  value: number
  unitKey?: TranslationKey
  icon: LucideIcon
  href?: string
  tone?: Tone
  valueTestId?: string
}) {
  const { t, locale } = useLocale()
  const animated = useCountUp(value)

  const body = (
    <>
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl",
          TONE_TILE[tone]
        )}
        aria-hidden="true"
      >
        <Icon className="size-8" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium opacity-75">
          {t(labelKey)}
        </span>
        <span className="block text-3xl leading-tight font-bold tabular-nums">
          <span data-testid={valueTestId}>{formatNumber(animated, locale)}</span>
          {unitKey ? (
            <span className="ml-1 text-sm font-normal opacity-75">
              {t(unitKey)}
            </span>
          ) : null}
        </span>
      </span>
    </>
  )

  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors hover:ring-foreground/25",
        CARD_TONE[tone]
      )}
    >
      <CardContent className="p-0">
        {href ? (
          <Link
            href={href}
            className="focus-visible:outline-ring flex items-center gap-3 rounded-lg p-4 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {body}
          </Link>
        ) : (
          <div className="flex items-center gap-3 rounded-lg p-4">{body}</div>
        )}
      </CardContent>
    </Card>
  )
}
