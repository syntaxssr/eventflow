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
 * กติกาสี: ใช้เฉพาะ token สีเชิงความหมายและ token สถานะกลางจาก Design System
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

/** info = ฟ้า — สถานะ "กำลังดำเนินการ/บทบาทหลัก" */
const INFO_DOT = "bg-info"

/** warning = เหลือง — สถานะที่ต้องให้ความสนใจ */
const WARNING_DOT = "bg-warning"

/** success = เขียว */
const SUCCESS_DOT = "bg-success"

/** danger = แดง */
const DANGER_DOT = "bg-danger"

/** สถานะกิจกรรมใช้สี Version 4 เต็มสี เพื่อให้ตรงกับ Design System */
const EVENT_DEFAULT_BADGE =
  "bg-status-default text-status-default-foreground border-status-gray"
const STATUS_GRAY_BADGE =
  "bg-status-gray text-status-gray-foreground border-status-gray"
const EVENT_PURPLE_BADGE =
  "bg-event-status-purple text-event-status-purple-foreground border-event-status-purple"
const EVENT_INFO_BADGE = "bg-info text-info-foreground border-info"
const EVENT_SUCCESS_BADGE =
  "bg-success text-success-foreground border-success"
const EVENT_DANGER_BADGE = "bg-danger text-danger-foreground border-danger"
const EVENT_DEFAULT_DOT = "bg-status-default"
const STATUS_GRAY_DOT = "bg-status-gray"
const EVENT_PURPLE_DOT = "bg-event-status-purple"

/** สถานะงานใช้สี Version 4 เต็มสีตามลำดับการทำงาน */
const TASK_INFO_BADGE = "bg-info text-info-foreground border-info"
const TASK_WARNING_BADGE =
  "bg-warning text-warning-foreground border-warning"
const TASK_ORANGE_BADGE =
  "bg-task-status-orange text-task-status-orange-foreground border-task-status-orange"
const TASK_SUCCESS_BADGE = "bg-success text-success-foreground border-success"
const TASK_ORANGE_DOT = "bg-task-status-orange"

/** ความสำคัญใช้สี Version 4 เพื่อให้ระดับความเร่งด่วนแยกชัดเจน */
const PRIORITY_LOW_BADGE = "bg-info text-info-foreground border-info"
const PRIORITY_NORMAL_BADGE =
  "bg-success text-success-foreground border-success"
const PRIORITY_HIGH_BADGE =
  "bg-task-status-orange text-task-status-orange-foreground border-task-status-orange"
const PRIORITY_URGENT_BADGE = "bg-danger text-danger-foreground border-danger"
const PRIORITY_LOW_DOT = "bg-info"
const PRIORITY_NORMAL_DOT = "bg-success"
const PRIORITY_HIGH_DOT = "bg-task-status-orange"
const PRIORITY_URGENT_DOT = "bg-danger"

/** สถานะตอบรับใช้สี Version 4 เพื่อให้เห็นคำตอบได้ทันที */
const RSVP_PENDING_BADGE = "bg-warning text-warning-foreground border-warning"
const RSVP_ATTENDING_BADGE =
  "bg-success text-success-foreground border-success"
const RSVP_NOT_ATTENDING_BADGE = "bg-danger text-danger-foreground border-danger"

/** ประเภทผู้เข้าร่วมใช้สี Version 4 เพื่อแยกกลุ่มได้อย่างรวดเร็ว */
const PARTICIPANT_EMPLOYEE_BADGE = "bg-info text-info-foreground border-info"
const PARTICIPANT_EXECUTIVE_BADGE =
  "bg-task-status-orange text-task-status-orange-foreground border-task-status-orange"
const PARTICIPANT_SPEAKER_BADGE =
  "bg-success text-success-foreground border-success"
const PARTICIPANT_GUEST_BADGE =
  "bg-event-status-purple text-event-status-purple-foreground border-event-status-purple"
const PARTICIPANT_ORGANIZER_BADGE = "bg-danger text-danger-foreground border-danger"
const PARTICIPANT_EMPLOYEE_DOT = "bg-info"
const PARTICIPANT_EXECUTIVE_DOT = "bg-task-status-orange"
const PARTICIPANT_SPEAKER_DOT = "bg-success"
const PARTICIPANT_GUEST_DOT = "bg-event-status-purple"
const PARTICIPANT_ORGANIZER_DOT = "bg-danger"

/** สถานะความพร้อมใช้สี Version 4 ตามลำดับการเตรียมงาน */
const READINESS_PREPARING_BADGE = "bg-info text-info-foreground border-info"
const READINESS_READY_BADGE =
  "bg-event-status-purple text-event-status-purple-foreground border-event-status-purple"
const READINESS_DONE_BADGE = "bg-success text-success-foreground border-success"
const READINESS_PREPARING_DOT = "bg-info"
const READINESS_READY_DOT = "bg-event-status-purple"
const READINESS_DONE_DOT = "bg-success"

/** กำหนดส่งใช้สี Version 4 เพื่อบอกระดับความเร่งด่วน */
const DUE_OVERDUE_BADGE = "bg-danger text-danger-foreground border-danger"
const DUE_SOON_BADGE =
  "bg-task-status-orange text-task-status-orange-foreground border-task-status-orange"
const DUE_OVERDUE_DOT = "bg-danger"
const DUE_SOON_DOT = "bg-task-status-orange"

export const EVENT_STATUS_STYLE: Record<EventStatus, StatusStyle> = {
  draft: {
    labelKey: "eventStatus.draft",
    icon: FileTextIcon,
    badge: EVENT_DEFAULT_BADGE,
    dot: EVENT_DEFAULT_DOT,
    chartColor: "var(--status-default)",
  },
  planning: {
    labelKey: "eventStatus.planning",
    icon: ClipboardListIcon,
    badge: STATUS_GRAY_BADGE,
    dot: STATUS_GRAY_DOT,
    chartColor: "var(--status-gray)",
  },
  ready: {
    labelKey: "eventStatus.ready",
    icon: BadgeCheckIcon,
    badge: EVENT_PURPLE_BADGE,
    dot: EVENT_PURPLE_DOT,
    chartColor: "var(--event-status-purple)",
  },
  in_progress: {
    labelKey: "eventStatus.inProgress",
    icon: PlayIcon,
    badge: EVENT_INFO_BADGE,
    dot: INFO_DOT,
    chartColor: "var(--info)",
  },
  completed: {
    labelKey: "eventStatus.completed",
    icon: CircleCheckIcon,
    badge: EVENT_SUCCESS_BADGE,
    dot: SUCCESS_DOT,
    chartColor: "var(--success)",
  },
  cancelled: {
    labelKey: "eventStatus.cancelled",
    icon: BanIcon,
    badge: EVENT_DANGER_BADGE,
    dot: DANGER_DOT,
    chartColor: "var(--danger)",
  },
}

export const TASK_STATUS_STYLE: Record<TaskStatus, StatusStyle> = {
  not_started: {
    labelKey: "taskStatus.notStarted",
    icon: CircleDashedIcon,
    badge: STATUS_GRAY_BADGE,
    dot: STATUS_GRAY_DOT,
    chartColor: "var(--status-gray)",
  },
  in_progress: {
    labelKey: "taskStatus.inProgress",
    icon: CircleDotIcon,
    badge: TASK_INFO_BADGE,
    dot: INFO_DOT,
    chartColor: "var(--info)",
  },
  awaiting_review: {
    labelKey: "taskStatus.awaitingReview",
    icon: EyeIcon,
    badge: TASK_WARNING_BADGE,
    dot: WARNING_DOT,
    chartColor: "var(--warning)",
  },
  blocked: {
    labelKey: "taskStatus.blocked",
    icon: OctagonXIcon,
    badge: TASK_ORANGE_BADGE,
    dot: TASK_ORANGE_DOT,
    chartColor: "var(--task-status-orange)",
  },
  completed: {
    labelKey: "taskStatus.completed",
    icon: CircleCheckIcon,
    badge: TASK_SUCCESS_BADGE,
    dot: SUCCESS_DOT,
    chartColor: "var(--success)",
  },
}

export const PRIORITY_STYLE: Record<Priority, StatusStyle> = {
  low: {
    labelKey: "priority.low",
    icon: ChevronDownIcon,
    badge: PRIORITY_LOW_BADGE,
    dot: PRIORITY_LOW_DOT,
    chartColor: "var(--info)",
  },
  normal: {
    labelKey: "priority.normal",
    icon: MinusIcon,
    badge: PRIORITY_NORMAL_BADGE,
    dot: PRIORITY_NORMAL_DOT,
    chartColor: "var(--success)",
  },
  high: {
    labelKey: "priority.high",
    icon: ChevronUpIcon,
    badge: PRIORITY_HIGH_BADGE,
    dot: PRIORITY_HIGH_DOT,
    chartColor: "var(--task-status-orange)",
  },
  urgent: {
    labelKey: "priority.urgent",
    icon: TriangleAlertIcon,
    badge: PRIORITY_URGENT_BADGE,
    dot: PRIORITY_URGENT_DOT,
    chartColor: "var(--danger)",
  },
}

export const RSVP_STATUS_STYLE: Record<RsvpStatus, StatusStyle> = {
  pending: {
    labelKey: "rsvp.pending",
    icon: CircleHelpIcon,
    badge: RSVP_PENDING_BADGE,
    dot: WARNING_DOT,
    chartColor: "var(--warning)",
  },
  attending: {
    labelKey: "rsvp.attending",
    icon: CircleCheckIcon,
    badge: RSVP_ATTENDING_BADGE,
    dot: SUCCESS_DOT,
    chartColor: "var(--success)",
  },
  not_attending: {
    labelKey: "rsvp.notAttending",
    icon: CircleXIcon,
    badge: RSVP_NOT_ATTENDING_BADGE,
    dot: DANGER_DOT,
    chartColor: "var(--danger)",
  },
}

export const PARTICIPANT_TYPE_STYLE: Record<ParticipantType, StatusStyle> = {
  employee: {
    labelKey: "participantType.employee",
    icon: UserIcon,
    badge: PARTICIPANT_EMPLOYEE_BADGE,
    dot: PARTICIPANT_EMPLOYEE_DOT,
    chartColor: "var(--info)",
  },
  executive: {
    labelKey: "participantType.executive",
    icon: CrownIcon,
    badge: PARTICIPANT_EXECUTIVE_BADGE,
    dot: PARTICIPANT_EXECUTIVE_DOT,
    chartColor: "var(--task-status-orange)",
  },
  speaker: {
    labelKey: "participantType.speaker",
    icon: MicIcon,
    badge: PARTICIPANT_SPEAKER_BADGE,
    dot: PARTICIPANT_SPEAKER_DOT,
    chartColor: "var(--success)",
  },
  external_guest: {
    labelKey: "participantType.externalGuest",
    icon: UserPlusIcon,
    badge: PARTICIPANT_GUEST_BADGE,
    dot: PARTICIPANT_GUEST_DOT,
    chartColor: "var(--event-status-purple)",
  },
  organizer: {
    labelKey: "participantType.organizer",
    icon: UsersIcon,
    badge: PARTICIPANT_ORGANIZER_BADGE,
    dot: PARTICIPANT_ORGANIZER_DOT,
    chartColor: "var(--danger)",
  },
}

export const READINESS_STYLE: Record<ReadinessStatus, StatusStyle> = {
  not_ready: {
    labelKey: "readiness.notReady",
    icon: CircleDashedIcon,
    badge: STATUS_GRAY_BADGE,
    dot: STATUS_GRAY_DOT,
    chartColor: "var(--status-gray)",
  },
  preparing: {
    labelKey: "readiness.preparing",
    icon: LoaderIcon,
    badge: READINESS_PREPARING_BADGE,
    dot: READINESS_PREPARING_DOT,
    chartColor: "var(--info)",
  },
  ready: {
    labelKey: "readiness.ready",
    icon: CircleCheckIcon,
    badge: READINESS_READY_BADGE,
    dot: READINESS_READY_DOT,
    chartColor: "var(--event-status-purple)",
  },
  done: {
    labelKey: "readiness.done",
    icon: FlagIcon,
    badge: READINESS_DONE_BADGE,
    dot: READINESS_DONE_DOT,
    chartColor: "var(--success)",
  },
}

/** สไตล์ของ Badge "เกินกำหนด / Overdue" */
export const OVERDUE_STYLE = {
  labelKey: "task.overdue",
  icon: TriangleAlertIcon,
  badge: DUE_OVERDUE_BADGE,
  dot: DUE_OVERDUE_DOT,
} as const

/** สไตล์ของ Badge "ใกล้ครบกำหนด / Due Soon" */
export const DUE_SOON_STYLE = {
  labelKey: "task.dueSoon",
  icon: TriangleAlertIcon,
  badge: DUE_SOON_BADGE,
  dot: DUE_SOON_DOT,
} as const
