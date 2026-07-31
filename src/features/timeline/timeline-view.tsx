"use client"

import * as React from "react"
import {
  CalendarDaysIcon,
  ChartGanttIcon,
  ClockIcon,
  ListIcon,
  PlusIcon,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { SaveIndicator, useAutoSaveState } from "@/components/common/save-indicator"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import { sortTimeline } from "@/lib/timeline"
import { useAppState } from "@/store"
import { selectActiveEvents, selectTasksByEvent } from "@/store/selectors"
import type { TimelineItem } from "@/types/timeline"
import { TimelineCalendar } from "./timeline-calendar"
import { TimelineFormDialog } from "./timeline-form-dialog"
import { TimelineGantt } from "./timeline-gantt"
import { TimelineVertical } from "./timeline-vertical"
import { useTimelineActions } from "./use-timeline-actions"

type ViewMode = "vertical" | "calendar" | "gantt"

/**
 * มุมมองไทม์ไลน์ที่ใช้ร่วมกันระหว่างหน้า Timeline กับแท็บในหน้ากิจกรรม
 * ทั้งสามมุมมองอ่านข้อมูลชุดเดียวกันจาก store
 */
export function TimelineView({ eventId }: { eventId?: string }) {
  const { t, tl, locale } = useLocale()
  const state = useAppState()
  const actions = useTimelineActions()
  const { state: saveState, run } = useAutoSaveState()

  const events = selectActiveEvents(state)
  const [selectedEventId, setSelectedEventId] = React.useState(
    () => eventId ?? events[0]?.id ?? ""
  )
  const activeEventId = eventId ?? selectedEventId

  const [view, setView] = React.useState<ViewMode>("vertical")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<TimelineItem | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<TimelineItem | null>(
    null
  )
  const [pendingMove, setPendingMove] = React.useState<{
    item: TimelineItem
    orderedIds: string[]
  } | null>(null)

  const items = React.useMemo(
    () =>
      sortTimeline(
        state.timeline.filter((item) => item.eventId === activeEventId)
      ),
    [state.timeline, activeEventId]
  )

  const tasks = React.useMemo(
    () => selectTasksByEvent(state, activeEventId),
    [state, activeEventId]
  )

  const usersById = React.useMemo(
    () => new Map(state.users.map((user) => [user.id, user])),
    [state.users]
  )
  const tasksById = React.useMemo(
    () => new Map(tasks.map((task) => [task.id, task])),
    [tasks]
  )

  const { state: pageState, retry } = usePageState(items.length === 0)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (item: TimelineItem) => {
    setEditing(item)
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
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {!eventId ? (
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger
              size="sm"
              className="w-64"
              aria-label={t("timeline.selectEvent")}
              data-testid="timeline-event-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title[locale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <SaveIndicator state={saveState} />

        <div className="ml-auto flex items-center gap-1">
          {(
            [
              ["vertical", ListIcon, "timeline.verticalView"],
              ["calendar", CalendarDaysIcon, "timeline.calendarView"],
              ["gantt", ChartGanttIcon, "timeline.ganttView"],
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

          <Button size="sm" onClick={openCreate} data-testid="create-timeline">
            <PlusIcon className="size-4" aria-hidden="true" />
            {t("timeline.add")}
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {t("timeline.resultCount", { count: items.length })}
      </p>

      {items.length === 0 ? (
        <EmptyState
          icon={ClockIcon}
          title={t("timeline.noItems")}
          description={t("timeline.noItemsDescription")}
          action={
            <Button onClick={openCreate}>
              <PlusIcon className="size-4" aria-hidden="true" />
              {t("timeline.add")}
            </Button>
          }
        />
      ) : view === "vertical" ? (
        <TimelineVertical
          items={items}
          usersById={usersById}
          tasksById={tasksById}
          onEdit={openEdit}
          onDelete={setPendingDelete}
          onReorder={(item, orderedIds) => setPendingMove({ item, orderedIds })}
        />
      ) : view === "calendar" ? (
        <TimelineCalendar items={items} onEdit={openEdit} />
      ) : (
        <TimelineGantt items={items} tasks={tasks} onEdit={openEdit} />
      )}

      <TimelineFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editing}
        eventId={activeEventId}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={t("timeline.confirmDeleteTitle")}
        description={t("timeline.confirmDeleteDescription")}
        targetName={pendingDelete ? tl(pendingDelete.title) : undefined}
        confirmLabel={t("common.delete")}
        destructive
        onConfirm={async () => {
          if (!pendingDelete) return
          const target = pendingDelete
          setPendingDelete(null)
          await actions.deleteItem(target)
        }}
      />

      {/* การเปลี่ยนลำดับถือเป็นการเปลี่ยนกำหนดการสำคัญ จึงต้องยืนยันก่อน */}
      <ConfirmDialog
        open={pendingMove !== null}
        onOpenChange={(open) => !open && setPendingMove(null)}
        title={t("timeline.confirmChangeTitle")}
        description={t("timeline.confirmChangeDescription")}
        targetName={pendingMove ? tl(pendingMove.item.title) : undefined}
        confirmLabel={t("common.confirm")}
        onConfirm={async () => {
          if (!pendingMove) return
          const move = pendingMove
          setPendingMove(null)
          await run(async () => {
            await actions.reorder(move.item, move.orderedIds)
            toast.success(t("timeline.moved"))
          })
        }}
      />
    </div>
  )
}
