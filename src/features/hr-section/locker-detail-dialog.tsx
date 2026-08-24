"use client"

import { CalendarDaysIcon, CookieIcon, PackageIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { getEmployeeFullName } from "@/lib/employee"
import type { Employee } from "@/types/employee"
import type { Locker, LockerContentTag } from "@/types/locker"
import { LockerKey } from "./locker-key"

const CONTENT_TAGS: Record<
  LockerContentTag,
  { icon: React.ComponentType<{ className?: string }>; labelKey: TranslationKey }
> = {
  office_supply: {
    icon: PackageIcon,
    labelKey: "employeeLocker.contentOfficeSupply",
  },
  snack: { icon: CookieIcon, labelKey: "employeeLocker.contentSnack" },
}

/**
 * มุมมองด้านในของช่องล็อกเกอร์เมื่อเปิดประตู — ผนังหลัง ผนังข้างที่เข้าเงา
 * และราวแขวนกุญแจด้านบน จำนวนกุญแจมาจากทะเบียนของ HR ตรง ๆ
 */
export function LockerDetailDialog({
  locker,
  employee,
  onClose,
}: {
  locker: Locker | null
  employee: Employee | null
  onClose: () => void
}) {
  const { t, locale } = useLocale()

  if (!locker) return null

  const occupantName = employee
    ? getEmployeeFullName(employee, locale)
    : locker.occupantName
  const isOccupied = locker.status === "occupied"

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono tabular-nums">{locker.code}</span>
            <Badge variant={isOccupied ? "default" : "secondary"}>
              {isOccupied
                ? t("employeeLocker.occupied")
                : t("employeeLocker.available")}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {isOccupied
              ? occupantName
              : t("employeeLocker.emptyLockerDescription")}
          </DialogDescription>
        </DialogHeader>

        {/* ช่องด้านใน: ผนังหลังโลหะเข้ม ผนังข้างเอียงเข้าหาจุดรวมสายตา */}
        <div className="relative overflow-hidden rounded-md bg-[#2A2A28] p-1 shadow-[inset_0_2px_6px_rgb(0_0_0/0.6)] ring-1 ring-black/40">
          <div
            className="absolute inset-y-1 left-1 w-6 bg-gradient-to-r from-black/70 to-transparent"
            style={{ clipPath: "polygon(0 0, 100% 12%, 100% 88%, 0 100%)" }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-1 right-1 w-6 bg-gradient-to-l from-black/70 to-transparent"
            style={{ clipPath: "polygon(100% 0, 0 12%, 0 88%, 100% 100%)" }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-1 top-1 h-5 bg-gradient-to-b from-white/12 to-transparent"
            aria-hidden="true"
          />

          <div className="relative min-h-56 rounded-sm bg-[linear-gradient(180deg,#3A3A37_0%,#232320_100%)] px-4 pt-4 pb-6">
            {/* ช่องระบายอากาศบนผนังหลัง */}
            <div
              className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-1.5"
              aria-hidden="true"
            >
              {Array.from({ length: 4 }, (_, index) => (
                <span
                  key={index}
                  className="h-px w-24 rounded-full bg-black/60 shadow-[0_1px_0_rgb(255_255_255/0.08)]"
                />
              ))}
            </div>

            {/* ราวแขวนกุญแจ */}
            <div
              className="mx-auto h-1 w-[85%] rounded-full bg-[linear-gradient(180deg,#C9CBCE_0%,#7C7F84_60%,#4A4C50_100%)] shadow-[0_1px_2px_rgb(0_0_0/0.55)]"
              aria-hidden="true"
            />

            {locker.keys.length > 0 ? (
              <ul className="relative flex flex-wrap items-start justify-center gap-x-2 gap-y-4">
                {locker.keys.map((key) => (
                  <LockerKey key={key.name} name={key.name} />
                ))}
              </ul>
            ) : (
              <p className="relative py-14 text-center text-sm text-white/55">
                {t("employeeLocker.noKeys")}
              </p>
            )}
          </div>
        </div>

        <dl className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">
              {t("employeeLocker.keyCount")}
            </dt>
            <dd className="font-medium tabular-nums">
              {t("employeeLocker.keyCountValue", { count: locker.keys.length })}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">
              {t("employeeLocker.spareKey")}
            </dt>
            <dd className="font-medium">
              {locker.hasSpareKey ? t("common.yes") : t("common.no")}
            </dd>
          </div>
          {locker.assignedDate ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">
                {t("employeeLocker.assignedDate")}
              </dt>
              <dd className="flex items-center gap-1.5 font-medium tabular-nums">
                <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
                {locker.assignedDate}
              </dd>
            </div>
          ) : null}
          {locker.contentTags.length > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">
                {t("employeeLocker.alsoStores")}
              </dt>
              <dd className="flex flex-wrap justify-end gap-1">
                {locker.contentTags.map((tag) => {
                  const { icon: Icon, labelKey } = CONTENT_TAGS[tag]
                  return (
                    <Badge key={tag} variant="outline">
                      <Icon className="size-3" aria-hidden="true" />
                      {t(labelKey)}
                    </Badge>
                  )
                })}
              </dd>
            </div>
          ) : null}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
