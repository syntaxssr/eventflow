"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon, ImageOffIcon, Loader2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useDemo } from "@/components/dev/demo-provider"
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
import { EVENT_STATUS_STYLE } from "@/constants/status"
import { useActivityLog } from "@/hooks/use-activity-log"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { nowIso } from "@/lib/clock"
import { newId } from "@/lib/id"
import { getFullName } from "@/lib/user"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppState, useCurrentUser } from "@/store"
import { EVENT_STATUSES, type EventItem } from "@/types/event"
import { COVER_OPTIONS, eventSchema, type EventFormValues } from "./event-schema"

function toFormValues(event: EventItem | null, locale: "th" | "en", ownerId: string): EventFormValues {
  if (!event) {
    return {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      startTime: "09:00",
      endTime: "17:00",
      location: "",
      ownerId,
      expectedAttendees: 0,
      status: "draft",
      coverImage: COVER_OPTIONS[0],
    }
  }
  return {
    title: event.title[locale],
    description: event.description[locale],
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location[locale],
    ownerId: event.ownerId,
    expectedAttendees: event.expectedAttendees,
    status: event.status,
    coverImage: event.coverImage,
  }
}

/**
 * ฟอร์มสร้าง/แก้ไขกิจกรรม — ใช้ Manual Save ตามข้อกำหนด
 *
 * ข้อความที่ผู้ใช้พิมพ์เองถูกเก็บเหมือนกันทั้งสองภาษา
 * เพราะผู้ใช้ป้อนมาชุดเดียว ต่างจาก Mock Data ที่เตรียมไว้ทั้งไทยและอังกฤษ
 */
export function EventFormDialog({
  open,
  onOpenChange,
  event,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: EventItem | null
}) {
  const { t, locale } = useLocale()
  const dispatch = useAppDispatch()
  const users = useAppState().users
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const logActivity = useActivityLog()

  const [confirmClose, setConfirmClose] = React.useState(false)
  const isEditing = Boolean(event)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: toFormValues(event ?? null, locale, currentUser?.id ?? "u-1"),
  })

  // โหลดค่าเริ่มต้นใหม่ทุกครั้งที่เปิดกล่อง เพื่อไม่ให้ค่าจากครั้งก่อนค้าง
  React.useEffect(() => {
    if (open) {
      form.reset(toFormValues(event ?? null, locale, currentUser?.id ?? "u-1"))
    }
  }, [open, event, locale, currentUser, form])

  // ต้องอ่าน formState ระหว่าง render เพื่อให้ react-hook-form เปิด subscription
  // ให้ค่าทั้งสองนี้ — ถ้าอ่านเฉพาะใน callback ค่าจะไม่ถูกอัปเดต
  const { isSubmitting, isDirty } = form.formState

  const requestClose = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true)
      return
    }
    if (isDirty && !isSubmitting) {
      setConfirmClose(true)
      return
    }
    onOpenChange(false)
  }

  const onSubmit = async (values: EventFormValues) => {
    if (!currentUser) return

    try {
      await demo.simulate()
    } catch {
      toast.error(t("common.saveFailed"))
      return
    }

    const at = nowIso()
    const localized = (value: string) => ({ th: value, en: value })

    if (event) {
      dispatch({
        type: "event/update",
        id: event.id,
        by: currentUser.id,
        at,
        changes: {
          title: localized(values.title),
          description: localized(values.description),
          startDate: values.startDate,
          endDate: values.endDate,
          startTime: values.startTime,
          endTime: values.endTime,
          location: localized(values.location),
          ownerId: values.ownerId,
          expectedAttendees: values.expectedAttendees,
          status: values.status,
          coverImage: values.coverImage,
        },
      })

      logActivity({
        action: "event_updated",
        targetType: "event",
        targetId: event.id,
        targetName: localized(values.title),
        eventId: event.id,
        before: null,
        after: null,
        createdAt: at,
      })

      toast.success(t("event.updated"))
    } else {
      const newEvent: EventItem = {
        id: newId("e"),
        title: localized(values.title),
        description: localized(values.description),
        startDate: values.startDate,
        endDate: values.endDate,
        startTime: values.startTime,
        endTime: values.endTime,
        location: localized(values.location),
        ownerId: values.ownerId,
        expectedAttendees: values.expectedAttendees,
        status: values.status,
        coverImage: values.coverImage,
        createdAt: at,
        createdBy: currentUser.id,
        updatedAt: at,
        updatedBy: currentUser.id,
        deletedAt: null,
        deletedBy: null,
      }

      dispatch({ type: "event/create", event: newEvent })
      logActivity({
        action: "event_created",
        targetType: "event",
        targetId: newEvent.id,
        targetName: newEvent.title,
        eventId: newEvent.id,
        before: null,
        after: null,
        createdAt: at,
      })

      toast.success(t("event.created"))
    }

    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={requestClose}>
        <DialogContent className="max-h-[92svh] gap-0 overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("event.editTitle") : t("event.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t("event.editDescription")
                : t("event.createDescription")}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              id="event-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("event.name")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("event.namePlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("event.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder={t("event.descriptionPlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("event.startDate")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("event.endDate")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("event.startTime")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("event.endTime")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("event.location")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("event.locationPlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="ownerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("event.owner")}</FormLabel>
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
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {getFullName(user, locale)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("designSystem.eventStatuses")}</FormLabel>
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
                          {EVENT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {t(
                                EVENT_STATUS_STYLE[status]
                                  .labelKey as TranslationKey
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("event.expectedAttendees")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          disabled={isSubmitting}
                          value={field.value}
                          onChange={(changeEvent) =>
                            field.onChange(
                              changeEvent.target.value === ""
                                ? 0
                                : Number(changeEvent.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("event.coverImage")}</FormLabel>
                    <div
                      role="radiogroup"
                      aria-label={t("event.coverImage")}
                      className="flex flex-wrap gap-2"
                    >
                      <button
                        type="button"
                        role="radio"
                        aria-checked={field.value === ""}
                        aria-label={t("event.coverNone")}
                        onClick={() => field.onChange("")}
                        className={cn(
                          "focus-visible:outline-ring text-muted-foreground flex h-12 w-20 items-center justify-center rounded-md border-2 focus-visible:outline-2",
                          field.value === ""
                            ? "border-brand-500"
                            : "border-border"
                        )}
                      >
                        <ImageOffIcon className="size-4" aria-hidden="true" />
                      </button>
                      {COVER_OPTIONS.map((cover) => (
                        <button
                          key={cover}
                          type="button"
                          role="radio"
                          aria-checked={field.value === cover}
                          aria-label={cover.split("/").pop() ?? cover}
                          onClick={() => field.onChange(cover)}
                          style={{ backgroundImage: `url(${cover})` }}
                          className={cn(
                            "focus-visible:outline-ring relative h-12 w-20 rounded-md border-2 bg-cover bg-center focus-visible:outline-2",
                            field.value === cover
                              ? "border-brand-500"
                              : "border-border"
                          )}
                        >
                          {field.value === cover ? (
                            <span className="bg-brand-500 text-brand-950 absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full">
                              <CheckIcon className="size-3" aria-hidden="true" />
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => requestClose(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" form="event-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {isSubmitting ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title={t("event.unsavedTitle")}
        description={t("event.unsavedDescription")}
        confirmLabel={t("event.unsavedDiscard")}
        cancelLabel={t("event.unsavedKeep")}
        destructive
        onConfirm={() => {
          setConfirmClose(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
