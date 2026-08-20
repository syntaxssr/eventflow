import { fromDateKey, getNow } from "@/constants/mock-date"
import type { Locale } from "@/types/common"

const INTL_LOCALE: Record<Locale, string> = {
  th: "th-TH",
  en: "en-GB",
}

/** `2026-09-18` → "18 ก.ย. 2569" / "18 Sep 2026" */
export function formatDate(dateKey: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(fromDateKey(dateKey))
}

/** รูปแบบยาว: "วันศุกร์ที่ 18 กันยายน 2569" / "Friday 18 September 2026" */
export function formatDateLong(dateKey: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fromDateKey(dateKey))
}

/** ช่วงวันที่ — ยุบให้เหลือวันเดียวเมื่อเริ่มและจบวันเดียวกัน */
export function formatDateRange(
  startDateKey: string,
  endDateKey: string,
  locale: Locale
): string {
  if (startDateKey === endDateKey) return formatDate(startDateKey, locale)
  return `${formatDate(startDateKey, locale)} – ${formatDate(endDateKey, locale)}`
}

/** ช่วงเวลา — ภาษาไทยต่อท้ายด้วย "น." ตามรูปแบบบอกเวลาของไทย */
export function formatTimeRange(
  startTime: string,
  endTime: string,
  locale: Locale
): string {
  return `${startTime} – ${endTime}${locale === "th" ? " น." : ""}`
}

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

/** เวลาแบบสัมพัทธ์ เช่น "3 ชั่วโมงที่แล้ว" / "3 hours ago" */
export function formatRelativeTime(
  iso: string,
  locale: Locale,
  now: Date = getNow()
): string {
  const formatter = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], {
    numeric: "auto",
  })
  const diffSeconds = (new Date(iso).getTime() - now.getTime()) / 1000

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ]

  for (const [unit, seconds] of units) {
    const value = diffSeconds / seconds
    if (Math.abs(value) >= 1) {
      return formatter.format(Math.round(value), unit)
    }
  }
  return formatter.format(Math.round(diffSeconds), "second")
}

/** ขนาดไฟล์ที่อ่านง่าย เช่น "24.7 MB" */
export function formatFileSize(bytes: number, locale: Locale): string {
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  const formatted = new Intl.NumberFormat(INTL_LOCALE[locale], {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  }).format(value)
  return `${formatted} ${units[unitIndex]}`
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale]).format(value)
}
