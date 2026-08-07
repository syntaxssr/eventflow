"use client"

import * as React from "react"
import { KeyRoundIcon } from "lucide-react"

import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLocale } from "@/i18n"
import { getFullName } from "@/lib/user"
import { MOCK_PASSWORD, MOCK_USERS } from "@/mock"

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

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("auth.mockAccountTitle")}</DialogTitle>
          <DialogDescription>
            {t("auth.mockAccountHint")} · {t("auth.password")}:{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-[0.6875rem]">
              {MOCK_PASSWORD}
            </code>
          </DialogDescription>
        </DialogHeader>

        <ul className="divide-border max-h-[60vh] divide-y overflow-y-auto">
          {MOCK_USERS.map((user) => (
            <li key={user.id} className="flex items-center gap-3 py-2 first:pt-0">
              <UserAvatar user={user} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {getFullName(user, locale)}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {user.position[locale]} · {user.email}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => handleSelect(user.email)}
              >
                {t("auth.useThisAccount")}
              </Button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
