import Link from "next/link"

import { LanguageToggle } from "@/components/common/language-toggle"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Button } from "@/components/ui/button"
import { APP_DESCRIPTION_TH, APP_NAME, ROUTES } from "@/constants/app"

/**
 * หน้าเริ่มต้นชั่วคราวของ Phase 0
 * Phase 1 จะเปลี่ยนเป็นการ redirect ไปหน้า Login
 */
export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="space-y-3">
        <p className="text-brand-text text-sm font-semibold tracking-wide">
          Phase 0 · Project Setup &amp; Design System
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {APP_NAME}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-md text-balance">
          {APP_DESCRIPTION_TH}
        </p>
      </div>

      <Button asChild size="lg">
        <Link href={ROUTES.designSystem}>เปิด Design System</Link>
      </Button>
    </main>
  )
}
