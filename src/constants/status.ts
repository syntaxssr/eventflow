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
 * กติกาสี: ใช้ได้เฉพาะ --success / --warning / --info / --danger (สื่อความหมาย)
 * กับดำ/ขาวไล่ความทึบ (--muted, --border, --foreground) เท่านั้น ห้ามใช้ Tailwind
 * palette อื่น (slate/blue/orange/green/red ฯลฯ) — ดู colors.md
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

/** neutral = ไม่มีความหมายพิเศษ ใช้ดำ/ขาวไล่ความทึบ */
const NEUTRAL_BADGE = "bg-muted text-muted-foreground border-border"
const NEUTRAL_BADGE_STRONG =
  "bg-foreground/10 text-foreground border-foreground/20"
const NEUTRAL_DOT = "bg-foreground/40"
const NEUTRAL_DOT_STRONG = "bg-foreground/60"

/** info = ฟ้า (#4586ee) — สถานะ "กำลังดำเนินการ/บทบาทหลัก" */
const INFO_BADGE =
  "bg-info/15 text-foreground border-info/35 dark:bg-info/25 dark:border-info/45"
const INFO_DOT = "bg-info"

/** warning = เหลือง (#ffcf49) — สถานะที่ต้องให้ความสนใจ */
const WARNING_BADGE =
  "bg-warning/25 text-foreground border-warning/45 dark:bg-warning/30 dark:border-warning/55"
const WARNING_DOT = "bg-warning"

/** success = เขียว (#54d463) */
const SUCCESS_BADGE =
  "bg-success/20 text-foreground border-success/40 dark:bg-success/25 dark:border-success/45"
const SUCCESS_DOT = "bg-success"

/** danger = แดง (#f83e32) */
const DANGER_BADGE =
  "bg-danger/15 text-foreground border-danger/35 dark:bg-danger/25 dark:border-danger/45"
const DANGER_DOT = "bg-danger"

export const EVENT_STATUS_STYLE: Record<EventStatus, StatusStyle> = {
  draft: {
    labelKey: "eventStatus.draft",
    icon: FileTextIcon,
    badge: NEUTRAL_BADGE,
    dot: NEUTRAL_DOT,
    chartColor: "var(--chart-5)",
  },
  planning: {
    labelKey: "eventStatus.planning",
    icon: ClipboardListIcon,
    badge: INFO_BADGE,
    dot: INFO_DOT,
    chartColor: "var(--chart-4)",
  },
  ready: {
    labelKey: "eventStatus.ready",
    icon: BadgeCheckIcon,
    badge: WARNING_BADGE,
    dot: WARNING_DOT,
    chartColor: "var(--chart-3)",
  },
  in_progress: {
    labelKey: "eventStatus.inProgress",
    icon: PlayIcon,
    badge: INFO_BADGE,
    dot: INFO_DOT,
    chartColor: "var(--chart-1)",
  },
  completed: {
    labelKey: "eventStatus.completed",
    icon: CircleCheckIcon,
    badge: SUCCESS_BADGE,
    dot: SUCCESS_DOT,
    chartColor: "var(--success)",
  },
  cancelled: {
    labelKey: "eventStatus.cancelled",
    icon: BanIcon,
    badge: DANGER_BADGE,
    dot: DANGER_DOT,
    chartColor: "var(--danger)",
  },
}

export const TASK_STATUS_STYLE: Record<TaskStatus, StatusStyle> = {
  not_started: {
    labelKey: "taskStatus.notStarted",
    icon: CircleDashedIcon,
    badge: NEUTRAL_BADGE,
    dot: NEUTRAL_DOT,
    chartColor: "var(--chart-5)",
  },
  in_progress: {
    labelKey: "taskStatus.inProgress",
    icon: CircleDotIcon,
    badge: INFO_BADGE,
    dot: INFO_DOT,
    chartColor: "var(--chart-1)",
  },
  awaiting_review: {
    labelKey: "taskStatus.awaitingReview",
    icon: EyeIcon,
    badge: WARNING_BADGE,
    dot: WARNING_DOT,
    chartColor: "var(--chart-4)",
  },
  completed: {
    labelKey: "taskStatus.completed",
    icon: CircleCheckIcon,
    badge: SUCCESS_BADGE,
    dot: SUCCESS_DOT,
    chartColor: "var(--success)",
  },
  blocked: {
    labelKey: "taskStatus.blocked",
    icon: OctagonXIcon,
    badge: DANGER_BADGE,
    dot: DANGER_DOT,
    chartColor: "var(--danger)",
  },
}

export const PRIORITY_STYLE: Record<Priority, StatusStyle> = {
  low: {
    labelKey: "priority.low",
    icon: ChevronDownIcon,
    badge: NEUTRAL_BADGE,
    dot: NEUTRAL_DOT,
    chartColor: "var(--chart-5)",
  },
  normal: {
    labelKey: "priority.normal",
    icon: MinusIcon,
    badge: NEUTRAL_BADGE_STRONG,
    dot: NEUTRAL_DOT_STRONG,
    chartColor: "var(--chart-4)",
  },
  high: {
    labelKey: "priority.high",
    icon: ChevronUpIcon,
    badge: WARNING_BADGE,
    dot: WARNING_DOT,
    chartColor: "var(--chart-3)",
  },
  urgent: {
    labelKey: "priority.urgent",
    icon: TriangleAlertIcon,
    badge: DANGER_BADGE,
    dot: DANGER_DOT,
    chartColor: "var(--danger)",
  },
}

export const RSVP_STATUS_STYLE: Record<RsvpStatus, StatusStyle> = {
  pending: {
    labelKey: "rsvp.pending",
    icon: CircleHelpIcon,
    badge: WARNING_BADGE,
    dot: WARNING_DOT,
    chartColor: "var(--chart-4)",
  },
  attending: {
    labelKey: "rsvp.attending",
    icon: CircleCheckIcon,
    badge: SUCCESS_BADGE,
    dot: SUCCESS_DOT,
    chartColor: "var(--success)",
  },
  not_attending: {
    labelKey: "rsvp.notAttending",
    icon: CircleXIcon,
    badge: DANGER_BADGE,
    dot: DANGER_DOT,
    chartColor: "var(--danger)",
  },
}

export const PARTICIPANT_TYPE_STYLE: Record<ParticipantType, StatusStyle> = {
  employee: {
    labelKey: "participantType.employee",
    icon: UserIcon,
    badge: NEUTRAL_BADGE,
    dot: NEUTRAL_DOT,
    chartColor: "var(--chart-5)",
  },
  executive: {
    labelKey: "participantType.executive",
    icon: CrownIcon,
    badge: NEUTRAL_BADGE_STRONG,
    dot: NEUTRAL_DOT_STRONG,
    chartColor: "var(--chart-3)",
  },
  speaker: {
    labelKey: "participantType.speaker",
    icon: MicIcon,
    badge: INFO_BADGE,
    dot: INFO_DOT,
    chartColor: "var(--chart-2)",
  },
  external_guest: {
    labelKey: "participantType.externalGuest",
    icon: UserPlusIcon,
    badge: NEUTRAL_BADGE,
    dot: NEUTRAL_DOT,
    chartColor: "var(--chart-4)",
  },
  organizer: {
    labelKey: "participantType.organizer",
    icon: UsersIcon,
    badge: INFO_BADGE,
    dot: INFO_DOT,
    chartColor: "var(--chart-1)",
  },
}

export const READINESS_STYLE: Record<ReadinessStatus, StatusStyle> = {
  not_ready: {
    labelKey: "readiness.notReady",
    icon: CircleDashedIcon,
    badge: NEUTRAL_BADGE,
    dot: NEUTRAL_DOT,
    chartColor: "var(--chart-5)",
  },
  preparing: {
    labelKey: "readiness.preparing",
    icon: LoaderIcon,
    badge: INFO_BADGE,
    dot: INFO_DOT,
    chartColor: "var(--chart-1)",
  },
  ready: {
    labelKey: "readiness.ready",
    icon: CircleCheckIcon,
    badge: SUCCESS_BADGE,
    dot: SUCCESS_DOT,
    chartColor: "var(--success)",
  },
  done: {
    labelKey: "readiness.done",
    icon: FlagIcon,
    badge: SUCCESS_BADGE,
    dot: SUCCESS_DOT,
    chartColor: "var(--success)",
  },
}

/** สไตล์ของ Badge "เกินกำหนด / Overdue" */
export const OVERDUE_STYLE = {
  labelKey: "task.overdue",
  icon: TriangleAlertIcon,
  badge: DANGER_BADGE,
  dot: DANGER_DOT,
} as const

/** สไตล์ของ Badge "ใกล้ครบกำหนด / Due Soon" */
export const DUE_SOON_STYLE = {
  labelKey: "task.dueSoon",
  icon: TriangleAlertIcon,
  badge: WARNING_BADGE,
  dot: WARNING_DOT,
} as const
