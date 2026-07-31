"use client"

import * as React from "react"

import { SimulatedError, simulateDelay } from "@/lib/async"

/** สถานะหน้าจอที่ผู้ทดสอบสามารถบังคับให้แสดงได้ */
export type ForcedScreenState = "normal" | "loading" | "empty" | "error"

interface DemoContextValue {
  forcedState: ForcedScreenState
  setForcedState: (state: ForcedScreenState) => void
  failNextAction: boolean
  setFailNextAction: (value: boolean) => void
  slowNetwork: boolean
  setSlowNetwork: (value: boolean) => void
  /**
   * หน่วงเวลาจำลอง แล้วโยน SimulatedError หากผู้ทดสอบสั่งให้ action ถัดไปล้มเหลว
   * (ธงจะถูกล้างอัตโนมัติหลังใช้งานหนึ่งครั้ง)
   */
  simulate: () => Promise<void>
}

const DemoContext = React.createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [forcedState, setForcedState] =
    React.useState<ForcedScreenState>("normal")
  const [failNextAction, setFailNextAction] = React.useState(false)
  const [slowNetwork, setSlowNetwork] = React.useState(false)

  const simulate = React.useCallback(async () => {
    if (slowNetwork) {
      await simulateDelay(1800, 2600)
    } else {
      await simulateDelay()
    }
    if (failNextAction) {
      setFailNextAction(false)
      throw new SimulatedError()
    }
  }, [failNextAction, slowNetwork])

  const value = React.useMemo<DemoContextValue>(
    () => ({
      forcedState,
      setForcedState,
      failNextAction,
      setFailNextAction,
      slowNetwork,
      setSlowNetwork,
      simulate,
    }),
    [forcedState, failNextAction, slowNetwork, simulate]
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoContextValue {
  const context = React.useContext(DemoContext)
  if (!context) {
    throw new Error("useDemo must be used within <DemoProvider>")
  }
  return context
}
