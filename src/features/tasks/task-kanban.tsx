"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { LinkIcon, ListChecksIcon } from "lucide-react"

import { AvatarGroup } from "@/components/common/avatar-group"
import { DueBadge } from "@/components/common/due-badge"
import { StatusBadge } from "@/components/common/status-badge"
import { PRIORITY_STYLE, TASK_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { checklistProgress } from "@/lib/checklist"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { TASK_STATUSES, type Task, type TaskStatus } from "@/types/task"
import type { User } from "@/types/user"

/**
 * มุมมองคัมบัง — ลากการ์ดข้ามคอลัมน์เพื่อเปลี่ยนสถานะ (Auto Save)
 * รองรับคีย์บอร์ดผ่าน KeyboardSensor ของ dnd-kit
 */
export function TaskKanban({
  tasks,
  usersById,
  onOpenTask,
  onMoveTask,
}: {
  tasks: Task[]
  usersById: Map<string, User>
  onOpenTask: (task: Task) => void
  onMoveTask: (task: Task, status: TaskStatus) => void
}) {
  const { t } = useLocale()
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const byStatus = React.useMemo(() => {
    const groups = new Map<TaskStatus, Task[]>(
      TASK_STATUSES.map((status) => [status, [] as Task[]])
    )
    for (const task of tasks) {
      groups.get(task.status)?.push(task)
    }
    return groups
  }, [tasks])

  const activeTask = tasks.find((task) => task.id === activeId) ?? null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const task = tasks.find((item) => item.id === active.id)
    if (!task) return

    // ปล่อยลงคอลัมน์โดยตรง หรือปล่อยทับการ์ดใบอื่นในคอลัมน์ปลายทาง
    const overId = String(over.id)
    const targetStatus = TASK_STATUSES.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : tasks.find((item) => item.id === overId)?.status

    if (targetStatus && targetStatus !== task.status) {
      onMoveTask(task, targetStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <p className="text-muted-foreground text-xs">{t("task.dragHint")}</p>

      <div
        className="grid snap-x snap-mandatory grid-flow-col auto-cols-[minmax(17rem,1fr)] gap-3 overflow-x-auto pb-2 lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-5"
        data-testid="task-kanban"
      >
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={byStatus.get(status) ?? []}
            usersById={usersById}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCardBody
            task={activeTask}
            usersById={usersById}
            className="rotate-2 shadow-xl"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumn({
  status,
  tasks,
  usersById,
  onOpenTask,
}: {
  status: TaskStatus
  tasks: Task[]
  usersById: Map<string, User>
  onOpenTask: (task: Task) => void
}) {
  const { t } = useLocale()
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const style = TASK_STATUS_STYLE[status]
  const Icon = style.icon

  return (
    <section
      ref={setNodeRef}
      data-testid={`kanban-column-${status}`}
      className={cn(
        "bg-muted/40 flex min-h-40 snap-start flex-col rounded-lg border p-2 transition-colors",
        isOver && "border-brand-400 bg-brand-50/60"
      )}
    >
      <header className="mb-2 flex items-center gap-1.5 px-1">
        <span className={cn("size-2.5 rounded-full", style.dot)} aria-hidden="true" />
        <Icon className="text-muted-foreground size-3.5" aria-hidden="true" />
        <h3 className="flex-1 truncate text-sm font-semibold">
          {t(style.labelKey as TranslationKey)}
        </h3>
        <span className="text-muted-foreground text-xs font-medium tabular-nums">
          {tasks.length}
        </span>
      </header>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-1 flex-col gap-2">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              usersById={usersById}
              onOpenTask={onOpenTask}
            />
          ))}
        </ul>
      </SortableContext>
    </section>
  )
}

function SortableTaskCard({
  task,
  usersById,
  onOpenTask,
}: {
  task: Task
  usersById: Map<string, User>
  onOpenTask: (task: Task) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "opacity-40")}
    >
      <TaskCardBody
        task={task}
        usersById={usersById}
        onOpenTask={onOpenTask}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </li>
  )
}

function TaskCardBody({
  task,
  usersById,
  onOpenTask,
  dragHandleProps,
  className,
}: {
  task: Task
  usersById: Map<string, User>
  onOpenTask?: (task: Task) => void
  dragHandleProps?: Record<string, unknown>
  className?: string
}) {
  const { t, tl, locale } = useLocale()
  const progress = checklistProgress(task.checklist)
  const assignees = task.assigneeIds
    .map((id) => usersById.get(id))
    .filter((user): user is User => Boolean(user))

  return (
    <article
      className={cn(
        "bg-background hover:border-brand-300 space-y-2 rounded-lg border p-2.5 transition-colors",
        className
      )}
      {...dragHandleProps}
    >
      <div className="flex items-start gap-1.5">
        {task.dependsOn.length > 0 ? (
          <LinkIcon
            className="text-muted-foreground mt-0.5 size-3.5 shrink-0"
            aria-label={t("task.dependencies")}
          />
        ) : null}
        {onOpenTask ? (
          <button
            type="button"
            onClick={() => onOpenTask(task)}
            className="hover:text-brand-text focus-visible:outline-ring flex-1 text-left text-sm font-medium focus-visible:outline-2"
          >
            {tl(task.title)}
          </button>
        ) : (
          <span className="flex-1 text-sm font-medium">{tl(task.title)}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge size="sm" style={PRIORITY_STYLE[task.priority]} />
        <DueBadge task={task} />
      </div>

      <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-2">
          {task.dueDate ? formatDate(task.dueDate, locale) : null}
          {progress.total > 0 ? (
            <span className="flex items-center gap-1 tabular-nums">
              <ListChecksIcon className="size-3" aria-hidden="true" />
              {progress.done}/{progress.total}
            </span>
          ) : null}
        </span>
        <AvatarGroup users={assignees} max={2} />
      </div>
    </article>
  )
}
