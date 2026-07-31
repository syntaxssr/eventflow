import type { Metadata } from "next"

import { NotificationSettingsView } from "@/features/notifications/notification-settings-view"

export const metadata: Metadata = {
  title: "ตั้งค่าการแจ้งเตือน",
}

export default function Page() {
  return <NotificationSettingsView />
}
