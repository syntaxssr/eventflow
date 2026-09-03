"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  Clock3Icon,
  Maximize2Icon,
  Minimize2Icon,
  Music2Icon,
} from "lucide-react"

import { PageContainer } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"
import { usePresentationMode } from "./presentation-mode-provider"

const COMING_SOON_CARD_COUNT = 6

export function GamesPageView() {
  const t = useT()
  const { presentationMode, openPresentationMode, closePresentationMode } =
    usePresentationMode()

  return (
    <PageContainer className="px-0 pt-0 pb-0 sm:px-0 sm:pb-0 lg:px-0 lg:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          asChild
          variant="ghost"
          size={presentationMode ? "lg" : "default"}
          data-testid="games-back"
        >
          <Link
            href={ROUTES.dashboard}
            // ยังอยู่ในเต็มจอจริงของเบราว์เซอร์อยู่ ต้องปิดก่อนออกจากหน้า ไม่งั้นค้างเต็มจอไปหน้าอื่นด้วย
            onClick={presentationMode ? closePresentationMode : undefined}
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
            {t("state.backToDashboard")}
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size={presentationMode ? "lg" : "sm"}
          className="ml-auto"
          onClick={presentationMode ? closePresentationMode : openPresentationMode}
          data-testid="games-fullscreen"
        >
          {presentationMode ? (
            <Minimize2Icon className="size-4" aria-hidden="true" />
          ) : (
            <Maximize2Icon className="size-4" aria-hidden="true" />
          )}
          {presentationMode ? t("common.exitFullscreen") : t("common.fullscreen")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link
          href={ROUTES.musicQuiz}
          className="focus-visible:ring-ring group rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Card className="h-full min-h-44 ring-general-purple/25 transition-[transform,box-shadow,--tw-ring-color] group-hover:-translate-y-0.5 group-hover:ring-general-purple/60 group-hover:shadow-md">
            <CardContent className="flex h-full flex-col justify-between gap-6">
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
            </CardContent>
          </Card>
        </Link>

        {Array.from({ length: COMING_SOON_CARD_COUNT }, (_, index) => (
          <Card
            key={index}
            className="bg-muted/30 min-h-44 border-dashed opacity-70"
          >
            <CardContent className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Clock3Icon
                className="text-muted-foreground size-7"
                aria-hidden="true"
              />
              <Badge variant="secondary">{t("games.comingSoon")}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
