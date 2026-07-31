import { applyChecklistRules, reorderChecklist } from "@/lib/checklist"
import {
  detachTask,
  linkDependency,
  unlinkDependency,
} from "@/lib/dependency"
import type { Task } from "@/types/task"
import type { AppAction, AppState } from "./types"

/**
 * แก้ไขงานหนึ่งงานแล้วให้กฎ Checklist ทำงานทุกครั้ง
 * เพื่อไม่ให้สถานะงานกับ Checklist ขัดแย้งกันเอง
 */
function updateTask(
  tasks: Task[],
  taskId: string,
  updater: (task: Task) => Task
): Task[] {
  return tasks.map((task) =>
    task.id === taskId ? applyChecklistRules(updater(task)) : task
  )
}

/**
 * Reducer หลักของ EventFlow
 *
 * รองรับ domain `auth`, `system`, `event`, `activity` และ `notification` แล้ว
 * Phase ถัด ๆ ไปจะเพิ่ม case ของ task / timeline / file / participant / comment
 */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    /* ---- Auth ---- */
    case "auth/signIn":
      return {
        ...state,
        session: {
          userId: action.userId,
          rememberMe: action.rememberMe,
          signedInAt: action.at,
        },
      }

    case "auth/signOut":
      return { ...state, session: null }

    case "auth/switchUser":
      return state.session
        ? { ...state, session: { ...state.session, userId: action.userId } }
        : state

    /* ---- Event ---- */
    case "event/create":
      return { ...state, events: [action.event, ...state.events] }

    case "event/update":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.id
            ? {
                ...event,
                ...action.changes,
                updatedAt: action.at,
                updatedBy: action.by,
              }
            : event
        ),
      }

    case "event/delete":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.id
            ? { ...event, deletedAt: action.at, deletedBy: action.by }
            : event
        ),
      }

    case "event/restore":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.id
            ? { ...event, deletedAt: null, deletedBy: null }
            : event
        ),
      }

    case "event/duplicate":
      return {
        ...state,
        events: [action.event, ...state.events],
        tasks: [...state.tasks, ...action.tasks],
        timeline: [...state.timeline, ...action.timeline],
        fileCategories: [...state.fileCategories, ...action.fileCategories],
      }

    /* ---- Task ---- */
    case "task/create":
      return { ...state, tasks: [...state.tasks, action.task] }

    case "task/update":
      return {
        ...state,
        tasks: updateTask(state.tasks, action.id, (task) => ({
          ...task,
          ...action.changes,
          updatedAt: action.at,
          updatedBy: action.by,
        })),
      }

    case "task/setStatus":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? {
                ...task,
                status: action.status,
                updatedAt: action.at,
                updatedBy: action.by,
              }
            : task
        ),
      }

    case "task/delete":
      return { ...state, tasks: detachTask(state.tasks, action.id) }

    case "task/addChecklistItem":
      return {
        ...state,
        tasks: updateTask(state.tasks, action.taskId, (task) => ({
          ...task,
          checklist: [...task.checklist, action.item],
        })),
      }

    case "task/updateChecklistItem":
      return {
        ...state,
        tasks: updateTask(state.tasks, action.taskId, (task) => ({
          ...task,
          checklist: task.checklist.map((item) =>
            item.id === action.itemId ? { ...item, ...action.changes } : item
          ),
        })),
      }

    case "task/removeChecklistItem":
      return {
        ...state,
        tasks: updateTask(state.tasks, action.taskId, (task) => ({
          ...task,
          checklist: task.checklist.filter((item) => item.id !== action.itemId),
        })),
      }

    case "task/reorderChecklist":
      return {
        ...state,
        tasks: updateTask(state.tasks, action.taskId, (task) => ({
          ...task,
          checklist: reorderChecklist(task.checklist, action.orderedIds),
        })),
      }

    case "task/addDependency":
      return {
        ...state,
        tasks: linkDependency(state.tasks, action.taskId, action.dependencyId),
      }

    case "task/removeDependency":
      return {
        ...state,
        tasks: unlinkDependency(state.tasks, action.taskId, action.dependencyId),
      }

    case "task/overrideBlock":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId ? { ...task, blockOverridden: true } : task
        ),
      }

    /* ---- Activity & Notification ---- */
    case "activity/add":
      return {
        ...state,
        activities: [...action.activities, ...state.activities],
      }

    case "notification/add":
      return {
        ...state,
        notifications: [...action.notifications, ...state.notifications],
      }

    case "notification/markRead": {
      const ids = new Set(action.ids)
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          ids.has(notification.id)
            ? { ...notification, isRead: true }
            : notification
        ),
      }
    }

    case "notification/markAllRead":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.userId === action.userId
            ? { ...notification, isRead: true }
            : notification
        ),
      }

    case "notification/updateSettings":
      return {
        ...state,
        notificationSettings: {
          ...state.notificationSettings,
          [action.userId]: {
            ...state.notificationSettings[action.userId],
            ...action.settings,
          },
        },
      }

    /* ---- System ---- */
    case "system/reset":
      return action.state

    default:
      return state
  }
}
