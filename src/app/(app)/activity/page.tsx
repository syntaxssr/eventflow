import type { Metadata } from "next"

import { ActivityPageView } from "@/features/activity/activity-page-view"

export const metadata: Metadata = {
  title: "ประวัติการใช้งาน",
}

export default function Page() {
  return <ActivityPageView />
}
