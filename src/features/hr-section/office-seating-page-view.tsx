"use client"

import * as React from "react"
import {
  ArmchairIcon,
  CoffeeIcon,
  DoorOpenIcon,
  SearchIcon,
  UsersRoundIcon,
  XIcon,
} from "lucide-react"

import { PageContainer } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DESTRUCTIVE_ACTION_CLASS,
  FILTER_TRIGGER_CLASS,
} from "@/constants/status"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useLocale } from "@/i18n"
import { getEmployeeFullName } from "@/lib/employee"
import { cn } from "@/lib/utils"
import { useAppState } from "@/store"
import type { Employee } from "@/types/employee"

const MAX_OFFICE_SEATS = 108

export function OfficeSeatingPageView() {
  const { t, tl, locale } = useLocale()
  const reducedMotion = useReducedMotion()
  const allEmployees = useAppState().employees
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState("")
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<
    string | null
  >(null)
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(0)

  const employees = React.useMemo(
    () =>
      allEmployees
        .filter((employee) => employee.status !== "resigned")
        .slice(0, MAX_OFFICE_SEATS),
    [allEmployees]
  )
  const normalizedQuery = query.trim().toLocaleLowerCase(locale)
  const suggestions = React.useMemo(() => {
    if (!normalizedQuery) return []

    return employees
      .filter((employee) =>
        [
          employee.firstName.th,
          employee.firstName.en,
          employee.lastName.th,
          employee.lastName.en,
          employee.nickname.th,
          employee.nickname.en,
        ].some((value) =>
          value.toLocaleLowerCase(locale).startsWith(normalizedQuery)
        )
      )
      .slice(0, 8)
  }, [employees, locale, normalizedQuery])
  const matchedEmployeeIds = React.useMemo(
    () =>
      new Set(
        selectedEmployeeId
          ? [selectedEmployeeId]
          : suggestions.map((employee) => employee.id)
      ),
    [selectedEmployeeId, suggestions]
  )
  const showSuggestions = searchFocused && normalizedQuery.length > 0

  React.useEffect(() => {
    if (!selectedEmployeeId) return

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`office-seat-${selectedEmployeeId}`)
        ?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "center",
          inline: "center",
        })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [reducedMotion, selectedEmployeeId])

  const selectEmployee = (employee: Employee) => {
    setSelectedEmployeeId(employee.id)
    setQuery(getEmployeeFullName(employee, locale))
    setSearchFocused(false)
  }

  const clearSearch = () => {
    setQuery("")
    setSelectedEmployeeId(null)
    setActiveSuggestionIndex(0)
    setSearchFocused(false)
    searchInputRef.current?.focus()
  }

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === "Escape") setSearchFocused(false)
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveSuggestionIndex((index) => (index + 1) % suggestions.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveSuggestionIndex(
        (index) => (index - 1 + suggestions.length) % suggestions.length
      )
    } else if (event.key === "Enter") {
      event.preventDefault()
      selectEmployee(suggestions[activeSuggestionIndex] ?? suggestions[0])
    } else if (event.key === "Escape") {
      event.preventDefault()
      setSearchFocused(false)
    }
  }

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xl">
          <SearchIcon
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setSelectedEmployeeId(null)
              setActiveSuggestionIndex(0)
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("officeSeating.searchPlaceholder")}
            aria-label={t("officeSeating.searchLabel")}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls="office-seat-suggestions"
            aria-activedescendant={
              showSuggestions && suggestions.length > 0
                ? `office-seat-suggestion-${suggestions[activeSuggestionIndex]?.id}`
                : undefined
            }
            className={cn("h-9 pr-10 pl-9", FILTER_TRIGGER_CLASS)}
            data-testid="office-seat-search"
          />

          {query ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                "absolute top-1/2 right-0.5 z-10 -translate-y-1/2 rounded-md",
                DESTRUCTIVE_ACTION_CLASS
              )}
              onClick={clearSearch}
              aria-label={t("officeSeating.clearSearch")}
              data-testid="office-seat-search-clear"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </Button>
          ) : null}

          {showSuggestions ? (
            <div
              id="office-seat-suggestions"
              className="bg-popover text-popover-foreground absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-lg p-1 shadow-lg ring-1 ring-foreground/10"
              role="listbox"
            >
              {suggestions.length === 0 ? (
                <p className="text-muted-foreground px-3 py-5 text-center text-sm">
                  {t("officeSeating.noSuggestions")}
                </p>
              ) : (
                suggestions.map((employee, index) => {
                  const seatNumber = employees.indexOf(employee) + 1

                  return (
                    <button
                      key={employee.id}
                      id={`office-seat-suggestion-${employee.id}`}
                      type="button"
                      role="option"
                      aria-selected={index === activeSuggestionIndex}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                      onClick={() => selectEmployee(employee)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm outline-none",
                        index === activeSuggestionIndex && "bg-muted"
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {getEmployeeFullName(employee, locale)}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {tl(employee.nickname)} · {tl(employee.department)}
                        </span>
                      </span>
                      <span className="text-muted-foreground shrink-0 text-xs">
                        {t("officeSeating.suggestionLocation", {
                          seat: formatSeatNumber(seatNumber),
                        })}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {t("officeSeating.location")}
          </span>
          <Badge className="border-status-pink bg-status-pink text-status-pink-foreground">
            {t("officeSeating.conceptBadge")}
          </Badge>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {normalizedQuery
          ? t("officeSeating.searchResults", {
              count: matchedEmployeeIds.size,
            })
          : ""}
      </p>

      <Card className="gap-3 overflow-hidden bg-status-pink/20 py-3 ring-status-pink-foreground/20">
        <CardContent className="px-3 sm:px-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-status-pink-foreground">
            <MapLegendDot />
            <span>{t("officeSeating.conceptNote")}</span>
          </div>

          <div className="overflow-x-auto rounded-lg bg-white/65 p-3 shadow-inner dark:bg-black/15">
            <div className="relative mx-auto h-[820px] min-w-[1180px] max-w-[1380px] overflow-hidden border-4 border-status-pink-foreground/70 bg-status-pink/35 p-2 shadow-xl">
              <span className="absolute inset-x-0 top-0 h-1.5 bg-info/70" aria-hidden="true" />
              <span className="absolute inset-y-0 right-0 w-1.5 bg-info/70" aria-hidden="true" />
              <span className="absolute top-2 left-1/2 -translate-x-1/2 rounded-b-md bg-info px-3 py-0.5 text-[0.625rem] font-semibold text-info-foreground">
                WINDOWS
              </span>

              <div className="grid h-full grid-cols-12 grid-rows-8 gap-2 pt-3">
                <FloorRoom
                  className="col-start-1 col-end-4 row-start-1 row-end-3"
                  icon={<UsersRoundIcon className="size-5" aria-hidden="true" />}
                  label={t("officeSeating.meetingRoomA")}
                  detail="8 seats"
                />
                <FloorRoom
                  className="col-start-4 col-end-7 row-start-1 row-end-3"
                  icon={<UsersRoundIcon className="size-5" aria-hidden="true" />}
                  label={t("officeSeating.meetingRoomB")}
                  detail="6 seats"
                />
                <FloorRoom
                  className="col-start-7 col-end-10 row-start-1 row-end-3"
                  icon={<DoorOpenIcon className="size-5" aria-hidden="true" />}
                  label={t("officeSeating.hrRoom")}
                  detail="4 seats"
                />
                <FloorRoom
                  className="col-start-10 col-end-13 row-start-1 row-end-3 bg-icon-tile-yellow/70"
                  icon={<CoffeeIcon className="size-5" aria-hidden="true" />}
                  label={t("officeSeating.pantry")}
                  detail="12 seats"
                />

                <FloorRoom
                  className="col-start-1 col-end-4 row-start-3 row-end-5 bg-icon-tile-orange/65"
                  icon={<ArmchairIcon className="size-5" aria-hidden="true" />}
                  label={t("officeSeating.reception")}
                  detail="ENTRANCE"
                />

                <div className="col-start-1 col-end-4 row-start-5 row-end-9 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-status-gray-foreground/35 bg-status-gray/95 p-4 text-center text-status-gray-foreground shadow-inner">
                  <span className="grid size-14 place-items-center rounded-full bg-status-default shadow-inner">
                    <DoorOpenIcon className="size-7" aria-hidden="true" />
                  </span>
                  <span className="font-semibold">{t("officeSeating.core")}</span>
                  <span className="text-xs opacity-70">BUILDING CORE</span>
                </div>

                <section className="col-start-4 col-end-13 row-start-3 row-end-9 flex min-h-0 flex-col border-2 border-status-pink-foreground/35 bg-white/60 p-2 shadow-inner dark:bg-black/10">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-status-pink-foreground">
                      {t("officeSeating.openWorkspace")}
                    </h2>
                    <span className="rounded-full bg-status-pink px-2 py-0.5 font-mono text-[0.625rem] font-semibold text-status-pink-foreground tabular-nums">
                      {employees.length} SEATS
                    </span>
                  </div>

                  <div className="grid min-h-0 flex-1 grid-cols-9 content-start gap-1.5">
                    {employees.map((employee, index) => {
                      const seatNumber = index + 1
                      const isMatch = matchedEmployeeIds.has(employee.id)

                      return (
                        <button
                          key={employee.id}
                          id={`office-seat-${employee.id}`}
                          type="button"
                          onClick={() => selectEmployee(employee)}
                          title={`${formatSeatNumber(seatNumber)} · ${getEmployeeFullName(employee, locale)}`}
                          aria-label={t("officeSeating.seatLabel", {
                            seat: formatSeatNumber(seatNumber),
                            employee: getEmployeeFullName(employee, locale),
                          })}
                          className={cn(
                            "relative flex h-10 min-w-0 flex-col items-center justify-center overflow-hidden rounded-sm border border-status-pink-foreground/25 bg-card px-1 text-card-foreground shadow-sm transition-[transform,box-shadow] hover:z-10 hover:scale-105 hover:shadow-md focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                            index % 18 < 9
                              ? "border-t-4 border-t-icon-tile-blue"
                              : "border-b-4 border-b-icon-tile-green"
                          )}
                        >
                          <span className="font-mono text-[0.5625rem] leading-none text-muted-foreground tabular-nums">
                            {formatSeatNumber(seatNumber)}
                          </span>
                          <span className="mt-0.5 block w-full truncate text-center text-[0.625rem] leading-tight font-semibold">
                            {tl(employee.nickname) || tl(employee.firstName)}
                          </span>
                          <ArmchairIcon
                            className="mt-1 size-3.5 text-muted-foreground/65"
                            aria-hidden="true"
                          />

                          {isMatch ? (
                            <span
                              className="pointer-events-none absolute inset-0 z-20 rounded-sm border-4 border-destructive-action bg-destructive-action/10 animate-pulse motion-reduce:animate-none"
                              aria-hidden="true"
                            />
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

function FloorRoom({
  className,
  icon,
  label,
  detail,
}: {
  className?: string
  icon: React.ReactNode
  label: string
  detail: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 border-2 border-status-pink-foreground/35 bg-white/70 p-3 text-center text-status-pink-foreground shadow-inner dark:bg-black/10",
        className
      )}
    >
      <span className="grid size-9 place-items-center rounded-full bg-status-pink">
        {icon}
      </span>
      <span className="font-semibold">{label}</span>
      <span className="font-mono text-[0.625rem] opacity-65">{detail}</span>
    </div>
  )
}

function MapLegendDot() {
  return (
    <span
      className="size-2.5 shrink-0 rounded-full bg-status-pink-foreground"
      aria-hidden="true"
    />
  )
}

function formatSeatNumber(seatNumber: number) {
  return `S-${String(seatNumber).padStart(3, "0")}`
}
