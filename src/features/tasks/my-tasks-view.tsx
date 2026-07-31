"use client"

import { useSearchParams } from "next/navigation"

import { PageContainer, PageHeader } from "@/components/common/page-header"
import { useT } from "@/i18n"
import { TasksView } from "./tasks-view"

export function MyTasksView() {
  const t = useT()
  const searchParams = useSearchParams()
  const isTeamScope = searchParams.get("scope") === "all"

  return (
    <PageContainer>
      <PageHeader
        title={t("nav.myTasks")}
        description={isTeamScope ? t("task.subtitleAll") : t("task.subtitle")}
      />
      <TasksView />
    </PageContainer>
  )
}
