"use client"

import * as React from "react"
import { ChevronDownIcon, KeyRoundIcon } from "lucide-react"

import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useLocale } from "@/i18n"
import { getFullName } from "@/lib/user"
import { cn } from "@/lib/utils"
import { MOCK_PASSWORD, MOCK_USERS } from "@/mock"

/**
 * รายการบัญชีทดลองใช้งาน — กดแล้วกรอกอีเมล/รหัสผ่านให้อัตโนมัติ
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

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border-border bg-muted/40 rounded-lg border"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="hover:bg-muted/60 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors"
        >
          <KeyRoundIcon
            className="text-muted-foreground size-4 shrink-0"
            aria-hidden="true"
          />
          <span className="flex-1 font-medium">{t("auth.mockAccountTitle")}</span>
          <ChevronDownIcon
            className={cn(
              "text-muted-foreground size-4 shrink-0 transition-transform",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-2 px-3 pb-3">
          <p className="text-muted-foreground text-xs">
            {t("auth.mockAccountHint")} · {t("auth.password")}:{" "}
            <code className="bg-background rounded px-1 py-0.5 font-mono text-[0.6875rem]">
              {MOCK_PASSWORD}
            </code>
          </p>

          <ul className="divide-border divide-y">
            {MOCK_USERS.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-3 py-2 first:pt-0"
              >
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
                  onClick={() => onSelect(user.email, MOCK_PASSWORD)}
                >
                  {t("auth.useThisAccount")}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
