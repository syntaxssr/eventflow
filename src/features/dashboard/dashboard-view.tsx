"use client"

import * as React from "react"
import Link from "next/link"
import {
  BellIcon,
  CalendarDaysIcon,
  CalendarPlusIcon,
  CircleAlertIcon,
  ClockAlertIcon,
  ListChecksIcon,
} from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { PageContainer, PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/app"
import { getToday } from "@/constants/mock-date"
import { MAIN_EVENT_ID } from "@/mock"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import { getFullName } from "@/lib/user"
import { useAppState, useCurrentUser } from "@/store"
import {
  countTasksByStatus,
  selectActiveTasks,
  selectEventProgress,
  selectNotificationsForUser,
  selectParticipantsByEvent,
  selectRecentActivities,
  selectRecentFiles,
  selectTasksByEvent,
  selectTasksForUser,
  selectUpcomingEvents,
  sortTasksByUrgency,
  summariseRsvp,
} from "@/store/selectors"
import { isDueSoon, isIncomplete, isOverdue } from "@/lib/due-date"
import { DashboardSkeleton } from "./dashboard-skeleton"
import { FeaturedEventCard } from "./featured-event-card"
import { RecentActivityCard } from "./recent-activity-card"
import { RecentFilesCard } from "./recent-files-card"
import { RsvpSummaryCard } from "./rsvp-summary-card"
import { StatCard } from "./stat-card"
import { TaskStatusChart } from "./task-status-chart"
import { UrgentTasksCard } from "./urgent-tasks-card"

export function DashboardView() {
  const { t, locale } = useLocale()
  const state = useAppState()
  const currentUser = useCurrentUser()
  const today = React.useMemo(() => getToday(), [])

  const data = React.useMemo(() => {
    const upcomingEvents = selectUpcomingEvents(state, today)
    const featuredEvent =
      upcomingEvents.find((event) => event.id === MAIN_EVENT_ID) ??
      upcomingEvents[0]

    const myTasks = currentUser
      ? selectTasksForUser(state, currentUser.id)
      : []

    // ตัวเลขสรุปด้านบนเป็นภาพรวมของทั้งทีม ไม่ใช่เฉพาะงานของผู้ใช้ที่ล็อกอิน
    // เพราะทุกคนในระบบดูแลกิจกรรมร่วมกัน
    const activeTasks = selectActiveTasks(state)

    return {
      upcomingEvents,
      featuredEvent,
      featuredProgress: featuredEvent
        ? selectEventProgress(state, featuredEvent.id, today)
        : null,
      featuredTasks: featuredEvent
        ? selectTasksByEvent(state, featuredEvent.id)
        : [],
      featuredParticipants: featuredEvent
        ? selectParticipantsByEvent(state, featuredEvent.id)
        : [],
      myTasks,
      overdueCount: activeTasks.filter((task) => isOverdue(task, today)).length,
      dueSoonCount: activeTasks.filter((task) => isDueSoon(task, today)).length,
      incompleteCount: activeTasks.filter(isIncomplete).length,
      unreadCount: currentUser
        ? selectNotificationsForUser(state, currentUser.id).filter(
            (notification) => !notification.isRead
          ).length
        : 0,
      recentFiles: selectRecentFiles(state, 5),
      recentActivities: selectRecentActivities(state, 6),
      usersById: new Map(state.users.map((user) => [user.id, user])),
      eventsById: new Map(state.events.map((event) => [event.id, event])),
    }
  }, [state, currentUser, today])

  const { state: pageState, retry } = usePageState(data.upcomingEvents.length === 0)

  if (pageState === "loading") {
    return (
      <PageContainer>
        <PageHeader title={t("nav.dashboard")} />
        <DashboardSkeleton />
      </PageContainer>
    )
  }

  if (pageState === "error") {
    return (
      <PageContainer>
        <PageHeader title={t("nav.dashboard")} />
        <ErrorState onRetry={retry} />
      </PageContainer>
    )
  }

  if (pageState === "empty" || !data.featuredEvent || !data.featuredProgress) {
    return (
      <PageContainer>
        <PageHeader title={t("nav.dashboard")} />
        <EmptyState
          icon={CalendarPlusIcon}
          title={t("dashboard.noUpcomingEvents")}
          description={t("state.emptyDescription")}
          action={
            <Button asChild>
              <Link href={ROUTES.events}>{t("dashboard.createFirstEvent")}</Link>
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const urgentTasks = sortTasksByUrgency(
    data.myTasks.filter(isIncomplete),
    today
  ).slice(0, 5)

  return (
    <PageContainer>
      <PageHeader
        title={
          currentUser
            ? t("dashboard.greeting", { name: getFullName(currentUser, locale) })
            : t("nav.dashboard")
        }
        description={t("dashboard.subtitle")}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          labelKey="dashboard.upcomingEvents"
          value={data.upcomingEvents.length}
          unitKey="dashboard.unitEvent"
          icon={CalendarDaysIcon}
          href={ROUTES.events}
          tone="brand"
        />
        <StatCard
          labelKey="dashboard.tasksDueSoon"
          value={data.dueSoonCount}
          unitKey="dashboard.unitTask"
          icon={ClockAlertIcon}
          href={`${ROUTES.myTasks}?scope=all&due=soon`}
          tone="warning"
        />
        <StatCard
          labelKey="dashboard.overdueTasks"
          value={data.overdueCount}
          unitKey="dashboard.unitTask"
          icon={CircleAlertIcon}
          href={`${ROUTES.myTasks}?scope=all&due=overdue`}
          tone="danger"
        />
        <StatCard
          labelKey="dashboard.incompleteTasks"
          value={data.incompleteCount}
          unitKey="dashboard.unitTask"
          icon={ListChecksIcon}
          href={`${ROUTES.myTasks}?scope=all&status=incomplete`}
        />
        <StatCard
          labelKey="dashboard.unreadNotifications"
          value={data.unreadCount}
          unitKey="dashboard.unit"
          icon={BellIcon}
          href={ROUTES.notifications}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FeaturedEventCard
            event={data.featuredEvent}
            progress={data.featuredProgress}
            owner={data.usersById.get(data.featuredEvent.ownerId)}
            participantCount={data.featuredParticipants.length}
          />
        </div>
        <TaskStatusChart
          counts={countTasksByStatus(data.featuredTasks)}
          total={data.featuredTasks.length}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RsvpSummaryCard summary={summariseRsvp(data.featuredParticipants)} />
        <div className="lg:col-span-2">
          <UrgentTasksCard tasks={urgentTasks} eventsById={data.eventsById} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentFilesCard files={data.recentFiles} usersById={data.usersById} />
        <RecentActivityCard
          activities={data.recentActivities}
          usersById={data.usersById}
        />
      </div>
    </PageContainer>
  )
}
