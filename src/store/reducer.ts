import type { AppAction, AppState } from "./types"

/**
 * Reducer หลักของ EventFlow
 *
 * Phase 0 รองรับ domain `auth` และ `system` ก่อน
 * Phase ถัด ๆ ไปจะเพิ่ม case ของ event / task / timeline / file /
 * participant / comment / notification / activity ตามลำดับการพัฒนา
 */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
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

    case "system/reset":
      return action.state

    default:
      return state
  }
}
