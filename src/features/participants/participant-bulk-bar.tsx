"use client"

import { Trash2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RSVP_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { RSVP_STATUSES, type RsvpStatus } from "@/types/participant"

/** แถบเครื่องมือเมื่อเลือกหลายรายการ — เปลี่ยน RSVP หรือลบเป็นชุด */
export function ParticipantBulkBar({
  count,
  onChangeRsvp,
  onDelete,
  onClear,
}: {
  count: number
  onChangeRsvp: (status: RsvpStatus) => void
  onDelete: () => void
  onClear: () => void
}) {
  const { t } = useLocale()
  if (count === 0) return null

  return (
    <div
      className="bg-brand-50 border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/30 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
      role="toolbar"
      aria-label={t("participant.selectedCount", { count })}
      data-testid="participant-bulk-bar"
    >
      <span className="text-sm font-medium">
        {t("participant.selectedCount", { count })}
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" data-testid="bulk-rsvp-trigger">
              {t("participant.bulkChangeRsvp")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {RSVP_STATUSES.map((status) => {
              const style = RSVP_STATUS_STYLE[status]
              const Icon = style.icon
              return (
                <DropdownMenuItem
                  key={status}
                  onSelect={() => onChangeRsvp(status)}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {t(style.labelKey as TranslationKey)}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          variant="outline"
          className="text-foreground"
          onClick={onDelete}
          data-testid="bulk-delete"
        >
          <Trash2Icon className="size-4" aria-hidden="true" />
          {t("participant.bulkDelete")}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          aria-label={t("participant.clearSelection")}
        >
          <XIcon className="size-4" aria-hidden="true" />
          {t("participant.clearSelection")}
        </Button>
      </div>
    </div>
  )
}
