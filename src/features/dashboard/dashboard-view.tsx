"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarDaysIcon,
  CalendarPlusIcon,
  CircleAlertIcon,
  ClockAlertIcon,
  OctagonXIcon,
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
import { getEventColor } from "@/lib/event"
import { appToast } from "@/lib/gif-toast"
import { DashboardCalendarCard } from "./dashboard-calendar-card"
import { DashboardSkeleton } from "./dashboard-skeleton"
import { FeaturedEventCard } from "./featured-event-card"
import { RecentActivityCard } from "./recent-activity-card"
import { RecentFilesCard } from "./recent-files-card"
import { RsvpSummaryCard } from "./rsvp-summary-card"
import { StatCard } from "./stat-card"
import { TaskStatusChart } from "./task-status-chart"
import { UrgentTasksCard } from "./urgent-tasks-card"

/** กัน welcome GIF เด้งซ้ำเมื่อกลับมาที่ Dashboard ภายใน session เดิม */
let welcomedSession: string | null = null

export function DashboardView() {
  const { t } = useLocale()
  const state = useAppState()
  const currentUser = useCurrentUser()
  const today = React.useMemo(() => getToday(), [])
  const signedInAt = state.session?.signedInAt

  React.useEffect(() => {
    if (!signedInAt || welcomedSession === signedInAt) return

    welcomedSession = signedInAt
    // Effect ทำงานหลัง Dashboard commit รอบแรก ซึ่งเป็นจังหวะเดียวกับที่ skeleton แสดง
    appToast.welcome("WELCOME")
  }, [signedInAt])

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
      blockedCount: activeTasks.filter((task) => task.status === "blocked").length,
      // ปฏิทินต้องเห็นได้ทุกเดือนที่เลื่อนไปดู จึงใช้ชุดเต็มไม่ใช่เฉพาะที่กำลังจะมาถึง
      calendarEvents: selectActiveEvents(state),
      calendarTasks: activeTasks,
      recentFiles: selectRecentFiles(state, 5),
      recentActivities: selectRecentActivities(state, 6),
      usersById: new Map(state.users.map((user) => [user.id, user])),
      eventsById: new Map(state.events.map((event) => [event.id, event])),
    }
  }, [state, currentUser, today])

  // แท็บความเคลื่อนไหวยืดยาวจนจบรายการ จึงต้องรู้ว่าแท็บไหนเปิดอยู่
  const [detailTab, setDetailTab] = React.useState("urgent")

  const { state: pageState, retry } = usePageState(data.upcomingEvents.length === 0)

  if (pageState === "loading") {
    return (
      <PageContainer>
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
      <div
        className="space-y-6"
        style={
          {
            "--dashboard-event-color": getEventColor(data.featuredEvent),
          } as React.CSSProperties
        }
      >
        {/* ปฏิทินฝั่งขวาใช้ความสูงคงที่จาก 6 สัปดาห์ + รายการ 3 งาน
          ฝั่งซ้ายยืดการ์ดกิจกรรมหลักให้สูงเท่ากับแถวเดียวกัน */}
        <div className="grid gap-4 lg:grid-cols-3">
        <div
          className="flex h-full min-h-0 flex-col gap-4 overflow-hidden lg:col-span-2"
          data-detail-card-expand={detailTab === "activity"}
        >
          {/* ชั้น 1 — ตัวเลขที่ต้องลงมือทำวันนี้เท่านั้น
              ตัด "งานที่ยังไม่เสร็จ" ออกเพราะนับซ้อนกับอีกสองใบ และตัดการแจ้งเตือน
              ที่ยังไม่อ่านออกเพราะมีกระดิ่งบน topbar อยู่แล้ว */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
              labelKey="dashboard.blockedTasks"
              value={data.blockedCount}
              unitKey="dashboard.unitTask"
              icon={OctagonXIcon}
              href={`${ROUTES.myTasks}?scope=all&status=blocked`}
              tone="blocked"
            />
            <StatCard
              labelKey="dashboard.overdueTasks"
              value={data.overdueCount}
              unitKey="dashboard.unitTask"
              icon={CircleAlertIcon}
              href={`${ROUTES.myTasks}?scope=all&due=overdue`}
              tone="danger"
            />
          </div>

          {/* ชั้น 2 — กิจกรรมที่ต้องดูแลตอนนี้ */}
          <FeaturedEventCard
            event={data.featuredEvent}
            progress={data.featuredProgress}
            participantCount={data.featuredParticipants.length}
          >
            <Tabs
              className="dashboard-featured-event-tabs"
              value={detailTab}
              onValueChange={setDetailTab}
              data-testid="dashboard-detail-tabs"
            >
              <TabsList className="dashboard-featured-tabs-list">
                <TabsTrigger value="urgent">
                  {t("dashboard.myUrgentTasks")}
                </TabsTrigger>
                <TabsTrigger value="rsvp">{t("dashboard.rsvpSummary")}</TabsTrigger>
                <TabsTrigger value="taskStatus">
                  {t("dashboard.taskStatusSummary")}
                </TabsTrigger>
                <TabsTrigger value="files">{t("dashboard.recentFiles")}</TabsTrigger>
                <TabsTrigger value="activity">
                  {t("dashboard.recentActivity")}
                </TabsTrigger>
              </TabsList>

              <TabsContent className="min-h-0" value="urgent">
                <UrgentTasksCard
                  tasks={urgentTasks}
                  eventsById={data.eventsById}
                />
              </TabsContent>
              <TabsContent className="min-h-0" value="rsvp">
                <RsvpSummaryCard
                  summary={summariseRsvp(data.featuredParticipants)}
                />
              </TabsContent>
              <TabsContent className="min-h-0" value="taskStatus">
                <TaskStatusChart
                  counts={countTasksByStatus(data.featuredTasks)}
                  total={data.featuredTasks.length}
                />
              </TabsContent>
              <TabsContent className="min-h-0" value="files">
                <RecentFilesCard
                  files={data.recentFiles}
                  usersById={data.usersById}
                />
              </TabsContent>
              <TabsContent className="min-h-0" value="activity">
                <RecentActivityCard
                  activities={data.recentActivities}
                  usersById={data.usersById}
                />
              </TabsContent>
            </Tabs>
          </FeaturedEventCard>
        </div>

        <DashboardCalendarCard
          events={data.calendarEvents}
          tasks={data.calendarTasks}
        />
        </div>

      </div>
    </PageContainer>
  )
}
