"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { UserAvatar } from "@/components/common/user-avatar"
import { useDemo } from "@/components/dev/demo-provider"
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
import { ROUTES } from "@/constants/app"
import { PRIORITY_STYLE, TASK_STATUS_STYLE } from "@/constants/status"
import { useActivityLog } from "@/hooks/use-activity-log"
import { useNotify } from "@/hooks/use-notify"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { nowIso } from "@/lib/clock"
import { newId } from "@/lib/id"
import { getFullName } from "@/lib/user"
import { useAppDispatch, useAppState, useCurrentUser } from "@/store"
import { selectActiveEvents } from "@/store/selectors"
import { PRIORITIES, TASK_STATUSES, type Task } from "@/types/task"
import { taskSchema, type TaskFormValues } from "./task-schema"

function toFormValues(
  task: Task | null,
  locale: "th" | "en",
  defaultEventId: string,
  defaultAssigneeId: string
): TaskFormValues {
  if (!task) {
    return {
      title: "",
      description: "",
      notes: "",
      eventId: defaultEventId,
      assigneeIds: defaultAssigneeId ? [defaultAssigneeId] : [],
      startDate: "",
      dueDate: "",
      priority: "normal",
      status: "not_started",
    }
  }
  return {
    title: task.title[locale],
    description: task.description[locale],
    notes: task.notes[locale],
    eventId: task.eventId,
    assigneeIds: [...task.assigneeIds],
    startDate: task.startDate ?? "",
    dueDate: task.dueDate ?? "",
    priority: task.priority,
    status: task.status,
  }
}

/** ฟอร์มสร้าง/แก้ไขงานย่อย — Manual Save ตามข้อกำหนด */
export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultEventId,
  lockEvent = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  defaultEventId: string
  /** ล็อกกิจกรรมไว้เมื่อเปิดจากหน้ารายละเอียดกิจกรรม */
  lockEvent?: boolean
}) {
  const { t, locale } = useLocale()
  const dispatch = useAppDispatch()
  const state = useAppState()
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const logActivity = useActivityLog()
  const notify = useNotify()

  const [confirmClose, setConfirmClose] = React.useState(false)
  const isEditing = Boolean(task)
  const events = selectActiveEvents(state)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: toFormValues(
      task ?? null,
      locale,
      defaultEventId,
      currentUser?.id ?? ""
    ),
  })

  React.useEffect(() => {
    if (open) {
      form.reset(
        toFormValues(task ?? null, locale, defaultEventId, currentUser?.id ?? "")
      )
    }
  }, [open, task, locale, defaultEventId, currentUser, form])

  // formState เป็น proxy — ต้องอ่านระหว่าง render เพื่อให้ค่าอัปเดตจริง
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

  const onSubmit = async (values: TaskFormValues) => {
    if (!currentUser) return

    try {
      await demo.simulate()
    } catch {
      toast.error(t("common.saveFailed"))
      return
    }

    const at = nowIso()
    const localized = (value: string) => ({ th: value, en: value })

    if (task) {
      dispatch({
        type: "task/update",
        id: task.id,
        by: currentUser.id,
        at,
        changes: {
          title: localized(values.title),
          description: localized(values.description),
          notes: localized(values.notes),
          assigneeIds: values.assigneeIds,
          startDate: values.startDate || null,
          dueDate: values.dueDate,
          priority: values.priority,
          status: values.status,
        },
      })
      logActivity({
        action: "task_updated",
        targetType: "task",
        targetId: task.id,
        targetName: localized(values.title),
        eventId: task.eventId,
        before: null,
        after: null,
        createdAt: at,
      })
      // แจ้งเฉพาะผู้รับผิดชอบที่เพิ่งถูกเพิ่มเข้ามาใหม่
      notify(
        {
          type: "task_assigned",
          title: { th: "คุณได้รับมอบหมายงานใหม่", en: "You have a new task" },
          body: localized(values.title),
          href: ROUTES.myTasks,
          eventId: task.eventId,
          createdAt: at,
          actorId: currentUser.id,
        },
        values.assigneeIds.filter((id) => !task.assigneeIds.includes(id))
      )
      toast.success(t("task.updated"))
    } else {
      const newTask: Task = {
        id: newId("t"),
        eventId: values.eventId,
        title: localized(values.title),
        description: localized(values.description),
        notes: localized(values.notes),
        assigneeIds: values.assigneeIds,
        startDate: values.startDate || null,
        dueDate: values.dueDate,
        priority: values.priority,
        status: values.status,
        checklist: [],
        attachmentIds: [],
        dependsOn: [],
        blocks: [],
        blockOverridden: false,
        createdAt: at,
        createdBy: currentUser.id,
        updatedAt: at,
        updatedBy: currentUser.id,
      }

      dispatch({ type: "task/create", task: newTask })
      notify(
        {
          type: "task_assigned",
          title: { th: "คุณได้รับมอบหมายงานใหม่", en: "You have a new task" },
          body: newTask.title,
          href: ROUTES.myTasks,
          eventId: newTask.eventId,
          createdAt: at,
          actorId: currentUser.id,
        },
        values.assigneeIds
      )
      logActivity({
        action: "task_created",
        targetType: "task",
        targetId: newTask.id,
        targetName: newTask.title,
        eventId: newTask.eventId,
        before: null,
        after: null,
        createdAt: at,
      })
      toast.success(t("task.created"))
    }

    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={requestClose}>
        <DialogContent className="max-h-[92svh] gap-0 overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("task.editTitle") : t("task.createTitle")}
            </DialogTitle>
            <DialogDescription>{t("task.descriptionPlaceholder")}</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              id="task-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("task.name")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("task.namePlaceholder")}
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
                    <FormLabel>{t("task.description")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!lockEvent ? (
                <FormField
                  control={form.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("task.event")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting || isEditing}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title[locale]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name="assigneeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("task.selectAssignees")}</FormLabel>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {state.users.map((user) => {
                        const checked = field.value.includes(user.id)
                        return (
                          <div key={user.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`assignee-${user.id}`}
                              checked={checked}
                              disabled={isSubmitting}
                              onCheckedChange={(next) =>
                                field.onChange(
                                  next === true
                                    ? [...field.value, user.id]
                                    : field.value.filter(
                                        (id: string) => id !== user.id
                                      )
                                )
                              }
                            />
                            <Label
                              htmlFor={`assignee-${user.id}`}
                              className="flex items-center gap-1.5 font-normal"
                            >
                              <UserAvatar user={user} size="xs" />
                              <span className="truncate text-sm">
                                {getFullName(user, locale)}
                              </span>
                            </Label>
                          </div>
                        )
                      })}
                    </div>
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
                      <FormLabel>{t("task.startDate")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("task.dueDate")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("priority.label")}</FormLabel>
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
                          {PRIORITIES.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {t(
                                PRIORITY_STYLE[priority].labelKey as TranslationKey
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("designSystem.taskStatuses")}</FormLabel>
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
                          {TASK_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {t(
                                TASK_STATUS_STYLE[status].labelKey as TranslationKey
                              )}
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("task.notes")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={2}
                        placeholder={t("task.notesPlaceholder")}
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
            <Button type="submit" form="task-form" disabled={isSubmitting}>
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
