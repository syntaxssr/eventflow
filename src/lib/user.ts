import { getAvatarForegroundColor } from "@/constants/avatar-colors"
import type { Locale } from "@/types/common"
import type { User } from "@/types/user"
import { getReadableTextColor } from "./color"

/**
 * ชื่อ–นามสกุลเต็มพร้อมชื่อเล่นในวงเล็บ เช่น "อลิสา ลีลายุวัฒนกุล (นุ่น)"
 * ทีมจำกันด้วยชื่อเล่นมากกว่าชื่อจริง จึงต่อท้ายไว้ทุกที่ที่แสดงชื่อคน
 */
export function getFullName(user: User, locale: Locale): string {
  const full = `${user.firstName[locale]} ${user.lastName[locale]}`.trim()
  const nickname = user.nickname[locale].trim()
  return nickname ? `${full} (${nickname})` : full
}

/** ชื่อจริงล้วน ไม่มีชื่อเล่น — ใช้เมื่อพื้นที่จำกัดหรือต้องการชื่อทางการ */
export function getLegalName(user: User, locale: Locale): string {
  return `${user.firstName[locale]} ${user.lastName[locale]}`.trim()
}

/** ชื่อเล่นล้วน */
export function getNickname(user: User, locale: Locale): string {
  return user.nickname[locale]
}

/** ชื่อย่อสำหรับ Avatar */
export function getInitials(user: User, locale: Locale): string {
  return user.initials[locale]
}

/**
 * คู่สีประจำตัวผู้ใช้ สำหรับย้อมทั้งช่องที่เลือกแล้วของ Select และ Dropdown
 *
 * ใช้คู่สีเดียวกับตัวอักษรย่อบน avatar เพื่อให้รู้ว่าเป็นคนเดียวกัน
 * สีนอกพาเลต (ข้อมูลเก่า/กำหนดเอง) ถึงจะ fallback เป็นดำ/ขาว
 */
export function getUserColorStyle(user: User): {
  backgroundColor: string
  color: string
} {
  return {
    backgroundColor: user.avatarColor,
    color:
      getAvatarForegroundColor(user.avatarColor) ??
      getReadableTextColor(user.avatarColor),
  }
}
