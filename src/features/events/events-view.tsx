"use client"

import * as React from "react"
import {
  ArrowUpDownIcon,
  CalendarPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  LayoutGridIcon,
  PlusIcon,
  TableIcon,
} from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { FilterChips, type FilterChip } from "@/components/common/filter-chips"
import { PageContainer } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { EVENT_STATUS_STYLE, FILTER_TRIGGER_CLASS } from "@/constants/status"
import { getToday } from "@/constants/mock-date"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { getFullName, getUserColorStyle } from "@/lib/user"
import { cn } from "@/lib/utils"
import { useAppState } from "@/store"
import {
  compareEventsByRelevance,
  selectActiveEvents,
  selectEventProgress,
  selectParticipantsByEvent,
  selectTasksByEvent,
} from "@/store/selectors"
import { EVENT_STATUSES, type EventStatus } from "@/types/event"
import { EventCard } from "./event-card"
import { EventDateRangePicker } from "./event-date-range-picker"
import { EventFormDialog } from "./event-form-dialog"
import { EventTable, type EventRow } from "./event-table"

type SortKey = "startDate" | "name" | "progress" | "updated"
type ViewMode = "grid" | "table"

const EVENTS_PER_PAGE = 8

/** ความกว้างของตัวกรองแต่ละช่องตอนโหลด ให้ใกล้เคียงแถบจริง */
const SKELETON_FILTER_WIDTHS = [
  "w-11",
  "w-72",
  "w-44",
  "w-44",
  "w-32",
] as const

/** กริด 3 คอลัมน์ 2 แถวเต็ม — เติมพื้นที่พอดีโดยไม่ล้นจอ */
const SKELETON_CARD_COUNT = 6

function getCurrentYearDateRange() {
  const currentYear = getToday().getFullYear()
  return {
    from: `${currentYear}-01-01`,
    to: `${currentYear}-12-31`,
  }
}

const SORT_LABEL: Record<SortKey, TranslationKey> = {
  startDate: "event.sortStartDate",
  name: "event.sortName",
  progress: "event.sortProgress",
  updated: "event.sortUpdated",
}

export function EventsView() {
  const { t, tl, locale } = useLocale()
  const state = useAppState()
  const today = React.useMemo(() => getToday(), [])
  const defaultDateRange = React.useMemo(() => getCurrentYearDateRange(), [])

  const [view, setView] = React.useState<ViewMode>("grid")
  const [statuses, setStatuses] = React.useState<EventStatus[]>([])
  const [ownerId, setOwnerId] = React.useState<string>("all")
  const [dateFrom, setDateFrom] = React.useState(defaultDateRange.from)
  const [dateTo, setDateTo] = React.useState(defaultDateRange.to)
  const [sort, setSort] = React.useState<SortKey>("startDate")
  const [formOpen, setFormOpen] = React.useState(false)
  const [page, setPage] = React.useState(0)
  const isDefaultDateRange =
    dateFrom === defaultDateRange.from && dateTo === defaultDateRange.to

  const allRows = React.useMemo<EventRow[]>(() => {
    const usersById = new Map(state.users.map((user) => [user.id, user]))
    return selectActiveEvents(state).map((event) => {
      const memberIds = [
        event.ownerId,
        event.createdBy,
        ...selectTasksByEvent(state, event.id).flatMap((task) => task.assigneeIds),
      ]
      const members = [...new Set(memberIds)].flatMap((id) => {
        const user = usersById.get(id)
        return user ? [user] : []
      })

      return {
        event,
        progress: selectEventProgress(state, event.id, today),
        owner: usersById.get(event.ownerId),
        members,
        participantCount: selectParticipantsByEvent(state, event.id).length,
      }
    })
  }, [state, today])

  const rows = React.useMemo(() => {
    const filtered = allRows.filter(({ event, members }) => {
      if (statuses.length > 0 && !statuses.includes(event.status)) return false
      if (ownerId !== "all" && !members.some((user) => user.id === ownerId)) {
        return false
      }
      if (dateFrom && event.endDate < dateFrom) return false
      if (dateTo && event.startDate > dateTo) return false
      return true
    })

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "name":
          return tl(a.event.title).localeCompare(tl(b.event.title), locale)
        case "progress":
          return b.progress.percent - a.progress.percent
        case "updated":
          return b.event.updatedAt.localeCompare(a.event.updatedAt)
        default:
          return compareEventsByRelevance(a.event, b.event, today)
      }
    })
  }, [allRows, statuses, ownerId, dateFrom, dateTo, sort, tl, locale, today])

  const totalPages = Math.ceil(rows.length / EVENTS_PER_PAGE)
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0))
  const visibleRows = rows.slice(
    currentPage * EVENTS_PER_PAGE,
    (currentPage + 1) * EVENTS_PER_PAGE
  )
  const selectedOwner =
    ownerId === "all"
      ? undefined
      : state.users.find((user) => user.id === ownerId)
  const selectedOwnerLabel =
    ownerId === "all"
      ? t("common.all")
      : selectedOwner
        ? getFullName(selectedOwner, locale)
        : ownerId

  const clearAll = () => {
    setStatuses([])
    setOwnerId("all")
    setDateFrom(defaultDateRange.from)
    setDateTo(defaultDateRange.to)
    setPage(0)
  }

  const chips: FilterChip[] = [
    ...statuses.map((status) => {
      const style = EVENT_STATUS_STYLE[status]
      const Icon = style.icon

      return {
        key: `status-${status}`,
        label: t(style.labelKey as TranslationKey),
        icon: <Icon className="size-3 shrink-0" aria-hidden="true" />,
        className: style.badge,
        onRemove: () => {
          setStatuses((current) => current.filter((item) => item !== status))
          setPage(0)
        },
      }
    }),
    ...(ownerId !== "all"
      ? (() => {
          const owner = selectedOwner
          // ชิปใช้สีประจำตัวของคนนั้น ชุดเดียวกับช่องที่เลือกแล้ว
          const ownerStyle = owner ? getUserColorStyle(owner) : undefined

          return [
            {
              key: "owner",
              label: `${t("event.assignees")}: ${
                owner ? getFullName(owner, locale) : ownerId
              }`,
              icon: owner ? (
                <UserAvatar user={owner} size="xs" className="-ml-1.5" />
              ) : undefined,
              style: ownerStyle,
              onRemove: () => {
                setOwnerId("all")
                setPage(0)
              },
            },
          ]
        })()
      : []),
    ...(dateFrom && !isDefaultDateRange
      ? [
          {
            key: "from",
            label: `${t("event.startDate")}: ${dateFrom}`,
            onRemove: () => {
              setDateFrom("")
              setPage(0)
            },
          },
        ]
      : []),
    ...(dateTo && !isDefaultDateRange
      ? [
          {
            key: "to",
            label: `${t("event.endDate")}: ${dateTo}`,
            onRemove: () => {
              setDateTo("")
              setPage(0)
            },
          },
        ]
      : []),
  ]

  const { state: pageState, retry } = usePageState(allRows.length === 0)

  if (pageState === "loading") {
    return (
      <PageContainer>
        {/* โครงร่างต้องเท่ากับหน้าจริง ไม่งั้นพอโหลดเสร็จเนื้อหาจะกระโดด
            แถบตัวกรองสูง ~130px ถ้าไม่ใส่ กริดจะเด้งลงมาทั้งแผง */}
        <div className="space-y-3" aria-hidden="true">
          <div className="flex flex-wrap items-end gap-2">
            {SKELETON_FILTER_WIDTHS.map((width, index) => (
              <div key={index} className="flex flex-col gap-1">
                <Skeleton className="ml-1 h-3 w-16" />
                <Skeleton className={cn("h-8", width)} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
            <Card key={index} className="overflow-hidden" aria-hidden="true">
              {/* ไล่ตามโครงของ EventCard ทีละส่วน ความสูงจึงใกล้เคียงของจริง */}
              <CardContent className="space-y-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 shrink-0 rounded-xl" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="col-span-3 h-4 w-3/4" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex min-h-6 items-center justify-end gap-2">
                  <div className="flex items-center">
                    {Array.from({ length: 4 }).map((_, avatarIndex) => (
                      <Skeleton
                        key={avatarIndex}
                        className="ring-card size-8 shrink-0 rounded-full not-first:-ml-2 ring-2"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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

  return (
    <PageContainer>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground pl-1 text-xs font-medium">
              {t("event.filterByStatus")}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={FILTER_TRIGGER_CLASS}
                  data-testid="status-filter"
                >
                  <FilterIcon className="size-4" aria-hidden="true" />
                  {statuses.length > 0 ? (
                    <span className="bg-brand-500 text-brand-950 ml-1 rounded-full px-1.5 text-[0.6875rem] font-bold">
                      {statuses.length}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>{t("event.filterByStatus")}</DropdownMenuLabel>
                {EVENT_STATUSES.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statuses.includes(status)}
                    onCheckedChange={(checked) => {
                      setStatuses((current) =>
                        checked
                          ? [...current, status]
                          : current.filter((item) => item !== status)
                      )
                      setPage(0)
                    }}
                    onSelect={(selectEvent) => selectEvent.preventDefault()}
                  >
                    <StatusBadge
                      size="sm"
                      style={EVENT_STATUS_STYLE[status]}
                      className="pointer-events-none"
                    />
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground pl-1 text-xs font-medium">
              {t("event.assignees")}
            </span>
            <Select
              value={ownerId}
              onValueChange={(value) => {
                setOwnerId(value)
                setPage(0)
              }}
            >
              <SelectTrigger
                size="sm"
                className={cn("w-72 max-w-none", FILTER_TRIGGER_CLASS)}
                aria-label={t("event.assignees")}
              >
                <span className="min-w-0 truncate">{selectedOwnerLabel}</span>
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="w-72">
                <SelectItem value="all">
                  {t("event.assignees")}: {t("common.all")}
                </SelectItem>
                {state.users.map((user) => (
                  <SelectItem key={user.id} value={user.id} className="py-1.5">
                    <span className="flex items-center gap-2">
                      <UserAvatar user={user} size="sm" />
                      <span className="truncate">{getFullName(user, locale)}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <EventDateRangePicker
            from={dateFrom}
            to={dateTo}
            onFromChange={(from) => {
              setDateFrom(from)
              if (dateTo && from > dateTo) setDateTo(from)
              setPage(0)
            }}
            onToChange={(to) => {
              setDateTo(to)
              if (dateFrom && to < dateFrom) setDateFrom(to)
              setPage(0)
            }}
          />

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground pl-1 text-xs font-medium">
              {t("event.sortBy")}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={FILTER_TRIGGER_CLASS}
                >
                  <ArrowUpDownIcon className="size-4" aria-hidden="true" />
                  {t(SORT_LABEL[sort])}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>{t("event.sortBy")}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(value) => {
                    setSort(value as SortKey)
                    setPage(0)
                  }}
                >
                  {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                    <DropdownMenuRadioItem key={key} value={key}>
                      {t(SORT_LABEL[key])}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DropdownMenuSeparator className="hidden" />

          <div className="ml-auto flex items-center gap-1">
            <Button onClick={() => setFormOpen(true)} data-testid="create-event">
              <PlusIcon className="size-4" aria-hidden="true" />
              {t("event.create")}
            </Button>
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-pressed={view === "grid"}
              aria-label={t("event.gridView")}
              onClick={() => setView("grid")}
            >
              <LayoutGridIcon className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-pressed={view === "table"}
              aria-label={t("event.tableView")}
              onClick={() => setView("table")}
            >
              <TableIcon className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <FilterChips chips={chips} onClearAll={clearAll} />

      </div>

      {pageState === "empty" || allRows.length === 0 ? (
        <EmptyState
          icon={CalendarPlusIcon}
          title={t("event.noEvents")}
          description={t("event.noEventsDescription")}
          action={
            <Button onClick={() => setFormOpen(true)}>
              <PlusIcon className="size-4" aria-hidden="true" />
              {t("event.create")}
            </Button>
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={FilterIcon}
          title={t("event.noEventsMatch")}
          description={t("event.noEventsMatchDescription")}
          action={
            <Button variant="outline" onClick={clearAll}>
              {t("common.clearAll")}
            </Button>
          }
        />
      ) : view === "grid" ? (
        <div
          className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3")}
          data-testid="event-grid"
        >
          {visibleRows.map((row) => (
            <EventCard key={row.event.id} {...row} />
          ))}
        </div>
      ) : (
        <EventTable rows={visibleRows} />
      )}

      {totalPages > 1 ? (
        <nav
          className="flex items-center justify-center gap-2"
          aria-label={t("event.pagination")}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={currentPage === 0}
            aria-label={t("common.previous")}
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </Button>
          <span className="text-muted-foreground min-w-12 text-center text-sm tabular-nums">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setPage((current) => Math.min(current + 1, totalPages - 1))
            }
            disabled={currentPage >= totalPages - 1}
            aria-label={t("common.next")}
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </nav>
      ) : null}

      <EventFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </PageContainer>
  )
}
