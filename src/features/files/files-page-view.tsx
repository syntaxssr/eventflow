"use client"

import { PageContainer, PageHeader } from "@/components/common/page-header"
import { useT } from "@/i18n"
import { FilesView } from "./files-view"

export function FilesPageView() {
  const t = useT()

  return (
    <PageContainer>
      <PageHeader title={t("nav.files")} description={t("file.subtitle")} />
      <FilesView />
    </PageContainer>
  )
}
