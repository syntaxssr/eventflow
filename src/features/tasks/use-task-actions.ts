"use client"

import * as React from "react"
import { toast } from "sonner"

import { useDemo } from "@/components/dev/demo-provider"
import { ROUTES } from "@/constants/app"
import { TASK_STATUS_STYLE } from "@/constants/status"
import { useActivityLog } from "@/hooks/use-activity-log"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { nowIso } from "@/lib/clock"
import { newId } from "@/lib/id"
import { useAppDispatch, useCurrentUser } from "@/store"
import type { LocalizedText } from "@/types/common"
import type { ChecklistItem, Task, TaskStatus } from "@/types/task"

/**
 * รวมการกระทำกับงานย่อยไว้ที่เดียว
 *
 * ทุกฟังก์ชันจำลองความหน่วงของการบันทึก บันทึกประวัติการใช้งาน
 * และแจ้งผลให้ผู้ใช้ทราบเสมอ เพื่อให้พฤติกรรมเหมือนกันทุกมุมมอง
 */
export function useTaskActions() {
  const { t, tl } = useLocale()
  const dispatch = useAppDispatch()
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const logActivity = useActivityLog()

  const statusLabel = React.useCallback(
    (status: TaskStatus): LocalizedText => {
      const label = t(TASK_STATUS_STYLE[status].labelKey as TranslationKey)
      return { th: label, en: label }
    },
    [t]
  )

  /** จำลองการบันทึก — โยน error เมื่อผู้ทดสอบสั่งให้ action ถัดไปล้มเหลว */
  const save = React.useCallback(async () => {
    await demo.simulate()
  }, [demo])

  const setStatus = React.useCallback(
    async (task: Task, status: TaskStatus) => {
      if (!currentUser || task.status === status) return
      await save()

      const at = nowIso()
      dispatch({ type: "task/setStatus", id: task.id, status, by: currentUser.id, at })
      logActivity({
        action: "task_status_changed",
        targetType: "task",
        targetId: task.id,
        targetName: task.title,
        eventId: task.eventId,
        before: statusLabel(task.status),
        after: statusLabel(status),
        createdAt: at,
      })
    },
    [currentUser, dispatch, logActivity, save, statusLabel]
  )

  /**
   * ติ๊ก/ยกเลิกรายการตรวจสอบ
   *
   * ที่นี่แค่บันทึกการติ๊ก — การเปลี่ยนสถานะงานเป็นหน้าที่ของ reducer
   * และการแจ้งผู้ใช้เป็นหน้าที่ของ `useChecklistStatusEffects` ซึ่งเฝ้าดู
   * สถานะจริงที่เปลี่ยนไป จึงไม่พลาดแม้ผู้ใช้ติ๊กรัวจนข้อมูลใน props ยังไม่ทันอัปเดต
   */
  const toggleChecklistItem = React.useCallback(
    async (task: Task, itemId: string, done: boolean) => {
      await save()
      dispatch({
        type: "task/updateChecklistItem",
        taskId: task.id,
        itemId,
        changes: { done },
      })
    },
    [dispatch, save]
  )

  /**
   * แจ้งเตือนและบันทึกประวัติเมื่อสถานะงานถูกเปลี่ยนโดยกฎของ Checklist
   * เรียกจากคอมโพเนนต์ที่แสดง Checklist อยู่
   */
  const reportChecklistStatusChange = React.useCallback(
    (task: Task, previousStatus: TaskStatus) => {
      if (!currentUser) return

      if (task.status === "completed") {
        logActivity(
          {
            action: "checklist_completed",
            targetType: "checklist",
            targetId: task.id,
            targetName: task.title,
            eventId: task.eventId,
            before: null,
            after: null,
          },
          {
            action: "task_status_changed",
            targetType: "task",
            targetId: task.id,
            targetName: task.title,
            eventId: task.eventId,
            before: statusLabel(previousStatus),
            after: statusLabel("completed"),
          }
        )

        dispatch({
          type: "notification/add",
          notifications: task.assigneeIds.map((userId) => ({
            id: newId("n"),
            userId,
            type: "checklist_completed" as const,
            title: {
              th: "รายการตรวจสอบครบทุกข้อแล้ว",
              en: "A checklist is now complete",
            },
            body: task.title,
            href: ROUTES.myTasks,
            eventId: task.eventId,
            isRead: false,
            createdAt: nowIso(),
            actorId: currentUser.id,
          })),
        })

        toast.success(t("task.autoCompleted"))
        return
      }

      logActivity({
        action: "task_status_changed",
        targetType: "task",
        targetId: task.id,
        targetName: task.title,
        eventId: task.eventId,
        before: statusLabel(previousStatus),
        after: statusLabel(task.status),
      })
      toast.info(t("task.autoReopened"))
    },
    [currentUser, dispatch, logActivity, statusLabel, t]
  )

  const addChecklistItem = React.useCallback(
    async (task: Task, label: string) => {
      if (!currentUser) return
      await save()

      const item: ChecklistItem = {
        id: newId(`${task.id}-c`),
        label: { th: label, en: label },
        done: false,
        order: task.checklist.length,
      }

      dispatch({ type: "task/addChecklistItem", taskId: task.id, item })
      logActivity({
        action: "checklist_added",
        targetType: "checklist",
        targetId: task.id,
        targetName: task.title,
        eventId: task.eventId,
        before: null,
        after: { th: label, en: label },
      })
    },
    [currentUser, dispatch, logActivity, save]
  )

  const renameChecklistItem = React.useCallback(
    async (task: Task, itemId: string, label: string) => {
      await save()
      dispatch({
        type: "task/updateChecklistItem",
        taskId: task.id,
        itemId,
        changes: { label: { th: label, en: label } },
      })
    },
    [dispatch, save]
  )

  const removeChecklistItem = React.useCallback(
    async (task: Task, itemId: string) => {
      await save()
      dispatch({ type: "task/removeChecklistItem", taskId: task.id, itemId })
    },
    [dispatch, save]
  )

  const reorderChecklist = React.useCallback(
    async (task: Task, orderedIds: string[]) => {
      await save()
      dispatch({ type: "task/reorderChecklist", taskId: task.id, orderedIds })
    },
    [dispatch, save]
  )

  const addDependency = React.useCallback(
    async (task: Task, dependencyId: string) => {
      await save()
      dispatch({ type: "task/addDependency", taskId: task.id, dependencyId })
      toast.success(t("task.dependencyAdded"))
    },
    [dispatch, save, t]
  )

  const removeDependency = React.useCallback(
    async (task: Task, dependencyId: string) => {
      await save()
      dispatch({ type: "task/removeDependency", taskId: task.id, dependencyId })
      toast.success(t("task.dependencyRemoved"))
    },
    [dispatch, save, t]
  )

  const overrideBlock = React.useCallback(
    (task: Task) => {
      dispatch({ type: "task/overrideBlock", taskId: task.id })
    },
    [dispatch]
  )

  const deleteTask = React.useCallback(
    async (task: Task) => {
      if (!currentUser) return
      await save()

      dispatch({ type: "task/delete", id: task.id })
      logActivity({
        action: "task_deleted",
        targetType: "task",
        targetId: task.id,
        targetName: task.title,
        eventId: task.eventId,
        before: null,
        after: null,
      })
      toast.success(t("task.deleted"))
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  return {
    tl,
    setStatus,
    toggleChecklistItem,
    reportChecklistStatusChange,
    addChecklistItem,
    renameChecklistItem,
    removeChecklistItem,
    reorderChecklist,
    addDependency,
    removeDependency,
    overrideBlock,
    deleteTask,
  }
}
