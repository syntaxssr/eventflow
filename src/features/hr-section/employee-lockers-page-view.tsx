"use client"

import * as React from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { PageContainer } from "@/components/common/page-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

const CABINET_COUNT = 7
const LOCKERS_PER_CABINET = 12
const TOTAL_LOCKERS = CABINET_COUNT * LOCKERS_PER_CABINET

const CABINET_TONES = [
  {
    frame: "bg-icon-tile-blue",
    door: "bg-info",
    foreground: "text-info-foreground",
  },
  {
    frame: "bg-icon-tile-purple",
    door: "bg-event-status-purple",
    foreground: "text-event-status-purple-foreground",
  },
  {
    frame: "bg-icon-tile-green",
    door: "bg-success",
    foreground: "text-success-foreground",
  },
  {
    frame: "bg-icon-tile-yellow",
    door: "bg-warning",
    foreground: "text-warning-foreground",
  },
  {
    frame: "bg-icon-tile-orange",
    door: "bg-task-status-orange",
    foreground: "text-task-status-orange-foreground",
  },
  {
    frame: "bg-icon-tile-red",
    door: "bg-danger",
    foreground: "text-danger-foreground",
  },
  {
    frame: "bg-status-pink",
    door: "bg-white/35",
    foreground: "text-status-pink-foreground",
  },
] as const

export function EmployeeLockersPageView() {
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
        .slice(0, TOTAL_LOCKERS),
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
        .getElementById(`employee-locker-${selectedEmployeeId}`)
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
      <div className="relative max-w-xl">
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
          placeholder={t("employeeLocker.searchPlaceholder")}
          aria-label={t("employeeLocker.searchLabel")}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="employee-locker-suggestions"
          aria-activedescendant={
            showSuggestions && suggestions.length > 0
              ? `employee-locker-suggestion-${suggestions[activeSuggestionIndex]?.id}`
              : undefined
          }
          className={cn("h-9 pr-10 pl-9", FILTER_TRIGGER_CLASS)}
          data-testid="employee-locker-search"
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
            onClick={() => {
              setQuery("")
              setSelectedEmployeeId(null)
              setActiveSuggestionIndex(0)
              setSearchFocused(false)
              searchInputRef.current?.focus()
            }}
            aria-label={t("employeeLocker.clearSearch")}
            data-testid="employee-locker-search-clear"
          >
            <XIcon className="size-4" aria-hidden="true" />
          </Button>
        ) : null}

        {showSuggestions ? (
          <div
            id="employee-locker-suggestions"
            className="bg-popover text-popover-foreground absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-lg p-1 shadow-lg ring-1 ring-foreground/10"
            role="listbox"
          >
            {suggestions.length === 0 ? (
              <p className="text-muted-foreground px-3 py-5 text-center text-sm">
                {t("employeeLocker.noSuggestions")}
              </p>
            ) : (
              suggestions.map((employee, index) => {
                const lockerNumber = employees.indexOf(employee) + 1
                const cabinetNumber = Math.ceil(
                  lockerNumber / LOCKERS_PER_CABINET
                )

                return (
                  <button
                    key={employee.id}
                    id={`employee-locker-suggestion-${employee.id}`}
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
                        {tl(employee.nickname)}
                      </span>
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {t("employeeLocker.suggestionLocation", {
                        cabinet: cabinetNumber,
                        locker: String(lockerNumber).padStart(2, "0"),
                      })}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        ) : null}
      </div>
      <p className="sr-only" aria-live="polite">
        {normalizedQuery
          ? t("employeeLocker.searchResults", {
              count: matchedEmployeeIds.size,
            })
          : ""}
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: CABINET_COUNT }, (_, cabinetIndex) => {
          const firstLockerNumber = cabinetIndex * LOCKERS_PER_CABINET + 1
          const tone = CABINET_TONES[cabinetIndex]

          return (
            <Card
              key={cabinetIndex}
              className={cn(
                "gap-1.5 overflow-hidden p-1.5 py-1.5 ring-status-gray-foreground/30 shadow-lg",
                tone.frame,
                tone.foreground
              )}
            >
              <CardHeader
                className={cn(
                  "justify-items-center rounded-md border border-current/20 px-3 py-3 text-center",
                  tone.door
                )}
              >
                <CardTitle className="text-xl font-bold text-inherit">
                  {t("employeeLocker.cabinet", { number: cabinetIndex + 1 })}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="grid grid-cols-3 gap-1">
                  {Array.from(
                    { length: LOCKERS_PER_CABINET },
                    (_, lockerIndex) => {
                      const lockerNumber = firstLockerNumber + lockerIndex
                      const employee = employees[lockerNumber - 1]
                      const fullName = employee
                        ? getEmployeeFullName(employee, locale)
                        : t("employeeLocker.available")
                      const displayName = employee
                        ? tl(employee.nickname) || tl(employee.firstName)
                        : t("employeeLocker.available")
                      const isMatch = employee
                        ? matchedEmployeeIds.has(employee.id)
                        : false

                      return (
                        <div
                          key={lockerNumber}
                          id={employee ? `employee-locker-${employee.id}` : undefined}
                          className={cn(
                            "relative aspect-3/4 min-h-28 overflow-hidden rounded-[2px] border border-current/25 shadow-[inset_1px_1px_0_rgb(255_255_255/0.55),inset_-1px_-1px_0_rgb(0_0_0/0.06)]",
                            tone.door,
                            tone.foreground
                          )}
                          title={fullName}
                          aria-label={t("employeeLocker.lockerLabel", {
                            number: String(lockerNumber).padStart(2, "0"),
                            employee: fullName,
                          })}
                        >
                          <span className="absolute inset-x-2 top-2 flex min-h-8 flex-col items-center justify-center rounded-[1px] border border-status-gray-foreground/25 bg-white/30 px-1 text-center shadow-[inset_0_0_0_1px_rgb(255_255_255/0.35)]">
                            <span className="font-mono text-[0.625rem] leading-none font-semibold tabular-nums">
                              {String(lockerNumber).padStart(2, "0")}
                            </span>
                            <span className="mt-0.5 block max-w-full truncate text-[0.625rem] leading-tight font-medium">
                              {displayName}
                            </span>
                          </span>

                          <span
                            className="absolute top-[46%] left-2 flex h-9 w-3.5 flex-col items-center rounded-[2px] bg-[#242422] pt-1 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12),0_1px_1px_rgb(0_0_0/0.25)]"
                            aria-hidden="true"
                          >
                            <span className="size-1.5 rounded-full border border-white/55 bg-black" />
                            <span className="mt-2 h-2 w-px bg-white/45" />
                          </span>

                          <span
                            className="absolute top-[calc(46%+2.4rem)] left-[0.6875rem] flex flex-col items-center"
                            aria-hidden="true"
                          >
                            <span className="h-2.5 w-px bg-status-gray-foreground/50" />
                            <span className="size-1.5 rounded-full border border-status-gray-foreground/45" />
                          </span>

                          <span
                            className="absolute right-2 bottom-3 flex flex-col gap-1"
                            aria-hidden="true"
                          >
                            {Array.from({ length: 4 }, (_, ventIndex) => (
                              <span
                                key={ventIndex}
                                className="h-px w-5 rounded-full bg-status-gray-foreground/35 shadow-[0_1px_0_rgb(255_255_255/0.5)]"
                              />
                            ))}
                          </span>

                          <span
                            className="absolute top-[42%] right-0 h-5 w-px bg-status-gray-foreground/20"
                            aria-hidden="true"
                          />

                          {isMatch ? (
                            <span
                              className="pointer-events-none absolute inset-0 z-20 rounded-[2px] border-4 border-destructive-action animate-pulse motion-reduce:animate-none"
                              aria-hidden="true"
                            />
                          ) : null}
                        </div>
                      )
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageContainer>
  )
}
