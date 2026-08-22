"use client"

import * as React from "react"
import { LinkIcon, OctagonXIcon, PlusIcon, XIcon } from "lucide-react"
import { appToast } from "@/lib/gif-toast"

import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TASK_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { getBlockedInfo, validateDependency } from "@/lib/dependency"
import { cn } from "@/lib/utils"
import type { Task } from "@/types/task"
import { useTaskActions } from "./use-task-actions"

const ERROR_KEY: Record<string, TranslationKey> = {
  self_reference: "task.dependencySelfError",
  circular: "task.dependencyCircularError",
  duplicate: "task.dependencyDuplicateError",
  cross_event: "task.dependencyCrossEventError",
}

/**
 * ส่วนจัดการความสัมพันธ์ระหว่างงาน
 *
 * แสดงทั้งงานที่ต้องรอ (dependsOn) และงานที่ถูกงานนี้บล็อกอยู่ (blocks)
 * พร้อมป้องกันการสร้างความสัมพันธ์ที่ทำให้เกิดการรอกันเป็นวงกลม
 */
export function DependencySection({
  task,
  tasks,
}: {
  task: Task
  tasks: Task[]
}) {
  const { t, tl } = useLocale()
  const actions = useTaskActions()
  const [selected, setSelected] = React.useState("")

  const byId = React.useMemo(
    () => new Map(tasks.map((item) => [item.id, item])),
    [tasks]
  )

  const blocked = getBlockedInfo(task, tasks)
  const dependencies = task.dependsOn
    .map((id) => byId.get(id))
    .filter((item): item is Task => Boolean(item))
  const blocking = task.blocks
    .map((id) => byId.get(id))
    .filter((item): item is Task => Boolean(item))

  /** งานที่เลือกเป็น dependency ได้ — ต้องอยู่กิจกรรมเดียวกันและไม่ทำให้เกิดวงกลม */
  const candidates = tasks.filter(
    (candidate) =>
      candidate.eventId === task.eventId &&
      candidate.id !== task.id &&
      !task.dependsOn.includes(candidate.id) &&
      validateDependency(tasks, task.id, candidate.id).valid
  )

  const handleAdd = async () => {
    if (!selected) return

    const validation = validateDependency(tasks, task.id, selected)
    if (!validation.valid) {
      appToast.error(t(ERROR_KEY[validation.reason ?? "duplicate"]))
      return
    }

    await actions.addDependency(task, selected)
    setSelected("")
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <LinkIcon className="size-4" aria-hidden="true" />
          {t("task.dependencies")}
          {blocked.isBlocked ? (
            <span className="bg-danger/15 text-foreground dark:bg-danger/25 rounded-full px-2 py-0.5 text-xs font-medium">
              {t("task.waitingFor", { count: blocked.blockingTaskIds.length })}
            </span>
          ) : null}
        </h3>

        {dependencies.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("task.noDependencies")}</p>
        ) : (
          <ul className="space-y-1.5" data-testid="task-dependencies">
            {dependencies.map((dependency) => (
              <li
                key={dependency.id}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2 py-1.5",
                  dependency.status !== "completed" &&
                    "border-danger/30 bg-danger/10 dark:border-danger/40 dark:bg-danger/15"
                )}
              >
                {dependency.status !== "completed" ? (
                  <OctagonXIcon
                    className="text-destructive size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="min-w-0 flex-1 truncate text-sm">
                  {tl(dependency.title)}
                </span>
                <StatusBadge
                  size="sm"
                  style={TASK_STATUS_STYLE[dependency.status]}
                />
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => actions.removeDependency(task, dependency.id)}
                  aria-label={`${t("common.remove")}: ${tl(dependency.title)}`}
                >
                  <XIcon className="size-3.5" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger
              size="sm"
              className="flex-1"
              aria-label={t("task.selectDependency")}
              data-testid="dependency-select"
            >
              <SelectValue placeholder={t("task.selectDependency")} />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {tl(candidate.title)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!selected}
            data-testid="dependency-add"
          >
            <PlusIcon className="size-4" aria-hidden="true" />
            {t("common.add")}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">{t("task.blocking")}</h3>
        {blocking.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("task.noBlocking")}</p>
        ) : (
          <ul className="space-y-1.5">
            {blocking.map((blockedTask) => (
              <li
                key={blockedTask.id}
                className="flex items-center gap-2 rounded-md border px-2 py-1.5"
              >
                <span className="min-w-0 flex-1 truncate text-sm">
                  {tl(blockedTask.title)}
                </span>
                <StatusBadge
                  size="sm"
                  style={TASK_STATUS_STYLE[blockedTask.status]}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
