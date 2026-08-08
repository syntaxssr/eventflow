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

/** ไอคอนใช้สีเดียวกับพื้นการ์ดแต่ทึบกว่า จึงยังอ่านออกบนพื้นที่จางลงแล้ว */
const TONE_TILE: Record<Tone, string> = {
  default: "bg-muted text-muted-foreground",
  brand: "bg-stat-blue/70 text-foreground dark:bg-stat-blue/45",
  danger: "bg-stat-red/70 text-foreground dark:bg-stat-red/45",
  blocked: "bg-stat-blocked/70 text-foreground dark:bg-stat-blocked/45",
  warning: "bg-stat-yellow/70 text-foreground dark:bg-stat-yellow/45",
}

/**
 * พื้นหลังการ์ด — สีละใบเพื่อให้สแกนแยกได้ทันทีโดยไม่ต้องอ่าน
 * ความทึบต่างกันตามธีมเพราะพื้นคนละขั้ว: light รับได้ถึง 40% ส่วน dark
 * ต้องหยุดที่ 22% ไม่งั้นสีอ่อน (ฟ้า/เหลือง) ดันพื้นสว่างจนตัวอักษรขาวหลุด AA
 */
const TONE_SURFACE: Record<Tone, string> = {
  default: "",
  brand: "bg-stat-blue/40 dark:bg-stat-blue/22",
  danger: "bg-stat-red/40 dark:bg-stat-red/22",
  blocked: "bg-stat-blocked/40 dark:bg-stat-blocked/22",
  warning: "bg-stat-yellow/40 dark:bg-stat-yellow/22",
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
        // Card ใช้ ring ไม่ใช่ border — hover จึงเน้นที่ ring
        "overflow-hidden transition-colors hover:ring-foreground/25",
        TONE_SURFACE[tone]
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
            {/* ไม่ใช้ --muted-foreground (ดำ 62%) เพราะพอมีสีทับพื้นการ์ดแล้ว
                contrast ตกต่ำกว่า AA (danger เหลือ 4.27) ดำ 70% ได้ 5.1–5.7 */}
            <span className="text-foreground/70 block truncate text-xs font-medium">
              {t(labelKey)}
            </span>
            <span className="block text-2xl leading-tight font-bold tabular-nums">
              {formatNumber(animated, locale)}
              {unitKey ? (
                <span className="text-foreground/70 ml-1 text-xs font-normal">
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
