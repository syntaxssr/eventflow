"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon, CircleCheckIcon, UsersIcon } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ACTIVITY_META } from "@/constants/activity"
import { ROUTES } from "@/constants/app"
import { RSVP_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { formatNumber, formatRelativeTime } from "@/lib/format"
import { getParticipantFullName } from "@/lib/participant"
import {
  listPendingParticipants,
  responseRate,
  rsvpStatusFromLabel,
  selectRsvpActivities,
  summariseRsvpByDepartment,
} from "@/lib/rsvp-form"
import { cn } from "@/lib/utils"
import { useAppState } from "@/store"
import { summariseRsvp } from "@/store/selectors"
import type {
  Participant,
  RsvpStatus,
  RsvpSummary,
} from "@/types/participant"

/** ลำดับการแสดง: คำตอบก่อน แล้วค่อยคนที่ยังไม่ตอบ */
const STATUS_ORDER: RsvpStatus[] = ["attending", "not_attending", "pending"]

const SUMMARY_KEY: Record<RsvpStatus, keyof RsvpSummary> = {
  pending: "pending",
  attending: "attending",
  not_attending: "notAttending",
}

const PENDING_PREVIEW = 8
const RECENT_LIMIT = 6

/**
 * สรุปผลตอบรับของกิจกรรมที่เลือกอยู่ — อ่านจาก store โดยตรง
 * จึงอัปเดตทันทีหลังส่งแบบฟอร์มโดยไม่ต้องโหลดใหม่
 */
export function RsvpSummaryPanel({
  eventId,
  participants,
}: {
  eventId: string
  participants: Participant[]
}) {
  const { t, tl, locale } = useLocale()
  const state = useAppState()

  const summary = React.useMemo(() => summariseRsvp(participants), [participants])
  const percent = responseRate(summary)
  const responded = summary.attending + summary.notAttending

  const byDepartment = React.useMemo(
    () => summariseRsvpByDepartment(participants, locale),
    [participants, locale]
  )
  const pending = React.useMemo(
    () => listPendingParticipants(participants, locale),
    [participants, locale]
  )
  const recent = React.useMemo(
    () => selectRsvpActivities(state.activities, eventId).slice(0, RECENT_LIMIT),
    [state.activities, eventId]
  )

  const statusLabel = (status: RsvpStatus) =>
    t(RSVP_STATUS_STYLE[status].labelKey as TranslationKey)

  return (
    <Card data-testid="rsvp-summary">
      <CardHeader>
        <CardTitle>{t("rsvpForm.summaryTitle")}</CardTitle>
        <CardDescription>{t("rsvpForm.summaryDescription")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {participants.length === 0 ? (
          <EmptyState
            compact
            icon={UsersIcon}
            title={t("participant.noParticipants")}
            description={t("participant.noParticipantsDescription")}
            action={
              <Button asChild variant="outline" size="sm">
                <Link href={`${ROUTES.participants}?event=${eventId}`}>
                  {t("rsvpForm.viewAllParticipants")}
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="rounded-lg border p-3" data-testid="rsvp-response-rate">
              <p className="text-3xl font-bold tabular-nums">
                {formatNumber(percent, locale)}%
              </p>
              <p className="text-muted-foreground text-sm" aria-live="polite">
                {t("rsvpForm.respondedCount", {
                  responded: formatNumber(responded, locale),
                  total: formatNumber(summary.total, locale),
                })}
              </p>
              <Progress
                value={percent}
                aria-label={t("rsvpForm.responseRate", { percent })}
                className="mt-2 h-1.5"
              />
            </div>

            <ul className="grid grid-cols-3 gap-2">
              {STATUS_ORDER.map((status) => {
                const style = RSVP_STATUS_STYLE[status]
                const Icon = style.icon
                return (
                  <li key={status} className="min-w-0 rounded-lg border p-2.5">
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <span
                        className={cn("size-2 shrink-0 rounded-full", style.dot)}
                        aria-hidden="true"
                      />
                      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{statusLabel(status)}</span>
                    </div>
                    <p
                      className="mt-1 text-xl font-bold tabular-nums"
                      data-testid={`rsvp-summary-${status}`}
                    >
                      {formatNumber(summary[SUMMARY_KEY[status]], locale)}
                    </p>
                  </li>
                )
              })}
            </ul>

            <section className="space-y-2">
              <h3 className="text-sm font-medium">{t("rsvpForm.byDepartment")}</h3>
              <div
                className="overflow-x-auto rounded-lg border"
                data-testid="rsvp-by-department"
              >
                <Table>
                  <caption className="sr-only">{t("rsvpForm.byDepartment")}</caption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("rsvpForm.department")}</TableHead>
                      {STATUS_ORDER.map((status) => {
                        const Icon = RSVP_STATUS_STYLE[status].icon
                        return (
                          <TableHead key={status} className="text-right">
                            <span className="inline-flex items-center gap-1">
                              <Icon className="size-3.5" aria-hidden="true" />
                              {statusLabel(status)}
                            </span>
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byDepartment.map((row) => (
                      <TableRow key={row.department}>
                        <TableCell className="max-w-48 truncate font-medium">
                          {row.department || "—"}
                        </TableCell>
                        {STATUS_ORDER.map((status) => (
                          <TableCell key={status} className="text-right tabular-nums">
                            {formatNumber(row[SUMMARY_KEY[status]], locale)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-medium">
                {t("rsvpForm.pendingList")}{" "}
                <span className="text-muted-foreground font-normal tabular-nums">
                  ({formatNumber(pending.length, locale)})
                </span>
              </h3>
              {pending.length === 0 ? (
                <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <CircleCheckIcon className="size-4 shrink-0" aria-hidden="true" />
                  {t("rsvpForm.pendingEmpty")}
                </p>
              ) : (
                <ul className="flex flex-wrap gap-1.5" data-testid="rsvp-pending-list">
                  {pending.slice(0, PENDING_PREVIEW).map((participant) => (
                    <li
                      key={participant.id}
                      className="bg-muted max-w-full truncate rounded-full px-2.5 py-0.5 text-xs"
                    >
                      {getParticipantFullName(participant, locale)}
                    </li>
                  ))}
                  {pending.length > PENDING_PREVIEW ? (
                    <li className="text-muted-foreground rounded-full border px-2.5 py-0.5 text-xs tabular-nums">
                      +{formatNumber(pending.length - PENDING_PREVIEW, locale)}
                    </li>
                  ) : null}
                </ul>
              )}
              <Button asChild variant="link" size="sm" className="h-auto px-0">
                <Link
                  href={`${ROUTES.participants}?event=${eventId}`}
                  data-testid="rsvp-view-all-participants"
                >
                  {t("rsvpForm.viewAllParticipants")}
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-medium">{t("rsvpForm.recentResponses")}</h3>
              {recent.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t("rsvpForm.noResponses")}
                </p>
              ) : (
                <ol className="space-y-2" data-testid="rsvp-recent-responses">
                  {recent.map((activity) => {
                    const Icon = ACTIVITY_META[activity.action].icon
                    const status = rsvpStatusFromLabel(activity.after)
                    return (
                      <li key={activity.id} className="flex items-start gap-2 text-sm">
                        <Icon
                          className="text-muted-foreground mt-0.5 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-1.5">
                            <span className="truncate font-medium">
                              {tl(activity.targetName)}
                            </span>
                            {status ? (
                              <StatusBadge size="sm" style={RSVP_STATUS_STYLE[status]} />
                            ) : activity.after ? (
                              <span className="text-muted-foreground text-xs">
                                {tl(activity.after)}
                              </span>
                            ) : null}
                          </p>
                          <time
                            dateTime={activity.createdAt}
                            className="text-muted-foreground text-xs"
                          >
                            {formatRelativeTime(activity.createdAt, locale)}
                          </time>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </section>
          </>
        )}
      </CardContent>
    </Card>
  )
}
