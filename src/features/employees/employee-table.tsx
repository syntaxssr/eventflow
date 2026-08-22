"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getToday, toDateKey } from "@/constants/mock-date"
import { EMPLOYEE_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import {
  getEmployeeFullName,
  yearsOfService,
  type EmployeeSortKey,
  type SortDirection,
} from "@/lib/employee"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Employee } from "@/types/employee"

interface EmployeeTableProps {
  employees: Employee[]
  selectedIds: Set<string>
  onToggleRow: (id: string) => void
  onToggleAll: () => void
  sortKey: EmployeeSortKey
  sortDirection: SortDirection
  onSortChange: (key: EmployeeSortKey) => void
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
}

const SORTABLE_COLUMNS: {
  key: EmployeeSortKey
  labelKey:
    | "employee.employeeCode"
    | "employee.name"
    | "employee.department"
    | "employee.position"
    | "employee.startDate"
    | "employee.status"
}[] = [
  { key: "employeeCode", labelKey: "employee.employeeCode" },
  { key: "name", labelKey: "employee.name" },
  { key: "department", labelKey: "employee.department" },
  { key: "position", labelKey: "employee.position" },
  { key: "startDate", labelKey: "employee.startDate" },
  { key: "status", labelKey: "employee.status" },
]

/** ตารางทะเบียน (desktop) + card view (mobile) — เลือกหลายรายการและจัดเรียงได้ */
export function EmployeeTable({
  employees,
  selectedIds,
  onToggleRow,
  onToggleAll,
  sortKey,
  sortDirection,
  onSortChange,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const { t, tl, locale } = useLocale()
  const todayKey = React.useMemo(() => toDateKey(getToday()), [])

  const allSelected =
    employees.length > 0 &&
    employees.every((employee) => selectedIds.has(employee.id))
  const someSelected = employees.some((employee) => selectedIds.has(employee.id))

  const sortIcon = (key: EmployeeSortKey) => {
    if (key !== sortKey)
      return <ArrowUpDownIcon className="size-3.5 opacity-50" aria-hidden="true" />
    return sortDirection === "asc" ? (
      <ArrowUpIcon className="size-3.5" aria-hidden="true" />
    ) : (
      <ArrowDownIcon className="size-3.5" aria-hidden="true" />
    )
  }

  // อายุงานนับถึงวันนี้เสมอ — คนที่ลาออกแล้วจึงไม่แสดง (ข้อมูลไม่มีวันที่ลาออก)
  const serviceHint = (employee: Employee) =>
    employee.status === "resigned"
      ? null
      : t("employee.yearsOfService", {
          years: yearsOfService(employee.startDate, todayKey),
        })

  const rowActions = (employee: Employee) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("employee.rowActions", {
            name: getEmployeeFullName(employee, locale),
          })}
          data-testid="employee-row-actions"
        >
          <MoreHorizontalIcon className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(employee)}>
          <PencilIcon className="size-4" aria-hidden="true" />
          {t("common.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(employee)}>
          <Trash2Icon className="size-4" aria-hidden="true" />
          {t("common.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/* Desktop */}
      <div
        className="hidden overflow-x-auto rounded-lg border md:block"
        data-testid="employee-table"
      >
        <Table>
          <caption className="sr-only">{t("employee.subtitle")}</caption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={onToggleAll}
                  aria-label={t("employee.selectAll")}
                  data-testid="select-all-employees"
                />
              </TableHead>
              {SORTABLE_COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  aria-sort={
                    column.key === sortKey
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => onSortChange(column.key)}
                    className="hover:text-foreground focus-visible:outline-ring inline-flex items-center gap-1 font-medium focus-visible:outline-2"
                    aria-label={t("employee.sortColumn", {
                      column: t(column.labelKey),
                    })}
                  >
                    {t(column.labelKey)}
                    {sortIcon(column.key)}
                  </button>
                </TableHead>
              ))}
              <TableHead className="w-12">
                <span className="sr-only">{t("common.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => {
              const hint = serviceHint(employee)
              return (
                <TableRow
                  key={employee.id}
                  data-state={
                    selectedIds.has(employee.id) ? "selected" : undefined
                  }
                  data-testid="employee-row"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(employee.id)}
                      onCheckedChange={() => onToggleRow(employee.id)}
                      aria-label={t("employee.selectRow", {
                        name: getEmployeeFullName(employee, locale),
                      })}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs whitespace-nowrap">
                    {employee.employeeCode}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 flex-col">
                      <span className="font-medium whitespace-nowrap">
                        {getEmployeeFullName(employee, locale)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {employee.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {tl(employee.department) || "—"}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {tl(employee.position) || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {formatDate(employee.startDate, locale)}
                      </span>
                      {hint ? (
                        <span className="text-muted-foreground text-xs">
                          {hint}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      style={EMPLOYEE_STATUS_STYLE[employee.status]}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>{rowActions(employee)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile — card view */}
      <ul className="space-y-2 md:hidden" data-testid="employee-cards">
        {employees.map((employee) => (
          <li
            key={employee.id}
            className={cn(
              "rounded-lg border p-3",
              selectedIds.has(employee.id) && "border-brand-400 bg-brand-50/50"
            )}
            data-testid="employee-row"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                className="mt-0.5"
                checked={selectedIds.has(employee.id)}
                onCheckedChange={() => onToggleRow(employee.id)}
                aria-label={t("employee.selectRow", {
                  name: getEmployeeFullName(employee, locale),
                })}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-muted-foreground font-mono text-xs">
                  {employee.employeeCode}
                </p>
                <p className="text-sm font-medium">
                  {getEmployeeFullName(employee, locale)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {[tl(employee.position), tl(employee.department)]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {[employee.email, employee.phone].filter(Boolean).join(" · ")}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <StatusBadge
                    style={EMPLOYEE_STATUS_STYLE[employee.status]}
                    size="sm"
                  />
                  <span className="text-muted-foreground text-xs">
                    {[
                      t("employee.startedOn", {
                        date: formatDate(employee.startDate, locale),
                      }),
                      serviceHint(employee),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                {tl(employee.note) ? (
                  <p className="text-muted-foreground text-xs">
                    {t("employee.note")}: {tl(employee.note)}
                  </p>
                ) : null}
              </div>
              {rowActions(employee)}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
