"use client"

import { PageContainer, PageHeader } from "@/components/common/page-header"
import { useT } from "@/i18n"
import { ParticipantsView } from "./participants-view"

export function ParticipantsPageView() {
  const t = useT()

  return (
    <PageContainer>
      <PageHeader
        title={t("nav.participants")}
        description={t("participant.subtitle")}
      />
      <ParticipantsView />
    </PageContainer>
  )
}
