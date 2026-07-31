"use client"

import { LinkIcon, ListChecksIcon } from "lucide-react"

import { AvatarGroup } from "@/components/common/avatar-group"
import { DueBadge } from "@/components/common/due-badge"
import { StatusBadge } from "@/components/common/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PRIORITY_STYLE, TASK_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import { checklistProgress } from "@/lib/checklist"
import { formatDate } from "@/lib/format"
import type { Task } from "@/types/task"
import type { User } from "@/types/user"

/** มุมมองตาราง — เลื่อนแนวนอนบนจอแคบแทนการบีบคอลัมน์จนอ่านไม่ออก */
export function TaskTable({
  tasks,
  usersById,
  onOpenTask,
}: {
  tasks: Task[]
  usersById: Map<string, User>
  onOpenTask: (task: Task) => void
}) {
  const { t, tl, locale } = useLocale()

  return (
    <div data-testid="task-table">
      {/* บนมือถือใช้การ์ดแทนตาราง เพราะคอลัมน์เยอะเกินกว่าจะอ่านสบายในจอแคบ */}
      <ul className="space-y-2 sm:hidden">
        {tasks.map((task) => {
          const progress = checklistProgress(task.checklist)
          const assignees = task.assigneeIds
            .map((id) => usersById.get(id))
            .filter((user): user is User => Boolean(user))

          return (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => onOpenTask(task)}
                className="hover:border-brand-300 focus-visible:outline-ring w-full space-y-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-2"
              >
                <span className="flex items-start gap-1.5">
                  {task.dependsOn.length > 0 ? (
                    <LinkIcon
                      className="text-muted-foreground mt-0.5 size-3.5 shrink-0"
                      aria-label={t("task.dependencies")}
                    />
                  ) : null}
                  <span className="flex-1 text-sm font-medium">
                    {tl(task.title)}
                  </span>
                </span>

                <span className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge size="sm" style={TASK_STATUS_STYLE[task.status]} />
                  <StatusBadge size="sm" style={PRIORITY_STYLE[task.priority]} />
                  <DueBadge task={task} />
                </span>

                <span className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-2">
                    {task.dueDate ? formatDate(task.dueDate, locale) : "—"}
                    {progress.total > 0 ? (
                      <span className="flex items-center gap-1 tabular-nums">
                        <ListChecksIcon className="size-3" aria-hidden="true" />
                        {progress.done}/{progress.total}
                      </span>
                    ) : null}
                  </span>
                  <AvatarGroup users={assignees} max={2} />
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border sm:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-64">{t("task.name")}</TableHead>
            <TableHead className="min-w-32">{t("task.assignees")}</TableHead>
            <TableHead className="min-w-32">
              {t("designSystem.taskStatuses")}
            </TableHead>
            <TableHead className="min-w-24">{t("priority.label")}</TableHead>
            <TableHead className="min-w-40">{t("task.dueDate")}</TableHead>
            <TableHead className="min-w-24">{t("task.checklist")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const progress = checklistProgress(task.checklist)
            const assignees = task.assigneeIds
              .map((id) => usersById.get(id))
              .filter((user): user is User => Boolean(user))

            return (
              <TableRow key={task.id}>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onOpenTask(task)}
                    className="hover:text-brand-text focus-visible:outline-ring flex items-center gap-1.5 text-left font-medium focus-visible:outline-2"
                  >
                    {task.dependsOn.length > 0 ? (
                      <LinkIcon
                        className="text-muted-foreground size-3.5 shrink-0"
                        aria-label={t("task.dependencies")}
                      />
                    ) : null}
                    {tl(task.title)}
                  </button>
                </TableCell>
                <TableCell>
                  <AvatarGroup users={assignees} />
                </TableCell>
                <TableCell>
                  <StatusBadge size="sm" style={TASK_STATUS_STYLE[task.status]} />
                </TableCell>
                <TableCell>
                  <StatusBadge size="sm" style={PRIORITY_STYLE[task.priority]} />
                </TableCell>
                <TableCell>
                  <span className="flex flex-wrap items-center gap-1.5 text-sm whitespace-nowrap">
                    {task.dueDate ? formatDate(task.dueDate, locale) : "—"}
                    <DueBadge task={task} />
                  </span>
                </TableCell>
                <TableCell>
                  {progress.total > 0 ? (
                    <span className="text-muted-foreground flex items-center gap-1 text-sm tabular-nums">
                      <ListChecksIcon className="size-3.5" aria-hidden="true" />
                      {t("task.checklistProgress", {
                        done: progress.done,
                        total: progress.total,
                      })}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}
