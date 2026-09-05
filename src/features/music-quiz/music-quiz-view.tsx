"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  EyeIcon,
  FlameIcon,
  MusicIcon,
  Music2Icon,
  Music3Icon,
  Music4Icon,
  PlayIcon,
  SparklesIcon,
  Volume2Icon,
  ZapIcon,
} from "lucide-react"
import UseAnimations from "react-useanimations"
import playPause from "react-useanimations/lib/playPause"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { ROUTES } from "@/constants/app"
import { useQuizRoom } from "@/features/games/quiz-room-provider"
import { cn } from "@/lib/utils"
import styles from "./music-quiz.module.css"

type QuizSong = {
  title: string
  artist: string
  category: string
  /** ยังไม่มีไฟล์จริงครบทุกเพลง — เพลงที่ยังไม่ใส่จะเห็น mockup ปกอัลบัมแทน */
  coverUrl?: string
  /** ยังไม่มีไฟล์จริงครบทุกเพลง — ไม่ใส่ค่านี้ไว้จะ fallback เป็นโหมดจำลอง (นับเวลาแต่ไม่มีเสียง) */
  audioUrl?: string
  /** คลิปท่อนฮุกแยกต่างหาก สำหรับเปิดตอนกดเฉลย — ไม่ใส่จะใช้ audioUrl (คลิปช่วงทาย) แทน */
  hookAudioUrl?: string
}

type Difficulty = {
  id: "very-hard" | "hard" | "normal" | "easy"
  label: string
  thaiLabel: string
  seconds: number
  icon: typeof ZapIcon
  /** สีประจำระดับความยาก — ไล่โทนแดง(ยากสุด) → เหลือง → ฟ้า → เขียว(ง่ายสุด) ตาม token สีของระบบ */
  color: string
}

/**
 * ลิสต์เพลงสำหรับกลุ่มอายุ 22–50 — เลือกทีละเพลง เช็คยุคจริงก่อนใส่ทุกเพลง
 * กำลังทยอยเพิ่มทีละยุค ลำดับตรงกับที่จะใส่รูปปกทีหลัง
 */
const QUIZ_SONGS: readonly QuizSong[] = [
  // 90s
  {
    title: "หมอกหรือควัน",
    artist: "เบิร์ด ธงไชย",
    category: "เพลงยุค 90s",
    coverUrl: "/quiz-covers/01.jpg",
    audioUrl: "/quiz-audio/01.m4a",
    hookAudioUrl: "/quiz-audio/01-hook.m4a",
  },
  {
    title: "เจ็บนิดเดียว",
    artist: "นิตยา บุญสูงเนิน",
    category: "เพลงยุค 90s",
    coverUrl: "/quiz-covers/02.jpg",
    audioUrl: "/quiz-audio/02.m4a",
    hookAudioUrl: "/quiz-audio/02-hook.m4a",
  },
  // 2000s
  {
    title: "อกหัก",
    artist: "Bodyslam",
    category: "เพลงยุค 2000s",
    coverUrl: "/quiz-covers/03.jpg",
    audioUrl: "/quiz-audio/03.m4a",
    hookAudioUrl: "/quiz-audio/03-hook.m4a",
  },
  {
    title: "ดวงดาวแห่งรัก",
    artist: "Dr.Fuu",
    category: "เพลงยุค 2000s",
    coverUrl: "/quiz-covers/04.jpg",
    audioUrl: "/quiz-audio/04.m4a",
    hookAudioUrl: "/quiz-audio/04-hook.m4a",
  },
  // Kamikaze
  {
    title: "ไม่ใช่อิจฉา",
    artist: "FFK",
    category: "Kamikaze",
    coverUrl: "/quiz-covers/05.jpg",
    audioUrl: "/quiz-audio/05.m4a",
    hookAudioUrl: "/quiz-audio/05-hook.m4a",
  },
  // ลูกทุ่ง
  {
    title: "แก้บน",
    artist: "ก้านตอง ทุ่งเงิน",
    category: "ลูกทุ่ง",
    coverUrl: "/quiz-covers/06.jpg",
    audioUrl: "/quiz-audio/06.m4a",
    hookAudioUrl: "/quiz-audio/06-hook.m4a",
  },
  {
    title: "ดอกกระเจียวบาน",
    artist: "ก้อง ห้วยไร่",
    category: "ลูกทุ่ง",
    coverUrl: "/quiz-covers/07.jpg",
    audioUrl: "/quiz-audio/07.m4a",
    hookAudioUrl: "/quiz-audio/07-hook.m4a",
  },
  // 2010s
  {
    title: "มันเป็นใคร",
    artist: "POLYCAT",
    category: "เพลงยุค 2010s",
    coverUrl: "/quiz-covers/08.jpg",
    audioUrl: "/quiz-audio/08.m4a",
    hookAudioUrl: "/quiz-audio/08-hook.m4a",
  },
  // 2020s
  {
    title: "ที่คั่นหนังสือ",
    artist: "BOWKYLION Ft. NONT TANONT",
    category: "เพลงยุค 2020s",
    coverUrl: "/quiz-covers/09.jpg",
    audioUrl: "/quiz-audio/09.m4a",
    hookAudioUrl: "/quiz-audio/09-hook.m4a",
  },
  // สากล
  {
    title: "Die With A Smile",
    artist: "Lady Gaga, Bruno Mars",
    category: "สากล",
    coverUrl: "/quiz-covers/10.jpg",
    audioUrl: "/quiz-audio/10.m4a",
    hookAudioUrl: "/quiz-audio/10-hook.m4a",
  },
]

/** มุม, ไอคอน, ขนาดคละกันไป — ตัวเดียวกันซ้ำทุกทิศแล้วดูจืด จึงสลับหน้าตา/ขนาดตัวโน้ตแต่ละทิศ */
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

const DIFFICULTIES: readonly Difficulty[] = [
  { id: "very-hard", label: "VERY HARD", thaiLabel: "ฟัง 1 วินาที", seconds: 1, icon: ZapIcon, color: "#f49a7f" },
  { id: "hard", label: "HARD", thaiLabel: "ฟัง 3 วินาที", seconds: 3, icon: FlameIcon, color: "#ffcf49" },
  { id: "normal", label: "NORMAL", thaiLabel: "ฟัง 10 วินาที", seconds: 10, icon: Music2Icon, color: "#a3defe" },
  { id: "easy", label: "EASY", thaiLabel: "ฟัง 15 วินาที", seconds: 15, icon: SparklesIcon, color: "#73bfa3" },
]

/**
 * สีประจำหมวดหมู่เพลง — ใช้ย้อมพื้นหลัง/กรอบรูปปกตอนเฉลย แต่ละหมวดสีไม่ซ้ำกันเลย ไล่โทน
 * ให้พอเดาความรู้สึกของยุค/แนวเพลงนั้นได้คร่าว ๆ:
 * 90s ม่วง (คลาสสิก) → 2000s ฟ้า (มิลเลนเนียม) → Kamikaze ชมพู (ป็อปวัยรุ่นจัดจ้าน)
 * → ลูกทุ่ง เขียว (ธรรมชาติ) → 2010s เหลือง (สดใส) → 2020s ส้ม (ทันสมัย) → สากล ฟ้าอมเขียว (สากล/มหาสมุทร)
 */
const CATEGORY_ACCENTS: Record<string, string> = {
  "เพลงยุค 90s": "#7b69cc",
  "เพลงยุค 2000s": "#a3defe",
  Kamikaze: "#e685c2",
  ลูกทุ่ง: "#73bfa3",
  "เพลงยุค 2010s": "#ffcf49",
  "เพลงยุค 2020s": "#ff9f5a",
  สากล: "#5ac8d8",
}
const DEFAULT_CATEGORY_ACCENT = "#73bfa3"

function getCategoryAccent(category: string) {
  return CATEGORY_ACCENTS[category] ?? DEFAULT_CATEGORY_ACCENT
}

const CONFETTI_COLORS = ["#a3defe", "#73bfa3", "#f49a7f", "#ffcf49", "#7b69cc", "#f2f2f0"]

/**
 * คอนเฟตตี้ตกต่อเนื่อง (ไม่ใช่ระเบิดครั้งเดียว) จนกว่าจะออกจากรอบเฉลย — ค่าตายตัวจาก index
 * (ไม่ใช้ Math.random กันผลเพี้ยนระหว่าง render) delay ต่างกันทำให้แต่ละชิ้นไม่ตกพร้อมกัน
 * เป็นจังหวะเดียวซ้ำ ๆ
 */
const CONFETTI_PIECES = Array.from({ length: 16 }, (_, index) => ({
  left: (index * 37) % 100,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  delayMs: (index * 173) % 1800,
  durationMs: 2800 + ((index * 61) % 1400),
  rotate: (index * 47) % 360,
  drift: (index % 2 === 0 ? 1 : -1) * (12 + ((index * 13) % 34)),
}))

const MAX_ROUNDS = 10

/** กดเฉลยแล้วเปิดเพลงเต็มที่ 15 วิ ให้ทุกคนได้ฟังจริง ๆ ว่าใช่เพลงที่ทายไหม ไม่ผูกกับความยากที่เลือกไว้ก่อนหน้า */
const REVEAL_SECONDS = 15

const WAVE_HEIGHTS = [
  "h-5", "h-11", "h-7", "h-14", "h-9", "h-16", "h-8", "h-12",
  "h-6", "h-15", "h-10", "h-18", "h-8", "h-13", "h-5", "h-16",
  "h-9", "h-12", "h-7", "h-14", "h-10", "h-17", "h-6", "h-11",
] as const

/**
 * เดิมทุกแท่งใช้ animation ตัวเดียวกันเป๊ะ (620ms พร้อมกันหมด) เลยดูเหมือนแท่งเดียว
 * กระพือ ไม่เหมือนคลื่นเสียงเพลงจริงที่แต่ละความถี่ขึ้นลงไม่พร้อมกัน — สุ่ม delay/duration/
 * ระยะยุบต่อแท่งแบบตายตัว (ไม่ใช้ Math.random จริงเพื่อกันผลลัพธ์เพี้ยนระหว่าง render)
 * ให้แต่ละแท่งจังหวะไม่ตรงกันแทน
 */
const WAVE_BARS = WAVE_HEIGHTS.map((height, index) => ({
  height,
  delayMs: (index * 137) % 640,
  durationMs: 420 + ((index * 53) % 280),
  minScale: 0.22 + ((index * 31) % 30) / 100,
}))

function formatTime(seconds: number) {
  return `0:${String(seconds).padStart(2, "0")}`
}

const ARTIST_MIN_PX = 16
const ARTIST_MAX_PX = 40
const TITLE_MIN_PX = 28
const TITLE_MAX_PX = 92

/**
 * ลดขนาดตัวอักษรชื่อเพลง/ศิลปินอัตโนมัติจนจบภายในบรรทัดเดียว — ชื่อเพลง/วง/ฟีเจอริ่งบางชื่อยาวมาก
 * (เช่น "BOWKYLION Ft. NONT TANONT") ใช้แค่ clamp(cqw) ของ CSS ไม่พอเพราะไม่รู้ความยาวข้อความจริง
 * จึงวัดความกว้างด้วย canvas แล้วลดขนาดทีละ 1px จนพอดีกล่อง — ข้อความสั้นได้ตัวใหญ่เต็ม max,
 * ข้อความยาวค่อยลดลงจนพอดี ไม่มีตัดคำ (ellipsis) หรือขึ้นบรรทัดใหม่เด็ดขาด
 */
function useFitOneLine(
  ref: React.RefObject<HTMLParagraphElement | null>,
  text: string,
  active: boolean,
  { minPx, maxPx, weight }: { minPx: number; maxPx: number; weight: number }
) {
  const [fontSize, setFontSize] = React.useState(maxPx)

  React.useLayoutEffect(() => {
    // active สลับ false→true ตอนแผงเฉลย mount — ต้องอยู่ใน deps เอง
    // ไม่งั้น effect นี้จะไม่รันซ้ำตอน ref เพิ่งผูกกับ DOM จริง (ref ว่างตอนรอบก่อนเฉลย)
    if (!active) return
    const el = ref.current
    if (!el) return

    const measure = () => {
      // เผื่อ margin ปลอดภัยจากความคลาดเคลื่อนเล็กน้อยระหว่างที่ canvas วัดกับที่เบราว์เซอร์
      // เรนเดอร์จริง (sub-pixel/hinting) — ไม่งั้นตัวท้ายสุดอาจโดน overflow-x:hidden ตัดไปนิดนึง
      const width = el.clientWidth * 0.97
      if (width <= 0) return
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // ต้องใช้ font-family เดียวกับที่ element เรนเดอร์จริง (LINE Seed Sans TH) ไม่ใช่
      // system-ui — ฟอนต์ไทยความกว้างตัวอักษรต่างจาก system-ui เยอะ วัดด้วยฟอนต์ผิดพลาด
      // ทำให้เข้าใจว่าตัวอักษรแคบกว่าจริง เลือกไซซ์ใหญ่เกิน แล้วโดนตัดท้ายตอนเรนเดอร์จริง
      const fontFamily = getComputedStyle(el).fontFamily || "system-ui, sans-serif"

      // minPx เป็นแค่ขนาดที่ "อยากได้" ไม่ใช่ขีดจำกัดที่หยุดแล้วปล่อยล้น — ชื่อเพลง/ศิลปิน
      // ยาวมากบางชื่อ (เช่น "BOWKYLION Ft. NONT TANONT") ยังไม่พอดีที่ minPx ในกล่องแคบ
      // ต้องยอมเล็กกว่า minPx ต่อไปจนกว่าจะพอดีจริง ห้ามล้นเด็ดขาดดีกว่าห้ามเล็กเกินไป
      let size = maxPx
      while (size > 8) {
        ctx.font = `${weight} ${size}px ${fontFamily}`
        if (ctx.measureText(text).width <= width) break
        size -= 1
      }
      setFontSize(size)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, text, active, minPx, maxPx, weight])

  return fontSize
}

/** การ์ดโฮสต์: เลือกเวลาของอินโทร แล้วผู้เล่นพิมพ์ชื่อเพลงจากมือถือ */
export function MusicQuizView() {
  const [roundIndex, setRoundIndex] = React.useState(0)
  const [difficulty, setDifficulty] = React.useState<Difficulty | null>(null)
  const [elapsedMs, setElapsedMs] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [revealed, setRevealed] = React.useState(false)
  const [notesPhase, setNotesPhase] = React.useState<"hidden" | "active" | "fading">("hidden")
  const [playCount, setPlayCount] = React.useState(0)

  const { publishRound } = useQuizRoom()
  const song = QUIZ_SONGS[roundIndex % QUIZ_SONGS.length]
  const isLastRound = roundIndex >= MAX_ROUNDS - 1
  const nextSong = QUIZ_SONGS[(roundIndex + 1) % QUIZ_SONGS.length]
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const hookAudioRef = React.useRef<HTMLAudioElement>(null)
  const fadeFrameRef = React.useRef<number | null>(null)
  const titleRef = React.useRef<HTMLParagraphElement>(null)
  const artistRef = React.useRef<HTMLParagraphElement>(null)
  const titleFontSize = useFitOneLine(titleRef, song.title, revealed, { minPx: TITLE_MIN_PX, maxPx: TITLE_MAX_PX, weight: 700 })
  const artistFontSize = useFitOneLine(artistRef, song.artist, revealed, { minPx: ARTIST_MIN_PX, maxPx: ARTIST_MAX_PX, weight: 600 })
  const duration = revealed ? REVEAL_SECONDS : (difficulty?.seconds ?? 0)
  const progress = duration > 0 ? Math.min(100, (elapsedMs / (duration * 1000)) * 100) : 0
  const secondsLeft = duration > 0 ? Math.max(0, Math.ceil(duration - elapsedMs / 1000)) : 0

  /**
   * เดิมกดเล่น/หมดเวลาแล้วเสียงมากระแทกทันที (volume 1 ตั้งแต่เฟรมแรก / หยุดดื้อ ๆ)
   * ไล่ volume ขึ้น-ลงเองด้วย rAF แทน เพราะ HTMLMediaElement ไม่มี fade ในตัว — ระยะเวลา fade
   * ผูกกับความยาวของช่วงที่กำลังเล่นอยู่ (ไม่เกินครึ่งนึงของ duration) กันเพลงสั้นมาก ๆ
   * อย่าง VERY_HARD (1 วิ) โดน fade กินเวลาเกินความยาวจริงของคลิป
   */
  const fadeVolume = React.useCallback((audio: HTMLAudioElement, to: number, ms: number) => {
    if (fadeFrameRef.current !== null) cancelAnimationFrame(fadeFrameRef.current)
    const from = audio.volume
    const startedAt = performance.now()

    const step = (now: number) => {
      /**
       * timestamp ที่ rAF ส่งมาบางทีมาก่อน performance.now() ที่จับไว้ตอน schedule
       * (เฟรมแรกสุด) ทำให้ (now - startedAt) ติดลบได้ — ไม่ clamp ขั้นต่ำไว้ volume
       * จะหลุดช่วง [0,1] แล้ว throw IndexSizeError ทันที
       */
      const t = ms <= 0 ? 1 : Math.max(0, Math.min(1, (now - startedAt) / ms))
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * t))
      fadeFrameRef.current = t < 1 ? requestAnimationFrame(step) : null
    }

    fadeFrameRef.current = requestAnimationFrame(step)
  }, [])

  const getFadeMs = (durationSeconds: number) => Math.min(1200, (durationSeconds * 1000) / 2)

  /**
   * ขับด้วย requestAnimationFrame อิงเวลาจริงที่ผ่านไป แทน setInterval ทีละ 1 วินาที —
   * แผ่นเสียง/แท่งคลื่นเสียงหยุดทันทีตอน isPlaying เป็น false โดยไม่มี transition ค้าง
   * ถ้า progress bar ยังขยับตาม CSS transition ต่ออีก 1 วินาทีหลังจากนั้นจะดูจบไม่พร้อมกัน
   * จึงต้องอัปเดตค่าเองทุกเฟรมแล้วปิด transition ของ Progress ไปเลย (ดู indicatorClassName ด้านล่าง)
   */
  React.useEffect(() => {
    if (!isPlaying) return

    const durationMs = duration * 1000
    const fadeOutMs = getFadeMs(duration)
    const startedAt = performance.now()
    let frameId: number
    let fadeOutStarted = false

    const tick = () => {
      const elapsed = performance.now() - startedAt
      if (elapsed >= durationMs) {
        setElapsedMs(durationMs)
        setIsPlaying(false)
        return
      }
      if (!fadeOutStarted && elapsed >= durationMs - fadeOutMs) {
        fadeOutStarted = true
        const activeAudio = revealed ? (hookAudioRef.current ?? audioRef.current) : audioRef.current
        if (activeAudio) fadeVolume(activeAudio, 0, fadeOutMs)
      }
      setElapsedMs(elapsed)
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, duration, revealed, fadeVolume])

  /**
   * เล่นเสียงจริงตาม isPlaying — ตัวจับเวลาด้านบน (RAF) ยังเป็นตัวคุมจังหวะหลักเหมือนเดิม
   * (ตัดจบตาม duration ของแต่ละระดับความยาก) เสียงแค่เล่นตามให้ตรงกัน เพลงที่ยังไม่มีไฟล์จริง
   * (audioUrl ว่าง) จะ fallback เป็นโหมดจำลองแบบเดิม นับเวลาแต่ไม่มีเสียง
   *
   * ช่วงทาย (ยังไม่เฉลย) เล่นจาก audioRef (คลิปช่วงต้น/เนื้อเพลงปกติ) ส่วนตอนเฉลยสลับไปเล่น
   * hookAudioRef (คลิปท่อนฮุกแยกต่างหาก) แทน — ถ้าเพลงนั้นยังไม่มีคลิปฮุก จะ fallback ไปเล่น
   * audioRef ตัวเดิมต่อ ไม่ใช่เงียบไปเฉย ๆ
   *
   * มี revealed เป็น dependency เพิ่ม — ตอนกดเฉลยกลางคันที่เพลงเล่นอยู่แล้ว (isPlaying เดิม
   * เป็น true อยู่ก่อน) ค่า isPlaying ไม่เปลี่ยนเลย effect นี้จะไม่รันซ้ำถ้าไม่มี revealed
   * คอยจับ ทำให้เสียงเล่นต่อจากตรงกลางแทนที่จะเริ่มใหม่ตั้งแต่ต้นเพลงตอนเฉลย
   */
  React.useEffect(() => {
    const previewAudio = audioRef.current
    const hookAudio = hookAudioRef.current
    const activeAudio = revealed ? (hookAudio ?? previewAudio) : previewAudio
    const inactiveAudio = revealed ? previewAudio : hookAudio

    inactiveAudio?.pause()
    if (!activeAudio) return

    if (isPlaying) {
      activeAudio.currentTime = 0
      activeAudio.volume = 0
      void activeAudio.play().catch(() => {})
      fadeVolume(activeAudio, 1, getFadeMs(duration))
    } else {
      activeAudio.pause()
    }
  }, [isPlaying, revealed, duration, song.audioUrl, song.hookAudioUrl, fadeVolume])

  /**
   * ตัวโน้ตหยุดพุ่งตอนฟังจบ — เดิม unmount ทันทีตาม isPlaying ทำให้หายวับกลางอากาศ
   * เลยแยกเป็น "fading" ก่อน (เฟด opacity ทั้งชั้นให้เนียน) แล้วค่อย unmount จริงทีหลัง
   *
   * เดิมใช้ useEffect คอย sync notesPhase ตาม isPlaying แต่ setState ตรง ๆ ใน effect
   * body ทำให้ React ต้อง render ซ้ำอีกรอบเสมอ (cascading render) — ย้ายมาคำนวณระหว่าง
   * render แทน (เทียบกับค่า isPlaying ของรอบก่อนหน้าที่เก็บไว้) ตาม pattern ที่ React
   * แนะนำสำหรับ "ปรับ state ตอน prop เปลี่ยน" (react.dev/learn/you-might-not-need-an-effect)
   */
  const [prevIsPlaying, setPrevIsPlaying] = React.useState(isPlaying)
  if (isPlaying !== prevIsPlaying) {
    setPrevIsPlaying(isPlaying)
    if (isPlaying) {
      setNotesPhase("active")
    } else if (notesPhase === "active") {
      setNotesPhase("fading")
    }
  }

  React.useEffect(() => {
    if (notesPhase !== "fading") return
    const timer = setTimeout(() => setNotesPhase("hidden"), 450)
    return () => clearTimeout(timer)
  }, [notesPhase])

  React.useEffect(() => {
    publishRound({
      index: roundIndex,
      durationSeconds: duration,
      open: isPlaying && !revealed,
      answer: song.title,
    })
  }, [duration, isPlaying, publishRound, revealed, roundIndex, song.title])

  // กดได้เรื่อย ๆ ไม่จำกัดจำนวนครั้งจนกว่าจะกดเฉลย — สลับความยาวหรือฟังซ้ำได้ตลอด
  const playDifficulty = (nextDifficulty: Difficulty) => {
    if (revealed) return
    setDifficulty(nextDifficulty)
    setElapsedMs(0)
    setIsPlaying(true)
    setPlayCount((count) => count + 1)
  }

  // เดิมทำผ่าน useEffect ที่คอยดัก revealed เปลี่ยนเป็น true แล้วค่อยยิง setState ตาม
  // แต่ revealed ถูกตั้งเป็น true จากจุดนี้จุดเดียวในทั้งไฟล์ — ย้ายมาไว้ในตัวจัดการคลิกตรง ๆ
  // ได้เลย ไม่ต้องผ่าน effect กันคนละรอบ render (เล่นเพลงเต็ม 15 วิ + แผ่นเสียงหมุนต่อ)
  const revealAnswer = () => {
    setRevealed(true)
    setElapsedMs(0)
    setIsPlaying(true)
  }

  const nextRound = () => {
    if (isLastRound) return
    setRoundIndex((current) => current + 1)
    setDifficulty(null)
    setElapsedMs(0)
    setIsPlaying(false)
    setRevealed(false)
  }

  const selectRound = (index: number) => {
    setRoundIndex(index)
    setDifficulty(null)
    setElapsedMs(0)
    setIsPlaying(false)
    setRevealed(false)
  }

  return (
    <Card className={cn(styles.card, "h-full border-white/15 text-white shadow-2xl shadow-black/25")} data-testid="music-quiz-page">
      <CardContent className="relative z-10 flex h-full min-h-0 flex-col overflow-y-auto p-5 sm:p-7">
        {song.audioUrl ? (
          <audio ref={audioRef} src={song.audioUrl} preload="auto" className="sr-only" data-testid="music-quiz-audio" />
        ) : null}
        {song.hookAudioUrl ? (
          <audio ref={hookAudioRef} src={song.hookAudioUrl} preload="auto" className="sr-only" data-testid="music-quiz-hook-audio" />
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-white hover:bg-white/10 hover:text-white">
            <Link href={ROUTES.games}>
              <ChevronLeftIcon className="size-4" aria-hidden="true" />
              กลับไปเลือกเกมส์
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-sm text-white/80 hover:bg-white/12"
                data-testid="music-quiz-round-trigger"
              >
                <span className="bg-general-green size-2 rounded-full" aria-hidden="true" />
                รอบ {String(roundIndex + 1).padStart(2, "0")}
                <ChevronDownIcon className="size-3.5 text-white/60" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {QUIZ_SONGS.slice(0, MAX_ROUNDS).map((quizSong, index) => (
                <DropdownMenuItem
                  key={quizSong.title}
                  onSelect={() => selectRound(index)}
                  className={cn("justify-center py-1.5 text-sm text-white", index === roundIndex && "bg-white/10")}
                  data-testid={`music-quiz-round-option-${index}`}
                >
                  รอบ {String(index + 1).padStart(2, "0")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="my-auto grid gap-7 py-6 lg:grid-cols-[minmax(12rem,0.72fr)_minmax(0,1.28fr)] lg:items-center">
          <section className="flex min-w-0 flex-col items-center text-center">
            <div className={cn(styles.coverStage, "w-full flex justify-center")} style={{ "--category-accent": getCategoryAccent(song.category) } as React.CSSProperties}>
              {notesPhase !== "hidden" ? (
                <div className={cn(styles.notes, notesPhase === "fading" && styles.notesFading)} aria-hidden="true">
                  {NOTE_ITEMS.map(({ angle, icon: NoteIcon, scale }, index) => (
                    <span
                      key={angle}
                      className={styles.noteOrbit}
                      style={{
                        "--note-angle": `${angle}deg`,
                        "--note-scale": scale,
                        animationDelay: `${index * 0.2}s`,
                      } as React.CSSProperties}
                    >
                      <NoteIcon className={styles.noteIcon} />
                    </span>
                  ))}
                </div>
              ) : null}
              <div className={cn(styles.cover, isPlaying && styles.coverPlaying)} aria-hidden="true">
                <div className={styles.record}><Volume2Icon className="relative z-10 size-9 text-white" /></div>
              </div>
            </div>
            <p className="mt-6 text-base font-medium text-white/58">MUSIC GUESSING GAME</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">ทายชื่อเพลง</h1>
          </section>

          <section
            className="min-w-0"
            aria-labelledby={revealed ? undefined : "difficulty-heading"}
            aria-label={revealed ? "เฉลยเพลง" : undefined}
          >
            <div className="mb-5 flex justify-center">
              <span
                className={styles.categoryBadge}
                style={{ "--category-accent": getCategoryAccent(song.category) } as React.CSSProperties}
                data-testid="music-quiz-category"
              >
                <span className={styles.categoryBadgeIcon} aria-hidden="true"><Music2Icon /></span>
                {song.category}
              </span>
            </div>
            {/*
              การ์ดตัวเลือกความยากกับการ์ดเฉลยเมาท์ค้างไว้ทั้งคู่เสมอ ซ้อนกันในกริดเซลล์
              เดียวกัน (.panelStack) แล้วสลับด้วย visibility แทน conditional mount — ความสูง
              ของเซลล์เลยเท่ากับตัวที่สูงที่สุดในสองใบเสมอ (ไม่ใช่แค่ min-height ที่ตั้งเท่ากัน
              ซึ่งเนื้อหาจริงอาจสูงเกินได้) ป้ายยุคเพลงด้านบนเลยไม่ขยับตอนสลับก่อน/หลังเฉลย
              ส่วนคอนเฟตตี้/ข้อความเด้ง ยังรีสตาร์ททุกรอบผ่าน key={roundIndex} ที่ห่อไว้ข้างใน
            */}
            <div className={styles.panelStack}>
              <div
                className={cn(styles.pickerPanel, revealed && "invisible")}
                aria-hidden={revealed}
              >
                {/*
                  ป้ายเวลา (0:00 / 0:10) เดิม mount/unmount ตาม difficulty ทำให้ข้อความ
                  "ยิ่งฟังสั้น ยิ่งทายยาก" ที่อยู่แถวเดียวกันโดนแย่งพื้นที่จนตัดบรรทัดตอนโผล่มา
                  แถวทั้งก้อนเลยสูงขึ้นกะทันหัน — เก็บป้ายนี้ไว้ในเลย์เอาต์ตลอด แค่สลับ
                  visibility แทน ความกว้าง/สูงเลยคงที่ไม่ขยับ
                */}
                <div className="mb-3">
                  <p id="difficulty-heading" className="text-sm font-semibold text-white">เลือกความยาก</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-xs text-white/55">ยิ่งฟังสั้น ยิ่งทายยาก</p>
                    <span
                      className={cn("text-general-blue shrink-0 text-xs font-semibold tabular-nums", !difficulty && "invisible")}
                      data-testid="music-quiz-timer"
                    >
                      {formatTime(secondsLeft)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2" data-testid="music-quiz-difficulties">
                  {DIFFICULTIES.map((item) => {
                    const Icon = item.icon
                    const isSelected = difficulty?.id === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => playDifficulty(item)}
                        disabled={revealed}
                        className={cn(styles.difficultyButton, isSelected && styles.difficultyButtonSelected)}
                        style={{ "--difficulty-color": item.color } as React.CSSProperties}
                        data-testid={`music-quiz-difficulty-${item.id}`}
                        aria-label={`${item.label}, ${item.thaiLabel}`}
                      >
                        <span className={styles.difficultyIcon} aria-hidden="true"><Icon className="size-5" /></span>
                        <span className="min-w-0 text-left">
                          <span className="block text-base font-extrabold tracking-wide whitespace-nowrap sm:text-lg">{item.label}</span>
                          <span className={cn(styles.difficultySubLabel, "mt-0.5 block text-base font-semibold")}>{item.thaiLabel}</span>
                        </span>
                        {isSelected && isPlaying ? (
                          // ปุ่มที่กำลังเล่นอยู่ — มอร์ฟไอคอนเล่น→หยุดด้วย react-useanimations แทนไอคอนนิ่ง
                          // remount ทุกครั้งที่กดฟังรอบใหม่ (roundIndex เปลี่ยน หรือกดฟังซ้ำ) ด้วย
                          // key ผูกกับ playCount กันไอคอนค้างท่าเดิมตอนกดฟังซ้ำความยากเดิม
                          <UseAnimations
                            key={`${item.id}-${roundIndex}-${playCount}`}
                            animation={playPause}
                            reverse
                            autoplay
                            size={20}
                            strokeColor="#f2f2f0"
                            wrapperStyle={{ marginLeft: "auto", flexShrink: 0 }}
                          />
                        ) : (
                          <PlayIcon className={cn(styles.difficultyPlayIcon, "ml-auto size-5 shrink-0")} aria-hidden="true" />
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/16 p-4">
                  <div className={cn(styles.wave, isPlaying && styles.wavePlaying)} aria-hidden="true">
                    {WAVE_BARS.map(({ height, delayMs, durationMs, minScale }, index) => (
                      <span
                        key={index}
                        className={cn(styles.waveBar, height)}
                        style={{
                          animationDelay: `${delayMs}ms`,
                          animationDuration: `${durationMs}ms`,
                          "--bar-min": minScale,
                        } as React.CSSProperties}
                      />
                    ))}
                  </div>
                  <Progress
                    value={progress}
                    aria-label="เวลาที่ผ่านไปของตัวอย่างเพลง"
                    className="mt-2 h-2 bg-white/12 [&>div]:bg-general-blue"
                    indicatorClassName="duration-0"
                  />
                </div>
              </div>

              <div
                className={cn(styles.revealPanel, !revealed && "invisible")}
                style={{ "--reveal-accent": getCategoryAccent(song.category) } as React.CSSProperties}
                aria-hidden={!revealed}
                data-testid="music-quiz-reveal-panel"
              >
                {revealed ? (
                  <React.Fragment key={roundIndex}>
                    <div className={styles.confettiLayer} aria-hidden="true">
                      {CONFETTI_PIECES.map((piece, index) => (
                        <span
                          key={index}
                          className={styles.confettiPiece}
                          style={{
                            left: `${piece.left}%`,
                            background: piece.color,
                            animationDelay: `${piece.delayMs}ms`,
                            animationDuration: `${piece.durationMs}ms`,
                            "--confetti-rotate": `${piece.rotate}deg`,
                            "--confetti-drift": `${piece.drift}px`,
                          } as React.CSSProperties}
                        />
                      ))}
                    </div>
                    <div className={styles.revealMain}>
                      <div className={styles.revealCover}>
                        {song.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- ปกอัลบัมมาจาก URL ที่ผู้ใช้เพิ่มเอง ไม่ใช่ asset ในโปรเจกต์
                          <img
                            src={song.coverUrl}
                            alt=""
                            className={styles.revealCoverImage}
                          />
                        ) : (
                          <Music2Icon className={styles.revealCoverIcon} aria-hidden="true" />
                        )}
                      </div>
                      <div className={styles.revealText}>
                        <p className={cn(styles.revealLabel, styles.revealPop)} style={{ animationDelay: "0ms" }}>เฉลย</p>
                        <p
                          ref={titleRef}
                          className={cn(styles.revealTitle, styles.revealPop)}
                          style={{ fontSize: titleFontSize, animationDelay: "90ms" }}
                          data-testid="music-quiz-answer"
                        >
                          {song.title}
                        </p>
                        <p
                          ref={artistRef}
                          className={cn(styles.revealArtist, styles.revealPop)}
                          style={{ fontSize: artistFontSize, animationDelay: "180ms" }}
                          data-testid="music-quiz-answer-artist"
                        >
                          {song.artist}
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                ) : null}
              </div>
            </div>

            {/* ปุ่มหลักอยู่นอกกรอบการ์ด (ไม่ใช่ในกรอบเฉลย/กรอบตัวเลือก) — ช่องเดียวสลับเนื้อหา
                ตามสถานะ แต่เมาท์ค้างไว้ตลอดกันการ์ดขยับตอนปุ่มโผล่/สลับข้อความ */}
            <div className={cn("flex justify-center", !difficulty && !revealed && "invisible")}>
              {revealed ? (
                isLastRound ? (
                  <Link href={ROUTES.games} className={styles.primaryCta} data-testid="music-quiz-back-to-games">
                    <ArrowRightIcon className="size-5" aria-hidden="true" />
                    กลับไปเลือกเกมส์
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={nextRound}
                    className={styles.primaryCta}
                    style={{ "--cta-accent": getCategoryAccent(nextSong.category) } as React.CSSProperties}
                    data-testid="music-quiz-next-round"
                  >
                    <ArrowRightIcon className="size-5" aria-hidden="true" />
                    รอบถัดไป
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={revealAnswer}
                  disabled={!difficulty}
                  className={styles.primaryCta}
                  data-testid="music-quiz-reveal"
                >
                  <EyeIcon className="size-5" aria-hidden="true" />
                  เฉลย
                </button>
              )}
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
