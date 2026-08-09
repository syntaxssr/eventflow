import {
  AtSignIcon,
  BellRingIcon,
  CalendarClockIcon,
  FilePenIcon,
  FileUpIcon,
  ListChecksIcon,
  LockIcon,
  LockOpenIcon,
  TriangleAlertIcon,
  UserPlusIcon,
  type LucideIcon,
} from "lucide-react"

import type { TranslationKey } from "@/i18n/types"
import type { NotificationType } from "@/types/notification"

interface NotificationMeta {
  labelKey: TranslationKey
  icon: LucideIcon
  /** สีพื้นของไอคอนในรายการแจ้งเตือน */
  tile: string
}

/** ใช้ได้เฉพาะ --info / --warning / --success / --danger กับดำ/ขาวไล่ความทึบ */
const NEUTRAL_TILE = "bg-muted text-muted-foreground"
const INFO_TILE = "bg-info/15 text-info-foreground dark:bg-info/25"
const WARNING_TILE = "bg-warning/25 text-warning-foreground dark:bg-warning/30"
const SUCCESS_TILE = "bg-success/20 text-success-foreground dark:bg-success/25"
const DANGER_TILE = "bg-danger/15 text-danger-foreground dark:bg-danger/25"

export const NOTIFICATION_META: Record<NotificationType, NotificationMeta> = {
  task_assigned: {
    labelKey: "notification.typeTaskAssigned",
    icon: UserPlusIcon,
    tile: INFO_TILE,
  },
  task_due_soon: {
    labelKey: "notification.typeTaskDueSoon",
    icon: BellRingIcon,
    tile: WARNING_TILE,
  },
  task_overdue: {
    labelKey: "notification.typeTaskOverdue",
    icon: TriangleAlertIcon,
    tile: DANGER_TILE,
  },
  file_updated: {
    labelKey: "notification.typeFileUpdated",
    icon: FilePenIcon,
    tile: NEUTRAL_TILE,
  },
  file_new_version: {
    labelKey: "notification.typeFileNewVersion",
    icon: FileUpIcon,
    tile: NEUTRAL_TILE,
  },
  mentioned: {
    labelKey: "notification.typeMentioned",
    icon: AtSignIcon,
    tile: INFO_TILE,
  },
  timeline_changed: {
    labelKey: "notification.typeTimelineChanged",
    icon: CalendarClockIcon,
    tile: NEUTRAL_TILE,
  },
  checklist_completed: {
    labelKey: "notification.typeChecklistCompleted",
    icon: ListChecksIcon,
    tile: SUCCESS_TILE,
  },
  task_blocked: {
    labelKey: "notification.typeTaskBlocked",
    icon: LockIcon,
    tile: DANGER_TILE,
  },
  task_unblocked: {
    labelKey: "notification.typeTaskUnblocked",
    icon: LockOpenIcon,
    tile: SUCCESS_TILE,
  },
}
