"use client"

import { cn } from "@/lib/utils"
import { GamesRoomPanel } from "./games-room-panel"
import { usePresentationMode } from "./presentation-mode-provider"

/** โครงตาราง 2 การ์ดของโซนเกมส์ — สลับเป็น overlay เต็มจอตอนเปิดโหมดนำเสนอ */
export function GamesLayoutGrid({ children }: { children: React.ReactNode }) {
  const { presentationMode } = usePresentationMode()

  return (
    <div
      className={cn(
        "grid items-start gap-4 px-4 pt-5 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 xl:grid-cols-[minmax(0,1fr)_20rem]",
        presentationMode && "bg-background fixed inset-0 z-50 overflow-y-auto"
      )}
    >
      <div className="min-w-0">{children}</div>
      <GamesRoomPanel />
    </div>
  )
}
