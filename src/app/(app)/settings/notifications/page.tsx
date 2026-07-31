import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/common/page-placeholder"

export const metadata: Metadata = {
  title: "ตั้งค่าการแจ้งเตือน",
}

export default function Page() {
  return <PagePlaceholder titleKey="shell.notificationSettings" phase="Phase 8 — Notification Settings" />
}
