"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import {
  PARTICIPANT_TYPE_STYLE,
  RSVP_STATUS_STYLE,
} from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { isValidEmail, normalizeEmail } from "@/lib/import"
import {
  PARTICIPANT_TYPES,
  RSVP_STATUSES,
  type Participant,
} from "@/types/participant"
import {
  useParticipantActions,
  type ParticipantFormInput,
} from "./use-participant-actions"

const participantSchema = z.object({
  firstName: z.string().trim().min(1, "participant.firstNameRequired"),
  lastName: z.string().trim().min(1, "participant.lastNameRequired"),
  email: z
    .string()
    .trim()
    .min(1, "participant.emailRequired")
    .refine(isValidEmail, "participant.emailInvalid"),
  department: z.string().trim(),
  phone: z.string().trim(),
  rsvpStatus: z.enum(RSVP_STATUSES),
  type: z.enum(PARTICIPANT_TYPES),
  note: z.string().trim(),
})

type FormValues = z.infer<typeof participantSchema>

function toFormValues(
  participant: Participant | null,
  locale: "th" | "en"
): FormValues {
  if (!participant) {
    return {
      firstName: "",
      lastName: "",
      email: "",
      department: "",
      phone: "",
      rsvpStatus: "pending",
      type: "employee",
      note: "",
    }
  }
  return {
    firstName: participant.firstName[locale],
    lastName: participant.lastName[locale],
    email: participant.email,
    department: participant.department[locale],
    phone: participant.phone,
    rsvpStatus: participant.rsvpStatus,
    type: participant.type,
    note: participant.note[locale],
  }
}

/**
 * ฟอร์มเพิ่ม/แก้ไขผู้เข้าร่วม — Manual Save
 * อีเมลต้องไม่ซ้ำกับรายชื่อเดิมของกิจกรรม (ยกเว้นรายการที่กำลังแก้ไขเอง)
 */
export function ParticipantFormDialog({
  open,
  onOpenChange,
  eventId,
  participant,
  existingParticipants,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  participant?: Participant | null
  existingParticipants: Participant[]
}) {
  const { t, locale } = useLocale()
  const actions = useParticipantActions()
  const isEditing = Boolean(participant)

  const form = useForm<FormValues>({
    resolver: zodResolver(participantSchema),
    defaultValues: toFormValues(participant ?? null, locale),
  })

  React.useEffect(() => {
    if (open) form.reset(toFormValues(participant ?? null, locale))
  }, [open, participant, locale, form])

  const { isSubmitting } = form.formState

  const onSubmit = async (values: FormValues) => {
    const email = normalizeEmail(values.email)
    const duplicate = existingParticipants.some(
      (entry) =>
        entry.id !== participant?.id && normalizeEmail(entry.email) === email
    )
    if (duplicate) {
      form.setError("email", { message: "participant.emailDuplicate" })
      return
    }

    const input: ParticipantFormInput = values
    const ok = participant
      ? await actions.updateParticipant(participant, input)
      : await actions.addParticipant(eventId, input)
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
            {isEditing ? t("participant.editTitle") : t("participant.addTitle")}
          </DialogTitle>
          <DialogDescription>{t("participant.subtitle")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("participant.firstName")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("participant.firstNamePlaceholder")}
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
                    <FormLabel>{t("participant.lastName")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("participant.lastNamePlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage>{message(fieldState.error?.message)}</FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("participant.email")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t("participant.emailPlaceholder")}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage>{message(fieldState.error?.message)}</FormMessage>
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("participant.department")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("participant.departmentPlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("participant.phone")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("participant.phonePlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="rsvpStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("rsvp.label")}</FormLabel>
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
                        {RSVP_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(RSVP_STATUS_STYLE[status].labelKey as TranslationKey)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("participantType.label")}</FormLabel>
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
                        {PARTICIPANT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(
                              PARTICIPANT_TYPE_STYLE[type]
                                .labelKey as TranslationKey
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("participant.note")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder={t("participant.notePlaceholder")}
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
              <Button type="submit" disabled={isSubmitting}>
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
