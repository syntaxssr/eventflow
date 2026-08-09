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

/** กล่องไอคอนใช้สีประจำการ์ด ส่วนไอคอนลดน้ำหนักลงเพื่อให้สมดุล */
const TONE_TILE: Record<Tone, string> = {
  default: "bg-muted text-muted-foreground",
  brand: "bg-stat-blue text-foreground/70",
  danger: "bg-stat-red text-foreground/70",
  blocked: "bg-stat-blocked text-foreground/70",
  warning: "bg-stat-yellow text-foreground/70",
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
    <Card className="dashboard-card-surface overflow-hidden transition-colors hover:ring-foreground/25">
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
            {/* ไม่ใช้ --muted-foreground (ดำ 62%) เพราะพอมีสีทับพื้นการ์ดแล้ว
                contrast ตกต่ำกว่า AA (danger เหลือ 4.27) ดำ 70% ได้ 5.1–5.7 */}
            <span className="text-foreground/70 block truncate text-sm font-medium">
              {t(labelKey)}
            </span>
            <span className="block text-3xl leading-tight font-bold tabular-nums">
              {formatNumber(animated, locale)}
              {unitKey ? (
                <span className="text-foreground/70 ml-1 text-sm font-normal">
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
