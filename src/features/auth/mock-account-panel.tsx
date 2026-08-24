"use client"

import * as React from "react"
import { KeyRoundIcon } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocale } from "@/i18n"
import { getFullName } from "@/lib/user"
import { MOCK_PASSWORD, MOCK_USERS } from "@/mock"
import type { User } from "@/types/user"

function DemoAccountAvatar({ user }: { user: User }) {
  return (
    <Avatar className="size-8 sm:size-20 lg:size-24">
      <AvatarImage
        src={user.avatarUrl}
        alt=""
        className="object-cover"
      />
      <AvatarFallback aria-hidden="true" className="bg-transparent">
        <Skeleton className="size-full rounded-full" />
      </AvatarFallback>
    </Avatar>
  )
}

/**
 * รายการบัญชีทดลองใช้งาน — กดแล้วกรอกอีเมล/รหัสผ่านให้อัตโนมัติ
 * ใช้ Dialog แทนการกางในหน้า เพื่อไม่ให้ฟอร์มด้านบนขยับตอนเปิด/ปิด
 * ไม่ใช่ข้อมูลลับ เพราะเป็น Prototype ที่ไม่มี Backend จริง
 */
export function MockAccountPanel({
  onSelect,
  disabled,
}: {
  onSelect: (email: string, password: string) => void
  disabled?: boolean
}) {
  const { t, locale } = useLocale()
  const [open, setOpen] = React.useState(false)

  const handleSelect = (email: string) => {
    onSelect(email, MOCK_PASSWORD)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="border-border bg-muted/40 hover:bg-muted/60 flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors"
        >
          <KeyRoundIcon
            className="text-muted-foreground size-4 shrink-0"
            aria-hidden="true"
          />
          <span className="flex-1 font-medium">
            {t("auth.mockAccountTitle")}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="gap-2 p-3 sm:max-w-6xl sm:gap-5 sm:p-6">
        <DialogHeader className="gap-1 pr-8 text-center sm:gap-2 sm:text-left">
          <DialogTitle className="text-xl sm:text-2xl">
            {t("auth.mockAccountTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("auth.mockAccountHint")} · {t("auth.password")}:{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-[0.6875rem]">
              {MOCK_PASSWORD}
            </code>
          </DialogDescription>
        </DialogHeader>

        <ul className="grid grid-cols-2 gap-1.5 p-0.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-7">
          {MOCK_USERS.map((user) => (
            <li key={user.id}>
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => handleSelect(user.email)}
                aria-label={`${t("auth.useThisAccount")}: ${user.nickname[locale]}`}
                className="hover:bg-muted/60 h-auto w-full flex-col gap-0.5 rounded-xl px-2 py-1 sm:gap-2.5 sm:rounded-2xl sm:px-3 sm:py-4"
              >
                <DemoAccountAvatar user={user} />
                <span className="max-w-full truncate text-sm font-semibold sm:text-lg">
                  {user.nickname[locale]}
                </span>
                <span className="sr-only">{getFullName(user, locale)}</span>
              </Button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
