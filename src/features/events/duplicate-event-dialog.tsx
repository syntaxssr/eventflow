"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, CopyIcon, Loader2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { useDemo } from "@/components/dev/demo-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROUTES } from "@/constants/app"
import { useActivityLog } from "@/hooks/use-activity-log"
import { useLocale } from "@/i18n"
import { nowIso } from "@/lib/clock"
import { defaultDuplicateOptions, duplicateEvent } from "@/lib/event"
import { useAppDispatch, useAppState, useCurrentUser } from "@/store"
import { selectTasksByEvent } from "@/store/selectors"
import type { EventItem } from "@/types/event"

/**
 * หน้าตรวจสอบก่อนคัดลอกกิจกรรม
 * บอกให้ชัดว่าอะไรจะถูกคัดลอกและอะไรจะไม่ถูกคัดลอก ก่อนผู้ใช้กดยืนยัน
 */
export function DuplicateEventDialog({
  open,
  onOpenChange,
  event,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventItem
}) {
  const { t } = useLocale()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("event.duplicateTitle")}</DialogTitle>
          <DialogDescription>{t("event.duplicateDescription")}</DialogDescription>
        </DialogHeader>

        {/* เนื้อหาถูก mount ใหม่ทุกครั้งที่เปิด ค่าเริ่มต้นจึงสดเสมอ */}
        <DuplicateEventForm event={event} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function DuplicateEventForm({
  event,
  onDone,
}: {
  event: EventItem
  onDone: () => void
}) {
  const { t, tl } = useLocale()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const state = useAppState()
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const logActivity = useActivityLog()

  const [title, setTitle] = React.useState(
    `${tl(event.title)} (${t("event.copySuffix")})`
  )
  const [startDate, setStartDate] = React.useState(event.startDate)
  const [endDate, setEndDate] = React.useState(event.endDate)
  const [submitting, setSubmitting] = React.useState(false)

  const tasks = React.useMemo(
    () => selectTasksByEvent(state, event.id),
    [state, event.id]
  )
  const timeline = React.useMemo(
    () => state.timeline.filter((item) => item.eventId === event.id),
    [state.timeline, event.id]
  )

  const included = [
    t("event.copyOfTasks", { count: tasks.length }),
    t("event.copyOfChecklists"),
    t("event.copyOfAssignees"),
    t("event.copyOfTimeline", { count: timeline.length }),
    t("event.copyOfCategories"),
    t("event.copyOfDependencies"),
    t("event.copyOfNotificationSettings"),
  ]

  const excluded = [
    t("event.excludeFiles"),
    t("event.excludeComments"),
    t("event.excludeActivity"),
    t("event.excludeNotifications"),
    t("event.excludeParticipants"),
  ]

  const handleConfirm = async () => {
    if (!currentUser) return
    setSubmitting(true)

    try {
      await demo.simulate()
    } catch {
      setSubmitting(false)
      toast.error(t("common.saveFailed"))
      return
    }

    const at = nowIso()
    const result = duplicateEvent({
      source: event,
      tasks,
      timeline,
      fileCategories: state.fileCategories,
      options: {
        ...defaultDuplicateOptions(event),
        title: { th: title, en: title },
        startDate,
        endDate,
      },
      actorId: currentUser.id,
      now: at,
    })

    dispatch({ type: "event/duplicate", ...result })
    logActivity({
      action: "event_duplicated",
      targetType: "event",
      targetId: result.event.id,
      targetName: result.event.title,
      eventId: result.event.id,
      before: event.title,
      after: result.event.title,
      createdAt: at,
    })

    setSubmitting(false)
    onDone()
    toast.success(t("event.duplicated"))
    router.push(ROUTES.eventDetail(result.event.id))
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="duplicate-title">{t("event.name")}</Label>
          <Input
            id="duplicate-title"
            value={title}
            onChange={(changeEvent) => setTitle(changeEvent.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="duplicate-start">{t("event.startDate")}</Label>
            <Input
              id="duplicate-start"
              type="date"
              value={startDate}
              onChange={(changeEvent) => {
                setStartDate(changeEvent.target.value)
                if (changeEvent.target.value > endDate) {
                  setEndDate(changeEvent.target.value)
                }
              }}
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duplicate-end">{t("event.endDate")}</Label>
            <Input
              id="duplicate-end"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(changeEvent) => setEndDate(changeEvent.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="border-border rounded-lg border p-3">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <CheckIcon
                className="size-4 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
              {t("event.duplicateIncluded")}
            </h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              {included.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="border-border rounded-lg border p-3">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <XIcon className="text-destructive size-4" aria-hidden="true" />
              {t("event.duplicateExcluded")}
            </h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              {excluded.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={submitting}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={submitting || title.trim() === ""}
          data-testid="confirm-duplicate"
        >
          {submitting ? (
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <CopyIcon className="size-4" aria-hidden="true" />
          )}
          {t("event.duplicateConfirm")}
        </Button>
      </DialogFooter>
    </>
  )
}
