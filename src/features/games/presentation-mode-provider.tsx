"use client"

import * as React from "react"

type PresentationModeContextValue = {
  presentationMode: boolean
  openPresentationMode: () => void
  closePresentationMode: () => void
}

const PresentationModeContext =
  React.createContext<PresentationModeContextValue | null>(null)

/**
 * โหมดเต็มจอของโซนเกมส์ — ครอบทั้งการ์ดเกมและการ์ดคนในห้องพร้อมกัน
 *
 * อยู่บน layout เพราะการ์ดทั้งสองเป็น sibling กัน (เกมอยู่ใน children,
 * คนในห้องอยู่ใน GamesRoomPanel) ต้อง toggle จากจุดร่วมด้านบนเท่านั้น
 */
export function PresentationModeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [presentationMode, setPresentationMode] = React.useState(false)

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setPresentationMode(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && presentationMode && !document.fullscreenElement) {
        setPresentationMode(false)
      }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [presentationMode])

  React.useEffect(() => {
    if (!presentationMode) return

    const root = document.documentElement
    const body = document.body
    const previousRootOverflow = root.style.overflow
    const previousBodyOverflow = body.style.overflow
    const previousOverscrollBehavior = root.style.overscrollBehavior

    root.style.overflow = "hidden"
    body.style.overflow = "hidden"
    root.style.overscrollBehavior = "none"

    return () => {
      root.style.overflow = previousRootOverflow
      body.style.overflow = previousBodyOverflow
      root.style.overscrollBehavior = previousOverscrollBehavior
    }
  }, [presentationMode])

  const value = React.useMemo<PresentationModeContextValue>(
    () => ({
      presentationMode,
      openPresentationMode: () => {
        setPresentationMode(true)
        document.documentElement.requestFullscreen?.().catch(() => {
          // เต็มจอด้วย overlay ยังทำงานต่อได้เมื่อเบราว์เซอร์ไม่อนุญาต Fullscreen API
        })
      },
      closePresentationMode: () => {
        setPresentationMode(false)
        if (document.fullscreenElement) void document.exitFullscreen()
      },
    }),
    [presentationMode]
  )

  return (
    <PresentationModeContext value={value}>{children}</PresentationModeContext>
  )
}

export function usePresentationMode() {
  const context = React.use(PresentationModeContext)
  if (!context) {
    throw new Error("usePresentationMode ต้องอยู่ภายใต้ PresentationModeProvider")
  }
  return context
}
