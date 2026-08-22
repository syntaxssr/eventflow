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
import { Textarea } from "@/components/ui/textarea"
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
  department: z.string().trim().min(1, "employee.departmentRequired"),
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("employee.editTitle") : t("employee.addTitle")}
          </DialogTitle>
          <DialogDescription>{t("employee.subtitle")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
            data-testid="employee-form"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="employeeCode"
                render={({ field, fieldState }) => (
                  <FormItem>
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
                  <FormItem>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormItem>
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
                  <FormItem>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
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
                  <FormItem>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="department"
                render={({ field, fieldState }) => (
                  <FormItem>
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
                  <FormItem>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
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
                  <FormItem>
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
                <FormItem>
                  <FormLabel>{t("employee.note")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder={t("employee.notePlaceholder")}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
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
