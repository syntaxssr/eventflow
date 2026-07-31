import {
  BadgeCheckIcon,
  BanIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleHelpIcon,
  CircleXIcon,
  ClipboardListIcon,
  CrownIcon,
  EyeIcon,
  FileTextIcon,
  FlagIcon,
  LoaderIcon,
  MicIcon,
  MinusIcon,
  OctagonXIcon,
  PlayIcon,
  TriangleAlertIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import type { EventStatus } from "@/types/event"
import type { ParticipantType, RsvpStatus } from "@/types/participant"
import type { Priority, TaskStatus } from "@/types/task"
import type { ReadinessStatus } from "@/types/timeline"

/**
 * รูปแบบการแสดงผลของแต่ละสถานะ
 *
 * กติกา: ห้ามใช้สีเป็นตัวสื่อความหมายเพียงอย่างเดียว
 * ทุกสถานะจึงมี `icon` + `labelKey` ควบคู่กับสีเสมอ
 *
 * หมายเหตุเรื่องธีม: โทนสีแบรนด์ (`brand-*`) สลับค่าเองใน Dark Mode
 * จึงไม่ต้องมี `dark:` variant ส่วนสีจาก Tailwind palette ต้องระบุ `dark:` เอง
 */
export interface StatusStyle {
  /** key ของข้อความใน dictionary (i18n) */
  labelKey: string
  icon: LucideIcon
  /** class สำหรับ Badge (พื้นหลัง + ข้อความ + เส้นขอบ) */
  badge: string
  /** class สำหรับจุดสีเล็ก ๆ เช่นใน legend หรือ list */
  dot: string
  /** สีสำหรับ Chart (อ้าง CSS variable) */
  chartColor: string
}

export const EVENT_STATUS_STYLE: Record<EventStatus, StatusStyle> = {
  draft: {
    labelKey: "eventStatus.draft",
    icon: FileTextIcon,
    badge:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
    dot: "bg-slate-400",
    chartColor: "var(--chart-5)",
  },
  planning: {
    labelKey: "eventStatus.planning",
    icon: ClipboardListIcon,
    badge:
      "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
    dot: "bg-blue-500",
    chartColor: "var(--chart-2)",
  },
  ready: {
    labelKey: "eventStatus.ready",
    icon: BadgeCheckIcon,
    badge:
      "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30",
    dot: "bg-teal-500",
    chartColor: "var(--chart-3)",
  },
  in_progress: {
    labelKey: "eventStatus.inProgress",
    icon: PlayIcon,
    badge: "bg-brand-50 text-brand-900 border-brand-200",
    dot: "bg-brand-500",
    chartColor: "var(--chart-1)",
  },
  completed: {
    labelKey: "eventStatus.completed",
    icon: CircleCheckIcon,
    badge:
      "bg-green-50 text-green-800 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30",
    dot: "bg-green-600",
    chartColor: "var(--chart-3)",
  },
  cancelled: {
    labelKey: "eventStatus.cancelled",
    icon: BanIcon,
    badge:
      "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
    dot: "bg-rose-500",
    chartColor: "var(--danger)",
  },
}

export const TASK_STATUS_STYLE: Record<TaskStatus, StatusStyle> = {
  not_started: {
    labelKey: "taskStatus.notStarted",
    icon: CircleDashedIcon,
    badge:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
    dot: "bg-slate-400",
    chartColor: "var(--chart-5)",
  },
  in_progress: {
    labelKey: "taskStatus.inProgress",
    icon: CircleDotIcon,
    badge:
      "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
    dot: "bg-blue-500",
    chartColor: "var(--chart-2)",
  },
  awaiting_review: {
    labelKey: "taskStatus.awaitingReview",
    icon: EyeIcon,
    badge:
      "bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30",
    dot: "bg-violet-500",
    chartColor: "var(--chart-4)",
  },
  completed: {
    labelKey: "taskStatus.completed",
    icon: CircleCheckIcon,
    badge:
      "bg-green-50 text-green-800 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30",
    dot: "bg-green-600",
    chartColor: "var(--chart-3)",
  },
  blocked: {
    labelKey: "taskStatus.blocked",
    icon: OctagonXIcon,
    badge:
      "bg-red-50 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
    dot: "bg-red-500",
    chartColor: "var(--danger)",
  },
}

export const PRIORITY_STYLE: Record<Priority, StatusStyle> = {
  low: {
    labelKey: "priority.low",
    icon: ChevronDownIcon,
    badge:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
    dot: "bg-slate-400",
    chartColor: "var(--chart-5)",
  },
  normal: {
    labelKey: "priority.normal",
    icon: MinusIcon,
    badge:
      "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
    dot: "bg-sky-500",
    chartColor: "var(--chart-2)",
  },
  high: {
    labelKey: "priority.high",
    icon: ChevronUpIcon,
    badge: "bg-brand-50 text-brand-900 border-brand-200",
    dot: "bg-brand-500",
    chartColor: "var(--chart-1)",
  },
  urgent: {
    labelKey: "priority.urgent",
    icon: TriangleAlertIcon,
    badge:
      "bg-red-50 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
    dot: "bg-red-500",
    chartColor: "var(--danger)",
  },
}

export const RSVP_STATUS_STYLE: Record<RsvpStatus, StatusStyle> = {
  pending: {
    labelKey: "rsvp.pending",
    icon: CircleHelpIcon,
    badge:
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    dot: "bg-amber-500",
    chartColor: "var(--warning)",
  },
  attending: {
    labelKey: "rsvp.attending",
    icon: CircleCheckIcon,
    badge:
      "bg-green-50 text-green-800 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30",
    dot: "bg-green-600",
    chartColor: "var(--chart-3)",
  },
  not_attending: {
    labelKey: "rsvp.notAttending",
    icon: CircleXIcon,
    badge:
      "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
    dot: "bg-rose-500",
    chartColor: "var(--danger)",
  },
}

export const PARTICIPANT_TYPE_STYLE: Record<ParticipantType, StatusStyle> = {
  employee: {
    labelKey: "participantType.employee",
    icon: UserIcon,
    badge:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
    dot: "bg-slate-400",
    chartColor: "var(--chart-5)",
  },
  executive: {
    labelKey: "participantType.executive",
    icon: CrownIcon,
    badge:
      "bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30",
    dot: "bg-violet-500",
    chartColor: "var(--chart-4)",
  },
  speaker: {
    labelKey: "participantType.speaker",
    icon: MicIcon,
    badge:
      "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
    dot: "bg-blue-500",
    chartColor: "var(--chart-2)",
  },
  external_guest: {
    labelKey: "participantType.externalGuest",
    icon: UserPlusIcon,
    badge:
      "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30",
    dot: "bg-teal-500",
    chartColor: "var(--chart-3)",
  },
  organizer: {
    labelKey: "participantType.organizer",
    icon: UsersIcon,
    badge: "bg-brand-50 text-brand-900 border-brand-200",
    dot: "bg-brand-500",
    chartColor: "var(--chart-1)",
  },
}

export const READINESS_STYLE: Record<ReadinessStatus, StatusStyle> = {
  not_ready: {
    labelKey: "readiness.notReady",
    icon: CircleDashedIcon,
    badge:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
    dot: "bg-slate-400",
    chartColor: "var(--chart-5)",
  },
  preparing: {
    labelKey: "readiness.preparing",
    icon: LoaderIcon,
    badge: "bg-brand-50 text-brand-900 border-brand-200",
    dot: "bg-brand-500",
    chartColor: "var(--chart-1)",
  },
  ready: {
    labelKey: "readiness.ready",
    icon: CircleCheckIcon,
    badge:
      "bg-green-50 text-green-800 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30",
    dot: "bg-green-600",
    chartColor: "var(--chart-3)",
  },
  done: {
    labelKey: "readiness.done",
    icon: FlagIcon,
    badge:
      "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30",
    dot: "bg-teal-500",
    chartColor: "var(--chart-3)",
  },
}

/** สไตล์ของ Badge "เกินกำหนด / Overdue" */
export const OVERDUE_STYLE = {
  labelKey: "task.overdue",
  icon: TriangleAlertIcon,
  badge:
    "bg-red-50 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  dot: "bg-red-500",
} as const

/** สไตล์ของ Badge "ใกล้ครบกำหนด / Due Soon" */
export const DUE_SOON_STYLE = {
  labelKey: "task.dueSoon",
  icon: TriangleAlertIcon,
  badge:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  dot: "bg-amber-500",
} as const
