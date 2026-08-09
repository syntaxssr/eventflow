"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useCountUp } from "@/hooks/use-count-up"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

type Tone = "default" | "warning" | "danger" | "blocked" | "brand"

/** พื้นการ์ดสรุปใช้ surface กลางของระบบ สีอยู่ที่กล่องไอคอนเท่านั้น */
const CARD_TONE: Record<Tone, string> = {
  default: "",
  brand: "",
  danger: "",
  blocked: "",
  warning: "",
}

/** กล่องไอคอนของสี่การ์ดบน ใช้ชุดสีสถานะตามลำดับความเร่งด่วน */
const TONE_TILE: Record<Tone, string> = {
  default: "bg-muted text-muted-foreground",
  brand: "bg-status-blue text-status-blue-foreground",
  warning: "bg-status-yellow text-status-yellow-foreground",
  blocked: "bg-status-orange text-status-orange-foreground",
  danger: "bg-status-red text-status-red-foreground",
}

/**
 * การ์ดตัวเลขสรุปบน Dashboard
 * ทั้งใบเป็นลิงก์ไปยังหน้าที่เกี่ยวข้องพร้อมตัวกรองที่ตรงกัน
 */
export function StatCard({
  labelKey,
  value,
  unitKey,
  icon: Icon,
  href,
  tone = "default",
}: {
  labelKey: TranslationKey
  value: number
  unitKey?: TranslationKey
  icon: LucideIcon
  href: string
  tone?: Tone
}) {
  const { t, locale } = useLocale()
  const animated = useCountUp(value)

  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors hover:ring-foreground/25",
        CARD_TONE[tone]
      )}
    >
      <CardContent className="p-0">
        <Link
          href={href}
          className="focus-visible:outline-ring flex items-center gap-3 rounded-lg p-4 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              TONE_TILE[tone]
            )}
            aria-hidden="true"
          >
            <Icon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium opacity-75">
              {t(labelKey)}
            </span>
            <span className="block text-3xl leading-tight font-bold tabular-nums">
              {formatNumber(animated, locale)}
              {unitKey ? (
                <span className="ml-1 text-sm font-normal opacity-75">
                  {t(unitKey)}
                </span>
              ) : null}
            </span>
          </span>
        </Link>
      </CardContent>
    </Card>
  )
}
