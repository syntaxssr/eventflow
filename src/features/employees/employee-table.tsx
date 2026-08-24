"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

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
import { useLocale } from "@/i18n"
import {
  formatDepartmentName,
  getEmployeeFullName,
  getEmployeeName,
  type EmployeeSortKey,
  type SortDirection,
} from "@/lib/employee"
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
    | "employee.sequence"
    | "employee.name"
    | "employee.nickname"
    | "employee.position"
    | "employee.department"
}[] = [
  { key: "employeeCode", labelKey: "employee.sequence" },
  { key: "name", labelKey: "employee.name" },
  { key: "nickname", labelKey: "employee.nickname" },
  { key: "position", labelKey: "employee.position" },
  { key: "department", labelKey: "employee.department" },
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
          <TableHeader className="bg-status-gray [&_th]:text-status-gray-foreground">
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
              const thaiName = getEmployeeName(employee, "th")
              const englishName = getEmployeeName(employee, "en")
              const departmentName = tl(employee.department)
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
                  <TableCell className="w-16 text-center font-mono text-xs tabular-nums">
                    {employee.employeeCode}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 flex-col">
                      <span className="font-medium whitespace-nowrap">
                        {thaiName}
                      </span>
                      {englishName && englishName !== thaiName ? (
                        <span className="text-muted-foreground text-xs">
                          {englishName}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {tl(employee.nickname) || "—"}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {tl(employee.position) || "—"}
                  </TableCell>
                  <TableCell
                    className="text-sm"
                    title={departmentName || undefined}
                  >
                    {departmentName
                      ? formatDepartmentName(departmentName)
                      : null}
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
        {employees.map((employee) => {
          const departmentName = tl(employee.department)
          return (
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
                    {t("employee.sequence")} {employee.employeeCode}
                  </p>
                  <p className="text-sm font-medium">
                    {getEmployeeName(employee, "th")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {getEmployeeName(employee, "en")}
                  </p>
                  <p className="text-sm">
                    {t("employee.nickname")}: {tl(employee.nickname) || "—"}
                  </p>
                  <p
                    className="text-muted-foreground text-xs"
                    title={departmentName || undefined}
                  >
                    {[
                      tl(employee.position),
                      formatDepartmentName(departmentName),
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                {rowActions(employee)}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
