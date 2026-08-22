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
import { useAppDispatch, useCurrentUser } from "@/store"
import type { Comment, CommentAttachment } from "@/types/comment"
import type { Task } from "@/types/task"

export interface NewCommentInput {
  body: string
  parentId: string | null
  mentionIds: string[]
  attachments: CommentAttachment[]
}

/**
 * การกระทำกับความคิดเห็น
 * การ mention สร้างการแจ้งเตือนถึงผู้ถูกกล่าวถึงทันที (ผ่าน useNotify ซึ่งเคารพ settings)
 */
export function useCommentActions(task: Task) {
  const { t } = useLocale()
  const dispatch = useAppDispatch()
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const logActivity = useActivityLog()
  const notify = useNotify()

  const save = React.useCallback(async () => {
    try {
      await demo.simulate()
      return true
    } catch {
      appToast.error(t("common.saveFailed"))
      return false
    }
  }, [demo, t])

  const addComment = React.useCallback(
    async (input: NewCommentInput) => {
      if (!currentUser || !(await save())) return false

      const at = nowIso()
      const comment: Comment = {
        id: newId("c"),
        taskId: task.id,
        authorId: currentUser.id,
        body: { th: input.body, en: input.body },
        parentId: input.parentId,
        mentionIds: input.mentionIds,
        attachments: input.attachments,
        reactions: [],
        createdAt: at,
        updatedAt: null,
        isEdited: false,
      }

      dispatch({ type: "comment/add", comment })

      logActivity({
        action: "comment_added",
        targetType: "comment",
        targetId: comment.id,
        targetName: task.title,
        eventId: task.eventId,
        before: null,
        after: null,
        createdAt: at,
      })
      if (input.mentionIds.length > 0) {
        logActivity({
          action: "comment_mentioned",
          targetType: "comment",
          targetId: comment.id,
          targetName: task.title,
          eventId: task.eventId,
          before: null,
          after: null,
          createdAt: at,
        })
        notify(
          {
            type: "mentioned",
            title: {
              th: "มีคนกล่าวถึงคุณในความคิดเห็น",
              en: "You were mentioned in a comment",
            },
            body: task.title,
            href: ROUTES.myTasks,
            eventId: task.eventId,
            createdAt: at,
            actorId: currentUser.id,
          },
          input.mentionIds
        )
      }

      appToast.success(t("comment.added"))
      return true
    },
    [currentUser, dispatch, logActivity, notify, save, t, task]
  )

  const updateComment = React.useCallback(
    async (comment: Comment, body: string) => {
      if (!currentUser || !(await save())) return false

      dispatch({
        type: "comment/update",
        id: comment.id,
        body: { th: body, en: body },
        at: nowIso(),
      })
      appToast.success(t("comment.updated"))
      return true
    },
    [currentUser, dispatch, save, t]
  )

  const deleteComment = React.useCallback(
    async (comment: Comment) => {
      if (!currentUser || !(await save())) return false

      dispatch({ type: "comment/delete", id: comment.id })
      appToast.delete(t("comment.deleted"))
      return true
    },
    [currentUser, dispatch, save, t]
  )

  /** Reaction เป็น Auto Save — ไม่มี dialog ไม่มี toast */
  const react = React.useCallback(
    (comment: Comment, emoji: string) => {
      if (!currentUser) return
      dispatch({
        type: "comment/react",
        id: comment.id,
        emoji,
        userId: currentUser.id,
      })
    },
    [currentUser, dispatch]
  )

  return { addComment, updateComment, deleteComment, react }
}
