"use client"

import * as React from "react"
import { ActivityIcon, FilterIcon, SearchIcon } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { FilterChips, type FilterChip } from "@/components/common/filter-chips"
import { PageContainer, PageHeader } from "@/components/common/page-header"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ACTIVITY_META } from "@/constants/activity"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import {
  EMPTY_ACTIVITY_FILTERS,
  filterActivities,
  type ActivityFilters,
} from "@/lib/activity"
import { formatDate, formatDateTime } from "@/lib/format"
import { getFullName } from "@/lib/user"
import { useAppState } from "@/store"
import { selectActiveEvents } from "@/store/selectors"
import { ACTIVITY_ACTIONS, type ActivityAction } from "@/types/activity"

/** หน้า Activity History — timeline list + ตัวกรองครบตามสเปกข้อ 27 */
export function ActivityPageView() {
  const { t, tl, locale } = useLocale()
  const state = useAppState()

  const [filters, setFilters] = React.useState<ActivityFilters>(
    EMPTY_ACTIVITY_FILTERS
  )
  const set = (changes: Partial<ActivityFilters>) =>
    setFilters((current) => ({ ...current, ...changes }))

  const events = selectActiveEvents(state)
  const usersById = React.useMemo(
    () => new Map(state.users.map((user) => [user.id, user])),
    [state.users]
  )

  const filtered = React.useMemo(
    () => filterActivities(state.activities, filters),
    [state.activities, filters]
  )

  const chips: FilterChip[] = [
    ...(filters.actorId !== "all"
      ? [
          {
            key: "actor",
            label: usersById.has(filters.actorId)
              ? getFullName(usersById.get(filters.actorId)!, locale)
              : filters.actorId,
            onRemove: () => set({ actorId: "all" }),
          },
        ]
      : []),
    ...(filters.action !== "all"
      ? [
          {
            key: "action",
            label: t(ACTIVITY_META[filters.action].labelKey),
            onRemove: () => set({ action: "all" }),
          },
        ]
      : []),
    ...(filters.eventId !== "all"
      ? [
          {
            key: "event",
            label:
              events.find((event) => event.id === filters.eventId)?.title[
                locale
              ] ?? filters.eventId,
            onRemove: () => set({ eventId: "all" }),
          },
        ]
      : []),
    ...(filters.dateFrom !== ""
      ? [
          {
            key: "from",
            label: `${t("activity.dateFrom")}: ${formatDate(filters.dateFrom, locale)}`,
            onRemove: () => set({ dateFrom: "" }),
          },
        ]
      : []),
    ...(filters.dateTo !== ""
      ? [
          {
            key: "to",
            label: `${t("activity.dateTo")}: ${formatDate(filters.dateTo, locale)}`,
            onRemove: () => set({ dateTo: "" }),
          },
        ]
      : []),
  ]

  const { state: pageState, retry } = usePageState(state.activities.length === 0)

  return (
    <PageContainer>
      <PageHeader
        title={t("nav.activity")}
        description={t("activity.subtitle")}
      />

      {pageState === "error" ? (
        <ErrorState onRetry={retry} />
      ) : pageState === "loading" ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-full max-w-2xl" />
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-2">
            <div className="relative w-full sm:w-64">
              <SearchIcon
                className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                value={filters.query}
                onChange={(event) => set({ query: event.target.value })}
                placeholder={t("activity.searchPlaceholder")}
                aria-label={t("common.search")}
                className="h-8 pl-8"
                data-testid="activity-search"
              />
            </div>

            <Select
              value={filters.actorId}
              onValueChange={(value) => set({ actorId: value })}
            >
              <SelectTrigger
                size="sm"
                className="w-44"
                aria-label={t("activity.filterActor")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("activity.filterActor")}: {t("common.all")}
                </SelectItem>
                {state.users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {getFullName(user, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.action}
              onValueChange={(value) =>
                set({ action: value as ActivityAction | "all" })
              }
            >
              <SelectTrigger
                size="sm"
                className="w-52"
                aria-label={t("activity.filterAction")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("activity.filterAction")}: {t("common.all")}
                </SelectItem>
                {ACTIVITY_ACTIONS.map((action) => (
                  <SelectItem key={action} value={action}>
                    {t(ACTIVITY_META[action].labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.eventId}
              onValueChange={(value) => set({ eventId: value })}
            >
              <SelectTrigger
                size="sm"
                className="w-52"
                aria-label={t("activity.filterEvent")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("activity.filterEvent")}: {t("common.all")}
                </SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid gap-1">
              <Label htmlFor="activity-from" className="text-xs">
                {t("activity.dateFrom")}
              </Label>
              <Input
                id="activity-from"
                type="date"
                value={filters.dateFrom}
                onChange={(event) => set({ dateFrom: event.target.value })}
                className="h-8 w-40"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="activity-to" className="text-xs">
                {t("activity.dateTo")}
              </Label>
              <Input
                id="activity-to"
                type="date"
                value={filters.dateTo}
                onChange={(event) => set({ dateTo: event.target.value })}
                className="h-8 w-40"
              />
            </div>
          </div>

          <FilterChips
            chips={chips}
            onClearAll={() =>
              setFilters({ ...EMPTY_ACTIVITY_FILTERS, query: filters.query })
            }
          />

          <p className="text-muted-foreground text-sm" aria-live="polite">
            {t("activity.resultCount", { count: filtered.length })}
          </p>

          {state.activities.length === 0 ? (
            <EmptyState
              icon={ActivityIcon}
              title={t("activity.empty")}
              description={t("activity.emptyDescription")}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FilterIcon}
              title={t("activity.noMatch")}
              description={t("activity.noMatchDescription")}
              action={
                <Button
                  variant="outline"
                  onClick={() => setFilters(EMPTY_ACTIVITY_FILTERS)}
                >
                  {t("common.clearAll")}
                </Button>
              }
            />
          ) : (
            <ol className="space-y-1" data-testid="activity-list">
              {filtered.map((activity) => {
                const actor = usersById.get(activity.actorId)
                const event = activity.eventId
                  ? events.find((entry) => entry.id === activity.eventId)
                  : null
                const meta = ACTIVITY_META[activity.action]
                const Icon = meta.icon

                return (
                  <li
                    key={activity.id}
                    className="hover:bg-muted/50 flex items-start gap-3 rounded-lg border px-3 py-2.5"
                    data-testid="activity-item"
                  >
                    <span
                      className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md"
                      aria-hidden="true"
                    >
                      <Icon className="size-3.5" />
                    </span>

                    <div className="min-w-0 flex-1 text-sm">
                      <p className="text-pretty">
                        {actor ? (
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <UserAvatar user={actor} size="xs" />
                            {getFullName(actor, locale)}
                          </span>
                        ) : null}{" "}
                        <span className="text-muted-foreground">
                          {t(meta.labelKey)}
                        </span>{" "}
                        <span className="font-medium">
                          {tl(activity.targetName)}
                        </span>
                      </p>

                      {activity.before && activity.after ? (
                        <p className="text-muted-foreground text-xs">
                          {t("activity.beforeAfter", {
                            before: tl(activity.before),
                            after: tl(activity.after),
                          })}
                        </p>
                      ) : activity.after ? (
                        <p className="text-muted-foreground text-xs">
                          {tl(activity.after)}
                        </p>
                      ) : null}

                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {event ? <>{tl(event.title)} · </> : null}
                        <time dateTime={activity.createdAt}>
                          {formatDateTime(activity.createdAt, locale)}
                        </time>
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </>
      )}
    </PageContainer>
  )
}
