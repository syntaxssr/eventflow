"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CalendarDaysIcon,
  FileIcon,
  HistoryIcon,
  ListChecksIcon,
  SearchIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react"

import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ROUTES } from "@/constants/app"
import {
  EVENT_STATUS_STYLE,
  RSVP_STATUS_STYLE,
  TASK_STATUS_STYLE,
} from "@/constants/status"
import { useLocale } from "@/i18n"
import { formatDate } from "@/lib/format"
import { globalSearch } from "@/lib/search"
import { getFullName } from "@/lib/user"
import { useAppState } from "@/store"

/** ประวัติค้นหาอยู่ในหน่วยความจำของ session — หายเมื่อ refresh ตามข้อกำหนด */
let recentSearches: string[] = []

function rememberSearch(query: string) {
  const trimmed = query.trim()
  if (trimmed === "") return
  recentSearches = [
    trimmed,
    ...recentSearches.filter((entry) => entry !== trimmed),
  ].slice(0, 5)
}

/** ไฮไลต์ส่วนที่ตรงกับคำค้นในข้อความผลลัพธ์ */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim().toLowerCase()
  const index = needle === "" ? -1 : text.toLowerCase().indexOf(needle)
  if (index === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-brand-100 text-brand-950 dark:bg-brand-500/30 dark:text-brand-100 rounded px-0.5">
        {text.slice(index, index + needle.length)}
      </mark>
      {text.slice(index + needle.length)}
    </>
  )
}

/**
 * Global Search แบบ Command Palette — เปิดด้วยปุ่มบน Topbar หรือ Ctrl/Cmd+K
 * ค้นครบทุกแหล่งตามสเปกข้อ 25 และคลิกผลลัพธ์แล้วพาไปหน้าเป้าหมาย
 */
export function GlobalSearch() {
  const { t, tl, locale } = useLocale()
  const state = useAppState()
  const router = useRouter()

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [debounced, setDebounced] = React.useState("")

  // Debounce เพื่อไม่ให้ค้นทุกตัวอักษรที่พิมพ์
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 200)
    return () => clearTimeout(timer)
  }, [query])

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const results = React.useMemo(
    () =>
      globalSearch(
        {
          events: state.events,
          tasks: state.tasks,
          files: state.files,
          participants: state.participants,
          users: state.users,
        },
        debounced
      ),
    [state, debounced]
  )

  const eventTitle = (eventId: string) => {
    const event = state.events.find((entry) => entry.id === eventId)
    return event ? tl(event.title) : ""
  }

  const go = (href: string) => {
    rememberSearch(query)
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  const hasQuery = debounced.trim() !== ""

  return (
    <>
      {/* ปุ่มหน้าตาเหมือนช่องค้นหาบน desktop / ปุ่มไอคอนบน mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="open-global-search"
        className="border-input bg-background text-muted-foreground hover:bg-muted/50 focus-visible:outline-ring hidden h-9 max-w-md min-w-0 flex-1 items-center gap-2 rounded-md border px-3 text-sm focus-visible:outline-2 sm:flex"
      >
        <SearchIcon className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-left">
          {t("shell.searchPlaceholder")}
        </span>
        <kbd className="bg-muted pointer-events-none hidden rounded px-1.5 py-0.5 font-mono text-[0.6875rem] lg:inline">
          Ctrl K
        </kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        aria-label={t("shell.openSearch")}
        onClick={() => setOpen(true)}
        data-testid="open-global-search-mobile"
      >
        <SearchIcon className="size-4" aria-hidden="true" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t("common.search")}
        description={t("search.typeToSearch")}
        className="top-0 max-h-dvh w-full max-w-full sm:top-1/4 sm:max-h-[70dvh] sm:max-w-xl"
      >
        <Command shouldFilter={false} className="max-h-[inherit]">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={t("shell.searchPlaceholder")}
            clearLabel={t("common.clearSearch")}
            data-testid="global-search-input"
          />
          <p className="sr-only" aria-live="polite">
            {hasQuery ? t("search.resultTotal", { count: results.total }) : ""}
          </p>

          <CommandList className="max-h-[60dvh]" data-testid="global-search-list">
            {!hasQuery ? (
              <>
                {recentSearches.length > 0 ? (
                  <CommandGroup heading={t("search.recentSearches")}>
                    {recentSearches.map((recent) => (
                      <CommandItem
                        key={recent}
                        value={`recent-${recent}`}
                        onSelect={() => setQuery(recent)}
                      >
                        <HistoryIcon className="size-4" aria-hidden="true" />
                        {recent}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <p className="text-muted-foreground px-4 py-8 text-center text-sm">
                    {t("search.typeToSearch")}
                  </p>
                )}
              </>
            ) : results.total === 0 ? (
              <CommandEmpty>
                <span className="block">
                  {t("search.noResults", { query: debounced })}
                </span>
                <span className="text-muted-foreground mt-1 block text-xs">
                  {t("search.noResultsHint")}
                </span>
              </CommandEmpty>
            ) : (
              <>
                {results.events.length > 0 ? (
                  <CommandGroup heading={t("nav.events")}>
                    {results.events.map((event) => (
                      <CommandItem
                        key={event.id}
                        value={`event-${event.id}`}
                        onSelect={() => go(ROUTES.eventDetail(event.id))}
                      >
                        <CalendarDaysIcon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">
                          <Highlight text={tl(event.title)} query={debounced} />
                        </span>
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {formatDate(event.startDate, locale)}
                        </span>
                        <StatusBadge size="sm" style={EVENT_STATUS_STYLE[event.status]} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}

                {results.tasks.length > 0 ? (
                  <CommandGroup heading={t("nav.myTasks")}>
                    {results.tasks.map((task) => (
                      <CommandItem
                        key={task.id}
                        value={`task-${task.id}`}
                        onSelect={() =>
                          go(`${ROUTES.myTasks}?scope=all&task=${task.id}`)
                        }
                      >
                        <ListChecksIcon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">
                          <Highlight text={tl(task.title)} query={debounced} />
                        </span>
                        <span className="text-muted-foreground max-w-32 shrink-0 truncate text-xs">
                          {eventTitle(task.eventId)}
                        </span>
                        <StatusBadge size="sm" style={TASK_STATUS_STYLE[task.status]} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}

                {results.files.length > 0 ? (
                  <CommandGroup heading={t("nav.files")}>
                    {results.files.map((file) => (
                      <CommandItem
                        key={file.id}
                        value={`file-${file.id}`}
                        onSelect={() => go(`${ROUTES.files}?file=${file.id}`)}
                      >
                        <FileIcon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">
                          <Highlight text={file.name} query={debounced} />
                        </span>
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {eventTitle(file.eventId)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}

                {results.participants.length > 0 ? (
                  <CommandGroup heading={t("nav.participants")}>
                    {results.participants.map((participant) => (
                      <CommandItem
                        key={participant.id}
                        value={`participant-${participant.id}`}
                        onSelect={() =>
                          go(
                            `${ROUTES.participants}?event=${participant.eventId}&q=${encodeURIComponent(participant.email)}`
                          )
                        }
                      >
                        <UsersIcon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">
                          <Highlight
                            text={`${participant.firstName[locale]} ${participant.lastName[locale]}`}
                            query={debounced}
                          />
                        </span>
                        <span className="text-muted-foreground max-w-40 shrink-0 truncate text-xs">
                          <Highlight text={participant.email} query={debounced} />
                        </span>
                        <StatusBadge
                          size="sm"
                          style={RSVP_STATUS_STYLE[participant.rsvpStatus]}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}

                {results.users.length > 0 ? (
                  <CommandGroup heading={t("search.groupPeople")}>
                    {results.users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={`user-${user.id}`}
                        onSelect={() =>
                          go(`${ROUTES.myTasks}?scope=all&assignee=${user.id}`)
                        }
                      >
                        <UserIcon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">
                          <Highlight
                            text={getFullName(user, locale)}
                            query={debounced}
                          />
                        </span>
                        <span className="text-muted-foreground max-w-44 shrink-0 truncate text-xs">
                          {user.position[locale]}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
