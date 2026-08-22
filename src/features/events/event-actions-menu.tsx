"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  BanIcon,
  CopyIcon,
  EllipsisVerticalIcon,
  PencilLineIcon,
  Trash2Icon,
} from "lucide-react"
import { appToast } from "@/lib/gif-toast"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useDemo } from "@/components/dev/demo-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROUTES } from "@/constants/app"
import { EVENT_STATUS_STYLE } from "@/constants/status"
import { useActivityLog } from "@/hooks/use-activity-log"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { nowIso } from "@/lib/clock"
import { useAppDispatch, useAppState, useCurrentUser } from "@/store"
import {
  selectParticipantsByEvent,
  selectTasksByEvent,
} from "@/store/selectors"
import { EVENT_STATUSES, type EventItem, type EventStatus } from "@/types/event"
import { DuplicateEventDialog } from "./duplicate-event-dialog"
import { EventFormDialog } from "./event-form-dialog"

export function EventActionsMenu({ event }: { event: EventItem }) {
  const { t, tl } = useLocale()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const state = useAppState()
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const logActivity = useActivityLog()

  const [editOpen, setEditOpen] = React.useState(false)
  const [duplicateOpen, setDuplicateOpen] = React.useState(false)
  const [confirmCancel, setConfirmCancel] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  const tasks = selectTasksByEvent(state, event.id)
  const participants = selectParticipantsByEvent(state, event.id)
  const files = state.files.filter(
    (file) => file.eventId === event.id && file.deletedAt === null
  )

  const applyStatus = async (status: EventStatus) => {
    if (!currentUser || status === event.status) return
    setBusy(true)

    try {
      await demo.simulate()
    } catch {
      setBusy(false)
      appToast.error(t("common.saveFailed"))
      return
    }

    const at = nowIso()
    dispatch({
      type: "event/update",
      id: event.id,
      changes: { status },
      by: currentUser.id,
      at,
    })
    logActivity({
      action: "event_status_changed",
      targetType: "event",
      targetId: event.id,
      targetName: event.title,
      eventId: event.id,
      before: {
        th: t(EVENT_STATUS_STYLE[event.status].labelKey as TranslationKey),
        en: t(EVENT_STATUS_STYLE[event.status].labelKey as TranslationKey),
      },
      after: {
        th: t(EVENT_STATUS_STYLE[status].labelKey as TranslationKey),
        en: t(EVENT_STATUS_STYLE[status].labelKey as TranslationKey),
      },
      createdAt: at,
    })

    setBusy(false)
    setConfirmCancel(false)
    appToast.success(t("event.statusChanged"))
  }

  const handleDelete = async () => {
    if (!currentUser) return
    setBusy(true)

    try {
      await demo.simulate()
    } catch {
      setBusy(false)
      appToast.error(t("common.saveFailed"))
      return
    }

    const at = nowIso()
    dispatch({ type: "event/delete", id: event.id, by: currentUser.id, at })
    logActivity({
      action: "event_deleted",
      targetType: "event",
      targetId: event.id,
      targetName: event.title,
      eventId: event.id,
      before: null,
      after: null,
      createdAt: at,
    })

    setBusy(false)
    setConfirmDelete(false)
    appToast.delete(t("event.deleted"))
    router.push(ROUTES.events)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
        <PencilLineIcon className="size-4" aria-hidden="true" />
        {t("common.edit")}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("common.actions")}
            data-testid="event-actions"
          >
            <EllipsisVerticalIcon className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{t("event.changeStatus")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={event.status}
            onValueChange={(value) => {
              const status = value as EventStatus
              if (status === "cancelled") {
                setConfirmCancel(true)
                return
              }
              void applyStatus(status)
            }}
          >
            {EVENT_STATUSES.map((status) => (
              <DropdownMenuRadioItem key={status} value={status}>
                {t(EVENT_STATUS_STYLE[status].labelKey as TranslationKey)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setDuplicateOpen(true)}>
            <CopyIcon className="size-4" aria-hidden="true" />
            {t("event.duplicate")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setConfirmCancel(true)}
            disabled={event.status === "cancelled"}
          >
            <BanIcon className="size-4" aria-hidden="true" />
            {t("event.cancelEvent")}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setConfirmDelete(true)}
            data-testid="delete-event"
          >
            <Trash2Icon className="size-4" aria-hidden="true" />
            {t("event.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EventFormDialog open={editOpen} onOpenChange={setEditOpen} event={event} />
      <DuplicateEventDialog
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
        event={event}
      />

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={t("event.confirmCancelTitle")}
        description={t("event.confirmCancelDescription")}
        targetName={tl(event.title)}
        confirmLabel={t("event.cancelEvent")}
        destructive
        loading={busy}
        onConfirm={() => applyStatus("cancelled")}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("event.confirmDeleteTitle")}
        description={t("event.confirmDeleteDescription")}
        targetName={tl(event.title)}
        impact={[
          t("event.confirmDeleteImpactTasks", { count: tasks.length }),
          t("event.confirmDeleteImpactParticipants", {
            count: participants.length,
          }),
          t("event.confirmDeleteImpactFiles", { count: files.length }),
        ]}
        confirmLabel={t("event.delete")}
        destructive
        loading={busy}
        onConfirm={handleDelete}
      />
    </>
  )
}
