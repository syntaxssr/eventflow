import type { Id, IsoDateTime, LocalizedText } from "./common"

export const ACTIVITY_ACTIONS = [
  "event_created",
  "event_updated",
  "event_status_changed",
  "event_duplicated",
  "event_deleted",
  "task_created",
  "task_updated",
  "task_status_changed",
  "task_deleted",
  "checklist_added",
  "checklist_completed",
  "file_uploaded",
  "file_renamed",
  "file_moved",
  "file_version_uploaded",
  "file_version_restored",
  "file_deleted",
  "file_restored",
  "timeline_created",
  "timeline_updated",
  "timeline_deleted",
  "participant_added",
  "participant_updated",
  "participant_deleted",
  "participant_rsvp_changed",
  "participant_imported",
  "participant_conflict_resolved",
  "comment_added",
  "comment_mentioned",
] as const

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number]

export type ActivityTargetType =
  | "event"
  | "task"
  | "checklist"
  | "file"
  | "timeline"
  | "participant"
  | "comment"

export interface Activity {
  id: Id
  actorId: Id
  action: ActivityAction
  targetType: ActivityTargetType
  targetId: Id
  targetName: LocalizedText
  eventId: Id | null
  createdAt: IsoDateTime
  /** สรุปค่าก่อน–หลัง เมื่อเหมาะสม */
  before: LocalizedText | null
  after: LocalizedText | null
}
