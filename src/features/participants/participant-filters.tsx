"use client"

import { SearchIcon } from "lucide-react"

import { FilterChips, type FilterChip } from "@/components/common/filter-chips"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PARTICIPANT_TYPE_STYLE,
  RSVP_STATUS_STYLE,
} from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import {
  EMPTY_PARTICIPANT_FILTERS,
  type ParticipantFilters,
} from "@/lib/participant"
import {
  PARTICIPANT_TYPES,
  RSVP_STATUSES,
  type ParticipantType,
  type RsvpStatus,
} from "@/types/participant"

/** แถบค้นหา + ตัวกรอง (ประเภท / สถานะตอบรับ / แผนก) + ชิปตัวกรองที่เลือกอยู่ */
export function ParticipantFiltersBar({
  filters,
  onChange,
  departments,
  resultCount,
}: {
  filters: ParticipantFilters
  onChange: (filters: ParticipantFilters) => void
  departments: { key: string; label: string }[]
  resultCount: number
}) {
  const { t } = useLocale()

  const set = (changes: Partial<ParticipantFilters>) =>
    onChange({ ...filters, ...changes })

  const chips: FilterChip[] = [
    ...(filters.type !== "all"
      ? [
          {
            key: "type",
            label: t(
              PARTICIPANT_TYPE_STYLE[filters.type].labelKey as TranslationKey
            ),
            onRemove: () => set({ type: "all" }),
          },
        ]
      : []),
    ...(filters.rsvpStatus !== "all"
      ? [
          {
            key: "rsvp",
            label: t(
              RSVP_STATUS_STYLE[filters.rsvpStatus].labelKey as TranslationKey
            ),
            onRemove: () => set({ rsvpStatus: "all" }),
          },
        ]
      : []),
    ...(filters.department !== "all"
      ? [
          {
            key: "department",
            label:
              departments.find((entry) => entry.key === filters.department)
                ?.label ?? filters.department,
            onRemove: () => set({ department: "all" }),
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <SearchIcon
            className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={filters.query}
            onChange={(event) => set({ query: event.target.value })}
            placeholder={t("participant.searchPlaceholder")}
            aria-label={t("common.search")}
            className="h-8 pl-8"
            data-testid="participant-search"
          />
        </div>

        <Select
          value={filters.type}
          onValueChange={(value) =>
            set({ type: value as ParticipantType | "all" })
          }
        >
          <SelectTrigger
            size="sm"
            className="w-44"
            aria-label={t("participantType.label")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("participantType.label")}: {t("common.all")}
            </SelectItem>
            {PARTICIPANT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(PARTICIPANT_TYPE_STYLE[type].labelKey as TranslationKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.rsvpStatus}
          onValueChange={(value) =>
            set({ rsvpStatus: value as RsvpStatus | "all" })
          }
        >
          <SelectTrigger size="sm" className="w-44" aria-label={t("rsvp.label")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("rsvp.label")}: {t("common.all")}
            </SelectItem>
            {RSVP_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(RSVP_STATUS_STYLE[status].labelKey as TranslationKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.department}
          onValueChange={(value) => set({ department: value })}
        >
          <SelectTrigger
            size="sm"
            className="w-48"
            aria-label={t("participant.department")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("participant.allDepartments")}</SelectItem>
            {departments.map((department) => (
              <SelectItem key={department.key} value={department.key}>
                {department.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FilterChips
        chips={chips}
        onClearAll={() =>
          onChange({ ...EMPTY_PARTICIPANT_FILTERS, query: filters.query })
        }
      />

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {t("participant.resultCount", { count: resultCount })}
      </p>
    </div>
  )
}
