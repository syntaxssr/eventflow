import type { Metadata } from "next"

import { NotificationsPageView } from "@/features/notifications/notifications-page-view"

export const metadata: Metadata = {
  title: "การแจ้งเตือน",
}

export default function Page() {
  return <NotificationsPageView />
}
