"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  FilterIcon,
  LayoutGridIcon,
  ListChecksIcon,
  PlusIcon,
  TableIcon,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { FilterChips, type FilterChip } from "@/components/common/filter-chips"
import { SaveIndicator, useAutoSaveState } from "@/components/common/save-indicator"
import { StatusBadge } from "@/components/common/status-badge"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getToday } from "@/constants/mock-date"
import {
  DUE_SOON_STYLE,
  OVERDUE_STYLE,
  PRIORITY_STYLE,
  TASK_STATUS_STYLE,
} from "@/constants/status"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { isDueSoon, isIncomplete, isOverdue } from "@/lib/due-date"
import { getFullName } from "@/lib/user"
import { useAppState, useCurrentUser } from "@/store"
import { sortTasksByUrgency } from "@/store/selectors"
import {
  PRIORITIES,
  TASK_STATUSES,
  type Priority,
  type Task,
  type TaskStatus,
} from "@/types/task"
import { TaskCalendar } from "./task-calendar"
import { TaskDetailSheet } from "./task-detail-sheet"
import { TaskFormDialog } from "./task-form-dialog"
import { TaskKanban } from "./task-kanban"
import { TaskTable } from "./task-table"
import { useTaskActions } from "./use-task-actions"

type ViewMode = "table" | "kanban" | "calendar"
type DueFilter = "all" | "overdue" | "soon" | "incomplete"
type Scope = "mine" | "all"

const DUE_LABEL: Record<DueFilter, TranslationKey> = {
  all: "task.dueAll",
  overdue: "task.dueOverdue",
  soon: "task.dueSoonFilter",
  incomplete: "task.dueIncomplete",
}

/**
 * มุมมองงานย่อยที่ใช้ร่วมกันระหว่างหน้า "งานของฉัน" กับแท็บงานในหน้ากิจกรรม
 *
 * ทั้งสามมุมมอง (ตาราง / คัมบัง / ปฏิทิน) อ่านข้อมูลชุดเดียวกันจาก store
 * การแก้ไขที่มุมมองใดจึงเห็นผลทันทีในอีกสองมุมมอง
 */
export function TasksView({
  eventId,
  showHeader = true,
}: {
  /** จำกัดเฉพาะงานของกิจกรรมนี้ (ใช้ในแท็บของหน้ารายละเอียดกิจกรรม) */
  eventId?: string
  showHeader?: boolean
}) {
  const { t, tl, locale } = useLocale()
  const state = useAppState()
  const currentUser = useCurrentUser()
  const searchParams = useSearchParams()
  const actions = useTaskActions()
  const { state: saveState, run } = useAutoSaveState()
  const today = React.useMemo(() => getToday(), [])

  const [view, setView] = React.useState<ViewMode>("table")
  const [scope, setScope] = React.useState<Scope>(() =>
    searchParams.get("scope") === "all" || eventId ? "all" : "mine"
  )
  const [statuses, setStatuses] = React.useState<TaskStatus[]>(() => {
    const status = searchParams.get("status")
    return status && TASK_STATUSES.includes(status as TaskStatus)
      ? [status as TaskStatus]
      : []
  })
  const [priorities, setPriorities] = React.useState<Priority[]>([])
  const [assigneeId, setAssigneeId] = React.useState(
    () => searchParams.get("assignee") ?? "all"
  )
  const [due, setDue] = React.useState<DueFilter>(() => {
    const value = searchParams.get("due")
    if (value === "overdue" || value === "soon") return value
    return searchParams.get("status") === "incomplete" ? "incomplete" : "all"
  })

  // เปิดรายละเอียดงานทันทีเมื่อมาจากลิงก์ Global Search (?task=...)
  const [detailTask, setDetailTask] = React.useState<Task | null>(() => {
    const taskId = searchParams.get("task")
    return taskId
      ? (state.tasks.find((task) => task.id === taskId) ?? null)
      : null
  })
  const [formTask, setFormTask] = React.useState<Task | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)

  const scopedTasks = React.useMemo(() => {
    if (eventId) return state.tasks.filter((task) => task.eventId === eventId)

    const activeEventIds = new Set(
      state.events
        .filter((event) => event.deletedAt === null && event.status !== "cancelled")
        .map((event) => event.id)
    )
    const base = state.tasks.filter((task) => activeEventIds.has(task.eventId))
    return scope === "mine" && currentUser
      ? base.filter((task) => task.assigneeIds.includes(currentUser.id))
      : base
  }, [state.tasks, state.events, eventId, scope, currentUser])

  const tasks = React.useMemo(() => {
    const filtered = scopedTasks.filter((task) => {
      if (statuses.length > 0 && !statuses.includes(task.status)) return false
      if (priorities.length > 0 && !priorities.includes(task.priority)) return false
      if (assigneeId !== "all" && !task.assigneeIds.includes(assigneeId))
        return false
      if (due === "overdue" && !isOverdue(task, today)) return false
      if (due === "soon" && !isDueSoon(task, today)) return false
      if (due === "incomplete" && !isIncomplete(task)) return false
      return true
    })
    return sortTasksByUrgency(filtered, today)
  }, [scopedTasks, statuses, priorities, assigneeId, due, today])

  // เก็บงานที่เปิดรายละเอียดอยู่ให้สดเสมอ แม้ข้อมูลใน store เปลี่ยน
  const openTask = detailTask
    ? (state.tasks.find((task) => task.id === detailTask.id) ?? null)
    : null

  const usersById = React.useMemo(
    () => new Map(state.users.map((user) => [user.id, user])),
    [state.users]
  )
  const selectedAssigneeLabel =
    assigneeId === "all"
      ? t("common.all")
      : usersById.has(assigneeId)
        ? getFullName(usersById.get(assigneeId)!, locale)
        : assigneeId

  const clearAll = () => {
    setStatuses([])
    setPriorities([])
    setAssigneeId("all")
    setDue("all")
  }

  const chips: FilterChip[] = [
    ...statuses.map((status) => {
      const style = TASK_STATUS_STYLE[status]
      const Icon = style.icon
      return {
        key: `status-${status}`,
        label: t(style.labelKey as TranslationKey),
        icon: <Icon className="size-3 shrink-0" aria-hidden="true" />,
        className: style.badge,
        onRemove: () =>
          setStatuses((current) => current.filter((item) => item !== status)),
      }
    }),
    ...priorities.map((priority) => {
      const style = PRIORITY_STYLE[priority]
      const Icon = style.icon
      return {
        key: `priority-${priority}`,
        label: t(style.labelKey as TranslationKey),
        icon: <Icon className="size-3 shrink-0" aria-hidden="true" />,
        className: style.badge,
        onRemove: () =>
          setPriorities((current) => current.filter((item) => item !== priority)),
      }
    }),
    ...(assigneeId !== "all"
      ? [
          {
            key: "assignee",
            label: `${t("task.assignees")}: ${selectedAssigneeLabel}`,
            onRemove: () => setAssigneeId("all"),
          },
        ]
      : []),
    ...(due !== "all"
      ? [
          {
            key: "due",
            label: t(DUE_LABEL[due]),
            onRemove: () => setDue("all"),
          },
        ]
      : []),
  ]

  const { state: pageState, retry } = usePageState(scopedTasks.length === 0)

  const handleMoveTask = (task: Task, status: TaskStatus) => {
    void run(async () => {
      await actions.setStatus(task, status)
      toast.success(
        t("task.movedTo", {
          task: tl(task.title),
          status: t(TASK_STATUS_STYLE[status].labelKey as TranslationKey),
        })
      )
    })
  }

  const openCreateForm = () => {
    setFormTask(null)
    setFormOpen(true)
  }

  if (pageState === "error") {
    return <ErrorState onRetry={retry} />
  }

  if (pageState === "loading") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {!eventId ? (
              <Select
                value={scope}
                onValueChange={(value) => setScope(value as Scope)}
              >
                <SelectTrigger
                  size="sm"
                  className="w-40"
                  data-testid="scope-select"
                  aria-label={t("task.scopeMine")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mine">{t("task.scopeMine")}</SelectItem>
                  <SelectItem value="all">{t("task.scopeAll")}</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
            <SaveIndicator state={saveState} />
          </div>

          <Button size="sm" onClick={openCreateForm} data-testid="create-task">
            <PlusIcon className="size-4" aria-hidden="true" />
            {t("task.create")}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <div className={eventId ? "flex flex-col gap-1" : undefined}>
          {eventId ? (
            <span className="text-muted-foreground pl-1 text-xs font-medium">
              {t("designSystem.taskStatuses")}
            </span>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="task-status-filter">
                <FilterIcon className="size-4" aria-hidden="true" />
                {!eventId ? t("designSystem.taskStatuses") : null}
                {statuses.length > 0 ? (
                  <span className="bg-brand-500 text-brand-950 ml-1 rounded-full px-1.5 text-[0.6875rem] font-bold">
                    {statuses.length}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>{t("designSystem.taskStatuses")}</DropdownMenuLabel>
              {TASK_STATUSES.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statuses.includes(status)}
                  onCheckedChange={(checked) =>
                    setStatuses((current) =>
                      checked
                        ? [...current, status]
                        : current.filter((item) => item !== status)
                    )
                  }
                  onSelect={(selectEvent) => selectEvent.preventDefault()}
                >
                  <StatusBadge
                    size="sm"
                    style={TASK_STATUS_STYLE[status]}
                    className="pointer-events-none"
                  />
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className={eventId ? "flex flex-col gap-1" : undefined}>
          {eventId ? (
            <span className="text-muted-foreground pl-1 text-xs font-medium">
              {t("priority.label")}
            </span>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {eventId ? <FilterIcon className="size-4" aria-hidden="true" /> : t("priority.label")}
                {priorities.length > 0 ? (
                  <span className="bg-brand-500 text-brand-950 ml-1 rounded-full px-1.5 text-[0.6875rem] font-bold">
                    {priorities.length}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>{t("priority.label")}</DropdownMenuLabel>
              {PRIORITIES.map((priority) => (
                <DropdownMenuCheckboxItem
                  key={priority}
                  checked={priorities.includes(priority)}
                  onCheckedChange={(checked) =>
                    setPriorities((current) =>
                      checked
                        ? [...current, priority]
                        : current.filter((item) => item !== priority)
                    )
                  }
                  onSelect={(selectEvent) => selectEvent.preventDefault()}
                >
                  <StatusBadge
                    size="sm"
                    style={PRIORITY_STYLE[priority]}
                    className="pointer-events-none"
                  />
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className={eventId ? "flex flex-col gap-1" : undefined}>
          {eventId ? (
            <span className="text-muted-foreground pl-1 text-xs font-medium">
              {t("task.assignees")}
            </span>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-72 justify-between"
                aria-label={t("task.assignees")}
              >
                <span className="truncate">
                  {eventId ? selectedAssigneeLabel : `${t("task.assignees")}: ${selectedAssigneeLabel}`}
                </span>
                <ChevronDownIcon className="size-4 text-muted-foreground" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuRadioGroup value={assigneeId} onValueChange={setAssigneeId}>
                <DropdownMenuRadioItem value="all">
                  {t("common.all")}
                </DropdownMenuRadioItem>
                {state.users.map((user) => (
                  <DropdownMenuRadioItem key={user.id} value={user.id} className="py-1.5">
                    <span className="flex items-center gap-2">
                      <UserAvatar user={user} size="sm" />
                      <span className="truncate">{getFullName(user, locale)}</span>
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className={eventId ? "flex flex-col gap-1" : undefined}>
          {eventId ? (
            <span className="text-muted-foreground pl-1 text-xs font-medium">
              {t("task.filterDue")}
            </span>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-40 justify-between"
                aria-label={t("task.filterDue")}
              >
                <span className="truncate">{t(DUE_LABEL[due])}</span>
                <ChevronDownIcon className="size-4 text-muted-foreground" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuRadioGroup
                value={due}
                onValueChange={(value) => setDue(value as DueFilter)}
              >
                {(Object.keys(DUE_LABEL) as DueFilter[]).map((key) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {key === "overdue" ? (
                      <StatusBadge size="sm" style={OVERDUE_STYLE} />
                    ) : key === "soon" ? (
                      <StatusBadge size="sm" style={DUE_SOON_STYLE} />
                    ) : (
                      t(DUE_LABEL[key])
                    )}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {(
            [
              ["table", TableIcon, "task.tableView"],
              ["kanban", LayoutGridIcon, "task.kanbanView"],
              ["calendar", CalendarDaysIcon, "task.calendarView"],
            ] as const
          ).map(([mode, Icon, labelKey]) => (
            <Button
              key={mode}
              variant={view === mode ? "secondary" : "ghost"}
              size="icon-sm"
              aria-pressed={view === mode}
              aria-label={t(labelKey)}
              onClick={() => setView(mode)}
            >
              <Icon className="size-4" aria-hidden="true" />
            </Button>
          ))}
        </div>
      </div>

      <FilterChips chips={chips} onClearAll={clearAll} />

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {t("task.resultCount", { count: tasks.length })}
      </p>

      {scopedTasks.length === 0 ? (
        <EmptyState
          icon={ListChecksIcon}
          title={t("task.noTasks")}
          description={t("task.noTasksDescription")}
          action={
            <Button onClick={openCreateForm}>
              <PlusIcon className="size-4" aria-hidden="true" />
              {t("task.create")}
            </Button>
          }
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={FilterIcon}
          title={t("task.noTasksMatch")}
          description={t("task.noTasksMatchDescription")}
          action={
            <Button variant="outline" onClick={clearAll}>
              {t("common.clearAll")}
            </Button>
          }
        />
      ) : view === "table" ? (
        <TaskTable
          tasks={tasks}
          usersById={usersById}
          onOpenTask={setDetailTask}
        />
      ) : view === "kanban" ? (
        <TaskKanban
          tasks={tasks}
          usersById={usersById}
          onOpenTask={setDetailTask}
          onMoveTask={handleMoveTask}
        />
      ) : (
        <TaskCalendar tasks={tasks} onOpenTask={setDetailTask} />
      )}

      <TaskDetailSheet
        task={openTask}
        tasks={state.tasks}
        open={openTask !== null}
        onOpenChange={(open) => !open && setDetailTask(null)}
        onEdit={(task) => {
          setFormTask(task)
          setFormOpen(true)
        }}
      />

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={formTask}
        defaultEventId={eventId ?? formTask?.eventId ?? state.events[0]?.id ?? ""}
        lockEvent={Boolean(eventId)}
      />
    </div>
  )
}
