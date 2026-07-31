import type { AppAction, AppState } from "./types"

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
