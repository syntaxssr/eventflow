"use client"

import * as React from "react"
import {
  CheckIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { useDemo } from "@/components/dev/demo-provider"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FILE_TYPE_STYLE } from "@/constants/file-type"
import { useLocale } from "@/i18n"
import { delay } from "@/lib/async"
import { formatFileSize } from "@/lib/format"
import { validateFile } from "@/lib/file"
import { newId } from "@/lib/id"
import { cn } from "@/lib/utils"
import type { UploadTask } from "@/types/file"
import { useFileActions } from "./use-file-actions"

/** ไฟล์ที่เลือกไว้ เก็บคู่กับ task เพื่อให้กด "ลองใหม่" ได้ */
interface PendingUpload {
  task: UploadTask
  file: File
}

/**
 * โซนอัปโหลดไฟล์
 *
 * รองรับทั้งการลากมาวางและเลือกจากเครื่อง อัปโหลดพร้อมกันได้หลายไฟล์
 * ความคืบหน้าเป็นการจำลอง (ไม่มี Backend) แต่ยกเลิกและลองใหม่ได้จริง
 */
export function FileUploadZone({
  eventId,
  categoryId,
}: {
  eventId: string
  categoryId: string
}) {
  const { t, locale } = useLocale()
  const actions = useFileActions()
  const demo = useDemo()

  const inputRef = React.useRef<HTMLInputElement>(null)
  const cancelledRef = React.useRef(new Set<string>())
  const [dragging, setDragging] = React.useState(false)
  const [uploads, setUploads] = React.useState<PendingUpload[]>([])

  const patch = React.useCallback(
    (id: string, changes: Partial<UploadTask>) => {
      setUploads((current) =>
        current.map((entry) =>
          entry.task.id === id
            ? { ...entry, task: { ...entry.task, ...changes } }
            : entry
        )
      )
    },
    []
  )

  const runUpload = React.useCallback(
    async (upload: PendingUpload) => {
      const { task, file } = upload
      cancelledRef.current.delete(task.id)
      patch(task.id, { status: "uploading", progress: 0, errorKey: null })

      for (let progress = 10; progress <= 100; progress += 10) {
        await delay(70)
        if (cancelledRef.current.has(task.id)) {
          patch(task.id, { status: "cancelled" })
          return
        }
        patch(task.id, { progress })
      }

      try {
        await demo.simulate()
      } catch {
        patch(task.id, { status: "failed", errorKey: "file.uploadFailed" })
        return
      }

      // รูปภาพใช้ URL ชั่วคราวของไฟล์จริง จึงพรีวิวได้เหมือนของจริง
      const previewUrl =
        task.type === "image" ? URL.createObjectURL(file) : null

      await actions.addFile({
        name: file.name,
        size: file.size,
        type: task.type!,
        eventId,
        categoryId,
        previewUrl,
      })

      patch(task.id, { status: "success", progress: 100 })
    },
    [actions, categoryId, demo, eventId, patch]
  )

  const acceptFiles = React.useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return

      const accepted: PendingUpload[] = []

      for (const file of Array.from(fileList)) {
        const validation = validateFile(file)

        if (!validation.valid) {
          toast.error(
            validation.error === "too_large"
              ? t("file.tooLarge", {
                  name: file.name,
                  size: formatFileSize(file.size, locale),
                })
              : t("file.unsupportedType", { name: file.name })
          )
          continue
        }

        accepted.push({
          file,
          task: {
            id: newId("up"),
            filename: file.name,
            size: file.size,
            type: validation.type ?? null,
            progress: 0,
            status: "queued",
            errorKey: null,
          },
        })
      }

      if (accepted.length === 0) return

      setUploads((current) => [...current, ...accepted])
      for (const upload of accepted) {
        void runUpload(upload)
      }
    },
    [locale, runUpload, t]
  )

  const successCount = uploads.filter(
    (entry) => entry.task.status === "success"
  ).length

  React.useEffect(() => {
    if (successCount > 0) {
      toast.success(t("file.uploaded"))
    }
    // แจ้งครั้งเดียวต่อจำนวนที่สำเร็จเพิ่มขึ้น
  }, [successCount, t])

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          acceptFiles(event.dataTransfer.files)
        }}
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragging ? "border-brand-500 bg-brand-50/60" : "border-border"
        )}
        data-testid="upload-zone"
      >
        <UploadIcon
          className="text-muted-foreground mx-auto mb-2 size-7"
          aria-hidden="true"
        />
        <p className="text-sm font-medium">{t("file.uploadZoneTitle")}</p>
        <p className="text-muted-foreground mx-auto mt-1 max-w-md text-xs text-pretty">
          {t("file.uploadZoneHint")}
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          aria-label={t("file.browse")}
          data-testid="file-input"
          onChange={(event) => {
            acceptFiles(event.target.files)
            event.target.value = ""
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
        >
          {t("file.browse")}
        </Button>
      </div>

      {uploads.length > 0 ? (
        <ul className="space-y-2" data-testid="upload-list">
          {uploads.map(({ task }) => {
            const style = task.type ? FILE_TYPE_STYLE[task.type] : null
            const Icon = style?.icon

            return (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-lg border p-2.5"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    style?.tile ?? "bg-muted"
                  )}
                  aria-hidden="true"
                >
                  {Icon ? <Icon className="size-4" /> : null}
                </span>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {task.filename}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatFileSize(task.size, locale)}
                    </span>
                  </div>

                  {task.status === "uploading" || task.status === "queued" ? (
                    <Progress
                      value={task.progress}
                      aria-label={t("file.uploading")}
                    />
                  ) : (
                    <p
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        task.status === "success" && "text-foreground",
                        task.status === "failed" && "text-destructive",
                        task.status === "cancelled" && "text-muted-foreground"
                      )}
                    >
                      {task.status === "success" ? (
                        <>
                          <CheckIcon className="size-3.5" aria-hidden="true" />
                          {t("file.uploadSuccess")}
                        </>
                      ) : task.status === "failed" ? (
                        <>
                          <TriangleAlertIcon
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          {t("file.uploadFailed")}
                        </>
                      ) : (
                        t("file.uploadCancelled")
                      )}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {task.status === "uploading" || task.status === "queued" ? (
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label={`${t("file.cancel")}: ${task.filename}`}
                      onClick={() => {
                        cancelledRef.current.add(task.id)
                      }}
                    >
                      <XIcon className="size-3.5" aria-hidden="true" />
                    </Button>
                  ) : null}

                  {task.status === "failed" || task.status === "cancelled" ? (
                    <Button
                      size="xs"
                      variant="outline"
                      data-testid="upload-retry"
                      onClick={() => {
                        const upload = uploads.find(
                          (entry) => entry.task.id === task.id
                        )
                        if (upload) void runUpload(upload)
                      }}
                    >
                      <RotateCcwIcon className="size-3" aria-hidden="true" />
                      {t("file.retry")}
                    </Button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
