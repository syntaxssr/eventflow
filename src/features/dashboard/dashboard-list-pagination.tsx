"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/i18n"

export const DASHBOARD_LIST_PAGE_SIZE = 5

export function DashboardListPagination({
  page,
  totalItems,
  onPageChange,
}: {
  page: number
  totalItems: number
  onPageChange: (page: number) => void
}) {
  const { t } = useLocale()
  const totalPages = Math.ceil(totalItems / DASHBOARD_LIST_PAGE_SIZE)

  if (totalPages <= 1) return null

  return (
    <div className="flex h-8 items-center justify-center gap-2 pt-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        aria-label={t("dashboard.calendarPreviousPage")}
      >
        <ChevronLeftIcon className="size-4" aria-hidden="true" />
      </Button>
      <span className="text-muted-foreground text-xs tabular-nums">
        {t("dashboard.calendarPage", { current: page + 1, total: totalPages })}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        aria-label={t("dashboard.calendarNextPage")}
      >
        <ChevronRightIcon className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
