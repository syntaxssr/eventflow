"use client"

import Link from "next/link"
import { ArrowRightIcon, Clock3Icon, Music2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"

const COMING_SOON_CARD_COUNT = 6

/**
 * เนื้อหาเริ่มต้นของการ์ดเกม (คอลัมน์ซ้ายของ GamesShell) — รายการเกมให้เลือก
 *
 * กดเลือกเกมแล้วนำทางไปหน้าเกมนั้น (เช่น /games/music-quiz) ซึ่งอยู่ใต้
 * layout เดียวกัน จึงเห็นเหมือนแค่เนื้อหาในการ์ดสลับ ไม่ใช่เปลี่ยนหน้า —
 * แถบควบคุมกับการ์ดคนในห้องของ GamesShell ไม่ remount ตาม
 */
export function GamesPageView() {
  const t = useT()

  return (
    <Card className="h-full" data-testid="games-picker">
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={ROUTES.musicQuiz}
          className="focus-visible:ring-ring group rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <div className="ring-general-purple/25 hover:ring-general-purple/60 flex h-full min-h-36 flex-col justify-between gap-6 rounded-xl p-4 ring-1 transition-[transform,box-shadow,--tw-ring-color] group-hover:-translate-y-0.5 group-hover:shadow-md">
            <span className="bg-general-purple text-white flex size-11 items-center justify-center rounded-xl">
              <Music2Icon className="size-6" aria-hidden="true" />
            </span>
            <span className="flex items-end justify-between gap-3">
              <span>
                <span className="block text-lg font-semibold">
                  {t("games.musicQuizTitle")}
                </span>
                <span className="text-muted-foreground mt-1 block text-sm">
                  {t("games.musicQuizDescription")}
                </span>
              </span>
              <ArrowRightIcon
                className="size-5 shrink-0 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </Link>

        {Array.from({ length: COMING_SOON_CARD_COUNT }, (_, index) => (
          <div
            key={index}
            className="bg-muted/30 flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-4 text-center opacity-70"
          >
            <Clock3Icon
              className="text-muted-foreground size-7"
              aria-hidden="true"
            />
            <Badge variant="secondary">{t("games.comingSoon")}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
