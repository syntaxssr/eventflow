"use client"

import * as React from "react"

import { createInitialState } from "@/mock"
import type { User } from "@/types"
import { appReducer } from "./reducer"
import { readStoredSession, writeStoredSession } from "./session-storage"
import type { AppAction, AppState } from "./types"

const StateContext = React.createContext<AppState | null>(null)
const DispatchContext = React.createContext<React.Dispatch<AppAction> | null>(
  null
)
export function AppStoreProvider({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: AppState
}) {
  const [state, dispatch] = React.useReducer(
    appReducer,
    initialState,
    (preset) => preset ?? createInitialState()
  )
  const users = state.users
  const hydrated = state.sessionHydrated
  const session = state.session

  /**
   * อ่าน Web Storage ได้เฉพาะหลัง mount เท่านั้น ถ้าอ่านตอน init ของ
   * useReducer จะทำให้ HTML ฝั่ง server กับ client ไม่ตรงกัน
   */
  React.useEffect(() => {
    if (hydrated) return
    const stored = readStoredSession()
    // ผู้ใช้อาจถูกลบไปแล้วระหว่างนั้น — กู้เฉพาะที่ยังมีตัวตนจริง
    const usable =
      stored && users.some((user) => user.id === stored.userId) ? stored : null
    dispatch({ type: "auth/hydrate", session: usable })
  }, [hydrated, users])

  React.useEffect(() => {
    // ก่อน hydrate เสร็จ session ยังเป็น null เสมอ ถ้าเขียนตอนนี้จะไปล้างค่า
    // ที่เพิ่งตั้งใจจะกู้มาทิ้ง
    if (!hydrated) return
    writeStoredSession(session)
  }, [hydrated, session])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

/** true เมื่อพยายามกู้ session ที่จดจำไว้เสร็จแล้ว (สำเร็จหรือไม่ก็ตาม) */
export function useSessionHydrated(): boolean {
  return useAppState().sessionHydrated
}

export function useAppState(): AppState {
  const state = React.useContext(StateContext)
  if (!state) {
    throw new Error("useAppState must be used within <AppStoreProvider>")
  }
  return state
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  const dispatch = React.useContext(DispatchContext)
  if (!dispatch) {
    throw new Error("useAppDispatch must be used within <AppStoreProvider>")
  }
  return dispatch
}

/** เลือกข้อมูลบางส่วนจาก state */
export function useAppSelector<T>(selector: (state: AppState) => T): T {
  return selector(useAppState())
}

/** ผู้ใช้ที่กำลังใช้งานอยู่ (null เมื่อยังไม่ได้เข้าสู่ระบบ) */
export function useCurrentUser(): User | null {
  const state = useAppState()
  if (!state.session) return null
  return state.users.find((user) => user.id === state.session?.userId) ?? null
}

/**
 * รีเซ็ตข้อมูลกลับเป็น Mock Data เริ่มต้น
 * คง session ปัจจุบันไว้เพื่อให้ทดลองใช้งานต่อได้โดยไม่ต้อง login ใหม่
 */
export function useResetStore(): () => void {
  const dispatch = useAppDispatch()
  const state = useAppState()
  return React.useCallback(() => {
    dispatch({
      type: "system/reset",
      state: {
        ...createInitialState(),
        session: state.session,
        sessionHydrated: state.sessionHydrated,
      },
    })
  }, [dispatch, state.session, state.sessionHydrated])
}
