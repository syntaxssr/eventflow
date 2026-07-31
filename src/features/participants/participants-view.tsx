"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  DownloadIcon,
  FilterIcon,
  UploadIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { RSVP_STATUS_STYLE } from "@/constants/status"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import {
  EMPTY_PARTICIPANT_FILTERS,
  filterParticipants,
  sortParticipants,
  listDepartments,
  type ParticipantSortKey,
  type SortDirection,
} from "@/lib/participant"
import { useAppState } from "@/store"
import {
  selectActiveEvents,
  selectParticipantsByEvent,
  summariseRsvp,
} from "@/store/selectors"
import type { Participant, RsvpStatus } from "@/types/participant"
import { ImportWizardDialog } from "./import/import-wizard-dialog"
import { ParticipantBulkBar } from "./participant-bulk-bar"
import { ExportParticipantsDialog } from "./participant-export-dialog"
import { ParticipantFiltersBar } from "./participant-filters"
import { ParticipantFormDialog } from "./participant-form-dialog"
import { ParticipantSummaryCards } from "./participant-summary-cards"
import { ParticipantTable } from "./participant-table"
import { useParticipantActions } from "./use-participant-actions"

/** มุมมองผู้เข้าร่วม ใช้ร่วมกันระหว่างหน้า Participants กับแท็บในหน้ากิจกรรม */
export function ParticipantsView({ eventId }: { eventId?: string }) {
  const { t, locale } = useLocale()
  const state = useAppState()
  const actions = useParticipantActions()
  const searchParams = useSearchParams()

  const events = selectActiveEvents(state)
  const [selectedEventId, setSelectedEventId] = React.useState(
    () =>
      eventId ?? searchParams.get("event") ?? events[0]?.id ?? ""
  )
  const activeEventId = eventId ?? selectedEventId

  // เติมคำค้นจากลิงก์ Global Search (?q=...)
  const [filters, setFilters] = React.useState(() => ({
    ...EMPTY_PARTICIPANT_FILTERS,
    query: searchParams.get("q") ?? "",
  }))
  const [sortKey, setSortKey] = React.useState<ParticipantSortKey>("name")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Participant | null>(null)
  const [deleteTargets, setDeleteTargets] = React.useState<Participant[]>([])
  const [pendingRsvp, setPendingRsvp] = React.useState<RsvpStatus | null>(null)
  const [importOpen, setImportOpen] = React.useState(false)
  const [exportOpen, setExportOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  const scoped = React.useMemo(
    () => selectParticipantsByEvent(state, activeEventId),
    [state, activeEventId]
  )
  const filtered = React.useMemo(
    () => filterParticipants(scoped, filters),
    [scoped, filters]
  )
  const sorted = React.useMemo(
    () => sortParticipants(filtered, sortKey, sortDirection, locale),
    [filtered, sortKey, sortDirection, locale]
  )
  const departments = React.useMemo(
    () => listDepartments(scoped, locale),
    [scoped, locale]
  )
  const summary = React.useMemo(() => summariseRsvp(scoped), [scoped])

  const selectedParticipants = React.useMemo(
    () => scoped.filter((participant) => selectedIds.has(participant.id)),
    [scoped, selectedIds]
  )

  const changeEvent = (id: string) => {
    setSelectedEventId(id)
    setSelectedIds(new Set())
    setFilters(EMPTY_PARTICIPANT_FILTERS)
  }

  const onSortChange = (key: ParticipantSortKey) => {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const toggleRow = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelectedIds((current) => {
      const allVisibleSelected =
        sorted.length > 0 && sorted.every((entry) => current.has(entry.id))
      if (allVisibleSelected) return new Set()
      return new Set(sorted.map((entry) => entry.id))
    })
  }

  const confirmDelete = async () => {
    setBusy(true)
    const ok = await actions.deleteParticipants(deleteTargets)
    setBusy(false)
    if (ok) {
      setDeleteTargets([])
      setSelectedIds(new Set())
    }
  }

  const confirmBulkRsvp = async () => {
    if (!pendingRsvp) return
    setBusy(true)
    const ok = await actions.bulkChangeRsvp(selectedParticipants, pendingRsvp)
    setBusy(false)
    if (ok) {
      setPendingRsvp(null)
      setSelectedIds(new Set())
    }
  }

  const { state: pageState, retry } = usePageState(scoped.length === 0)

  if (pageState === "error") return <ErrorState onRetry={retry} />

  if (pageState === "loading") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {!eventId ? (
          <Select value={selectedEventId} onValueChange={changeEvent}>
            <SelectTrigger
              size="sm"
              className="w-64"
              data-testid="participant-event-select"
              aria-label={t("timeline.selectEvent")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title[locale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExportOpen(true)}
            data-testid="open-export"
          >
            <DownloadIcon className="size-4" aria-hidden="true" />
            {t("participant.export")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setImportOpen(true)}
            data-testid="open-import"
          >
            <UploadIcon className="size-4" aria-hidden="true" />
            {t("participant.import")}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
            data-testid="add-participant"
          >
            <UserPlusIcon className="size-4" aria-hidden="true" />
            {t("participant.add")}
          </Button>
        </div>
      </div>

      <ParticipantSummaryCards summary={summary} />

      <ParticipantFiltersBar
        filters={filters}
        onChange={setFilters}
        departments={departments}
        resultCount={filtered.length}
      />

      <ParticipantBulkBar
        count={selectedParticipants.length}
        onChangeRsvp={setPendingRsvp}
        onDelete={() => setDeleteTargets(selectedParticipants)}
        onClear={() => setSelectedIds(new Set())}
      />

      {scoped.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={t("participant.noParticipants")}
          description={t("participant.noParticipantsDescription")}
          action={
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                {t("participant.add")}
              </Button>
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                {t("participant.import")}
              </Button>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FilterIcon}
          title={t("participant.noParticipantsMatch")}
          description={t("participant.noParticipantsMatchDescription")}
          action={
            <Button
              variant="outline"
              onClick={() => setFilters(EMPTY_PARTICIPANT_FILTERS)}
            >
              {t("common.clearAll")}
            </Button>
          }
        />
      ) : (
        <ParticipantTable
          participants={sorted}
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          onEdit={(participant) => {
            setEditing(participant)
            setFormOpen(true)
          }}
          onDelete={(participant) => setDeleteTargets([participant])}
        />
      )}

      <ParticipantFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        eventId={activeEventId}
        participant={editing}
        existingParticipants={scoped}
      />

      <ConfirmDialog
        open={deleteTargets.length > 0}
        onOpenChange={(open) => !open && setDeleteTargets([])}
        title={t("participant.confirmDeleteTitle")}
        description={t("participant.confirmDeleteDescription")}
        targetName={
          deleteTargets.length === 1
            ? `${deleteTargets[0].firstName[locale]} ${deleteTargets[0].lastName[locale]}`
            : t("participant.selectedCount", { count: deleteTargets.length })
        }
        impact={[
          t("participant.confirmDeleteImpact", { count: deleteTargets.length }),
        ]}
        confirmLabel={t("common.delete")}
        destructive
        loading={busy}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={pendingRsvp !== null}
        onOpenChange={(open) => !open && setPendingRsvp(null)}
        title={t("participant.confirmBulkRsvpTitle")}
        description={t("participant.confirmBulkRsvpDescription", {
          status: pendingRsvp
            ? t(RSVP_STATUS_STYLE[pendingRsvp].labelKey as TranslationKey)
            : "",
        })}
        impact={[
          t("participant.confirmBulkRsvpImpact", {
            count: selectedParticipants.length,
          }),
        ]}
        confirmLabel={t("common.confirm")}
        loading={busy}
        onConfirm={confirmBulkRsvp}
      />

      <ImportWizardDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        eventId={activeEventId}
        existingParticipants={scoped}
      />

      <ExportParticipantsDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        allParticipants={scoped}
        filteredParticipants={sorted}
      />
    </div>
  )
}
