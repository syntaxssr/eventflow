"use client"

import type { ReactNode } from "react"
import { SearchIcon } from "lucide-react"

import { FilterChips, type FilterChip } from "@/components/common/filter-chips"
import { StatusBadge } from "@/components/common/status-badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EMPLOYEE_STATUS_STYLE, FILTER_TRIGGER_CLASS } from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { EMPTY_EMPLOYEE_FILTERS, type EmployeeFilters } from "@/lib/employee"
import { cn } from "@/lib/utils"
import { EMPLOYEE_STATUSES, type EmployeeStatus } from "@/types/employee"

/** แถบค้นหา + ตัวกรอง (แผนก / สถานะพนักงาน) + ชิปตัวกรองที่เลือกอยู่ */
export function EmployeeFiltersBar({
  filters,
  onChange,
  departments,
  resultCount,
  actions,
}: {
  filters: EmployeeFilters
  onChange: (filters: EmployeeFilters) => void
  departments: { key: string; label: string }[]
  resultCount: number
  actions?: ReactNode
}) {
  const { t } = useLocale()

  const set = (changes: Partial<EmployeeFilters>) =>
    onChange({ ...filters, ...changes })

  const chips: FilterChip[] = [
    ...(filters.status !== "all"
      ? (() => {
          const style = EMPLOYEE_STATUS_STYLE[filters.status]
          const Icon = style.icon

          return [{
            key: "status",
            label: t(style.labelKey as TranslationKey),
            icon: <Icon className="size-3 shrink-0" aria-hidden="true" />,
            className: style.badge,
            onRemove: () => set({ status: "all" }),
          }]
        })()
      : []),
    ...(filters.department !== "all"
      ? [
          {
            key: "department",
            label:
              departments.find((entry) => entry.key === filters.department)
                ?.label ?? filters.department,
            onRemove: () => set({ department: "all" }),
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-full space-y-1 sm:w-96">
          <Label htmlFor="employee-search" className="pl-1 text-xs">
            {t("common.search")}
          </Label>
          <div className="relative">
            <SearchIcon
              className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="employee-search"
              value={filters.query}
              onChange={(event) => set({ query: event.target.value })}
              placeholder={t("employee.searchPlaceholder")}
              className={cn("h-8 pl-8", FILTER_TRIGGER_CLASS)}
              data-testid="employee-search"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="employee-department-filter" className="pl-1 text-xs">
            {t("employee.department")}
          </Label>
          <Select
            value={filters.department}
            onValueChange={(value) => set({ department: value })}
          >
            <SelectTrigger
              id="employee-department-filter"
              size="sm"
              className={cn("w-48", FILTER_TRIGGER_CLASS)}
              data-testid="employee-department-filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("employee.allDepartments")}</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.key} value={department.key}>
                  {department.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="employee-status-filter" className="pl-1 text-xs">
            {t("employeeStatus.label")}
          </Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              set({ status: value as EmployeeStatus | "all" })
            }
          >
            <SelectTrigger
              id="employee-status-filter"
              size="sm"
              className={cn("w-44", FILTER_TRIGGER_CLASS)}
              data-testid="employee-status-filter"
            >
              {filters.status === "all" ? (
                <SelectValue />
              ) : (
                <StatusBadge
                  size="sm"
                  style={EMPLOYEE_STATUS_STYLE[filters.status]}
                  className="pointer-events-none"
                />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("employee.allStatuses")}</SelectItem>
              {EMPLOYEE_STATUSES.map((status) => {
                const style = EMPLOYEE_STATUS_STYLE[status]
                return (
                  <SelectItem key={status} value={status}>
                    <StatusBadge
                      size="sm"
                      style={style}
                      className="pointer-events-none"
                    />
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {actions ? <div className="ml-auto">{actions}</div> : null}
      </div>

      <FilterChips
        chips={chips}
        onClearAll={() =>
          onChange({ ...EMPTY_EMPLOYEE_FILTERS, query: filters.query })
        }
      />

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {t("employee.resultCount", { count: resultCount })}
      </p>
    </div>
  )
}
