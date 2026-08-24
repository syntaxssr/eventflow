"use client"

import * as React from "react"
import { FilterIcon, UserPlusIcon, UsersIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import {
  EMPTY_EMPLOYEE_FILTERS,
  filterEmployees,
  getEmployeeFullName,
  listDepartments,
  sortEmployees,
  summariseEmployees,
  type EmployeeFilters,
  type EmployeeSortKey,
  type SortDirection,
} from "@/lib/employee"
import { useAppState } from "@/store"
import type { Employee } from "@/types/employee"
import { EmployeeBulkBar } from "./employee-bulk-bar"
import { EmployeeFiltersBar } from "./employee-filters"
import { EmployeeFormDialog } from "./employee-form-dialog"
import { EmployeeSummaryCards } from "./employee-summary-cards"
import { EmployeeTable } from "./employee-table"
import { useEmployeeActions } from "./use-employee-actions"

/** มุมมองทะเบียนพนักงาน — ค้นหา กรอง จัดเรียง และจัดการรายชื่อทั้งบริษัท */
export function EmployeesView() {
  const { t, locale } = useLocale()
  const state = useAppState()
  const actions = useEmployeeActions()

  const [filters, setFilters] = React.useState(EMPTY_EMPLOYEE_FILTERS)
  const [sortKey, setSortKey] = React.useState<EmployeeSortKey>("employeeCode")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Employee | null>(null)
  const [deleteTargets, setDeleteTargets] = React.useState<Employee[]>([])
  const [busy, setBusy] = React.useState(false)

  const employees = state.employees
  const departments = React.useMemo(
    () => listDepartments(employees, locale),
    [employees, locale]
  )

  // แผนกที่เลือกไว้อาจหายไปหลังลบ/ย้ายพนักงานคนสุดท้ายของแผนกนั้น — ให้ถือว่าเป็น "ทุกแผนก"
  const departmentMissing =
    filters.department !== "all" &&
    departments.every((entry) => entry.key !== filters.department)
  const activeFilters = React.useMemo<EmployeeFilters>(
    () => (departmentMissing ? { ...filters, department: "all" } : filters),
    [filters, departmentMissing]
  )

  const filtered = React.useMemo(
    () => filterEmployees(employees, activeFilters, locale),
    [employees, activeFilters, locale]
  )
  const sorted = React.useMemo(
    () => sortEmployees(filtered, sortKey, sortDirection, locale),
    [filtered, sortKey, sortDirection, locale]
  )
  const summary = React.useMemo(() => summariseEmployees(employees), [employees])

  const selectedEmployees = React.useMemo(
    () => employees.filter((employee) => selectedIds.has(employee.id)),
    [employees, selectedIds]
  )

  const onSortChange = (key: EmployeeSortKey) => {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const toggleRow = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelectedIds((current) => {
      const allVisibleSelected =
        sorted.length > 0 && sorted.every((entry) => current.has(entry.id))
      if (allVisibleSelected) return new Set()
      return new Set(sorted.map((entry) => entry.id))
    })
  }

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    setBusy(true)
    const ok = await actions.deleteEmployees(deleteTargets)
    setBusy(false)
    if (ok) {
      setDeleteTargets([])
      setSelectedIds(new Set())
    }
  }

  const { state: pageState, retry } = usePageState(employees.length === 0)

  if (pageState === "error") return <ErrorState onRetry={retry} />

  if (pageState === "loading") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <EmployeeSummaryCards summary={summary} />

      <Card>
        <CardContent className="space-y-4">
          <EmployeeFiltersBar
            filters={activeFilters}
            onChange={setFilters}
            departments={departments}
            resultCount={filtered.length}
            actions={
              <Button size="sm" onClick={openAdd} data-testid="add-employee">
                <UserPlusIcon className="size-4" aria-hidden="true" />
                {t("employee.add")}
              </Button>
            }
          />

          <EmployeeBulkBar
            count={selectedEmployees.length}
            onDelete={() => setDeleteTargets(selectedEmployees)}
            onClear={() => setSelectedIds(new Set())}
          />

          {pageState === "empty" || employees.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title={t("employee.noEmployees")}
              description={t("employee.noEmployeesDescription")}
              action={<Button onClick={openAdd}>{t("employee.add")}</Button>}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FilterIcon}
              title={t("employee.noEmployeesMatch")}
              description={t("employee.noEmployeesMatchDescription")}
              action={
                <Button
                  variant="outline"
                  onClick={() => setFilters(EMPTY_EMPLOYEE_FILTERS)}
                >
                  {t("common.clearAll")}
                </Button>
              }
            />
          ) : (
            <EmployeeTable
              employees={sorted}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
              onEdit={(employee) => {
                setEditing(employee)
                setFormOpen(true)
              }}
              onDelete={(employee) => setDeleteTargets([employee])}
            />
          )}
        </CardContent>
      </Card>

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editing}
        existingEmployees={employees}
      />

      <ConfirmDialog
        open={deleteTargets.length > 0}
        onOpenChange={(open) => !open && setDeleteTargets([])}
        title={t("employee.confirmDeleteTitle")}
        description={t("employee.confirmDeleteDescription")}
        targetName={
          deleteTargets.length === 1
            ? getEmployeeFullName(deleteTargets[0], locale)
            : t("employee.selectedCount", { count: deleteTargets.length })
        }
        impact={[
          t("employee.confirmDeleteImpact", { count: deleteTargets.length }),
        ]}
        confirmLabel={t("common.delete")}
        destructive
        loading={busy}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
