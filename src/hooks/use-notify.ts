"use client"

import * as React from "react"

import { newId } from "@/lib/id"
import { buildNotifications, type NotificationDraft } from "@/lib/notification"
import { useAppDispatch, useAppState } from "@/store"
import type { Id } from "@/types/common"

/**
 * ส่งการแจ้งเตือนภายในเว็บไซต์
 *
 * จุดยิงการแจ้งเตือนทุกจุดต้องผ่าน hook นี้ เพื่อให้กติกาเหมือนกันหมด:
 * ไม่แจ้งตัวผู้กระทำเอง ไม่แจ้งซ้ำ และเคารพ Notification Settings ของผู้รับ
 */
export function useNotify() {
  const dispatch = useAppDispatch()
  const state = useAppState()
  const settingsByUser = state.notificationSettings

  return React.useCallback(
    (draft: NotificationDraft, recipientIds: Id[]) => {
      const notifications = buildNotifications(
        draft,
        recipientIds,
        settingsByUser,
        () => newId("n")
      )
      if (notifications.length > 0) {
        dispatch({ type: "notification/add", notifications })
      }
    },
    [dispatch, settingsByUser]
  )
}
