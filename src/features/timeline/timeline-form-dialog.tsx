"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { appToast } from "@/lib/gif-toast"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { TimePickerField } from "@/components/common/time-picker-field"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { READINESS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { derivePhase } from "@/lib/timeline"
import { getFullName } from "@/lib/user"
import { useAppState } from "@/store"
import { selectEventById, selectTasksByEvent } from "@/store/selectors"
import { READINESS_STATUSES, type TimelineItem } from "@/types/timeline"
import { timelineSchema, type TimelineFormValues } from "./timeline-schema"
import { useTimelineActions } from "./use-timeline-actions"

const NO_TASK = "none"

function toFormValues(
  item: TimelineItem | null,
  locale: "th" | "en",
  defaultDate: string
): TimelineFormValues {
  if (!item) {
    return {
      title: "",
      date: defaultDate,
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      ownerIds: [],
      readiness: "not_ready",
      note: "",
      linkedTaskId: NO_TASK,
    }
  }
  return {
    title: item.title[locale],
    date: item.date,
    startTime: item.startTime,
    endTime: item.endTime,
    location: item.location[locale],
    ownerIds: [...item.ownerIds],
    readiness: item.readiness,
    note: item.note[locale],
    linkedTaskId: item.linkedTaskId ?? NO_TASK,
  }
}

/** ฟอร์มเพิ่ม/แก้ไขรายการไทม์ไลน์ — Manual Save */
export function TimelineFormDialog({
  open,
  onOpenChange,
  item,
  eventId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: TimelineItem | null
  eventId: string
}) {
  const { t, locale } = useLocale()
  const state = useAppState()
  const actions = useTimelineActions()

  const event = selectEventById(state, eventId)
  const tasks = selectTasksByEvent(state, eventId)
  const [confirmClose, setConfirmClose] = React.useState(false)

  const form = useForm<TimelineFormValues>({
    resolver: zodResolver(timelineSchema),
    defaultValues: toFormValues(
      item ?? null,
      locale,
      event?.startDate ?? "2026-09-18"
    ),
  })
  const startTime = useWatch({ control: form.control, name: "startTime" })

  React.useEffect(() => {
    if (open) {
      form.reset(
        toFormValues(item ?? null, locale, event?.startDate ?? "2026-09-18")
      )
    }
  }, [open, item, locale, event, form])

  // formState เป็น proxy — ต้องอ่านระหว่าง render จึงจะได้ค่าที่อัปเดตจริง
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

  const onSubmit = async (values: TimelineFormValues) => {
    const localized = (value: string) => ({ th: value, en: value })
    const phase = derivePhase(
      values.date,
      event?.startDate ?? values.date,
      event?.endDate ?? values.date
    )

    try {
      if (item) {
        const scheduleChanged =
          item.date !== values.date ||
          item.startTime !== values.startTime ||
          item.endTime !== values.endTime

        await actions.updateItem(
          item,
          {
            title: localized(values.title),
            date: values.date,
            startTime: values.startTime,
            endTime: values.endTime,
            location: localized(values.location),
            ownerIds: values.ownerIds,
            readiness: values.readiness,
            note: localized(values.note),
            linkedTaskId:
              values.linkedTaskId === NO_TASK ? null : values.linkedTaskId,
            phase,
          },
          scheduleChanged
            ? {
                before: localized(
                  `${item.date} ${item.startTime}–${item.endTime}`
                ),
                after: localized(
                  `${values.date} ${values.startTime}–${values.endTime}`
                ),
              }
            : {}
        )
        appToast.success(t("timeline.updated"))
      } else {
        await actions.createItem({
          eventId,
          phase,
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          title: localized(values.title),
          ownerIds: values.ownerIds,
          location: localized(values.location),
          readiness: values.readiness,
          note: localized(values.note),
          linkedTaskId:
            values.linkedTaskId === NO_TASK ? null : values.linkedTaskId,
          order: state.timeline.filter(
            (entry) => entry.eventId === eventId && entry.phase === phase
          ).length,
        })
      }
    } catch {
      appToast.error(t("common.saveFailed"))
      return
    }

    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={requestClose}>
        <DialogContent className="max-h-[92svh] gap-0 overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {item ? t("timeline.editTitle") : t("timeline.createTitle")}
            </DialogTitle>
            <DialogDescription>{t("timeline.subtitle")}</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              id="timeline-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("timeline.name")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("timeline.namePlaceholder")}
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("timeline.date")}</FormLabel>
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
                      <FormLabel>{t("timeline.startTime")}</FormLabel>
                      <TimePickerField
                        label={t("timeline.startTime")}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("timeline.endTime")}</FormLabel>
                      {/* รายการไทม์ไลน์อยู่ในวันเดียวเสมอ เวลาสิ้นสุดจึงต้อง
                          มาหลังเวลาเริ่มทุกกรณี */}
                      <TimePickerField
                        label={t("timeline.endTime")}
                        value={field.value}
                        onChange={field.onChange}
                        min={startTime}
                        disabled={isSubmitting}
                      />
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
                    <FormLabel>{t("timeline.location")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("timeline.locationPlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("timeline.owners")}</FormLabel>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {state.users.map((user) => (
                        <div key={user.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`timeline-owner-${user.id}`}
                            checked={field.value.includes(user.id)}
                            disabled={isSubmitting}
                            onCheckedChange={(checked) =>
                              field.onChange(
                                checked === true
                                  ? [...field.value, user.id]
                                  : field.value.filter(
                                      (id: string) => id !== user.id
                                    )
                              )
                            }
                          />
                          <Label
                            htmlFor={`timeline-owner-${user.id}`}
                            className="flex items-center gap-1.5 font-normal"
                          >
                            <UserAvatar user={user} size="xs" />
                            <span className="truncate text-sm">
                              {getFullName(user, locale)}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="readiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("timeline.readiness")}</FormLabel>
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
                          {READINESS_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {t(
                                READINESS_STYLE[status].labelKey as TranslationKey
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
                  name="linkedTaskId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("timeline.linkedTask")}</FormLabel>
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
                          <SelectItem value={NO_TASK}>
                            {t("timeline.noLinkedTask")}
                          </SelectItem>
                          {tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title[locale]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("timeline.note")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={2}
                        placeholder={t("timeline.notePlaceholder")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
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
            <Button type="submit" form="timeline-form" disabled={isSubmitting}>
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
