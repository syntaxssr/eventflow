"use client"

import Link from "next/link"
import { Clock3Icon, Music2Icon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"

const GAMES_PER_ROW = 4
const GAME_ROWS = 4
const TOTAL_TILES = GAMES_PER_ROW * GAME_ROWS
/** ตอนนี้มีเกมจริงแค่เกมส์ทายเพลง ที่เหลือคือช่อง "เร็วๆ นี้" เติมให้เต็ม 4x4 */
const PLACEHOLDER_COUNT = TOTAL_TILES - 1

/**
 * เนื้อหาเริ่มต้นของการ์ดเกม (คอลัมน์ซ้ายของ GamesShell) — รายการเกมให้เลือก
 *
 * ตรึงไว้ 4 เกมต่อแถว 4 แถว (16 ช่อง) เต็มความสูงการ์ดพอดี — GamesShell
 * กำหนดให้การ์ดนี้สูงเท่าจอไว้แล้ว จึงแค่ปล่อยให้ grid แบ่งพื้นที่เท่า ๆ กัน
 *
 * แต่ละช่องแสดงแค่ไอคอน + ชื่อเกมใต้ไอคอน ไม่มีคำอธิบายหรือลูกศร
 *
 * กดเลือกเกมแล้วนำทางไปหน้าเกมนั้น (เช่น /games/music-quiz) ซึ่งอยู่ใต้
 * layout เดียวกัน จึงเห็นเหมือนแค่เนื้อหาในการ์ดสลับ ไม่ใช่เปลี่ยนหน้า —
 * แถบควบคุมกับการ์ดคนในห้องของ GamesShell ไม่ remount ตาม
 */
export function GamesPageView() {
  const t = useT()

  return (
    <Card className="h-full" data-testid="games-picker">
      <CardContent className="grid h-full grid-cols-4 grid-rows-4 gap-3">
        <Link
          href={ROUTES.musicQuiz}
          className="group focus-visible:ring-ring from-general-purple to-general-purple/70 ring-general-purple/30 relative flex h-full flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br p-2 ring-1 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-general-purple/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <span
            className="bg-general-green absolute top-2.5 right-2.5 size-2 rounded-full"
            aria-hidden="true"
          />
          <Music2Icon
            className="size-9 text-white transition-transform group-hover:scale-110"
            aria-hidden="true"
          />
          <span className="text-center text-xs font-medium text-white">
            {t("games.musicQuizTitle")}
          </span>
        </Link>

        {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
          <div
            key={index}
            className="bg-muted/30 flex h-full items-center justify-center rounded-xl border border-dashed opacity-60"
          >
            <Clock3Icon
              className="text-muted-foreground size-6"
              aria-hidden="true"
            />
            <span className="sr-only">{t("games.comingSoon")}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
