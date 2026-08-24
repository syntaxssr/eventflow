"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DatePickerField } from "@/components/common/date-picker-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
import { isValidEmail, normalizeEmail } from "@/lib/import"
import { EMPLOYEE_STATUSES, type Employee } from "@/types/employee"
import {
  useEmployeeActions,
  type EmployeeFormInput,
} from "./use-employee-actions"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const employeeSchema = z.object({
  employeeCode: z.string().trim().min(1, "employee.employeeCodeRequired"),
  firstName: z.string().trim().min(1, "employee.firstNameRequired"),
  lastName: z.string().trim().min(1, "employee.lastNameRequired"),
  nickname: z.string().trim(),
  department: z.string().trim(),
  position: z.string().trim().min(1, "employee.positionRequired"),
  email: z
    .string()
    .trim()
    .min(1, "employee.emailRequired")
    .refine(isValidEmail, "employee.emailInvalid"),
  phone: z.string().trim(),
  startDate: z
    .string()
    .min(1, "employee.startDateRequired")
    .regex(DATE_PATTERN, "employee.startDateInvalid"),
  status: z.enum(EMPLOYEE_STATUSES),
  note: z.string().trim(),
})

type FormValues = z.infer<typeof employeeSchema>

function toFormValues(
  employee: Employee | null,
  locale: "th" | "en"
): FormValues {
  if (!employee) {
    return {
      employeeCode: "",
      firstName: "",
      lastName: "",
      nickname: "",
      department: "",
      position: "",
      email: "",
      phone: "",
      startDate: "",
      status: "active",
      note: "",
    }
  }
  return {
    employeeCode: employee.employeeCode,
    firstName: employee.firstName[locale],
    lastName: employee.lastName[locale],
    nickname: employee.nickname[locale],
    department: employee.department[locale],
    position: employee.position[locale],
    email: employee.email,
    phone: employee.phone,
    startDate: employee.startDate,
    status: employee.status,
    note: employee.note[locale],
  }
}

/** รหัสพนักงานเทียบแบบไม่สนตัวพิมพ์ เช่น emp-0001 กับ EMP-0001 ถือว่าซ้ำกัน */
function normalizeCode(code: string): string {
  return code.trim().toLowerCase()
}

/**
 * ฟอร์มเพิ่ม/แก้ไขพนักงาน — Manual Save
 * รหัสพนักงานและอีเมลต้องไม่ซ้ำกับทะเบียนเดิม (ยกเว้นรายการที่กำลังแก้ไขเอง)
 */
export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  existingEmployees,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee | null
  existingEmployees: Employee[]
}) {
  const { t, locale } = useLocale()
  const actions = useEmployeeActions()
  const isEditing = Boolean(employee)

  const form = useForm<FormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: toFormValues(employee ?? null, locale),
  })

  React.useEffect(() => {
    if (open) form.reset(toFormValues(employee ?? null, locale))
  }, [open, employee, locale, form])

  const { isSubmitting } = form.formState

  const onSubmit = async (values: FormValues) => {
    const code = normalizeCode(values.employeeCode)
    const email = normalizeEmail(values.email)
    const others = existingEmployees.filter(
      (entry) => entry.id !== employee?.id
    )
    const codeDuplicate = others.some(
      (entry) => normalizeCode(entry.employeeCode) === code
    )
    const emailDuplicate = others.some(
      (entry) => normalizeEmail(entry.email) === email
    )
    if (codeDuplicate) {
      form.setError("employeeCode", { message: "employee.employeeCodeDuplicate" })
    }
    if (emailDuplicate) {
      form.setError("email", { message: "employee.emailDuplicate" })
    }
    if (codeDuplicate || emailDuplicate) return

    const input: EmployeeFormInput = values
    const ok = employee
      ? await actions.updateEmployee(employee, input)
      : await actions.addEmployee(input)
    if (ok) onOpenChange(false)
  }

  /** ข้อความ error เก็บเป็น key i18n เพื่อเปลี่ยนภาษาได้ทันที */
  const message = (key?: string) =>
    key ? t(key as TranslationKey) : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-none grid-rows-[auto_1fr] overflow-hidden sm:min-h-[min(40rem,calc(100dvh-2rem))] sm:max-w-5xl sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("employee.editTitle") : t("employee.addTitle")}
          </DialogTitle>
          <DialogDescription className="truncate">
            {t("employee.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-col gap-4 [&_[data-slot=form-item]]:min-w-0 [&_[data-slot=form-label]]:block [&_[data-slot=form-label]]:truncate [&_[data-slot=form-message]]:truncate"
            noValidate
            data-testid="employee-form"
          >
            <div className="grid min-h-0 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="contents">
              <FormField
                control={form.control}
                name="employeeCode"
                render={({ field, fieldState }) => (
                  <FormItem className="order-1">
                    <FormLabel>{t("employee.employeeCode")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("employee.employeeCodePlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage>{message(fieldState.error?.message)}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="order-2">
                    <FormLabel>{t("employeeStatus.label")}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                  </FormItem>
                )}
              />
            </div>

            <div className="contents">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormItem className="order-4">
                    <FormLabel>{t("employee.firstName")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("employee.firstNamePlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage>{message(fieldState.error?.message)}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <FormItem className="order-5">
                    <FormLabel>{t("employee.lastName")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("employee.lastNamePlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage>{message(fieldState.error?.message)}</FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <div className="contents">
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem className="order-6">
                    <FormLabel>{t("employee.nickname")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("employee.nicknamePlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <FormItem className="order-3">
                    <FormLabel>{t("employee.startDate")}</FormLabel>
                    <DatePickerField
                      label={t("employee.startDate")}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                    <FormMessage>{message(fieldState.error?.message)}</FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <div className="contents">
              <FormField
                control={form.control}
                name="department"
                render={({ field, fieldState }) => (
                  <FormItem className="order-7">
                    <FormLabel>{t("employee.department")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("employee.departmentPlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage>{message(fieldState.error?.message)}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field, fieldState }) => (
                  <FormItem className="order-8">
                    <FormLabel>{t("employee.position")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("employee.positionPlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage>{message(fieldState.error?.message)}</FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <div className="contents">
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem className="order-9">
                    <FormLabel>{t("employee.email")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t("employee.emailPlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage>{message(fieldState.error?.message)}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="order-10">
                    <FormLabel>{t("employee.phone")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder={t("employee.phonePlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="order-11">
                  <FormLabel>{t("employee.note")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("employee.notePlaceholder")}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            </div>

            <DialogFooter className="mt-auto sm:-mx-6 sm:-mb-6 sm:p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="employee-form-submit"
              >
                {isSubmitting ? (
                  <Loader2Icon
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                {isEditing ? t("common.saveChanges") : t("common.add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
