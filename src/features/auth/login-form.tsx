"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { appToast } from "@/lib/gif-toast"

import { useDemo } from "@/components/dev/demo-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROUTES } from "@/constants/app"
import { MOCK_NOW_ISO } from "@/constants/mock-date"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { authenticate } from "@/mock"
import { useAppDispatch } from "@/store"
import { loginSchema, type LoginValues } from "./login-schema"
import { MockAccountPanel } from "./mock-account-panel"

/** ช่องกรอกแบบขีดเส้นใต้ (ไม่มีกรอบรอบ) — ใช้เฉพาะหน้า Login */
const UNDERLINE_INPUT =
  "h-11 rounded-none border-0 border-b border-input bg-transparent px-0 text-base focus-visible:border-foreground focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent"

export function LoginForm() {
  const { t } = useLocale()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const demo = useDemo()

  const [showPassword, setShowPassword] = React.useState(false)
  const [formError, setFormError] = React.useState<TranslationKey | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onSubmit",
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (values: LoginValues) => {
    setFormError(null)

    try {
      await demo.simulate()
    } catch {
      setFormError("toast.genericError")
      appToast.error(t("toast.genericError"))
      return
    }

    const credential = authenticate(values.email, values.password)

    if (!credential) {
      setFormError("auth.invalidCredentials")
      appToast.error(t("auth.invalidCredentials"))
      form.setFocus("email")
      return
    }

    dispatch({
      type: "auth/signIn",
      userId: credential.userId,
      rememberMe: values.rememberMe,
      at: MOCK_NOW_ISO,
    })

    // Toast ต้อนรับใช้ภาพเคลื่อนไหวหมวด welcome ซึ่งสลับภาพใหม่ทุกครั้งที่เข้าสู่ระบบ
    // ข้อความเหลือคำเดียวเพราะภาพเป็นตัวสื่อสารหลัก และชื่อผู้ใช้อยู่บน Topbar อยู่แล้ว
    appToast.welcome("WELCOME")

    router.replace(ROUTES.dashboard)
  }

  const fillAccount = (email: string, password: string) => {
    form.setValue("email", email, { shouldValidate: true })
    form.setValue("password", password, { shouldValidate: true })
    setFormError(null)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        {formError ? (
          <div
            role="alert"
            data-testid="login-error"
            className="border-destructive-message/30 bg-destructive-message/10 text-destructive-message flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm"
          >
            <TriangleAlertIcon
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{t(formError)}</span>
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">{t("auth.email")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder={t("auth.emailPlaceholder")}
                  disabled={isSubmitting}
                  className={UNDERLINE_INPUT}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">{t("auth.password")}</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={t("auth.passwordPlaceholder")}
                    disabled={isSubmitting}
                    className={`${UNDERLINE_INPUT} pr-10`}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                  }
                  aria-pressed={showPassword}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2">
                <FormControl>
                  <Checkbox
                    id="rememberMe"
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    disabled={isSubmitting}
                  />
                </FormControl>
                <Label htmlFor="rememberMe" className="font-normal">
                  {t("auth.rememberMe")}
                </Label>
              </FormItem>
            )}
          />

          <p className="text-muted-foreground text-sm">
            {t("auth.forgotPassword")}{" "}
            <button
              type="button"
              className="text-foreground rounded-sm font-semibold underline underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              onClick={() => toast.info(t("auth.forgotPasswordUnavailable"))}
            >
              {t("auth.forgotPasswordCta")}
            </button>
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
              {t("auth.signingIn")}
            </>
          ) : (
            t("auth.signIn")
          )}
        </Button>

        <MockAccountPanel onSelect={fillAccount} disabled={isSubmitting} />
      </form>
    </Form>
  )
}
