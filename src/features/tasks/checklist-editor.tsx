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
  CheckIcon,
  GripVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { SaveIndicator, useAutoSaveState } from "@/components/common/save-indicator"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useLocale } from "@/i18n"
import { checklistProgress } from "@/lib/checklist"
import { DESTRUCTIVE_ACTION_CLASS } from "@/constants/status"
import { cn } from "@/lib/utils"
import type { ChecklistItem, Task } from "@/types/task"
import { useTaskActions } from "./use-task-actions"

/**
 * ตัวจัดการรายการตรวจสอบภายในงาน
 *
 * ทุกการเปลี่ยนแปลงเป็น Auto Save และแสดงสถานะบันทึกทันที
 * การจัดลำดับรองรับทั้งเมาส์และคีย์บอร์ด (dnd-kit KeyboardSensor)
 */
export function ChecklistEditor({ task }: { task: Task }) {
  const { t, tl } = useLocale()
  const actions = useTaskActions()
  const { state: saveState, run } = useAutoSaveState()

  const [newLabel, setNewLabel] = React.useState("")
  const [pendingDelete, setPendingDelete] = React.useState<ChecklistItem | null>(
    null
  )

  const items = React.useMemo(
    () => [...task.checklist].sort((a, b) => a.order - b.order),
    [task.checklist]
  )
  const progress = checklistProgress(items)

  useChecklistStatusEffects(task, actions.reportChecklistStatusChange)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const reordered = [...items]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    void run(() =>
      actions.reorderChecklist(
        task,
        reordered.map((item) => item.id)
      )
    )
  }

  const handleAdd = async () => {
    const label = newLabel.trim()
    if (!label) return
    setNewLabel("")
    await run(() => actions.addChecklistItem(task, label))
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t("task.checklist")}</h3>
        <div className="flex items-center gap-2">
          <SaveIndicator state={saveState} />
          <span
            className="text-muted-foreground text-xs font-medium tabular-nums"
            data-testid="checklist-progress"
          >
            {t("task.checklistProgress", {
              done: progress.done,
              total: progress.total,
            })}
          </span>
        </div>
      </div>

      {items.length > 0 ? (
        <Progress
          value={progress.percent}
          tone="completion"
          aria-label={t("task.checklist")}
        />
      ) : null}

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("task.checklistEmpty")}</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          accessibility={{
            announcements: {
              onDragStart: ({ active }) => `${String(active.id)}`,
              onDragEnd: ({ active, over }) =>
                over ? `${String(active.id)} → ${String(over.id)}` : "",
              onDragCancel: () => "",
              onDragOver: () => "",
            },
          }}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-1" data-testid="checklist">
              {items.map((item) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  label={tl(item.label)}
                  onToggle={(done) =>
                    run(() => actions.toggleChecklistItem(task, item.id, done))
                  }
                  onRename={(label) =>
                    run(() => actions.renameChecklistItem(task, item.id, label))
                  }
                  onRequestDelete={() => setPendingDelete(item)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={newLabel}
          onChange={(changeEvent) => setNewLabel(changeEvent.target.value)}
          onKeyDown={(keyEvent) => {
            if (keyEvent.key === "Enter") {
              keyEvent.preventDefault()
              void handleAdd()
            }
          }}
          placeholder={t("task.checklistPlaceholder")}
          aria-label={t("task.addChecklistItem")}
          data-testid="checklist-input"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAdd}
          disabled={newLabel.trim() === ""}
          data-testid="checklist-add"
        >
          <PlusIcon className="size-4" aria-hidden="true" />
          {t("common.add")}
        </Button>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={t("task.confirmDeleteChecklistTitle")}
        description={t("task.confirmDeleteChecklistDescription")}
        targetName={pendingDelete ? tl(pendingDelete.label) : undefined}
        confirmLabel={t("common.delete")}
        destructive
        onConfirm={async () => {
          if (!pendingDelete) return
          const target = pendingDelete
          setPendingDelete(null)
          await run(() => actions.removeChecklistItem(task, target.id))
        }}
      />
    </section>
  )
}

/**
 * เฝ้าดูสถานะงานที่ถูกเปลี่ยนโดยกฎของ Checklist แล้วแจ้งผู้ใช้เพียงครั้งเดียว
 *
 * เฝ้าจากสถานะจริงหลัง reducer ทำงาน แทนการทำนายล่วงหน้า
 * เพราะการติ๊กรัว ๆ ทำให้ props ที่คอมโพเนนต์ถืออยู่ตามไม่ทัน
 */
function useChecklistStatusEffects(
  task: Task,
  report: (task: Task, previousStatus: Task["status"]) => void
) {
  const previousStatus = React.useRef(task.status)

  React.useEffect(() => {
    const previous = previousStatus.current
    if (previous === task.status) return
    previousStatus.current = task.status

    if (task.checklist.length === 0) return
    const allDone = task.checklist.every((item) => item.done)

    const completedByChecklist = task.status === "completed" && allDone
    const reopenedByChecklist =
      previous === "completed" && task.status === "in_progress" && !allDone

    if (completedByChecklist || reopenedByChecklist) {
      report(task, previous)
    }
  }, [task, report])
}

function ChecklistRow({
  item,
  label,
  onToggle,
  onRename,
  onRequestDelete,
}: {
  item: ChecklistItem
  label: string
  onToggle: (done: boolean) => void
  onRename: (label: string) => void
  onRequestDelete: () => void
}) {
  const { t } = useLocale()
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(label)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const commit = () => {
    const next = draft.trim()
    setEditing(false)
    if (next && next !== label) onRename(next)
    else setDraft(label)
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "bg-background group flex items-center gap-2 rounded-md border px-2 py-1.5",
        isDragging && "shadow-lg"
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground focus-visible:outline-ring cursor-grab touch-none focus-visible:outline-2"
        aria-label={t("common.sort")}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" aria-hidden="true" />
      </button>

      <Checkbox
        id={`checklist-${item.id}`}
        checked={item.done}
        onCheckedChange={(checked) => onToggle(checked === true)}
        aria-label={label}
      />

      {editing ? (
        <span className="flex flex-1 items-center gap-1">
          <Input
            autoFocus
            value={draft}
            onChange={(changeEvent) => setDraft(changeEvent.target.value)}
            onKeyDown={(keyEvent) => {
              if (keyEvent.key === "Enter") commit()
              if (keyEvent.key === "Escape") {
                setDraft(label)
                setEditing(false)
              }
            }}
            className="h-7"
            aria-label={t("common.edit")}
          />
          <Button size="icon-xs" variant="ghost" onClick={commit} aria-label={t("common.save")}>
            <CheckIcon className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => {
              setDraft(label)
              setEditing(false)
            }}
            aria-label={t("common.cancel")}
          >
            <XIcon className="size-3.5" aria-hidden="true" />
          </Button>
        </span>
      ) : (
        <>
          <label
            htmlFor={`checklist-${item.id}`}
            className={cn(
              "flex-1 cursor-pointer text-sm",
              item.done && "text-muted-foreground line-through"
            )}
          >
            {label}
          </label>
          <Button
            size="icon-xs"
            variant="ghost"
            className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            onClick={() => {
              setDraft(label)
              setEditing(true)
            }}
            aria-label={`${t("common.edit")}: ${label}`}
          >
            <PencilIcon className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            className={cn(
              DESTRUCTIVE_ACTION_CLASS,
              "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            )}
            onClick={onRequestDelete}
            aria-label={`${t("common.delete")}: ${label}`}
          >
            <Trash2Icon className="size-3.5" aria-hidden="true" />
          </Button>
        </>
      )}
    </li>
  )
}
