"use client"

import Link from "next/link"
import { ArrowRightIcon, PartyPopperIcon } from "lucide-react"

import { DueBadge } from "@/components/common/due-badge"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ROUTES } from "@/constants/app"
import { PRIORITY_STYLE, TASK_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import { formatDate } from "@/lib/format"
import type { EventItem } from "@/types/event"
import type { Task } from "@/types/task"

export function UrgentTasksCard({
  tasks,
  eventsById,
}: {
  tasks: Task[]
  eventsById: Map<string, EventItem>
}) {
  const { t, tl, locale } = useLocale()

  return (
    <Card data-testid="urgent-tasks">
      <CardHeader>
        <CardTitle>{t("dashboard.myUrgentTasks")}</CardTitle>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.myTasks}>
              {t("common.viewAll")}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {tasks.length === 0 ? (
          <EmptyState
            compact
            icon={PartyPopperIcon}
            title={t("dashboard.noUrgentTasks")}
          />
        ) : (
          <ul className="divide-border divide-y">
            {tasks.map((task) => {
              const event = eventsById.get(task.eventId)
              return (
                <li key={task.id}>
                  <Link
                    href={`${ROUTES.myTasks}?task=${task.id}`}
                    className="hover:bg-muted/60 focus-visible:outline-ring -mx-2 flex flex-col gap-1.5 rounded-md px-2 py-2.5 transition-colors focus-visible:outline-2"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0 flex-1 text-sm font-medium">
                        {tl(task.title)}
                      </span>
                      <DueBadge task={task} />
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge
                        size="sm"
                        style={TASK_STATUS_STYLE[task.status]}
                      />
                      <StatusBadge
                        size="sm"
                        style={PRIORITY_STYLE[task.priority]}
                      />
                      {task.dueDate ? (
                        <span className="text-muted-foreground text-xs">
                          {formatDate(task.dueDate, locale)}
                        </span>
                      ) : null}
                      {event ? (
                        <span className="text-muted-foreground truncate text-xs">
                          · {tl(event.title)}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
