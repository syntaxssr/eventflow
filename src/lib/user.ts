import type { Locale } from "@/types/common"
import type { User } from "@/types/user"

/** ชื่อ–นามสกุลเต็มตามภาษาที่เลือก */
export function getFullName(user: User, locale: Locale): string {
  return `${user.firstName[locale]} ${user.lastName[locale]}`.trim()
}

/** ชื่อย่อสำหรับ Avatar */
export function getInitials(user: User, locale: Locale): string {
  return user.initials[locale]
}
