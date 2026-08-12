"use client"

import type { CSSProperties } from "react"

import { UserAvatar } from "@/components/common/user-avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLocale } from "@/i18n"
import { getFullName } from "@/lib/user"
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"

/** กลุ่ม Avatar ของผู้รับผิดชอบ — เกินจำนวนที่กำหนดจะยุบเป็นตัวเลข */
export function AvatarGroup({
  users,
  max = 3,
  size = "xs",
  className,
  overflowStyle,
}: {
  users: User[]
  max?: number
  size?: "xs" | "sm"
  className?: string
  overflowStyle?: CSSProperties
}) {
  const { t, locale } = useLocale()

  if (users.length === 0) {
    return (
      <span className="text-muted-foreground text-xs">{t("task.noAssignee")}</span>
    )
  }

  const visible = users.slice(0, max)
  const overflow = users.length - visible.length

  return (
    <span className={cn("flex items-center -space-x-1.5", className)}>
      {visible.map((user, index) => (
        <Tooltip key={user.id}>
          <TooltipTrigger asChild>
            <span
              className="relative inline-flex rounded-full"
              style={{ zIndex: visible.length - index }}
            >
              <UserAvatar user={user} size={size} />
            </span>
          </TooltipTrigger>
          <TooltipContent>{getFullName(user, locale)}</TooltipContent>
        </Tooltip>
      ))}
      {overflow > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "bg-muted text-muted-foreground relative inline-flex items-center justify-center rounded-full font-semibold",
                size === "xs" ? "size-6 text-[0.625rem]" : "size-8 text-xs"
              )}
              style={{ ...overflowStyle, zIndex: 0 }}
            >
              +{overflow}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {users
              .slice(max)
              .map((user) => getFullName(user, locale))
              .join(", ")}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </span>
  )
}
