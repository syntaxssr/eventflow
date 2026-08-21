"use client"

import { PageContainer } from "@/components/common/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { TasksView } from "./tasks-view"

export function MyTasksView() {
  return (
    <PageContainer>
      <Card>
        <CardContent className="[&_[data-slot=task-table]]:rounded-none [&_[data-slot=task-table]]:border-0">
          <TasksView />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
