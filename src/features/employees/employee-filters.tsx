"use client"

import { SearchIcon } from "lucide-react"

import { FilterChips, type FilterChip } from "@/components/common/filter-chips"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EMPLOYEE_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { EMPTY_EMPLOYEE_FILTERS, type EmployeeFilters } from "@/lib/employee"
import { EMPLOYEE_STATUSES, type EmployeeStatus } from "@/types/employee"

/** แถบค้นหา + ตัวกรอง (แผนก / สถานะพนักงาน) + ชิปตัวกรองที่เลือกอยู่ */
export function EmployeeFiltersBar({
  filters,
  onChange,
  departments,
  resultCount,
}: {
  filters: EmployeeFilters
  onChange: (filters: EmployeeFilters) => void
  departments: { key: string; label: string }[]
  resultCount: number
}) {
  const { t } = useLocale()

  const set = (changes: Partial<EmployeeFilters>) =>
    onChange({ ...filters, ...changes })

  const chips: FilterChip[] = [
    ...(filters.status !== "all"
      ? [
          {
            key: "status",
            label: t(
              EMPLOYEE_STATUS_STYLE[filters.status].labelKey as TranslationKey
            ),
            onRemove: () => set({ status: "all" }),
          },
        ]
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
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <SearchIcon
            className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={filters.query}
            onChange={(event) => set({ query: event.target.value })}
            placeholder={t("employee.searchPlaceholder")}
            aria-label={t("common.search")}
            className="h-8 pl-8"
            data-testid="employee-search"
          />
        </div>

        <Select
          value={filters.department}
          onValueChange={(value) => set({ department: value })}
        >
          <SelectTrigger
            size="sm"
            className="w-48"
            aria-label={t("employee.department")}
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

        <Select
          value={filters.status}
          onValueChange={(value) =>
            set({ status: value as EmployeeStatus | "all" })
          }
        >
          <SelectTrigger
            size="sm"
            className="w-44"
            aria-label={t("employeeStatus.label")}
            data-testid="employee-status-filter"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("employee.allStatuses")}</SelectItem>
            {EMPLOYEE_STATUSES.map((status) => {
              const style = EMPLOYEE_STATUS_STYLE[status]
              const Icon = style.icon
              return (
                <SelectItem key={status} value={status}>
                  <Icon className="size-4" aria-hidden="true" />
                  {t(style.labelKey as TranslationKey)}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
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
