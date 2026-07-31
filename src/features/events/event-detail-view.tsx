"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  CalendarIcon,
  CalendarOffIcon,
  ChevronLeftIcon,
  ClockIcon,
  HardHatIcon,
  MapPinIcon,
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
import { formatDateRange, formatDateTime, formatNumber } from "@/lib/format"
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
import { FilesView } from "@/features/files/files-view"
import { TasksView } from "@/features/tasks/tasks-view"
import { TimelineView } from "@/features/timeline/timeline-view"
import { EventActionsMenu } from "./event-actions-menu"

export function EventDetailView({ eventId }: { eventId: string }) {
  const { t, tl, locale } = useLocale()
  const state = useAppState()
  const today = React.useMemo(() => getToday(), [])

  const event = selectEventById(state, eventId)
  const { state: pageState, retry } = usePageState(false)

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
        <Skeleton className="h-40 w-full rounded-lg sm:h-52" />
        <Skeleton className="h-9 w-2/3" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
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

  return (
    <PageContainer>
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href={ROUTES.events}>
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
          {t("nav.events")}
        </Link>
      </Button>

      {event.coverImage ? (
        <div className="relative h-40 w-full overflow-hidden rounded-lg sm:h-52">
          <Image
            src={event.coverImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
            priority
          />
        </div>
      ) : null}

      <PageHeader
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
        actions={<EventActionsMenu event={event} />}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTile
          icon={CalendarIcon}
          label={t("event.startDate")}
          value={formatDateRange(event.startDate, event.endDate, locale)}
        />
        <InfoTile
          icon={ClockIcon}
          label={t("event.startTime")}
          value={`${event.startTime} – ${event.endTime}`}
        />
        <InfoTile
          icon={MapPinIcon}
          label={t("event.location")}
          value={tl(event.location)}
        />
        <InfoTile
          icon={UsersIcon}
          label={t("event.expectedAttendees")}
          value={`${formatNumber(event.expectedAttendees, locale)} ${t("dashboard.unitPerson")}`}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">{t("event.overview")}</TabsTrigger>
          <TabsTrigger value="tasks">{t("nav.myTasks")}</TabsTrigger>
          <TabsTrigger value="timeline">{t("nav.timeline")}</TabsTrigger>
          <TabsTrigger value="files">{t("nav.files")}</TabsTrigger>
          <TabsTrigger value="participants">{t("nav.participants")}</TabsTrigger>
          <TabsTrigger value="activity">{t("nav.activity")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
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
                    label={t("dashboard.overdueTasks")}
                    value={data.progress.overdueTasks}
                  />
                  <Metric
                    label={t("dashboard.participantSummary")}
                    value={data.rsvp.total}
                  />
                  <Metric label={t("nav.files")} value={data.files.length} />
                  <Metric label={t("rsvp.attending")} value={data.rsvp.attending} />
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
            <TasksView eventId={event.id} />
          </React.Suspense>
        </TabsContent>

        <TabsContent value="timeline" className="pt-4">
          <TimelineView eventId={event.id} />
        </TabsContent>

        <TabsContent value="files" className="pt-4">
          <FilesView eventId={event.id} />
        </TabsContent>

        <TabsContent value="participants" className="pt-4">
          <PendingTab
            countLabel={`${t("nav.participants")}: ${data.participants.length}`}
            phase="Phase 7 — Participants & Excel Import"
          />
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <RecentActivityCard
            activities={data.activities}
            usersById={data.usersById}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <span
          className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg"
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="text-muted-foreground block text-xs">{label}</span>
          <span className="block text-sm font-medium text-pretty">{value}</span>
        </span>
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  const { locale } = useLocale()
  return (
    <div>
      <p className="text-xl font-bold tabular-nums">
        {formatNumber(value, locale)}
      </p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  )
}

/** แท็บที่เนื้อหาจะถูกเติมใน Phase ถัดไป — แสดงจำนวนข้อมูลจริงไว้ก่อน */
function PendingTab({
  countLabel,
  phase,
}: {
  countLabel: string
  phase: string
}) {
  const { t } = useLocale()
  return (
    <Card>
      <CardContent>
        <EmptyState
          icon={HardHatIcon}
          title={countLabel}
          description={t("page.comingSoonDescription")}
          action={
            <p className="text-muted-foreground bg-muted rounded-full px-3 py-1 font-mono text-xs">
              {t("page.comingSoonPhase", { phase })}
            </p>
          }
        />
      </CardContent>
    </Card>
  )
}
