"use client"

import * as React from "react"
import { toast } from "sonner"

import { useDemo } from "@/components/dev/demo-provider"
import { ROUTES } from "@/constants/app"
import { useActivityLog } from "@/hooks/use-activity-log"
import { useLocale } from "@/i18n"
import { nowIso } from "@/lib/clock"
import { newId } from "@/lib/id"
import { currentVersion } from "@/lib/file"
import { useAppDispatch, useAppState, useCurrentUser } from "@/store"
import type { LocalizedText } from "@/types/common"
import type { FileItem, FileType, FileVersion } from "@/types/file"
import type { NotificationType } from "@/types/notification"

export interface NewFileInput {
  name: string
  size: number
  type: FileType
  eventId: string
  categoryId: string
  /** URL ชั่วคราวจาก `URL.createObjectURL` สำหรับพรีวิวรูปภาพจริง */
  previewUrl: string | null
}

/**
 * การกระทำกับไฟล์ทั้งหมด
 * ทุกอย่างบันทึกประวัติ และการเปลี่ยนแปลงที่คนอื่นควรรู้จะสร้างการแจ้งเตือน
 */
export function useFileActions() {
  const { t } = useLocale()
  const dispatch = useAppDispatch()
  const state = useAppState()
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const logActivity = useActivityLog()

  const save = React.useCallback(async () => {
    await demo.simulate()
  }, [demo])

  /** แจ้งทีมที่เกี่ยวข้องกับกิจกรรม ยกเว้นตัวผู้ทำเอง */
  const notifyTeam = React.useCallback(
    (
      file: FileItem,
      type: NotificationType,
      title: LocalizedText,
      at: string
    ) => {
      if (!currentUser) return

      const event = state.events.find((entry) => entry.id === file.eventId)
      const recipients = new Set(
        [event?.ownerId, ...state.files
          .filter((entry) => entry.eventId === file.eventId)
          .map((entry) => entry.uploadedBy)]
          .filter((id): id is string => Boolean(id) && id !== currentUser.id)
      )
      if (recipients.size === 0) return

      dispatch({
        type: "notification/add",
        notifications: [...recipients].map((userId) => ({
          id: newId("n"),
          userId,
          type,
          title,
          body: { th: file.name, en: file.name },
          href: ROUTES.files,
          eventId: file.eventId,
          isRead: false,
          createdAt: at,
          actorId: currentUser.id,
        })),
      })
    },
    [currentUser, dispatch, state.events, state.files]
  )

  const addFile = React.useCallback(
    async (input: NewFileInput) => {
      if (!currentUser) return
      const at = nowIso()
      const fileId = newId("f")

      const version: FileVersion = {
        id: `${fileId}-v1`,
        versionNumber: 1,
        filename: input.name,
        uploadedBy: currentUser.id,
        uploadedAt: at,
        size: input.size,
        changeNote: { th: "อัปโหลดครั้งแรก", en: "Initial upload" },
        previewUrl: input.previewUrl,
      }

      const file: FileItem = {
        id: fileId,
        eventId: input.eventId,
        name: input.name,
        categoryId: input.categoryId,
        type: input.type,
        versions: [version],
        currentVersionId: version.id,
        uploadedBy: currentUser.id,
        uploadedAt: at,
        updatedAt: at,
        updatedBy: currentUser.id,
        deletedAt: null,
        deletedBy: null,
      }

      dispatch({ type: "file/add", file })
      logActivity({
        action: "file_uploaded",
        targetType: "file",
        targetId: file.id,
        targetName: { th: file.name, en: file.name },
        eventId: file.eventId,
        before: null,
        after: null,
        createdAt: at,
      })
    },
    [currentUser, dispatch, logActivity]
  )

  const addVersion = React.useCallback(
    async (
      file: FileItem,
      input: { filename: string; size: number; changeNote: string; previewUrl: string | null }
    ) => {
      if (!currentUser) return
      await save()

      const at = nowIso()
      const nextNumber = file.versions.length + 1
      const version: FileVersion = {
        id: `${file.id}-v${nextNumber}`,
        versionNumber: nextNumber,
        filename: input.filename,
        uploadedBy: currentUser.id,
        uploadedAt: at,
        size: input.size,
        changeNote: { th: input.changeNote, en: input.changeNote },
        previewUrl: input.previewUrl,
      }

      dispatch({ type: "file/addVersion", fileId: file.id, version })
      logActivity({
        action: "file_version_uploaded",
        targetType: "file",
        targetId: file.id,
        targetName: { th: file.name, en: file.name },
        eventId: file.eventId,
        before: {
          th: `เวอร์ชัน ${nextNumber - 1}`,
          en: `Version ${nextNumber - 1}`,
        },
        after: { th: `เวอร์ชัน ${nextNumber}`, en: `Version ${nextNumber}` },
        createdAt: at,
      })
      notifyTeam(
        file,
        "file_new_version",
        {
          th: "มีการอัปโหลดไฟล์เวอร์ชันใหม่",
          en: "A new file version was uploaded",
        },
        at
      )
      toast.success(t("file.versionUploaded"))
    },
    [currentUser, dispatch, logActivity, notifyTeam, save, t]
  )

  const restoreVersionTo = React.useCallback(
    async (file: FileItem, versionId: string) => {
      if (!currentUser) return
      await save()

      const source = file.versions.find((version) => version.id === versionId)
      if (!source) return

      const at = nowIso()
      const nextNumber = file.versions.length + 1
      const version: FileVersion = {
        ...source,
        id: `${file.id}-v${nextNumber}`,
        versionNumber: nextNumber,
        uploadedBy: currentUser.id,
        uploadedAt: at,
        changeNote: {
          th: `กู้คืนจากเวอร์ชัน ${source.versionNumber}`,
          en: `Restored from version ${source.versionNumber}`,
        },
      }

      dispatch({ type: "file/restoreVersion", fileId: file.id, version })
      logActivity({
        action: "file_version_restored",
        targetType: "file",
        targetId: file.id,
        targetName: { th: file.name, en: file.name },
        eventId: file.eventId,
        before: {
          th: `เวอร์ชัน ${currentVersion(file).versionNumber}`,
          en: `Version ${currentVersion(file).versionNumber}`,
        },
        after: { th: `เวอร์ชัน ${nextNumber}`, en: `Version ${nextNumber}` },
        createdAt: at,
      })
      toast.success(t("file.versionRestored"))
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  const renameFile = React.useCallback(
    async (file: FileItem, name: string) => {
      if (!currentUser) return
      await save()

      const at = nowIso()
      dispatch({
        type: "file/update",
        id: file.id,
        changes: { name },
        by: currentUser.id,
        at,
      })
      logActivity({
        action: "file_renamed",
        targetType: "file",
        targetId: file.id,
        targetName: { th: name, en: name },
        eventId: file.eventId,
        before: { th: file.name, en: file.name },
        after: { th: name, en: name },
        createdAt: at,
      })
      toast.success(t("file.renamed"))
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  const moveCategory = React.useCallback(
    async (file: FileItem, categoryId: string) => {
      if (!currentUser) return
      await save()

      const at = nowIso()
      const label = (id: string) =>
        state.fileCategories.find((category) => category.id === id)?.name ?? {
          th: id,
          en: id,
        }

      dispatch({
        type: "file/update",
        id: file.id,
        changes: { categoryId },
        by: currentUser.id,
        at,
      })
      logActivity({
        action: "file_moved",
        targetType: "file",
        targetId: file.id,
        targetName: { th: file.name, en: file.name },
        eventId: file.eventId,
        before: label(file.categoryId),
        after: label(categoryId),
        createdAt: at,
      })
      toast.success(t("file.moved"))
    },
    [currentUser, dispatch, logActivity, save, state.fileCategories, t]
  )

  const moveToTrash = React.useCallback(
    async (file: FileItem) => {
      if (!currentUser) return
      await save()

      const at = nowIso()
      dispatch({ type: "file/moveToTrash", id: file.id, by: currentUser.id, at })
      logActivity({
        action: "file_deleted",
        targetType: "file",
        targetId: file.id,
        targetName: { th: file.name, en: file.name },
        eventId: file.eventId,
        before: null,
        after: { th: "ย้ายไปถังขยะ", en: "Moved to trash" },
        createdAt: at,
      })
      toast.success(t("file.deleted"))
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  const restoreFromTrash = React.useCallback(
    async (file: FileItem) => {
      if (!currentUser) return
      await save()

      dispatch({ type: "file/restore", id: file.id })
      logActivity({
        action: "file_restored",
        targetType: "file",
        targetId: file.id,
        targetName: { th: file.name, en: file.name },
        eventId: file.eventId,
        before: { th: "ถังขยะ", en: "Trash" },
        after: { th: "กู้คืนแล้ว", en: "Restored" },
      })
      toast.success(t("trash.restored"))
    },
    [currentUser, dispatch, logActivity, save, t]
  )

  const purgeFile = React.useCallback(
    async (file: FileItem) => {
      await save()
      dispatch({ type: "file/purge", id: file.id })
      toast.success(t("trash.purged"))
    },
    [dispatch, save, t]
  )

  const addCategory = React.useCallback(
    async (name: string, eventId: string | null) => {
      await save()
      dispatch({
        type: "fileCategory/add",
        category: {
          id: newId("fc"),
          eventId,
          name: { th: name, en: name },
          isDefault: false,
          order: state.fileCategories.length,
        },
      })
      toast.success(t("file.categoryAdded"))
    },
    [dispatch, save, state.fileCategories.length, t]
  )

  return {
    addFile,
    addVersion,
    restoreVersionTo,
    renameFile,
    moveCategory,
    moveToTrash,
    restoreFromTrash,
    purgeFile,
    addCategory,
  }
}
