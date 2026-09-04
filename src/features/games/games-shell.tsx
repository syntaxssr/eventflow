"use client"

import { Maximize2Icon } from "lucide-react"

import { PageContainer } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n"
import { cn } from "@/lib/utils"
import { GamesRoomPanel } from "./games-room-panel"
import { usePresentationMode } from "./presentation-mode-provider"

/**
 * โครงของโซนเกมส์ — ปุ่มเต็มจอบนสุด, การ์ดเกมซ้าย, การ์ดคนในห้องขวา
 *
 * การ์ดเกมกับการ์ดคนในห้องสูงเท่าจอเสมอ (ลบความสูง Topbar ของแอป h-14 ออก)
 * ไม่มีการ scroll ทั้งหน้า — เนื้อหาที่ยาวเกินไปต้อง scroll ในการ์ดตัวเอง
 *
 * ปกติตายตัวเสมอไม่ว่าจะเลือกเกมไหน — สลับแค่เนื้อหาในการ์ดเกม (children)
 * ส่วนโหมดเต็มจอซ่อนแถบควบคุมทิ้งไปเลย (เหลือแค่การ์ดเกม+การ์ดคนในห้อง)
 * เพื่อไม่ให้มีปุ่มออกให้กด — ออกจากเต็มจอได้ทางเดียวคือกด Esc เท่านั้น
 */
export function GamesShell({ children }: { children: React.ReactNode }) {
  const t = useT()
  const { presentationMode, openPresentationMode } = usePresentationMode()

  return (
    <PageContainer
      className={cn(
        "flex h-[calc(100dvh-3.5rem)] flex-col space-y-4 overflow-hidden",
        presentationMode && "bg-background fixed inset-0 z-50 h-dvh"
      )}
    >
      {presentationMode ? null : (
        <div className="flex shrink-0 justify-center">
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
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-rows-[1fr] items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="h-full min-h-0 min-w-0">{children}</div>
        <GamesRoomPanel />
      </div>
    </PageContainer>
  )
}
