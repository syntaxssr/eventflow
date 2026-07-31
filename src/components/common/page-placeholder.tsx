"use client"

import { HardHatIcon } from "lucide-react"

import { PageContainer, PageHeader } from "@/components/common/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { useT } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"

/**
 * หน้าจอชั่วคราวสำหรับเส้นทางที่ยังพัฒนาไม่ถึง
 * มีอยู่เพื่อให้ทุก route ในเมนูเปิดได้จริงตั้งแต่ Phase 1
 */
export function PagePlaceholder({
  titleKey,
  phase,
}: {
  titleKey: TranslationKey
  phase: string
}) {
  const t = useT()

  return (
    <PageContainer>
      <PageHeader title={t(titleKey)} />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <div
            className="bg-brand-50 text-brand-900 flex size-14 items-center justify-center rounded-full"
            aria-hidden="true"
          >
            <HardHatIcon className="size-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold">
              {t("page.comingSoonTitle")}
            </h2>
            <p className="text-muted-foreground mx-auto max-w-md text-sm text-pretty">
              {t("page.comingSoonDescription")}
            </p>
          </div>
          <p className="text-muted-foreground bg-muted rounded-full px-3 py-1 font-mono text-xs">
            {t("page.comingSoonPhase", { phase })}
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
