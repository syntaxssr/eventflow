"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { LanguageToggle } from "@/components/common/language-toggle"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { APP_NAME, ROUTES } from "@/constants/app"
import { MOCK_TODAY_ISO } from "@/constants/mock-date"
import { useLocale } from "@/i18n"
import { cn } from "@/lib/utils"
import { useAppState } from "@/store"
import { LoginForm } from "./login-form"

/** เครื่องหมายดอกจัน 8 แฉกปลายมน — ใช้เฉพาะแผงแบรนด์หน้า Login */
function HeroMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-16 xl:size-20", className)}
    >
      {[0, 45, 90, 135].map((angle) => (
        <line
          key={angle}
          x1={16}
          y1={4}
          x2={16}
          y2={28}
          stroke="currentColor"
          strokeWidth={4.5}
          strokeLinecap="round"
          transform={`rotate(${angle} 16 16)`}
        />
      ))}
    </svg>
  )
}

/** พื้นผิวเกรนบางๆ ทับพื้นสีทึบของแผงแบรนด์ — ตกแต่งล้วน ไม่สื่อความหมาย */
function HeroGrain() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full opacity-[0.18] mix-blend-overlay dark:opacity-50"
    >
      <filter id="auth-hero-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves={4}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
        {/* จูนให้ค่ากลางอยู่ที่ 0.5 พอดี overlay จึงได้ทั้งเม็ดสว่างและเม็ดมืด
            ไม่ใช่ฝ้าขาวทับอย่างเดียว — alpha คงที่ ความเข้มคุมด้วย opacity ข้างนอก */}
        <feComponentTransfer>
          <feFuncR type="linear" slope="1.8" intercept="-0.65" />
          <feFuncG type="linear" slope="1.8" intercept="-0.65" />
          <feFuncB type="linear" slope="1.8" intercept="-0.65" />
          <feFuncA type="linear" slope="0" intercept="1" />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#auth-hero-grain)" />
    </svg>
  )
}

export function LoginView() {
  const { t } = useLocale()
  const router = useRouter()
  const session = useAppState().session

  // เข้าสู่ระบบอยู่แล้วไม่ต้องเห็นหน้า Login อีก
  React.useEffect(() => {
    if (session) router.replace(ROUTES.dashboard)
  }, [session, router])

  return (
    <main className="flex min-h-svh flex-col lg:flex-row">
      {/* แผงแบรนด์ — สีนอกพาเลตที่อนุมัติเฉพาะจุดนี้ (ดู colors.md) */}
      <section
        data-auth-hero
        className="from-auth-hero to-auth-hero-deep text-auth-hero-foreground relative hidden flex-col overflow-hidden bg-gradient-to-b lg:flex lg:flex-[3]"
      >
        <HeroGrain />

        {/* ไอคอน + หัวเรื่อง + คำโปรย เป็นบล็อกเดียวกันตามตัวอย่าง
            px เป็น % ของ section เท่ากับบรรทัดลิขสิทธิ์ จึงชิดซ้ายตรงกัน */}
        <div className="relative flex flex-1 flex-col justify-center px-[13%] pt-14 pb-8">
          <div className="max-w-lg">
            <HeroMark />
            <span className="sr-only">{APP_NAME}</span>

            <h2 className="mt-12 text-5xl leading-tight font-extrabold tracking-tight xl:text-6xl">
              {t("auth.heroGreeting")}
              {/* NBSP กันอิโมจิตกไปอยู่บรรทัดเดียวโดดๆ */}
              <span aria-hidden="true">{" 👋🏻"}</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed">
              {t("auth.heroBody")}
            </p>
          </div>
        </div>

        <p className="relative px-[13%] pb-12 text-xs opacity-80">
          © {MOCK_TODAY_ISO.slice(0, 4)} EventFlow · Interactive Prototype
        </p>
      </section>

      {/* ฟอร์มเข้าสู่ระบบ */}
      <section className="flex flex-1 flex-col lg:flex-[2]">
        <div className="flex items-center justify-between gap-4 p-4 lg:px-[12%] lg:pt-10">
          {/* ตามตัวอย่าง: ฝั่งฟอร์มใช้ชื่อแบรนด์ล้วน ไม่มีไอคอน (ไอคอนอยู่แผงซ้ายแล้ว) */}
          <span className="text-lg font-extrabold tracking-tight">
            {APP_NAME}
          </span>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center px-4 pb-10 lg:px-[12%]">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {t("auth.welcomeBack")}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t("auth.subtitle")}
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  )
}
