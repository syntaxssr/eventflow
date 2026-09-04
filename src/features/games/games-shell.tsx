"use client"

import Link from "next/link"
import { ChevronLeftIcon, Maximize2Icon } from "lucide-react"

import { PageContainer } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"
import { cn } from "@/lib/utils"
import { GamesRoomPanel } from "./games-room-panel"
import { usePresentationMode } from "./presentation-mode-provider"

/**
 * โครงของโซนเกมส์ — แถบควบคุมบนสุด, การ์ดเกมซ้าย, การ์ดคนในห้องขวา
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
        <Card className="shrink-0">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="ghost" data-testid="games-back">
              <Link href={ROUTES.dashboard}>
                <ChevronLeftIcon className="size-4" aria-hidden="true" />
                {t("state.backToDashboard")}
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openPresentationMode}
              data-testid="games-fullscreen"
            >
              <Maximize2Icon className="size-4" aria-hidden="true" />
              {t("common.fullscreen")}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid min-h-0 flex-1 grid-rows-[1fr] items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="h-full min-h-0 min-w-0">{children}</div>
        <GamesRoomPanel />
      </div>
    </PageContainer>
  )
}
