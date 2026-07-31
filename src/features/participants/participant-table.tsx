"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  PARTICIPANT_TYPE_STYLE,
  RSVP_STATUS_STYLE,
} from "@/constants/status"
import { useLocale } from "@/i18n"
import {
  getParticipantFullName,
  type ParticipantSortKey,
  type SortDirection,
} from "@/lib/participant"
import { cn } from "@/lib/utils"
import type { Participant } from "@/types/participant"

interface ParticipantTableProps {
  participants: Participant[]
  selectedIds: Set<string>
  onToggleRow: (id: string) => void
  onToggleAll: () => void
  sortKey: ParticipantSortKey
  sortDirection: SortDirection
  onSortChange: (key: ParticipantSortKey) => void
  onEdit: (participant: Participant) => void
  onDelete: (participant: Participant) => void
}

const SORTABLE_COLUMNS: {
  key: ParticipantSortKey
  labelKey: "participant.name" | "participant.email" | "participant.department"
    | "rsvp.label" | "participantType.label"
}[] = [
  { key: "name", labelKey: "participant.name" },
  { key: "email", labelKey: "participant.email" },
  { key: "department", labelKey: "participant.department" },
  { key: "rsvpStatus", labelKey: "rsvp.label" },
  { key: "type", labelKey: "participantType.label" },
]

/** ตารางรายชื่อ (desktop) + card view (mobile) — เลือกหลายรายการและจัดเรียงได้ */
export function ParticipantTable({
  participants,
  selectedIds,
  onToggleRow,
  onToggleAll,
  sortKey,
  sortDirection,
  onSortChange,
  onEdit,
  onDelete,
}: ParticipantTableProps) {
  const { t, tl, locale } = useLocale()

  const allSelected =
    participants.length > 0 &&
    participants.every((participant) => selectedIds.has(participant.id))
  const someSelected = participants.some((participant) =>
    selectedIds.has(participant.id)
  )

  const sortIcon = (key: ParticipantSortKey) => {
    if (key !== sortKey)
      return <ArrowUpDownIcon className="size-3.5 opacity-50" aria-hidden="true" />
    return sortDirection === "asc" ? (
      <ArrowUpIcon className="size-3.5" aria-hidden="true" />
    ) : (
      <ArrowDownIcon className="size-3.5" aria-hidden="true" />
    )
  }

  const rowActions = (participant: Participant) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${t("common.actions")}: ${getParticipantFullName(participant, locale)}`}
        >
          <MoreHorizontalIcon className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(participant)}>
          <PencilIcon className="size-4" aria-hidden="true" />
          {t("common.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(participant)}>
          <Trash2Icon className="size-4" aria-hidden="true" />
          {t("common.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/* Desktop */}
      <div
        className="hidden overflow-x-auto rounded-lg border md:block"
        data-testid="participant-table"
      >
        <Table>
          <caption className="sr-only">{t("participant.subtitle")}</caption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={onToggleAll}
                  aria-label={t("participant.selectAll")}
                  data-testid="select-all-participants"
                />
              </TableHead>
              {SORTABLE_COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  aria-sort={
                    column.key === sortKey
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => onSortChange(column.key)}
                    className="hover:text-foreground focus-visible:outline-ring inline-flex items-center gap-1 font-medium focus-visible:outline-2"
                    aria-label={t("participant.sortColumn", {
                      column: t(column.labelKey),
                    })}
                  >
                    {t(column.labelKey)}
                    {sortIcon(column.key)}
                  </button>
                </TableHead>
              ))}
              <TableHead>{t("participant.phone")}</TableHead>
              <TableHead>{t("participant.note")}</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">{t("common.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow
                key={participant.id}
                data-state={selectedIds.has(participant.id) ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(participant.id)}
                    onCheckedChange={() => onToggleRow(participant.id)}
                    aria-label={t("participant.selectRow", {
                      name: getParticipantFullName(participant, locale),
                    })}
                  />
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  {getParticipantFullName(participant, locale)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {participant.email}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {tl(participant.department) || "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    style={RSVP_STATUS_STYLE[participant.rsvpStatus]}
                    size="sm"
                  />
                </TableCell>
                <TableCell>
                  <StatusBadge
                    style={PARTICIPANT_TYPE_STYLE[participant.type]}
                    size="sm"
                  />
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {participant.phone || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-48 truncate text-sm">
                  {tl(participant.note) || "—"}
                </TableCell>
                <TableCell>{rowActions(participant)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile — card view */}
      <ul className="space-y-2 md:hidden" data-testid="participant-cards">
        {participants.map((participant) => (
          <li
            key={participant.id}
            className={cn(
              "rounded-lg border p-3",
              selectedIds.has(participant.id) && "border-brand-400 bg-brand-50/50"
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                className="mt-0.5"
                checked={selectedIds.has(participant.id)}
                onCheckedChange={() => onToggleRow(participant.id)}
                aria-label={t("participant.selectRow", {
                  name: getParticipantFullName(participant, locale),
                })}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {getParticipantFullName(participant, locale)}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {participant.email}
                </p>
                <p className="text-muted-foreground text-xs">
                  {[tl(participant.department), participant.phone]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <StatusBadge
                    style={RSVP_STATUS_STYLE[participant.rsvpStatus]}
                    size="sm"
                  />
                  <StatusBadge
                    style={PARTICIPANT_TYPE_STYLE[participant.type]}
                    size="sm"
                  />
                </div>
                {tl(participant.note) ? (
                  <p className="text-muted-foreground text-xs">
                    {t("participant.note")}: {tl(participant.note)}
                  </p>
                ) : null}
              </div>
              {rowActions(participant)}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
