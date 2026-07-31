"use client"

import { PageContainer, PageHeader } from "@/components/common/page-header"
import { useT } from "@/i18n"
import { TimelineView } from "./timeline-view"

export function TimelinePageView() {
  const t = useT()

  return (
    <PageContainer>
      <PageHeader
        title={t("nav.timeline")}
        description={t("timeline.subtitle")}
      />
      <TimelineView />
    </PageContainer>
  )
}
