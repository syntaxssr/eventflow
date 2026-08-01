"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useCountUp } from "@/hooks/use-count-up"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

type Tone = "default" | "warning" | "danger" | "brand"

const TONE_TILE: Record<Tone, string> = {
  default: "bg-muted text-muted-foreground",
  brand: "bg-brand-50 text-brand-900",
  warning: "bg-warning/25 text-foreground dark:bg-warning/30",
  danger: "bg-danger/15 text-foreground dark:bg-danger/25",
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
    <Card className="hover:border-brand-300 transition-colors">
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
            <span className="text-muted-foreground block truncate text-xs font-medium">
              {t(labelKey)}
            </span>
            <span className="block text-2xl leading-tight font-bold tabular-nums">
              {formatNumber(animated, locale)}
              {unitKey ? (
                <span className="text-muted-foreground ml-1 text-xs font-normal">
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
