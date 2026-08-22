"use client"

import { PageContainer, PageHeader } from "@/components/common/page-header"
import { useT } from "@/i18n"
import { EmployeesView } from "./employees-view"

export function EmployeesPageView() {
  const t = useT()

  return (
    <PageContainer>
      <PageHeader
        title={t("employee.title")}
        description={t("employee.subtitle")}
      />
      <EmployeesView />
    </PageContainer>
  )
}
