"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForegroundColor } from "@/constants/avatar-colors"
import { useLocale } from "@/i18n"
import { getReadableTextColor } from "@/lib/color"
import { getFullName, getInitials } from "@/lib/user"
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"

const SIZE_CLASS = {
  xs: "size-6",
  sm: "size-8",
  default: "size-9",
  lg: "size-12",
  xl: "size-20",
} as const

/**
 * ขนาดตัวอักษรย่อ ต้องใส่ที่ `AvatarFallback` โดยตรง — ตัว fallback มี `text-sm`
 * ของมันเอง คลาสที่ใส่ไว้ที่วง avatar จึงไม่มีผล (ทุกขนาดเลยได้ 14px เท่ากันหมด)
 *
 * ค่าที่ไม่ระบุ = คงพฤติกรรมเดิม (14px) ส่วน `lg`/`xl` คุมสัดส่วนตัวอักษรต่อ
 * เส้นผ่านศูนย์กลางไว้ที่ ~0.58 เท่ากับ `xs` บน Topbar (14/24) ไม่งั้นวงใหญ่
 * จะดูตัวอักษรลีบกว่าวงเล็กทั้งที่เป็นคนเดียวกัน
 */
const FALLBACK_TEXT_CLASS = {
  xs: "",
  sm: "",
  default: "",
  lg: "text-[1.75rem]",
  xl: "text-[2.875rem]",
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
        className={cn("font-semibold", FALLBACK_TEXT_CLASS[size])}
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
