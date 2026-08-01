"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CalendarCheckIcon,
  ListChecksIcon,
  MessagesSquareIcon,
  UsersIcon,
} from "lucide-react"

import { LanguageToggle } from "@/components/common/language-toggle"
import { Logo } from "@/components/common/logo"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/app"
import { MOCK_TODAY_ISO } from "@/constants/mock-date"
import { useLocale } from "@/i18n"
import { useAppState } from "@/store"
import { LoginForm } from "./login-form"

const HIGHLIGHTS = [
  { icon: CalendarCheckIcon, key: "timeline" },
  { icon: ListChecksIcon, key: "tasks" },
  { icon: UsersIcon, key: "participants" },
  { icon: MessagesSquareIcon, key: "collaboration" },
] as const

const HIGHLIGHT_TEXT: Record<
  (typeof HIGHLIGHTS)[number]["key"],
  { th: string; en: string }
> = {
  timeline: {
    th: "วางกำหนดการและไทม์ไลน์ของงานได้ในที่เดียว",
    en: "Plan the full event timeline in one place",
  },
  tasks: {
    th: "มอบหมายงาน ติดตามสถานะ และเช็กความคืบหน้า",
    en: "Assign tasks, track status and progress",
  },
  participants: {
    th: "จัดการรายชื่อผู้เข้าร่วมและสถานะตอบรับ",
    en: "Manage participants and RSVP responses",
  },
  collaboration: {
    th: "สื่อสารกับทีมผ่านความคิดเห็นและการแจ้งเตือน",
    en: "Collaborate through comments and notifications",
  },
}

export function LoginView() {
  const { t, locale } = useLocale()
  const router = useRouter()
  const session = useAppState().session

  // เข้าสู่ระบบอยู่แล้วไม่ต้องเห็นหน้า Login อีก
  React.useEffect(() => {
    if (session) router.replace(ROUTES.dashboard)
  }, [session, router])

  return (
    <main className="flex min-h-svh flex-col lg:flex-row">
      {/* แผงแบรนด์ — โทนเทาไล่น้ำหนักแบบมินิมอล ไม่ใช้สี accent */}
      <section className="bg-brand-50 relative hidden flex-1 flex-col justify-between p-10 lg:flex">
        <Logo size="lg" className="text-brand-950" />

        <div className="max-w-md space-y-6">
          <h2 className="text-brand-950 text-3xl font-extrabold tracking-tight text-balance">
            {t("common.tagline")}
          </h2>
          <ul className="space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-start gap-3">
                <span
                  className="bg-brand-500 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full"
                  aria-hidden="true"
                >
                  <Icon className="size-4 text-foreground" />
                </span>
                <span className="text-brand-950 text-sm">
                  {HIGHLIGHT_TEXT[key][locale]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-brand-900 text-xs">
          © {MOCK_TODAY_ISO.slice(0, 4)} EventFlow · Interactive Prototype
        </p>
      </section>

      {/* ฟอร์มเข้าสู่ระบบ */}
      <section className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-4 lg:justify-end">
          <Logo className="lg:hidden" />
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-10">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight">
                {t("auth.title")}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t("auth.subtitle")}
              </p>
            </div>

            <Card>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
