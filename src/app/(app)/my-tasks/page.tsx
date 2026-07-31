import { Suspense } from "react"
import type { Metadata } from "next"

import { MyTasksView } from "@/features/tasks/my-tasks-view"

export const metadata: Metadata = {
  title: "งานของฉัน",
}

export default function MyTasksPage() {
  return (
    <Suspense>
      <MyTasksView />
    </Suspense>
  )
}
