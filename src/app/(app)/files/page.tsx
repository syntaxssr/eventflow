import { Suspense } from "react"
import type { Metadata } from "next"

import { FilesPageView } from "@/features/files/files-page-view"

export const metadata: Metadata = {
  title: "ไฟล์",
}

export default function FilesPage() {
  return (
    <Suspense>
      <FilesPageView />
    </Suspense>
  )
}
