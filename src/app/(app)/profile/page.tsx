import type { Metadata } from "next"

import { ProfilePageView } from "@/features/profile/profile-page-view"

export const metadata: Metadata = {
  title: "โปรไฟล์",
}

export default function Page() {
  return <ProfilePageView />
}
