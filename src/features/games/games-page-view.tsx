"use client"

import Link from "next/link"
import {
  Clock3Icon,
  Music2Icon,
  Music3Icon,
  Music4Icon,
  MusicIcon,
  Volume2Icon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"
import { cn } from "@/lib/utils"
import recordStyles from "@/features/music-quiz/music-quiz.module.css"
import { usePresentationMode } from "./presentation-mode-provider"

/**
 * โทนเข้มเกือบดำ (ไม่ใช้ general-purple ตรง ๆ) — ให้แผ่นเสียงดูเป็นแผ่นไวนิลจริง
 * แยกออกจากพื้นหลัง gradient สีม่วงของ tile ชัดเจน ไม่กลืนไปเป็นสีเดียวกัน
 */
const RECORD_ACCENT = "#2a2530"

/** มุม/ไอคอน/ขนาดตัวโน้ตที่ลอยออกจากแผ่น — ก็อปมาจากชุดเดียวกับหน้าเล่นเกมจริง (music-quiz-view.tsx) */
const NOTE_ITEMS = [
  { angle: 0, icon: MusicIcon, scale: 0.75 },
  { angle: 45, icon: Music3Icon, scale: 1.3 },
  { angle: 90, icon: Music2Icon, scale: 0.95 },
  { angle: 135, icon: Music4Icon, scale: 1.15 },
  { angle: 180, icon: MusicIcon, scale: 1.4 },
  { angle: 225, icon: Music2Icon, scale: 0.7 },
  { angle: 270, icon: Music3Icon, scale: 1.05 },
  { angle: 315, icon: Music4Icon, scale: 0.85 },
] as const

const GAMES_PER_ROW = 2
const GAME_ROWS = 2
const TOTAL_TILES = GAMES_PER_ROW * GAME_ROWS
/** แผนตอนนี้มีแค่ 4 เกมรวม (2x2) — เกมส์ทายเพลงเป็นเกมจริง ที่เหลือคือช่อง "เร็วๆ นี้" */
const PLACEHOLDER_COUNT = TOTAL_TILES - 1

/**
 * เนื้อหาเริ่มต้นของการ์ดเกม (คอลัมน์ซ้ายของ GamesShell) — รายการเกมให้เลือก
 *
 * ตรึงไว้ 2 เกมต่อแถว 2 แถว (4 ช่อง) เต็มความสูงการ์ดพอดี — GamesShell
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
  const { presentationMode } = usePresentationMode()

  return (
    <Card className="h-full" data-testid="games-picker">
      <CardContent className="grid h-full grid-cols-2 grid-rows-2 gap-3">
        <Link
          href={ROUTES.musicQuiz}
          className="group focus-visible:ring-ring from-general-purple via-general-purple to-background relative flex h-full flex-col items-stretch overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg shadow-general-purple/20 ring-1 ring-general-purple/50 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-general-purple/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none"
        >
          <span
            className="bg-general-blue/25 absolute -top-10 -right-10 size-40 rounded-full blur-xl transition-transform duration-200 group-hover:scale-125 motion-reduce:transform-none"
            aria-hidden="true"
          />
          <span
            className="bg-general-green text-black absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide"
          >
            LIVE
          </span>
          {/* TODO: เส้นแบ่ง 70/30 (border-dashed) เอาไว้ดูสัดส่วนชั่วคราว เอาออกทีหลัง */}
          <div className="relative flex min-h-0 flex-[7] items-center justify-center border-b-2 border-dashed border-white/50">
            {/*
              ตัวโน้ตลอยออกจากหลังแผ่น — ก็อปเอฟเฟกต์จากหน้าเล่นเกมจริง แต่ตรงนี้ให้ลอยตลอด
              ไม่ผูกกับสถานะ isPlaying (ไม่มี concept "กำลังเล่น" ในหน้ารวมเกม) ต้องอยู่ก่อน
              .cover ใน DOM เพราะเป็น position:absolute — มาก่อนแปลว่า paint ทับได้ก่อน
              แผ่นเสียง (position:relative) จึงบังโน้ตตอนซ้อนทับกัน เป็นเลเยอร์หลังแผ่นเสมอ
              ระยะที่โน้ตลอยออกในเกมจริงอิง dvh ของทั้งหน้าจอ (ไกลกว่าขนาด tile เล็ก ๆ นี้มาก)
              ลองปล่อยตามค่าเดิมแล้วโน้ตลอยไกลจนหลุดกรอบ tile ทันทีมองไม่เห็นเลย จึงต้อง scale
              ทั้งเลเยอร์ให้เล็กลงมาก ระยะลอยจะย่อตามสัดส่วนไปด้วยพอดี
            */}
            <div className={cn(recordStyles.notes, "scale-[0.55]")} aria-hidden="true">
              {NOTE_ITEMS.map(({ angle, icon: NoteIcon, scale }, index) => (
                <span
                  key={angle}
                  className={recordStyles.noteOrbit}
                  style={{
                    "--note-angle": `${angle}deg`,
                    "--note-scale": scale,
                    animationDelay: `${index * 0.2}s`,
                  } as React.CSSProperties}
                >
                  <NoteIcon className={recordStyles.noteIcon} />
                </span>
              ))}
            </div>
            <div
              className={cn(recordStyles.cover, recordStyles.coverPlaying, "!w-auto h-[82%] transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transform-none")}
              style={{ "--category-accent": RECORD_ACCENT } as React.CSSProperties}
              aria-hidden="true"
            >
              <div className={recordStyles.record}>
                <Volume2Icon className="relative z-10 size-9 text-white" />
              </div>
            </div>
          </div>
          <div className="flex min-h-0 flex-[3] items-center justify-center px-4">
            {/*
              ขนาดตัวหนังสือแยกตามโหมด — โหมดเต็มจอ (ใช้จริงในงาน) ช่องกว้างพอให้ 48px
              (text-5xl) อยู่บรรทัดเดียวไม่ล้น ส่วนมุมมองปกติ (จอผู้ควบคุมตอนไม่เต็มจอ)
              ช่องแคบกว่า ใช้ text-xl กัน pill ล้น/ตัดคำ
            */}
            <span
              className={cn(
                "bg-background rounded-full px-6 py-2 text-center leading-none font-bold whitespace-nowrap text-white shadow-lg shadow-black/25 ring-1 ring-white/10",
                presentationMode ? "text-5xl" : "text-xl"
              )}
            >
              {t("games.musicQuizTitle")}
            </span>
          </div>
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
