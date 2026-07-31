"use client"

import * as React from "react"
import {
  ArrowUpDownIcon,
  CalendarPlusIcon,
  FilterIcon,
  LayoutGridIcon,
  PlusIcon,
  TableIcon,
} from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { FilterChips, type FilterChip } from "@/components/common/filter-chips"
import { PageContainer, PageHeader } from "@/components/common/page-header"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EVENT_STATUS_STYLE } from "@/constants/status"
import { getToday } from "@/constants/mock-date"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { getFullName } from "@/lib/user"
import { cn } from "@/lib/utils"
import { useAppState } from "@/store"
import {
  selectActiveEvents,
  selectEventProgress,
  selectParticipantsByEvent,
} from "@/store/selectors"
import { EVENT_STATUSES, type EventStatus } from "@/types/event"
import { EventCard } from "./event-card"
import { EventFormDialog } from "./event-form-dialog"
import { EventTable, type EventRow } from "./event-table"

type SortKey = "startDate" | "name" | "progress" | "updated"
type ViewMode = "grid" | "table"

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

  const [view, setView] = React.useState<ViewMode>("grid")
  const [statuses, setStatuses] = React.useState<EventStatus[]>([])
  const [ownerId, setOwnerId] = React.useState<string>("all")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [sort, setSort] = React.useState<SortKey>("startDate")
  const [formOpen, setFormOpen] = React.useState(false)

  const allRows = React.useMemo<EventRow[]>(() => {
    const usersById = new Map(state.users.map((user) => [user.id, user]))
    return selectActiveEvents(state).map((event) => ({
      event,
      progress: selectEventProgress(state, event.id, today),
      owner: usersById.get(event.ownerId),
      participantCount: selectParticipantsByEvent(state, event.id).length,
    }))
  }, [state, today])

  const rows = React.useMemo(() => {
    const filtered = allRows.filter(({ event }) => {
      if (statuses.length > 0 && !statuses.includes(event.status)) return false
      if (ownerId !== "all" && event.ownerId !== ownerId) return false
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
          return a.event.startDate.localeCompare(b.event.startDate)
      }
    })
  }, [allRows, statuses, ownerId, dateFrom, dateTo, sort, tl, locale])

  const clearAll = () => {
    setStatuses([])
    setOwnerId("all")
    setDateFrom("")
    setDateTo("")
  }

  const chips: FilterChip[] = [
    ...statuses.map((status) => ({
      key: `status-${status}`,
      label: t(EVENT_STATUS_STYLE[status].labelKey as TranslationKey),
      onRemove: () =>
        setStatuses((current) => current.filter((item) => item !== status)),
    })),
    ...(ownerId !== "all"
      ? [
          {
            key: "owner",
            label: `${t("event.owner")}: ${
              state.users.find((user) => user.id === ownerId)
                ? getFullName(
                    state.users.find((user) => user.id === ownerId)!,
                    locale
                  )
                : ownerId
            }`,
            onRemove: () => setOwnerId("all"),
          },
        ]
      : []),
    ...(dateFrom
      ? [
          {
            key: "from",
            label: `${t("event.startDate")}: ${dateFrom}`,
            onRemove: () => setDateFrom(""),
          },
        ]
      : []),
    ...(dateTo
      ? [
          {
            key: "to",
            label: `${t("event.endDate")}: ${dateTo}`,
            onRemove: () => setDateTo(""),
          },
        ]
      : []),
  ]

  const { state: pageState, retry } = usePageState(allRows.length === 0)

  const header = (
    <PageHeader
      title={t("nav.events")}
      description={t("event.listSubtitle")}
      actions={
        <Button onClick={() => setFormOpen(true)} data-testid="create-event">
          <PlusIcon className="size-4" aria-hidden="true" />
          {t("event.create")}
        </Button>
      }
    />
  )

  if (pageState === "loading") {
    return (
      <PageContainer>
        {header}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden pt-0">
              <Skeleton className="h-32 w-full rounded-none" />
              <CardContent className="space-y-3 pt-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2 w-full" />
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
        {header}
        <ErrorState onRetry={retry} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {header}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="status-filter">
                <FilterIcon className="size-4" aria-hidden="true" />
                {t("event.filterByStatus")}
                {statuses.length > 0 ? (
                  <span className="bg-brand-500 text-brand-950 ml-1 rounded-full px-1.5 text-[0.6875rem] font-bold">
                    {statuses.length}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>{t("event.filterByStatus")}</DropdownMenuLabel>
              {EVENT_STATUSES.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statuses.includes(status)}
                  onCheckedChange={(checked) =>
                    setStatuses((current) =>
                      checked
                        ? [...current, status]
                        : current.filter((item) => item !== status)
                    )
                  }
                  onSelect={(selectEvent) => selectEvent.preventDefault()}
                >
                  {t(EVENT_STATUS_STYLE[status].labelKey as TranslationKey)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={ownerId} onValueChange={setOwnerId}>
            <SelectTrigger size="sm" className="w-44" aria-label={t("event.owner")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("event.owner")}: {t("common.all")}
              </SelectItem>
              {state.users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {getFullName(user, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5">
            <Label htmlFor="event-from" className="sr-only">
              {t("event.startDate")}
            </Label>
            <Input
              id="event-from"
              type="date"
              value={dateFrom}
              onChange={(changeEvent) => setDateFrom(changeEvent.target.value)}
              className="h-7 w-36 text-xs"
            />
            <span className="text-muted-foreground text-xs">–</span>
            <Label htmlFor="event-to" className="sr-only">
              {t("event.endDate")}
            </Label>
            <Input
              id="event-to"
              type="date"
              value={dateTo}
              onChange={(changeEvent) => setDateTo(changeEvent.target.value)}
              className="h-7 w-36 text-xs"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDownIcon className="size-4" aria-hidden="true" />
                {t(SORT_LABEL[sort])}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>{t("event.sortBy")}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sort}
                onValueChange={(value) => setSort(value as SortKey)}
              >
                {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {t(SORT_LABEL[key])}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenuSeparator className="hidden" />

          <div className="ml-auto flex items-center gap-1">
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

        <p className="text-muted-foreground text-sm" aria-live="polite">
          {t("event.resultCount", { count: rows.length })}
        </p>
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
          {rows.map((row) => (
            <EventCard key={row.event.id} {...row} />
          ))}
        </div>
      ) : (
        <EventTable rows={rows} />
      )}

      <EventFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </PageContainer>
  )
}
