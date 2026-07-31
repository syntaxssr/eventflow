"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"
import { useAppState } from "@/store"

/**
 * ป้องกันหน้าภายในระบบ
 *
 * Prototype เก็บ session ไว้ใน memory เท่านั้น การ refresh จึงทำให้หลุดออกจากระบบ
 * และถูกส่งกลับไปหน้า Login เสมอ — เป็นพฤติกรรมที่ตั้งใจไว้
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = useAppState().session
  const router = useRouter()
  const t = useT()

  React.useEffect(() => {
    if (!session) router.replace(ROUTES.login)
  }, [session, router])

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
