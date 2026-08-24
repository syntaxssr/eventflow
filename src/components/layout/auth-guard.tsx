"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"
import { useAppState, useSessionHydrated } from "@/store"

/**
 * ป้องกันหน้าภายในระบบ
 *
 * Session อยู่ใน memory เป็นหลัก ยกเว้นผู้ที่ติ๊ก "จดจำฉันไว้" ซึ่งจะถูกกู้กลับมา
 * จาก localStorage ตอนเปิดหน้า จึงปิดแล้วเปิดเบราว์เซอร์ใหม่ได้โดยไม่หลุด
 *
 * ต้องรอ `hydrated` ก่อนเสมอ ไม่งั้นจะเด้งไปหน้า Login ตั้งแต่จังหวะแรกที่ session
 * ยังเป็น null ทั้งที่กำลังจะกู้กลับมาได้
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = useAppState().session
  const hydrated = useSessionHydrated()
  const router = useRouter()
  const t = useT()

  React.useEffect(() => {
    if (hydrated && !session) router.replace(ROUTES.login)
  }, [hydrated, session, router])

  if (!session) {
    return (
      <div
        className="flex min-h-svh items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <Loader2Icon
          className="text-muted-foreground size-6 animate-spin"
          aria-hidden="true"
        />
        <span className="sr-only">{t("common.loading")}</span>
      </div>
    )
  }

  return <>{children}</>
}
