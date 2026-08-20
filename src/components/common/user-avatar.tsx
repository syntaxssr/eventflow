"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForegroundColor } from "@/constants/avatar-colors"
import { useLocale } from "@/i18n"
import { getReadableTextColor } from "@/lib/color"
import { getFullName, getInitials } from "@/lib/user"
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"

const SIZE_CLASS = {
  xs: "size-6 text-[0.625rem]",
  sm: "size-8 text-xs",
  default: "size-9 text-sm",
  lg: "size-12 text-base",
  xl: "size-20 text-2xl",
} as const

export function UserAvatar({
  user,
  size = "default",
  className,
}: {
  user: User
  size?: keyof typeof SIZE_CLASS
  className?: string
}) {
  const { locale } = useLocale()
  const fullName = getFullName(user, locale)

  return (
    <Avatar className={cn(SIZE_CLASS[size], className)}>
      {user.avatarUrl ? (
        <AvatarImage src={user.avatarUrl} alt={fullName} />
      ) : null}
      <AvatarFallback
        className="font-semibold"
        style={{
          backgroundColor: user.avatarColor,
          // ตัวอักษรย่อใช้สีคู่ประจำของสีนั้นในระบบสถานะ
          // สีนอกพาเลต (ข้อมูลเก่า/กำหนดเอง) ถึงจะ fallback เป็นดำ/ขาว
          color:
            getAvatarForegroundColor(user.avatarColor) ??
            getReadableTextColor(user.avatarColor),
        }}
      >
        {getInitials(user, locale)}
      </AvatarFallback>
    </Avatar>
  )
}
