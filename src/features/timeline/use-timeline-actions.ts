"use client"

import * as React from "react"
import { appToast } from "@/lib/gif-toast"

import { useDemo } from "@/components/dev/demo-provider"
import { ROUTES } from "@/constants/app"
import { useActivityLog } from "@/hooks/use-activity-log"
import { useNotify } from "@/hooks/use-notify"
import { useLocale } from "@/i18n"
import { nowIso } from "@/lib/clock"
import { newId } from "@/lib/id"
import { useAppDispatch, useAppState, useCurrentUser } from "@/store"
import type { LocalizedText } from "@/types/common"
import type { TimelineItem } from "@/types/timeline"

/**
 * การกระทำกับรายการไทม์ไลน์
 *
 * การเปลี่ยนวันหรือเวลาถือเป็นการเปลี่ยนกำหนดการที่กระทบทีมงานทั้งหมด
 * จึงบันทึกค่าก่อน–หลังลงประวัติ และแจ้งเตือนผู้ที่เกี่ยวข้องเสมอ
 */
export function useTimelineActions() {
  const { t, tl } = useLocale()
  const dispatch = useAppDispatch()
  const state = useAppState()
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const logActivity = useActivityLog()
  const notify = useNotify()

  const save = React.useCallback(async () => {
    await demo.simulate()
  }, [demo])

  /** แจ้งผู้รับผิดชอบรายการนั้นและเจ้าของกิจกรรม — settings ถูกบังคับใน useNotify */
  const notifyOwners = React.useCallback(
    (item: TimelineItem, body: LocalizedText, at: string) => {
      if (!currentUser) return

      const event = state.events.find((entry) => entry.id === item.eventId)
      notify(
        {
          type: "timeline_changed",
          title: {
            th: t("timeline.notificationTitle"),
            en: t("timeline.notificationTitle"),
          },
          body,
          href: ROUTES.timeline,
          eventId: item.eventId,
          createdAt: at,
          actorId: currentUser.id,
        },
        [...item.ownerIds, ...(event?.ownerId ? [event.ownerId] : [])]
      )
    },
    [currentUser, notify, state.events, t]
  )

  const createItem = React.useCallback(
    async (item: Omit<TimelineItem, "id" | keyof AuditKeys>) => {
      if (!currentUser) return
      await save()

      const at = nowIso()
      const newItem: TimelineItem = {
        ...item,
        id: newId("tl"),
        createdAt: at,
        createdBy: currentUser.id,
        updatedAt: at,
        updatedBy: currentUser.id,
      }

      dispatch({ type: "timeline/create", item: newItem })
      logActivity({
        action: "timeline_created",
        targetType: "timeline",
        targetId: newItem.id,
        targetName: newItem.title,
        eventId: newItem.eventId,
        before: null,
        after: null,
        createdAt: at,
      })
      appToast.success(t("timeline.created"))
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  const updateItem = React.useCallback(
    async (
      item: TimelineItem,
      changes: Partial<TimelineItem>,
      options: { before?: LocalizedText; after?: LocalizedText } = {}
    ) => {
      if (!currentUser) return
      await save()

      const at = nowIso()
      dispatch({
        type: "timeline/update",
        id: item.id,
        changes,
        by: currentUser.id,
        at,
      })
      logActivity({
        action: "timeline_updated",
        targetType: "timeline",
        targetId: item.id,
        targetName: item.title,
        eventId: item.eventId,
        before: options.before ?? null,
        after: options.after ?? null,
        createdAt: at,
      })

      // แจ้งเตือนเฉพาะเมื่อกำหนดการจริง ๆ เปลี่ยน ไม่ใช่ทุกการแก้ไขเล็กน้อย
      if (options.before && options.after) {
        notifyOwners(
          item,
          {
            th: `${tl(item.title)} · ${options.before.th} → ${options.after.th}`,
            en: `${tl(item.title)} · ${options.before.en} → ${options.after.en}`,
          },
          at
        )
      }
    },
    [currentUser, dispatch, logActivity, notifyOwners, save, tl]
  )

  const deleteItem = React.useCallback(
    async (item: TimelineItem) => {
      if (!currentUser) return
      await save()

      const at = nowIso()
      dispatch({ type: "timeline/delete", id: item.id })
      logActivity({
        action: "timeline_deleted",
        targetType: "timeline",
        targetId: item.id,
        targetName: item.title,
        eventId: item.eventId,
        before: null,
        after: null,
        createdAt: at,
      })
      appToast.delete(t("timeline.deleted"))
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  const reorder = React.useCallback(
    async (item: TimelineItem, orderedIds: string[]) => {
      await save()
      dispatch({
        type: "timeline/reorder",
        phase: item.phase,
        orderedIds,
      })
    },
    [dispatch, save]
  )

  return { createItem, updateItem, deleteItem, reorder }
}

type AuditKeys = {
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}
