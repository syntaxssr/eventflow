import type {
  Activity,
  AuthSession,
  Comment,
  EventItem,
  FileCategory,
  FileItem,
  FileVersion,
  Id,
  Notification,
  NotificationSettings,
  Participant,
  Task,
  TimelineItem,
  User,
} from "@/types"

/**
 * State ทั้งหมดของ Prototype — อยู่ใน memory เท่านั้น
 * refresh หน้าเว็บเมื่อใด ข้อมูลจะกลับไปเป็น Mock Data เริ่มต้นเสมอ
 */
export interface AppState {
  session: AuthSession | null
  users: User[]
  events: EventItem[]
  tasks: Task[]
  timeline: TimelineItem[]
  files: FileItem[]
  fileCategories: FileCategory[]
  participants: Participant[]
  comments: Comment[]
  notifications: Notification[]
  activities: Activity[]
  /** ตั้งค่าการแจ้งเตือนแยกตามผู้ใช้ */
  notificationSettings: Record<Id, NotificationSettings>
}

/* -------------------------------------------------------------------------
   Action — แยกตาม domain
   แต่ละ Phase จะทยอยเพิ่ม case ที่เกี่ยวข้องลงใน reducer
   ------------------------------------------------------------------------- */

export type AuthAction =
  | { type: "auth/signIn"; userId: Id; rememberMe: boolean; at: string }
  | { type: "auth/signOut" }
  | { type: "auth/switchUser"; userId: Id }

export type UserAction = {
  /** เปลี่ยนสี avatar ของผู้ใช้เอง — เลือกได้เฉพาะสีในพาเลต avatar */
  type: "user/setAvatarColor"
  userId: Id
  color: string
}

export type EventAction =
  | { type: "event/create"; event: EventItem }
  | { type: "event/update"; id: Id; changes: Partial<EventItem>; by: Id; at: string }
  | { type: "event/delete"; id: Id; by: Id; at: string }
  | { type: "event/restore"; id: Id }
  | {
      type: "event/duplicate"
      event: EventItem
      tasks: Task[]
      timeline: TimelineItem[]
      fileCategories: FileCategory[]
    }

export type TaskAction =
  | { type: "task/create"; task: Task }
  | { type: "task/update"; id: Id; changes: Partial<Task>; by: Id; at: string }
  | { type: "task/delete"; id: Id }
  | { type: "task/setStatus"; id: Id; status: Task["status"]; by: Id; at: string }
  | { type: "task/addChecklistItem"; taskId: Id; item: Task["checklist"][number] }
  | {
      type: "task/updateChecklistItem"
      taskId: Id
      itemId: Id
      changes: Partial<Task["checklist"][number]>
    }
  | { type: "task/removeChecklistItem"; taskId: Id; itemId: Id }
  | { type: "task/reorderChecklist"; taskId: Id; orderedIds: Id[] }
  | { type: "task/addDependency"; taskId: Id; dependencyId: Id }
  | { type: "task/removeDependency"; taskId: Id; dependencyId: Id }
  | { type: "task/overrideBlock"; taskId: Id }

export type TimelineAction =
  | { type: "timeline/create"; item: TimelineItem }
  | {
      type: "timeline/update"
      id: Id
      changes: Partial<TimelineItem>
      by: Id
      at: string
    }
  | { type: "timeline/delete"; id: Id }
  | { type: "timeline/reorder"; phase: TimelineItem["phase"]; orderedIds: Id[] }

export type FileAction =
  | { type: "file/add"; file: FileItem }
  | { type: "file/update"; id: Id; changes: Partial<FileItem>; by: Id; at: string }
  | { type: "file/moveToTrash"; id: Id; by: Id; at: string }
  | { type: "file/restore"; id: Id }
  | { type: "file/purge"; id: Id }
  | { type: "file/addVersion"; fileId: Id; version: FileVersion }
  | { type: "file/restoreVersion"; fileId: Id; version: FileVersion }
  | { type: "fileCategory/add"; category: FileCategory }
  | { type: "fileCategory/update"; id: Id; changes: Partial<FileCategory> }
  | { type: "fileCategory/delete"; id: Id }

export type ParticipantAction =
  | { type: "participant/add"; participant: Participant }
  | { type: "participant/update"; id: Id; changes: Partial<Participant> }
  | { type: "participant/delete"; ids: Id[] }
  | {
      type: "participant/bulkRsvp"
      ids: Id[]
      rsvpStatus: Participant["rsvpStatus"]
    }
  | { type: "participant/import"; created: Participant[]; updated: Participant[] }

export type CommentAction =
  | { type: "comment/add"; comment: Comment }
  | { type: "comment/update"; id: Id; body: Comment["body"]; at: string }
  | { type: "comment/delete"; id: Id }
  | { type: "comment/react"; id: Id; emoji: string; userId: Id }

export type NotificationAction =
  | { type: "notification/add"; notifications: Notification[] }
  | { type: "notification/markRead"; ids: Id[] }
  | { type: "notification/markAllRead"; userId: Id }
  | {
      type: "notification/updateSettings"
      userId: Id
      settings: Partial<NotificationSettings>
    }

export type ActivityAction = { type: "activity/add"; activities: Activity[] }

export type SystemAction = { type: "system/reset"; state: AppState }

export type AppAction =
  | AuthAction
  | UserAction
  | EventAction
  | TaskAction
  | TimelineAction
  | FileAction
  | ParticipantAction
  | CommentAction
  | NotificationAction
  | ActivityAction
  | SystemAction
