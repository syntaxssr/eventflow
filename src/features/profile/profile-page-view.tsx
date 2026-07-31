"use client"

import * as React from "react"
import Link from "next/link"
import {
  BellIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  ClockIcon,
  ListChecksIcon,
  MailIcon,
  type LucideIcon,
} from "lucide-react"

import { DueBadge } from "@/components/common/due-badge"
import { LanguageToggle } from "@/components/common/language-toggle"
import { PageContainer, PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ROUTES } from "@/constants/app"
import { getToday } from "@/constants/mock-date"
import { TASK_STATUS_STYLE } from "@/constants/status"
import { RecentActivityCard } from "@/features/dashboard/recent-activity-card"
import { useLocale } from "@/i18n"
import { isDueSoon, isIncomplete } from "@/lib/due-date"
import { formatDate } from "@/lib/format"
import { useAppState, useCurrentUser } from "@/store"
import {
  selectRecentActivities,
  selectTasksForUser,
  sortTasksByUrgency,
} from "@/store/selectors"
import type { Task } from "@/types/task"

/** หน้า User Profile — ข้อมูลผู้ใช้ปัจจุบัน + งานที่ดูแล + การตั้งค่า */
export function ProfilePageView() {
  const { t, locale } = useLocale()
  const state = useAppState()
  const currentUser = useCurrentUser()
  const today = React.useMemo(() => getToday(), [])

  if (!currentUser) return null

  const myTasks = selectTasksForUser(state, currentUser.id)
  const assigned = sortTasksByUrgency(myTasks.filter(isIncomplete), today)
  const dueSoon = assigned.filter((task) => isDueSoon(task, today))
  const completed = myTasks
    .filter((task) => task.status === "completed")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const activities = selectRecentActivities(state, 8, currentUser.id)
  const usersById = new Map(state.users.map((user) => [user.id, user]))

  return (
    <PageContainer>
      <PageHeader
        title={t("nav.profile")}
        description={t("profile.subtitle")}
      />

      <Card data-testid="profile-card">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <UserAvatar user={currentUser} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">
              {currentUser.firstName[locale]} {currentUser.lastName[locale]}
            </h2>
            <p className="text-muted-foreground text-sm">
              {currentUser.position[locale]} · {currentUser.team[locale]}
            </p>
            <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-sm">
              <MailIcon className="size-3.5 shrink-0" aria-hidden="true" />
              {currentUser.email}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.notificationSettings}>
                <BellIcon className="size-4" aria-hidden="true" />
                {t("shell.notificationSettings")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <TaskBucket
          icon={ListChecksIcon}
          title={t("profile.assignedTasks")}
          tasks={assigned}
          testId="profile-assigned"
        />
        <TaskBucket
          icon={ClockIcon}
          title={t("profile.dueSoonTasks")}
          tasks={dueSoon}
          testId="profile-due-soon"
        />
        <TaskBucket
          icon={CheckCircle2Icon}
          title={t("profile.recentlyCompleted")}
          tasks={completed.slice(0, 5)}
          testId="profile-completed"
        />
      </div>

      <RecentActivityCard activities={activities} usersById={usersById} />
    </PageContainer>
  )
}

function TaskBucket({
  icon: Icon,
  title,
  tasks,
  testId,
}: {
  icon: LucideIcon
  title: string
  tasks: Task[]
  testId: string
}) {
  const { t, tl, locale } = useLocale()

  return (
    <Card data-testid={testId}>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-sm">
          <Icon className="size-4" aria-hidden="true" />
          {title}
          <span className="text-muted-foreground font-normal">
            ({tasks.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("profile.noTasksInBucket")}
          </p>
        ) : (
          <ul className="space-y-1">
            {tasks.slice(0, 5).map((task) => (
              <li key={task.id}>
                <Link
                  href={`${ROUTES.myTasks}?task=${task.id}`}
                  className="hover:bg-muted/60 focus-visible:outline-ring group flex items-center gap-2 rounded-md px-2 py-1.5 focus-visible:outline-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {tl(task.title)}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      {task.dueDate ? formatDate(task.dueDate, locale) : "—"}
                      <DueBadge task={task} />
                    </span>
                  </span>
                  <StatusBadge
                    size="sm"
                    style={TASK_STATUS_STYLE[task.status]}
                    showIcon={false}
                  />
                  <ChevronRightIcon
                    className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
