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
import { PageContainer } from "@/components/common/page-header"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ROUTES } from "@/constants/app"
import { getToday } from "@/constants/mock-date"
import { TASK_STATUS_STYLE } from "@/constants/status"
import { RecentActivityCard } from "@/features/dashboard/recent-activity-card"
import { NotificationSettingsDialog } from "@/features/notifications/notification-settings-dialog"
import { AvatarColorPicker } from "./avatar-color-picker"
import { usePageState } from "@/hooks/use-page-state"
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
  // หน้านี้มีข้อมูลของผู้ใช้เสมอ จึงไม่มีสถานะ empty/error แยก
  const { state: pageState } = usePageState(false)

  if (!currentUser) return null

  const myTasks = selectTasksForUser(state, currentUser.id)
  const assigned = sortTasksByUrgency(myTasks.filter(isIncomplete), today)
  const dueSoon = assigned.filter((task) => isDueSoon(task, today))
  const completed = myTasks
    .filter((task) => task.status === "completed")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const activities = selectRecentActivities(state, 8, currentUser.id)
  const usersById = new Map(state.users.map((user) => [user.id, user]))

  if (pageState === "loading") return <ProfileSkeleton />

  return (
    <PageContainer>
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
            <AvatarColorPicker />
            <LanguageToggle />
            <ThemeToggle />
            <NotificationSettingsDialog>
              <Button
                variant="outline"
                size="sm"
                data-testid="open-notification-settings"
              >
                <BellIcon className="size-4" aria-hidden="true" />
                {t("shell.notificationSettings")}
              </Button>
            </NotificationSettingsDialog>
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

/**
 * โครงร่างตอนโหลด — ต้องเรียงและสูงเท่าหน้าจริง (ไม่มีหัวเพจแล้ว)
 * การ์ดโปรไฟล์ → 3 กล่องงาน → การ์ดความเคลื่อนไหว
 */
function ProfileSkeleton() {
  return (
    <PageContainer>
      <Card aria-hidden="true">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
            <Skeleton className="h-8 w-40" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {Array.from({ length: 5 }).map((_, row) => (
                <Skeleton key={row} className="h-11" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card aria-hidden="true">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-44" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
