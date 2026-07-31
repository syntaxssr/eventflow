"use client"

import * as React from "react"

import { nowIso } from "@/lib/clock"
import { newId } from "@/lib/id"
import { useAppDispatch, useCurrentUser } from "@/store"
import type { Activity } from "@/types/activity"

type ActivityInput = Omit<Activity, "id" | "actorId" | "createdAt"> & {
  createdAt?: string
}

/**
 * บันทึกประวัติการใช้งาน
 * ผู้ดำเนินการคือผู้ใช้ที่กำลังเข้าสู่ระบบอยู่เสมอ
 */
export function useActivityLog() {
  const dispatch = useAppDispatch()
  const currentUser = useCurrentUser()

  return React.useCallback(
    (...entries: ActivityInput[]) => {
      if (!currentUser || entries.length === 0) return

      dispatch({
        type: "activity/add",
        activities: entries.map((entry) => ({
          ...entry,
          id: newId("a"),
          actorId: currentUser.id,
          createdAt: entry.createdAt ?? nowIso(),
        })),
      })
    },
    [dispatch, currentUser]
  )
}
