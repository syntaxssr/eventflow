"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarIcon,
  CalendarOffIcon,
  ChevronLeftIcon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  MapPinIcon,
  TriangleAlertIcon,
  UserCheckIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { PageContainer, PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ROUTES } from "@/constants/app"
import {
  daysBetween,
  fromDateKey,
  getToday,
} from "@/constants/mock-date"
import { EVENT_STATUS_STYLE } from "@/constants/status"
import { RecentActivityCard } from "@/features/dashboard/recent-activity-card"
import { TaskStatusChart } from "@/features/dashboard/task-status-chart"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import { getEventColor, getEventIcon, getEventIconColor } from "@/lib/event"
import {
  formatDateRange,
  formatDateTime,
  formatNumber,
  formatTimeRange,
} from "@/lib/format"
import { getFullName } from "@/lib/user"
import { useAppState } from "@/store"
import {
  countTasksByStatus,
  selectEventById,
  selectEventProgress,
  selectParticipantsByEvent,
  selectTasksByEvent,
  summariseRsvp,
} from "@/store/selectors"
import { ExportEventDialog } from "@/features/export/export-event-dialog"
import { FilesView } from "@/features/files/files-view"
import { ParticipantsView } from "@/features/participants/participants-view"
import { TasksView } from "@/features/tasks/tasks-view"
import { TimelineView } from "@/features/timeline/timeline-view"
import { EventActionsMenu } from "./event-actions-menu"

export function EventDetailView({ eventId }: { eventId: string }) {
  const { t, tl, locale } = useLocale()
  const state = useAppState()
  const today = React.useMemo(() => getToday(), [])

  const event = selectEventById(state, eventId)
  const { state: pageState, retry } = usePageState(false)
  const [exportOpen, setExportOpen] = React.useState(false)

  const data = React.useMemo(() => {
    if (!event) return null
    const tasks = selectTasksByEvent(state, event.id)
    const participants = selectParticipantsByEvent(state, event.id)
    return {
      tasks,
      participants,
      progress: selectEventProgress(state, event.id, today),
      rsvp: summariseRsvp(participants),
      files: state.files.filter(
        (file) => file.eventId === event.id && file.deletedAt === null
      ),
      timeline: state.timeline.filter((item) => item.eventId === event.id),
      activities: state.activities
        .filter((activity) => activity.eventId === event.id)
        .slice(0, 12),
      owner: state.users.find((user) => user.id === event.ownerId),
      creator: state.users.find((user) => user.id === event.createdBy),
      editor: state.users.find((user) => user.id === event.updatedBy),
      usersById: new Map(state.users.map((user) => [user.id, user])),
    }
  }, [state, event, today])

  // ไม่ใช้ notFound() เพราะการ throw ระหว่าง render จะยกเลิกการเปลี่ยนหน้า
  // ที่กำลังเกิดขึ้นตอนผู้ใช้กดลบกิจกรรม — แสดงสถานะไม่พบไว้ในโครงหน้าเดิมแทน
  if (!event || event.deletedAt !== null || !data) {
    return (
      <PageContainer>
        <EmptyState
          icon={CalendarOffIcon}
          title={t("state.notFoundTitle")}
          description={t("state.notFoundDescription")}
          action={
            <Button asChild>
              <Link href={ROUTES.events}>{t("nav.events")}</Link>
            </Button>
          }
        />
      </PageContainer>
    )
  }

  if (pageState === "error") {
    return (
      <PageContainer>
        <ErrorState onRetry={retry} />
      </PageContainer>
    )
  }

  if (pageState === "loading") {
    return (
      <PageContainer>
        <Skeleton className="h-9 w-2/3" />
        <div className="grid grid-cols-12 gap-x-4">
          <Skeleton className="col-span-2 h-5" />
          <Skeleton className="col-span-2 h-5" />
          <Skeleton className="col-span-2 h-5" />
          <Skeleton className="col-span-6 h-5" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </PageContainer>
    )
  }

  const daysLeft = daysBetween(today, fromDateKey(event.startDate))
  const countdown =
    daysLeft > 0
      ? t("dashboard.daysUntilEvent", { days: daysLeft })
      : daysLeft === 0
        ? t("dashboard.eventToday")
        : t("dashboard.eventPassed", { days: Math.abs(daysLeft) })
  const eventColor = getEventColor(event)
  const eventIcon = getEventIcon(event)

  return (
    <PageContainer className="space-y-2">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href={ROUTES.events}>
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
          {t("nav.events")}
        </Link>
      </Button>

      <Card>
        <CardContent className="space-y-4">
          <PageHeader
            className="border-b-0 pb-0"
            visual={
              <span
                className="flex size-full items-center justify-center rounded-xl"
                style={{
                  backgroundColor: eventColor,
                  color: getEventIconColor(eventColor),
                }}
                aria-hidden="true"
              >
                {React.createElement(eventIcon, {
                  className: "size-7",
                  strokeWidth: 2.25,
                })}
              </span>
            }
            title={
              <span className="flex flex-wrap items-center gap-2">
                {tl(event.title)}
                <StatusBadge style={EVENT_STATUS_STYLE[event.status]} />
                <span className="bg-muted rounded-full px-2.5 py-1 text-xs font-semibold">
                  {countdown}
                </span>
              </span>
            }
            description={tl(event.description)}
            actions={
              <span className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExportOpen(true)}
                  data-testid="open-event-export"
                >
                  <DownloadIcon className="size-4" aria-hidden="true" />
                  {t("export.action")}
                </Button>
                <EventActionsMenu event={event} />
              </span>
            }
          />

          <div className="grid grid-cols-12 gap-x-4">
            <InfoTile
              className="col-span-2"
              icon={CalendarIcon}
              label={t("event.startDate")}
              value={formatDateRange(event.startDate, event.endDate, locale)}
            />
            <InfoTile
              className="col-span-2"
              icon={ClockIcon}
              label={t("event.startTime")}
              value={formatTimeRange(event.startTime, event.endTime, locale)}
            />
            <InfoTile
              className="col-span-2"
              icon={UsersIcon}
              label={t("event.expectedAttendees")}
              value={`${formatNumber(event.expectedAttendees, locale)} ${t("dashboard.unitPerson")}`}
            />
            <InfoTile
              className="col-span-6"
              icon={MapPinIcon}
              label={t("event.location")}
              value={tl(event.location)}
            />
          </div>

          <Tabs className="event-detail-tabs" defaultValue="overview">
            <TabsList className="event-detail-tabs-list">
          <TabsTrigger value="overview">{t("event.overview")}</TabsTrigger>
          <TabsTrigger value="tasks">{t("nav.myTasks")}</TabsTrigger>
          <TabsTrigger value="timeline">{t("nav.timeline")}</TabsTrigger>
          <TabsTrigger value="files">{t("nav.files")}</TabsTrigger>
          <TabsTrigger value="participants">{t("nav.participants")}</TabsTrigger>
          <TabsTrigger value="activity">{t("nav.activity")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.progress")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t("dashboard.progress")}</span>
                    <span className="text-xl font-bold tabular-nums">
                      {data.progress.percent}%
                    </span>
                  </div>
                  <Progress
                    value={data.progress.percent}
                    tone="completion"
                    className="h-2"
                    aria-label={t("dashboard.progress")}
                  />
                  <p className="text-muted-foreground text-sm">
                    {t("dashboard.tasksCompletedOf", {
                      done: data.progress.completedTasks,
                      total: data.progress.totalTasks,
                    })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-4">
                  <Metric
                    icon={TriangleAlertIcon}
                    iconClassName="bg-danger text-danger-foreground"
                    label={t("dashboard.overdueTasks")}
                    value={data.progress.overdueTasks}
                  />
                  <Metric
                    icon={UsersIcon}
                    iconClassName="bg-info text-info-foreground"
                    label={t("dashboard.participantSummary")}
                    value={data.rsvp.total}
                  />
                  <Metric
                    icon={FileTextIcon}
                    iconClassName="bg-event-status-purple text-event-status-purple-foreground"
                    label={t("nav.files")}
                    value={data.files.length}
                  />
                  <Metric
                    icon={UserCheckIcon}
                    iconClassName="bg-success text-success-foreground"
                    label={t("rsvp.attending")}
                    value={data.rsvp.attending}
                  />
                </div>

                <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-xs">
                  {data.owner ? (
                    <span className="flex items-center gap-2">
                      <UserAvatar user={data.owner} size="xs" />
                      <span className="text-foreground font-medium">
                        {getFullName(data.owner, locale)}
                      </span>
                      <span>· {t("event.owner")}</span>
                    </span>
                  ) : null}
                  {data.creator ? (
                    <span>
                      {t("event.createdBy", {
                        name: getFullName(data.creator, locale),
                      })}{" "}
                      · {formatDateTime(event.createdAt, locale)}
                    </span>
                  ) : null}
                  {data.editor ? (
                    <span>
                      {t("event.updatedBy", {
                        name: getFullName(data.editor, locale),
                      })}{" "}
                      · {formatDateTime(event.updatedAt, locale)}
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <TaskStatusChart
              counts={countTasksByStatus(data.tasks)}
              total={data.tasks.length}
            />
          </div>
            </TabsContent>

            <TabsContent value="tasks" className="pt-4">
          <React.Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <TasksView eventId={event.id} showHeader={false} />
          </React.Suspense>
            </TabsContent>

            <TabsContent value="timeline" className="pt-4">
          <TimelineView eventId={event.id} />
            </TabsContent>

            <TabsContent value="files" className="pt-4">
          <FilesView eventId={event.id} />
            </TabsContent>

            <TabsContent value="participants" className="pt-4">
          <ParticipantsView eventId={event.id} />
            </TabsContent>

            <TabsContent value="activity" className="pt-4">
          <RecentActivityCard
            activities={data.activities}
            usersById={data.usersById}
          />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ExportEventDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        eventId={event.id}
      />
    </PageContainer>
  )
}

function InfoTile({
  className,
  icon: Icon,
  label,
  value,
}: {
  className?: string
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div
      className={`text-muted-foreground flex min-w-0 items-center gap-3 ${className ?? ""}`}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span className="sr-only">{label}: </span>
      <span className="truncate text-base">{value}</span>
    </div>
  )
}

function Metric({
  icon: Icon,
  iconClassName,
  label,
  value,
}: {
  icon: LucideIcon
  iconClassName: string
  label: string
  value: number
}) {
  const { locale } = useLocale()
  return (
    <div className="flex items-center justify-center gap-2 text-left">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xl leading-none font-bold tabular-nums">
          {formatNumber(value, locale)}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">{label}</p>
      </div>
    </div>
  )
}
