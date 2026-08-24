import {
  CalendarPlusIcon,
  CopyIcon,
  FilePlusIcon,
  FolderInputIcon,
  ListChecksIcon,
  MailCheckIcon,
  MessageSquareIcon,
  PencilIcon,
  RotateCcwIcon,
  ShuffleIcon,
  StarIcon,
  Trash2Icon,
  UploadIcon,
  UserPlusIcon,
  type LucideIcon,
} from "lucide-react"

import type { TranslationKey } from "@/i18n/types"
import type { ActivityAction } from "@/types/activity"

interface ActivityMeta {
  labelKey: TranslationKey
  icon: LucideIcon
}

export const ACTIVITY_META: Record<ActivityAction, ActivityMeta> = {
  event_created: { labelKey: "activityAction.eventCreated", icon: CalendarPlusIcon },
  event_updated: { labelKey: "activityAction.eventUpdated", icon: PencilIcon },
  event_status_changed: {
    labelKey: "activityAction.eventStatusChanged",
    icon: ShuffleIcon,
  },
  event_duplicated: { labelKey: "activityAction.eventDuplicated", icon: CopyIcon },
  event_deleted: { labelKey: "activityAction.eventDeleted", icon: Trash2Icon },
  task_created: { labelKey: "activityAction.taskCreated", icon: ListChecksIcon },
  task_updated: { labelKey: "activityAction.taskUpdated", icon: PencilIcon },
  task_status_changed: {
    labelKey: "activityAction.taskStatusChanged",
    icon: ShuffleIcon,
  },
  task_deleted: { labelKey: "activityAction.taskDeleted", icon: Trash2Icon },
  checklist_added: { labelKey: "activityAction.checklistAdded", icon: ListChecksIcon },
  checklist_completed: {
    labelKey: "activityAction.checklistCompleted",
    icon: ListChecksIcon,
  },
  file_uploaded: { labelKey: "activityAction.fileUploaded", icon: FilePlusIcon },
  file_renamed: { labelKey: "activityAction.fileRenamed", icon: PencilIcon },
  file_moved: { labelKey: "activityAction.fileMoved", icon: FolderInputIcon },
  file_version_uploaded: {
    labelKey: "activityAction.fileVersionUploaded",
    icon: UploadIcon,
  },
  file_version_restored: {
    labelKey: "activityAction.fileVersionRestored",
    icon: RotateCcwIcon,
  },
  file_deleted: { labelKey: "activityAction.fileDeleted", icon: Trash2Icon },
  file_restored: { labelKey: "activityAction.fileRestored", icon: RotateCcwIcon },
  timeline_created: { labelKey: "activityAction.timelineCreated", icon: CalendarPlusIcon },
  timeline_updated: { labelKey: "activityAction.timelineUpdated", icon: PencilIcon },
  timeline_deleted: { labelKey: "activityAction.timelineDeleted", icon: Trash2Icon },
  participant_added: { labelKey: "activityAction.participantAdded", icon: UserPlusIcon },
  participant_updated: {
    labelKey: "activityAction.participantUpdated",
    icon: PencilIcon,
  },
  participant_deleted: {
    labelKey: "activityAction.participantDeleted",
    icon: Trash2Icon,
  },
  participant_rsvp_changed: {
    labelKey: "activityAction.participantRsvpChanged",
    icon: ShuffleIcon,
  },
  participant_imported: {
    labelKey: "activityAction.participantImported",
    icon: UploadIcon,
  },
  participant_conflict_resolved: {
    labelKey: "activityAction.participantConflictResolved",
    icon: ShuffleIcon,
  },
  comment_added: { labelKey: "activityAction.commentAdded", icon: MessageSquareIcon },
  comment_mentioned: {
    labelKey: "activityAction.commentMentioned",
    icon: MessageSquareIcon,
  },
  employee_added: { labelKey: "activityAction.employeeAdded", icon: UserPlusIcon },
  employee_updated: { labelKey: "activityAction.employeeUpdated", icon: PencilIcon },
  employee_deleted: { labelKey: "activityAction.employeeDeleted", icon: Trash2Icon },
  rsvp_submitted: { labelKey: "activityAction.rsvpSubmitted", icon: MailCheckIcon },
  feedback_submitted: {
    labelKey: "activityAction.feedbackSubmitted",
    icon: StarIcon,
  },
}
