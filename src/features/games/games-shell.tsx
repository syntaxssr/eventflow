"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Maximize2Icon, Volume2Icon, VolumeXIcon } from "lucide-react"

import { PageContainer } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"
import { cn } from "@/lib/utils"
import { GamesRoomPanel } from "./games-room-panel"
import { usePresentationMode } from "./presentation-mode-provider"

const BGM_SRC = "/audio/games-lobby-bgm.mp3"
const BGM_FADE_MS = 2000

/**
 * โครงของโซนเกมส์ — ปุ่มเต็มจอบนสุด, การ์ดเกมซ้าย, การ์ดคนในห้องขวา
 *
 * ที่ xl ขึ้นไป: 2 คอลัมน์เคียงข้าง สูงเท่าจอเสมอ (ลบความสูง Topbar h-14 ออก)
 * ไม่มีการ scroll ทั้งหน้า — เนื้อหาที่ยาวเกินไปต้อง scroll ในการ์ดตัวเอง
 *
 * ต่ำกว่า xl (tablet/mobile): เรียงแนวตั้งแทน แต่ละการ์ดสูงคงที่ตายตัว
 * (ไม่ใช่เท่าจอ) แล้วปล่อยให้หน้าเลื่อนได้ตามปกติแทน
 *
 * ปกติตายตัวเสมอไม่ว่าจะเลือกเกมไหน — สลับแค่เนื้อหาในการ์ดเกม (children)
 * ส่วนโหมดเต็มจอซ่อนแถบควบคุมทิ้งไปเลย (เหลือแค่การ์ดเกม+การ์ดคนในห้อง)
 * เพื่อไม่ให้มีปุ่มออกให้กด — ออกจากเต็มจอได้ทางเดียวคือกด Esc เท่านั้น
 */
export function GamesShell({ children }: { children: React.ReactNode }) {
  const t = useT()
  const { presentationMode, openPresentationMode } = usePresentationMode()
  const pathname = usePathname()
  /** เพลงประกอบเล่นเฉพาะหน้าเลือกเกมส์ (`/games` เป๊ะ ๆ) — เข้าไปเล่นเกมจริงแล้วไม่ต้องมีเพลงนี้ */
  const isPickerPage = pathname === ROUTES.games
  const audioRef = useRef<HTMLAudioElement>(null)
  const fadeFrameRef = useRef<number | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  /*
   * ออกจากหน้าเลือกเกมส์ (เข้าไปเล่นเกมจริง) แล้วต้องรีเซ็ตปุ่มกลับเป็น "ยังไม่เล่น" — ใช้ pattern
   * "adjust state during render" ของ React แทน useEffect (React แนะนำวิธีนี้สำหรับ reset state
   * ตาม prop ที่เปลี่ยน, ตรงไปตรงมากว่า effect + ไม่โดน lint rule "no setState in effect")
   * ไม่ต้องสั่ง audio.pause() เอง เพราะ <audio> ถูก unmount ไปพร้อมกันในรอบ render เดียวกันอยู่แล้ว
   * (เสียงหยุดเองตาม DOM ที่หายไป)
   */
  const [wasPickerPage, setWasPickerPage] = useState(isPickerPage)
  if (isPickerPage !== wasPickerPage) {
    setWasPickerPage(isPickerPage)
    if (!isPickerPage) setIsMusicPlaying(false)
  }

  /*
   * ไล่ audio.volume จากค่าปัจจุบันไปยัง `to` ภายใน `durationMs` — ยกเลิก fade ก่อนหน้าที่ค้างอยู่เสมอ
   * ใช้ window.setInterval (ไม่ใช่ requestAnimationFrame) เพราะจอที่ใช้แสดงจริงมักเปิดค้างไว้เป็นพื้นหลัง
   * ของหน้าจอโปรเจกเตอร์/มอนิเตอร์ที่สอง ซึ่งเบราว์เซอร์อาจมองว่า tab "ไม่ active" แล้วสั่งพัก
   * rAF ทั้งหมด (ตาม Page Visibility) ทำให้ fade ค้างไม่ขยับเลย — window.setInterval ไม่โดนพักแบบนั้น
   */
  function fadeVolume(
    audio: HTMLAudioElement,
    to: number,
    durationMs: number,
    onDone?: () => void
  ) {
    if (fadeFrameRef.current !== null) clearInterval(fadeFrameRef.current)
    const from = audio.volume
    const start = Date.now()
    const TICK_MS = 50
    const intervalId = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - start) / durationMs)
      audio.volume = from + (to - from) * progress
      if (progress >= 1) {
        clearInterval(intervalId)
        fadeFrameRef.current = null
        onDone?.()
      }
    }, TICK_MS)
    fadeFrameRef.current = intervalId
  }

  /*
   * เข้าหน้านี้แล้วเล่นเพลงให้เองอัตโนมัติ พร้อมเฟดอิน 2 วิ — เบราว์เซอร์อาจบล็อก autoplay ที่มี
   * เสียงถ้าเว็บนี้ยังไม่เคยถูกโต้ตอบมาก่อนเลย (เช่นเปิดแท็บใหม่ตรง ๆ) กรณีนั้น .play() จะ reject
   * แล้วปล่อยให้พิธีกรกดปุ่มเล่นเองแทน ไม่ต้อง error ให้ผู้ใช้เห็น
   */
  useEffect(() => {
    if (!isPickerPage) return
    const audio = audioRef.current
    if (!audio) return
    let cancelled = false
    audio.volume = 0
    audio
      .play()
      .then(() => {
        if (cancelled) return
        fadeVolume(audio, 1, BGM_FADE_MS)
        setIsMusicPlaying(true)
      })
      .catch(() => {
        /* autoplay ถูกบล็อก — เหลือปุ่มให้กดเล่นเอง */
      })
    return () => {
      cancelled = true
    }
  }, [isPickerPage])

  function toggleMusic() {
    const audio = audioRef.current
    if (!audio) return
    if (isMusicPlaying) {
      fadeVolume(audio, 0, BGM_FADE_MS, () => audio.pause())
      setIsMusicPlaying(false)
    } else {
      audio.volume = 0
      void audio.play()
      fadeVolume(audio, 1, BGM_FADE_MS)
      setIsMusicPlaying(true)
    }
  }

  return (
    <PageContainer
      className={cn(
        "flex flex-col space-y-4 xl:h-[calc(100dvh-3.5rem)] xl:overflow-hidden",
        /*
         * padding เริ่มต้นของ PageContainer (pt-5/pb-4.../px-4...) ออกแบบมาสำหรับหน้าปกติที่
         * เลื่อนได้ — ตอนเต็มจอต้องการ edge-to-edge จริง ๆ ไม่งั้นการ์ดจะเหลือแถบว่างชนขอบจอ
         * ไม่สุด จึงต้อง reset เป็น 0 ทุกด้าน
         *
         * ต้องใส่ "xl:h-dvh" แทนที่ "xl:h-[calc(100dvh-3.5rem)]" ของโหมดปกติด้วย (ไม่ใช่แค่
         * "h-dvh" เฉย ๆ) เพราะที่ viewport ≥ xl ตัว calc เดิมชนะอยู่ดี (twMerge มองว่าเป็นคนละ
         * variant กับ h-dvh เปล่า ๆ เลยไม่ลบให้) ผลคือความสูงขาดไป 3.5rem เท่ากับที่ลบไว้เผื่อ
         * Topbar พอดี — คือสาเหตุจริงของช่องว่างด้านล่างที่เจอ ไม่ใช่แค่ padding
         */
        presentationMode &&
          "bg-background fixed inset-0 z-50 h-dvh xl:h-dvh overflow-hidden p-0 sm:p-0 lg:p-0 space-y-0"
      )}
    >
      {/*
        เพลงประกอบ (element + ปุ่มเปิด/ปิด) มีเฉพาะหน้าเลือกเกมส์ — เข้าไปเล่นเกมจริงแล้วไม่ต้อง
        มีเพลงนี้เลย จึง unmount <audio> ไปด้วยตอนไม่ใช่หน้าเลือกเกมส์ (เพลงหยุดเองเมื่อ element
        หายไป, useEffect ข้างบนช่วย sync สถานะปุ่มให้ทันก่อน re-render ด้วย)
      */}
      {isPickerPage && <audio ref={audioRef} src={BGM_SRC} loop preload="none" />}

      {/*
        ปุ่มเปิด/ปิดเพลงประกอบ ต้องกดได้ทั้งสองโหมด เพราะพิธีกรอาจอยากปิดเสียงตอนพูดแม้อยู่ใน
        โหมดเต็มจอ — ต่างจากปุ่มเต็มจอที่ซ่อนไปเลยเพื่อกันกดออกโดยไม่ตั้งใจ โหมดปกติวางไว้ในแถว
        ควบคุมข้างปุ่มเต็มจอ (ไม่ทับกับ topbar ของแอป) ส่วนโหมดเต็มจอที่ซ่อนแถบควบคุมไปแล้ว
        ต้องลอยเป็น fixed มุมจอแทน
      */}
      {presentationMode && isPickerPage ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleMusic}
          className="fixed top-4 right-4 z-[60] size-11 rounded-full border-2 border-general-purple/60 bg-general-purple/10 text-general-purple shadow-md shadow-general-purple/15 hover:border-general-purple hover:bg-general-purple hover:text-white"
          aria-label={isMusicPlaying ? t("games.turnMusicOff") : t("games.turnMusicOn")}
          aria-pressed={isMusicPlaying}
          data-testid="games-bgm-toggle"
        >
          {isMusicPlaying ? (
            <Volume2Icon className="size-5" aria-hidden="true" />
          ) : (
            <VolumeXIcon className="size-5" aria-hidden="true" />
          )}
        </Button>
      ) : presentationMode ? null : (
        <div className="flex shrink-0 items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={openPresentationMode}
            className="group h-14 rounded-full border-2 border-general-purple/60 bg-general-purple/10 px-7 text-base font-semibold text-general-purple shadow-md shadow-general-purple/15 transition-[transform,colors,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:border-general-purple hover:bg-general-purple hover:text-white hover:shadow-xl hover:shadow-general-purple/35 active:translate-y-0 active:scale-100 motion-reduce:transform-none"
            data-testid="games-fullscreen"
          >
            <Maximize2Icon
              className="size-5 transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transform-none"
              aria-hidden="true"
            />
            {t("common.fullscreen")}
          </Button>
          {isPickerPage && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleMusic}
              className="size-14 rounded-full border-2 border-general-purple/60 bg-general-purple/10 text-general-purple shadow-md shadow-general-purple/15 hover:border-general-purple hover:bg-general-purple hover:text-white"
              aria-label={isMusicPlaying ? t("games.turnMusicOff") : t("games.turnMusicOn")}
              aria-pressed={isMusicPlaying}
              data-testid="games-bgm-toggle"
            >
              {isMusicPlaying ? (
                <Volume2Icon className="size-5" aria-hidden="true" />
              ) : (
                <VolumeXIcon className="size-5" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 xl:grid xl:grid-rows-[1fr] xl:items-stretch xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="h-[65vh] min-h-0 min-w-0 xl:h-full">{children}</div>
        <div className="h-[26rem] min-h-0 xl:h-full">
          <GamesRoomPanel />
        </div>
      </div>
    </PageContainer>
  )
}
