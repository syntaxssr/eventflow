"use client"

import * as React from "react"
import { KeyRoundIcon, SearchIcon, XIcon } from "lucide-react"

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
import {
  LOCKER_CABINET_COUNT,
  LOCKERS_PER_CABINET,
  MOCK_LOCKERS,
} from "@/mock/lockers"
import { useAppState } from "@/store"
import type { Employee } from "@/types/employee"
import type { Locker } from "@/types/locker"
import { LockerDetailDialog } from "./locker-detail-dialog"

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
  {
    frame: "bg-status-blue",
    door: "bg-white/35",
    foreground: "text-status-blue-foreground",
  },
] as const

/** ล็อกเกอร์หนึ่งช่องพร้อมพนักงานที่จับคู่ได้ และคำที่ใช้ค้นหา */
interface LockerEntry {
  locker: Locker
  employee: Employee | null
  displayName: string
  searchTerms: string[]
}

export function EmployeeLockersPageView() {
  const { t, tl, locale } = useLocale()
  const reducedMotion = useReducedMotion()
  const allEmployees = useAppState().employees
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState("")
  const [selectedLockerCode, setSelectedLockerCode] = React.useState<
    string | null
  >(null)
  const [openLockerCode, setOpenLockerCode] = React.useState<string | null>(null)
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(0)

  const employeesById = React.useMemo(
    () => new Map(allEmployees.map((employee) => [employee.id, employee])),
    [allEmployees]
  )

  const entries = React.useMemo<LockerEntry[]>(
    () =>
      MOCK_LOCKERS.map((locker) => {
        const employee = locker.employeeId
          ? (employeesById.get(locker.employeeId) ?? null)
          : null
        // ช่องของทีม (เช่น Network Team) ไม่มีในทะเบียนพนักงาน จึงใช้ชื่อจากทะเบียนล็อกเกอร์แทน
        const displayName = employee
          ? tl(employee.nickname) || tl(employee.firstName)
          : locker.occupantNickname || locker.occupantName

        return {
          locker,
          employee,
          displayName,
          searchTerms: [
            locker.code,
            locker.occupantName,
            locker.occupantNickname,
            ...(employee
              ? [
                  employee.firstName.th,
                  employee.firstName.en,
                  employee.lastName.th,
                  employee.lastName.en,
                  employee.nickname.th,
                  employee.nickname.en,
                ]
              : []),
          ]
            .map((term) => term.trim())
            .filter(Boolean),
        }
      }),
    [employeesById, tl]
  )

  const entriesByCode = React.useMemo(
    () => new Map(entries.map((entry) => [entry.locker.code, entry])),
    [entries]
  )

  const normalizedQuery = query.trim().toLocaleLowerCase(locale)
  const suggestions = React.useMemo(() => {
    if (!normalizedQuery) return []

    return entries
      .filter(
        (entry) =>
          entry.locker.status === "occupied" &&
          entry.searchTerms.some((term) =>
            term.toLocaleLowerCase(locale).startsWith(normalizedQuery)
          )
      )
      .slice(0, 8)
  }, [entries, locale, normalizedQuery])

  const matchedLockerCodes = React.useMemo(
    () =>
      new Set(
        selectedLockerCode
          ? [selectedLockerCode]
          : suggestions.map((entry) => entry.locker.code)
      ),
    [selectedLockerCode, suggestions]
  )
  const showSuggestions = searchFocused && normalizedQuery.length > 0
  const openEntry = openLockerCode
    ? (entriesByCode.get(openLockerCode) ?? null)
    : null

  React.useEffect(() => {
    if (!selectedLockerCode) return

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`locker-${selectedLockerCode}`)?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
        inline: "center",
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [reducedMotion, selectedLockerCode])

  const selectSuggestion = (entry: LockerEntry) => {
    setSelectedLockerCode(entry.locker.code)
    setQuery(
      entry.employee
        ? getEmployeeFullName(entry.employee, locale)
        : entry.locker.occupantName
    )
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
      selectSuggestion(suggestions[activeSuggestionIndex] ?? suggestions[0])
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
            setSelectedLockerCode(null)
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
              ? `employee-locker-suggestion-${suggestions[activeSuggestionIndex]?.locker.code}`
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
              setSelectedLockerCode(null)
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
            className="bg-popover text-popover-foreground ring-foreground/10 absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-lg p-1 shadow-lg ring-1"
            role="listbox"
          >
            {suggestions.length === 0 ? (
              <p className="text-muted-foreground px-3 py-5 text-center text-sm">
                {t("employeeLocker.noSuggestions")}
              </p>
            ) : (
              suggestions.map((entry, index) => {
                const cabinetNumber = Math.ceil(
                  entry.locker.number / LOCKERS_PER_CABINET
                )

                return (
                  <button
                    key={entry.locker.code}
                    id={`employee-locker-suggestion-${entry.locker.code}`}
                    type="button"
                    role="option"
                    aria-selected={index === activeSuggestionIndex}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                    onClick={() => selectSuggestion(entry)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm outline-none",
                      index === activeSuggestionIndex && "bg-muted"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {entry.employee
                          ? getEmployeeFullName(entry.employee, locale)
                          : entry.locker.occupantName}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {entry.displayName}
                      </span>
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {t("employeeLocker.suggestionLocation", {
                        cabinet: cabinetNumber,
                        locker: entry.locker.code,
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
              count: matchedLockerCodes.size,
            })
          : ""}
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: LOCKER_CABINET_COUNT }, (_, cabinetIndex) => {
          const tone = CABINET_TONES[cabinetIndex % CABINET_TONES.length]
          const cabinetEntries = entries.slice(
            cabinetIndex * LOCKERS_PER_CABINET,
            (cabinetIndex + 1) * LOCKERS_PER_CABINET
          )

          return (
            <Card
              key={cabinetIndex}
              className={cn(
                "ring-status-gray-foreground/30 gap-1.5 overflow-hidden p-1.5 py-1.5 shadow-lg",
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
                  {cabinetEntries.map((entry) => {
                    const { locker } = entry
                    const isOccupied = locker.status === "occupied"
                    const occupantName = entry.employee
                      ? getEmployeeFullName(entry.employee, locale)
                      : locker.occupantName
                    const isMatch = matchedLockerCodes.has(locker.code)

                    return (
                      <button
                        key={locker.code}
                        id={`locker-${locker.code}`}
                        type="button"
                        onClick={() => setOpenLockerCode(locker.code)}
                        className={cn(
                          "relative aspect-3/4 min-h-28 cursor-pointer overflow-hidden rounded-[2px] border border-current/25 text-left shadow-[inset_1px_1px_0_rgb(255_255_255/0.55),inset_-1px_-1px_0_rgb(0_0_0/0.06)] transition-transform outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-current motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                          tone.door,
                          tone.foreground
                        )}
                        title={
                          isOccupied ? occupantName : t("employeeLocker.available")
                        }
                        aria-label={t("employeeLocker.lockerLabel", {
                          number: locker.code,
                          employee: isOccupied
                            ? occupantName
                            : t("employeeLocker.available"),
                        })}
                        data-testid={`locker-tile-${locker.code}`}
                        data-status={locker.status}
                      >
                        <span className="border-status-gray-foreground/25 absolute inset-x-2 top-2 flex min-h-8 flex-col items-center justify-center rounded-[1px] border bg-white/30 px-1 text-center shadow-[inset_0_0_0_1px_rgb(255_255_255/0.35)]">
                          <span className="font-mono text-[0.625rem] leading-none font-semibold tabular-nums">
                            {locker.code}
                          </span>
                          {isOccupied ? (
                            <span className="mt-0.5 block max-w-full truncate text-[0.625rem] leading-tight font-medium">
                              {entry.displayName}
                            </span>
                          ) : null}
                        </span>

                        {/* ป้ายบอกว่าช่องนี้ยังไม่มีคนใช้ */}
                        {!isOccupied ? (
                          <span className="bg-success text-success-foreground ring-status-gray-foreground/30 absolute inset-x-2 bottom-2.5 z-10 rounded-sm px-1 py-0.5 text-center text-[0.5625rem] leading-tight font-bold tracking-wide uppercase ring-1">
                            {t("employeeLocker.available")}
                          </span>
                        ) : null}

                        {/* จำนวนกุญแจที่อยู่ในช่อง */}
                        {locker.keys.length > 0 ? (
                          <span
                            className="absolute top-2.5 right-2.5 z-10 flex items-center gap-0.5 text-[0.5625rem] font-semibold tabular-nums"
                            aria-hidden="true"
                          >
                            <KeyRoundIcon className="size-2.5" />
                            {locker.keys.length}
                          </span>
                        ) : null}

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
                          <span className="bg-status-gray-foreground/50 h-2.5 w-px" />
                          <span className="border-status-gray-foreground/45 size-1.5 rounded-full border" />
                        </span>

                        <span
                          className="absolute right-2 bottom-3 flex flex-col gap-1"
                          aria-hidden="true"
                        >
                          {Array.from({ length: 4 }, (_, ventIndex) => (
                            <span
                              key={ventIndex}
                              className="bg-status-gray-foreground/35 h-px w-5 rounded-full shadow-[0_1px_0_rgb(255_255_255/0.5)]"
                            />
                          ))}
                        </span>

                        <span
                          className="bg-status-gray-foreground/20 absolute top-[42%] right-0 h-5 w-px"
                          aria-hidden="true"
                        />

                        {isMatch ? (
                          <span
                            className="border-destructive-action pointer-events-none absolute inset-0 z-20 animate-pulse rounded-[2px] border-4 motion-reduce:animate-none"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <LockerDetailDialog
        locker={openEntry?.locker ?? null}
        employee={openEntry?.employee ?? null}
        onClose={() => setOpenLockerCode(null)}
      />
    </PageContainer>
  )
}
