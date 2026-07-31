"use client"

import * as React from "react"
import { PencilLineIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { AvatarGroup } from "@/components/common/avatar-group"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { DueBadge } from "@/components/common/due-badge"
import { SaveIndicator, useAutoSaveState } from "@/components/common/save-indicator"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { PRIORITY_STYLE, TASK_STATUS_STYLE } from "@/constants/status"
import { CommentSection } from "@/features/comments/comment-section"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { getBlockedInfo } from "@/lib/dependency"
import { formatDate } from "@/lib/format"
import { useAppState } from "@/store"
import { selectEventById } from "@/store/selectors"
import { TASK_STATUSES, type Task, type TaskStatus } from "@/types/task"
import { ChecklistEditor } from "./checklist-editor"
import { DependencySection } from "./dependency-section"
import { useTaskActions } from "./use-task-actions"

export function TaskDetailSheet({
  task,
  tasks,
  open,
  onOpenChange,
  onEdit,
}: {
  task: Task | null
  tasks: Task[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (task: Task) => void
}) {
  const { t, tl, locale } = useLocale()
  const state = useAppState()
  const actions = useTaskActions()
  const { state: saveState, run } = useAutoSaveState()

  const [pendingStatus, setPendingStatus] = React.useState<TaskStatus | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  if (!task) return null

  const event = selectEventById(state, task.eventId)
  const assignees = state.users.filter((user) =>
    task.assigneeIds.includes(user.id)
  )
  const blocked = getBlockedInfo(task, tasks)

  /** สถานะที่แปลว่า "เริ่มทำงานแล้ว" — ต้องเตือนถ้ายังถูกบล็อกอยู่ */
  const startsWork = (status: TaskStatus) =>
    status === "in_progress" || status === "awaiting_review" || status === "completed"

  const requestStatus = (status: TaskStatus) => {
    if (blocked.isBlocked && !task.blockOverridden && startsWork(status)) {
      setPendingStatus(status)
      return
    }
    void run(async () => {
      await actions.setStatus(task, status)
      toast.success(t("task.statusChanged"))
    })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto sm:max-w-xl"
          data-testid="task-detail"
        >
          <SheetHeader>
            <SheetTitle className="pr-6 text-balance">{tl(task.title)}</SheetTitle>
            <SheetDescription className="flex flex-wrap items-center gap-1.5">
              <StatusBadge size="sm" style={TASK_STATUS_STYLE[task.status]} />
              <StatusBadge size="sm" style={PRIORITY_STYLE[task.priority]} />
              <DueBadge task={task} />
              {event ? (
                <span className="text-muted-foreground text-xs">
                  · {tl(event.title)}
                </span>
              ) : null}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={task.status}
                onValueChange={(value) => requestStatus(value as TaskStatus)}
              >
                <SelectTrigger
                  size="sm"
                  className="w-48"
                  aria-label={t("designSystem.taskStatuses")}
                  data-testid="task-status-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(TASK_STATUS_STYLE[status].labelKey as TranslationKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <SaveIndicator state={saveState} />

              <span className="ml-auto flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => onEdit(task)}>
                  <PencilLineIcon className="size-4" aria-hidden="true" />
                  {t("common.edit")}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setConfirmDelete(true)}
                  aria-label={t("common.delete")}
                  data-testid="delete-task"
                >
                  <Trash2Icon className="size-4" aria-hidden="true" />
                </Button>
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t("task.assignees")}
                </dt>
                <dd className="mt-1">
                  <AvatarGroup users={assignees} max={4} size="sm" />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t("task.startDate")}
                </dt>
                <dd className="mt-1">
                  {task.startDate ? formatDate(task.startDate, locale) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t("task.dueDate")}
                </dt>
                <dd className="mt-1">
                  {task.dueDate ? formatDate(task.dueDate, locale) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t("priority.label")}
                </dt>
                <dd className="mt-1">
                  <StatusBadge size="sm" style={PRIORITY_STYLE[task.priority]} />
                </dd>
              </div>
            </dl>

            {tl(task.description) ? (
              <div>
                <h3 className="mb-1 text-sm font-semibold">
                  {t("task.description")}
                </h3>
                <p className="text-muted-foreground text-sm text-pretty">
                  {tl(task.description)}
                </p>
              </div>
            ) : null}

            {tl(task.notes) ? (
              <div className="bg-muted rounded-md p-3">
                <h3 className="mb-1 text-sm font-semibold">{t("task.notes")}</h3>
                <p className="text-muted-foreground text-sm text-pretty">
                  {tl(task.notes)}
                </p>
              </div>
            ) : null}

            <Separator />
            <ChecklistEditor task={task} />

            <Separator />
            <DependencySection task={task} tasks={tasks} />

            <Separator />
            <CommentSection task={task} />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={(nextOpen) => !nextOpen && setPendingStatus(null)}
        title={t("task.blockedWarningTitle")}
        description={t("task.blockedWarningDescription")}
        targetName={tl(task.title)}
        impact={blocked.blockingTaskIds.map((id) => {
          const blocker = tasks.find((item) => item.id === id)
          return blocker ? tl(blocker.title) : id
        })}
        confirmLabel={t("task.blockedOverrideConfirm")}
        onConfirm={async () => {
          const status = pendingStatus
          setPendingStatus(null)
          if (!status) return
          actions.overrideBlock(task)
          await run(async () => {
            await actions.setStatus(task, status)
            toast.success(t("task.statusChanged"))
          })
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("task.confirmDeleteTitle")}
        description={t("task.confirmDeleteDescription")}
        targetName={tl(task.title)}
        impact={[
          t("task.confirmDeleteImpactBlocking", { count: task.blocks.length }),
          t("task.confirmDeleteImpactChecklist", {
            count: task.checklist.length,
          }),
        ]}
        confirmLabel={t("common.delete")}
        destructive
        onConfirm={async () => {
          setConfirmDelete(false)
          onOpenChange(false)
          await actions.deleteTask(task)
        }}
      />
    </>
  )
}
