"use client"

import * as React from "react"
import { appToast } from "@/lib/gif-toast"

import { useDemo } from "@/components/dev/demo-provider"
import { useActivityLog } from "@/hooks/use-activity-log"
import { useLocale } from "@/i18n"
import { getEmployeeLocalizedName } from "@/lib/employee"
import { newId } from "@/lib/id"
import { useAppDispatch, useCurrentUser } from "@/store"
import type { Locale, LocalizedText } from "@/types/common"
import type { Employee, EmployeeStatus } from "@/types/employee"

/** ข้อมูลจากฟอร์ม — ผู้ใช้กรอกชุดเดียวในภาษาที่แสดงอยู่ */
export interface EmployeeFormInput {
  employeeCode: string
  firstName: string
  lastName: string
  nickname: string
  department: string
  position: string
  email: string
  phone: string
  startDate: string
  status: EmployeeStatus
  note: string
}

/**
 * ถ้าค่าในภาษาที่กำลังแก้ไม่เปลี่ยน ให้คงคำแปลอีกภาษาของข้อมูลเดิมไว้
 * ไม่งั้นเก็บค่าเดียวกันทั้งสองภาษาเหมือนผู้เข้าร่วม เพราะผู้ใช้ป้อนมาชุดเดียว
 */
function toLocalizedText(
  value: string,
  locale: Locale,
  existing?: LocalizedText
): LocalizedText {
  if (existing && existing[locale] === value) return existing
  return { th: value, en: value }
}

function toEmployeeFields(
  input: EmployeeFormInput,
  locale: Locale,
  existing?: Employee
): Omit<Employee, "id"> {
  return {
    employeeCode: input.employeeCode,
    firstName: toLocalizedText(input.firstName, locale, existing?.firstName),
    lastName: toLocalizedText(input.lastName, locale, existing?.lastName),
    nickname: toLocalizedText(input.nickname, locale, existing?.nickname),
    department: toLocalizedText(input.department, locale, existing?.department),
    position: toLocalizedText(input.position, locale, existing?.position),
    email: input.email,
    phone: input.phone,
    startDate: input.startDate,
    status: input.status,
    note: toLocalizedText(input.note, locale, existing?.note),
  }
}

/**
 * การกระทำทั้งหมดกับทะเบียนพนักงาน — Manual Save ตามข้อกำหนด
 * ทุกการเปลี่ยนแปลงบันทึกลง Activity History (ไม่ผูกกับกิจกรรมใด)
 */
export function useEmployeeActions() {
  const { t, locale } = useLocale()
  const dispatch = useAppDispatch()
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const logActivity = useActivityLog()

  const save = React.useCallback(async () => {
    try {
      await demo.simulate()
      return true
    } catch {
      appToast.error(t("common.saveFailed"))
      return false
    }
  }, [demo, t])

  const addEmployee = React.useCallback(
    async (input: EmployeeFormInput) => {
      if (!currentUser || !(await save())) return false

      const employee: Employee = {
        id: newId("emp"),
        ...toEmployeeFields(input, locale),
      }

      dispatch({ type: "employee/add", employee })
      logActivity({
        action: "employee_added",
        targetType: "employee",
        targetId: employee.id,
        targetName: getEmployeeLocalizedName(employee),
        eventId: null,
        before: null,
        after: null,
      })
      appToast.success(t("employee.added"))
      return true
    },
    [currentUser, dispatch, locale, logActivity, save, t]
  )

  const updateEmployee = React.useCallback(
    async (employee: Employee, input: EmployeeFormInput) => {
      if (!currentUser || !(await save())) return false

      const changes: Partial<Employee> = toEmployeeFields(
        input,
        locale,
        employee
      )

      dispatch({ type: "employee/update", id: employee.id, changes })
      logActivity({
        action: "employee_updated",
        targetType: "employee",
        targetId: employee.id,
        targetName: getEmployeeLocalizedName({ ...employee, ...changes }),
        eventId: null,
        before: null,
        after: null,
      })
      appToast.success(t("employee.updated"))
      return true
    },
    [currentUser, dispatch, locale, logActivity, save, t]
  )

  const deleteEmployees = React.useCallback(
    async (employees: Employee[]) => {
      if (!currentUser || employees.length === 0 || !(await save()))
        return false

      dispatch({
        type: "employee/delete",
        ids: employees.map((employee) => employee.id),
      })
      logActivity({
        action: "employee_deleted",
        targetType: "employee",
        targetId: employees[0].id,
        targetName:
          employees.length === 1
            ? getEmployeeLocalizedName(employees[0])
            : {
                th: `${employees.length} คน`,
                en: `${employees.length} employees`,
              },
        eventId: null,
        before: null,
        after: null,
      })
      appToast.delete(t("employee.deleted", { count: employees.length }))
      return true
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  return { addEmployee, updateEmployee, deleteEmployees }
}
