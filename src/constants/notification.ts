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

export const NOTIFICATION_META: Record<NotificationType, NotificationMeta> = {
  task_assigned: {
    labelKey: "notification.typeTaskAssigned",
    icon: UserPlusIcon,
    tile: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  task_due_soon: {
    labelKey: "notification.typeTaskDueSoon",
    icon: BellRingIcon,
    tile: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  task_overdue: {
    labelKey: "notification.typeTaskOverdue",
    icon: TriangleAlertIcon,
    tile: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  },
  file_updated: {
    labelKey: "notification.typeFileUpdated",
    icon: FilePenIcon,
    tile: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  },
  file_new_version: {
    labelKey: "notification.typeFileNewVersion",
    icon: FileUpIcon,
    tile: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  },
  mentioned: {
    labelKey: "notification.typeMentioned",
    icon: AtSignIcon,
    tile: "bg-brand-50 text-brand-900 dark:bg-brand-500/15 dark:text-brand-300",
  },
  timeline_changed: {
    labelKey: "notification.typeTimelineChanged",
    icon: CalendarClockIcon,
    tile: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  },
  checklist_completed: {
    labelKey: "notification.typeChecklistCompleted",
    icon: ListChecksIcon,
    tile: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  },
  task_blocked: {
    labelKey: "notification.typeTaskBlocked",
    icon: LockIcon,
    tile: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  },
  task_unblocked: {
    labelKey: "notification.typeTaskUnblocked",
    icon: LockOpenIcon,
    tile: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  },
}
