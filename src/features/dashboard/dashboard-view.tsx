"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarDaysIcon,
  CalendarPlusIcon,
  CircleAlertIcon,
  ClockAlertIcon,
} from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { PageContainer, PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ROUTES } from "@/constants/app"
import { getToday } from "@/constants/mock-date"
import { MAIN_EVENT_ID } from "@/mock"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import { useAppState, useCurrentUser } from "@/store"
import {
  countTasksByStatus,
  selectActiveEvents,
  selectActiveTasks,
  selectEventProgress,
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
import { DashboardCalendarCard } from "./dashboard-calendar-card"
import { DashboardSkeleton } from "./dashboard-skeleton"
import { FeaturedEventCard } from "./featured-event-card"
import { RecentActivityCard } from "./recent-activity-card"
import { RecentFilesCard } from "./recent-files-card"
import { RsvpSummaryCard } from "./rsvp-summary-card"
import { StatCard } from "./stat-card"
import { TaskStatusChart } from "./task-status-chart"
import { UrgentTasksCard } from "./urgent-tasks-card"

export function DashboardView() {
  const { t } = useLocale()
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
      // ปฏิทินต้องเห็นได้ทุกเดือนที่เลื่อนไปดู จึงใช้ชุดเต็มไม่ใช่เฉพาะที่กำลังจะมาถึง
      calendarEvents: selectActiveEvents(state),
      calendarTasks: activeTasks,
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
      {/* คอลัมน์ซ้าย (2/3) เป็นตัวกำหนดความสูงของแถว ปฏิทินฝั่งขวายืดตาม
          ไม่ใช่กลับกัน — ไม่งั้นการ์ดกิจกรรมหลักจะโดนบีบจนเนื้อหาขาด */}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* ชั้น 1 — ตัวเลขที่ต้องลงมือทำวันนี้เท่านั้น
              ตัด "งานที่ยังไม่เสร็จ" ออกเพราะนับซ้อนกับอีกสองใบ และตัดการแจ้งเตือน
              ที่ยังไม่อ่านออกเพราะมีกระดิ่งบน topbar อยู่แล้ว */}
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              labelKey="dashboard.upcomingEvents"
              value={data.upcomingEvents.length}
              unitKey="dashboard.unitEvent"
              icon={CalendarDaysIcon}
              href={ROUTES.events}
              tone="brand"
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
              labelKey="dashboard.tasksDueSoon"
              value={data.dueSoonCount}
              unitKey="dashboard.unitTask"
              icon={ClockAlertIcon}
              href={`${ROUTES.myTasks}?scope=all&due=soon`}
              tone="warning"
            />
          </div>

          {/* ชั้น 2 — กิจกรรมที่ต้องดูแลตอนนี้ */}
          <FeaturedEventCard
            event={data.featuredEvent}
            progress={data.featuredProgress}
            participantCount={data.featuredParticipants.length}
          />
        </div>

        <DashboardCalendarCard
          events={data.calendarEvents}
          tasks={data.calendarTasks}
        />
      </div>

      {/* ชั้น 3 — ข้อมูลประกอบ ยุบเป็นแท็บเดียวเพื่อไม่ให้แย่งความสนใจกับสองชั้นบน
          งานเร่งด่วนของผู้ใช้เป็นแท็บแรกและเปิดค้างไว้ เพราะเป็นสิ่งเดียวในหน้านี้
          ที่ผูกกับคนที่ล็อกอินอยู่ */}
      <Tabs defaultValue="urgent" data-testid="dashboard-detail-tabs">
        <TabsList>
          <TabsTrigger value="urgent">
            {t("dashboard.myUrgentTasks")}
          </TabsTrigger>
          <TabsTrigger value="taskStatus">
            {t("dashboard.taskStatusSummary")}
          </TabsTrigger>
          <TabsTrigger value="rsvp">{t("dashboard.rsvpSummary")}</TabsTrigger>
          <TabsTrigger value="files">{t("dashboard.recentFiles")}</TabsTrigger>
          <TabsTrigger value="activity">
            {t("dashboard.recentActivity")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="urgent">
          <UrgentTasksCard tasks={urgentTasks} eventsById={data.eventsById} />
        </TabsContent>
        <TabsContent value="taskStatus">
          <TaskStatusChart
            counts={countTasksByStatus(data.featuredTasks)}
            total={data.featuredTasks.length}
          />
        </TabsContent>
        <TabsContent value="rsvp">
          <RsvpSummaryCard summary={summariseRsvp(data.featuredParticipants)} />
        </TabsContent>
        <TabsContent value="files">
          <RecentFilesCard files={data.recentFiles} usersById={data.usersById} />
        </TabsContent>
        <TabsContent value="activity">
          <RecentActivityCard
            activities={data.recentActivities}
            usersById={data.usersById}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
