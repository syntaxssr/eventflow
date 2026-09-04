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
          className="group focus-visible:ring-ring from-general-purple via-general-purple to-background relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg shadow-general-purple/20 ring-1 ring-general-purple/50 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-general-purple/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none"
        >
          <span
            className="bg-general-blue/25 absolute -top-7 -right-7 size-24 rounded-full blur-xl transition-transform duration-200 group-hover:scale-125 motion-reduce:transform-none"
            aria-hidden="true"
          />
          <span
            className="bg-general-green text-black absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide"
          >
            LIVE
          </span>
          <span className="relative flex size-14 items-center justify-center rounded-2xl border border-white/30 bg-white/12 shadow-lg shadow-black/15 transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-rotate-3 motion-reduce:transform-none">
            <Music2Icon className="size-7" aria-hidden="true" />
          </span>
          <span className="relative text-center text-sm font-semibold leading-tight">
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
