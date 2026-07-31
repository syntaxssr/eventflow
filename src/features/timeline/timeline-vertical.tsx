"use client"

import * as React from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ClockIcon,
  GripVerticalIcon,
  LinkIcon,
  MapPinIcon,
  PencilLineIcon,
  Trash2Icon,
} from "lucide-react"

import { AvatarGroup } from "@/components/common/avatar-group"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { READINESS_STYLE } from "@/constants/status"
import { getToday, toDateKey } from "@/constants/mock-date"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { formatDate } from "@/lib/format"
import { groupByPhase } from "@/lib/timeline"
import { cn } from "@/lib/utils"
import type { Task } from "@/types/task"
import { TIMELINE_PHASES, type TimelineItem } from "@/types/timeline"
import type { User } from "@/types/user"

const PHASE_LABEL: Record<string, TranslationKey> = {
  before: "timeline.phaseBefore",
  during: "timeline.phaseDuring",
  after: "timeline.phaseAfter",
}

/**
 * มุมมองไทม์ไลน์แนวตั้ง แบ่งเป็น 3 ช่วงตามข้อกำหนด
 * ลากเพื่อจัดลำดับภายในช่วงเดียวกันได้ (รองรับคีย์บอร์ดผ่าน dnd-kit)
 */
export function TimelineVertical({
  items,
  usersById,
  tasksById,
  onEdit,
  onDelete,
  onReorder,
}: {
  items: TimelineItem[]
  usersById: Map<string, User>
  tasksById: Map<string, Task>
  onEdit: (item: TimelineItem) => void
  onDelete: (item: TimelineItem) => void
  onReorder: (item: TimelineItem, orderedIds: string[]) => void
}) {
  const { t } = useLocale()
  const groups = React.useMemo(() => groupByPhase(items), [items])
  const todayKey = toDateKey(getToday())

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (dragEvent: DragEndEvent) => {
    const { active, over } = dragEvent
    if (!over || active.id === over.id) return

    const moved = items.find((item) => item.id === active.id)
    if (!moved) return

    const phaseItems = groups[moved.phase]
    const oldIndex = phaseItems.findIndex((item) => item.id === active.id)
    const newIndex = phaseItems.findIndex((item) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const reordered = [...phaseItems]
    const [entry] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, entry)

    onReorder(
      moved,
      reordered.map((item) => item.id)
    )
  }

  return (
    <div className="space-y-6" data-testid="timeline-vertical">
      <p className="text-muted-foreground text-xs">{t("timeline.dragHint")}</p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        {TIMELINE_PHASES.map((phase) => (
          <section key={phase} data-testid={`timeline-phase-${phase}`}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span className="bg-brand-500 size-2.5 rounded-full" aria-hidden="true" />
              {t(PHASE_LABEL[phase])}
              <span className="text-muted-foreground font-normal">
                ({groups[phase].length})
              </span>
            </h3>

            {groups[phase].length === 0 ? (
              <p className="text-muted-foreground border-l-2 py-3 pl-6 text-sm">
                {t("timeline.noItemsInPhase")}
              </p>
            ) : (
              <SortableContext
                items={groups[phase].map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <ol className="border-border space-y-3 border-l-2 pl-5">
                  {groups[phase].map((item) => (
                    <TimelineRow
                      key={item.id}
                      item={item}
                      isToday={item.date === todayKey}
                      usersById={usersById}
                      task={
                        item.linkedTaskId
                          ? tasksById.get(item.linkedTaskId)
                          : undefined
                      }
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </ol>
              </SortableContext>
            )}
          </section>
        ))}
      </DndContext>

      {items.length === 0 ? (
        <EmptyState
          icon={ClockIcon}
          title={t("timeline.noItems")}
          description={t("timeline.noItemsDescription")}
        />
      ) : null}
    </div>
  )
}

function TimelineRow({
  item,
  isToday,
  usersById,
  task,
  onEdit,
  onDelete,
}: {
  item: TimelineItem
  isToday: boolean
  usersById: Map<string, User>
  task: Task | undefined
  onEdit: (item: TimelineItem) => void
  onDelete: (item: TimelineItem) => void
}) {
  const { t, tl, locale } = useLocale()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const owners = item.ownerIds
    .map((id) => usersById.get(id))
    .filter((user): user is User => Boolean(user))

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative", isDragging && "z-10")}
    >
      <span
        className={cn(
          "border-background absolute top-4 -left-[1.6875rem] size-3 rounded-full border-2",
          isToday ? "bg-brand-500" : "bg-muted-foreground/40"
        )}
        aria-hidden="true"
      />

      <article
        className={cn(
          "bg-background hover:border-brand-300 group rounded-lg border p-3 transition-colors",
          isDragging && "shadow-lg",
          isToday && "border-brand-400"
        )}
      >
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground focus-visible:outline-ring mt-0.5 cursor-grab touch-none focus-visible:outline-2"
            aria-label={t("common.sort")}
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="size-4" aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <time
                dateTime={`${item.date}T${item.startTime}`}
                className="text-brand-text text-xs font-semibold whitespace-nowrap"
              >
                {formatDate(item.date, locale)} · {item.startTime}–{item.endTime}
              </time>
              {isToday ? (
                <span className="bg-brand-50 text-brand-900 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold">
                  {t("timeline.today")}
                </span>
              ) : null}
              <StatusBadge size="sm" style={READINESS_STYLE[item.readiness]} />
            </div>

            <h4 className="font-medium text-balance">{tl(item.title)}</h4>

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="flex items-center gap-1">
                <MapPinIcon className="size-3.5" aria-hidden="true" />
                {tl(item.location)}
              </span>
              {task ? (
                <span className="flex items-center gap-1">
                  <LinkIcon className="size-3.5" aria-hidden="true" />
                  {tl(task.title)}
                </span>
              ) : null}
              <AvatarGroup users={owners} max={3} />
            </div>

            {tl(item.note) ? (
              <p className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs">
                {tl(item.note)}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => onEdit(item)}
              aria-label={`${t("common.edit")}: ${tl(item.title)}`}
            >
              <PencilLineIcon className="size-3.5" aria-hidden="true" />
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              className="text-destructive"
              onClick={() => onDelete(item)}
              aria-label={`${t("common.delete")}: ${tl(item.title)}`}
            >
              <Trash2Icon className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </article>
    </li>
  )
}
