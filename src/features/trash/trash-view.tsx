"use client"

import * as React from "react"
import { RotateCcwIcon, Trash2Icon } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { PageContainer, PageHeader } from "@/components/common/page-header"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FILE_TYPE_STYLE } from "@/constants/file-type"
import { useFileActions } from "@/features/files/use-file-actions"
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import { isExpiringSoon, trashDaysRemaining } from "@/lib/file"
import { formatDateTime } from "@/lib/format"
import { getFullName } from "@/lib/user"
import { cn } from "@/lib/utils"
import { useAppState } from "@/store"
import { selectTrashedFiles } from "@/store/selectors"
import type { FileItem } from "@/types/file"

/**
 * ถังขยะ — ไฟล์ที่ถูกลบจะอยู่ที่นี่ 30 วันก่อนถูกลบถาวร
 * นับถอยหลังจาก MOCK_TODAY เพื่อให้ตัวเลขคงที่ทุกครั้งที่เปิด
 */
export function TrashView() {
  const { t, tl, locale } = useLocale()
  const state = useAppState()
  const actions = useFileActions()

  const [restoreTarget, setRestoreTarget] = React.useState<FileItem | null>(null)
  const [purgeTarget, setPurgeTarget] = React.useState<FileItem | null>(null)

  const files = React.useMemo(() => {
    return selectTrashedFiles(state).sort((a, b) =>
      (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "")
    )
  }, [state])

  const usersById = React.useMemo(
    () => new Map(state.users.map((user) => [user.id, user])),
    [state.users]
  )
  const eventsById = React.useMemo(
    () => new Map(state.events.map((event) => [event.id, event])),
    [state.events]
  )

  const { state: pageState, retry } = usePageState(files.length === 0)

  const header = (
    <PageHeader title={t("nav.trash")} description={t("trash.subtitle")} />
  )

  if (pageState === "error") {
    return (
      <PageContainer>
        {header}
        <ErrorState onRetry={retry} />
      </PageContainer>
    )
  }

  if (pageState === "loading") {
    return (
      <PageContainer>
        {header}
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    )
  }

  if (files.length === 0) {
    return (
      <PageContainer>
        {header}
        <EmptyState
          icon={Trash2Icon}
          title={t("trash.emptyTitle")}
          description={t("trash.emptyDescription")}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {header}

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {t("trash.resultCount", { count: files.length })}
      </p>

      <div className="overflow-x-auto rounded-lg border" data-testid="trash-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-56">{t("file.newName")}</TableHead>
              <TableHead className="min-w-24">{t("file.fileType")}</TableHead>
              <TableHead className="min-w-40">{t("task.event")}</TableHead>
              <TableHead className="min-w-36">{t("trash.deletedBy")}</TableHead>
              <TableHead className="min-w-40">{t("trash.deletedAt")}</TableHead>
              <TableHead className="min-w-32">
                {t("trash.daysRemainingHeader")}
              </TableHead>
              <TableHead className="min-w-44 text-right">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => {
              const remaining = trashDaysRemaining(file) ?? 0
              const expiring = isExpiringSoon(file)
              const deleter = file.deletedBy
                ? usersById.get(file.deletedBy)
                : undefined
              const event = eventsById.get(file.eventId)

              return (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell className="text-sm">
                    {FILE_TYPE_STYLE[file.type].label}
                  </TableCell>
                  <TableCell className="text-sm">
                    {event ? tl(event.title) : "—"}
                  </TableCell>
                  <TableCell>
                    {deleter ? (
                      <span className="flex items-center gap-1.5 text-sm">
                        <UserAvatar user={deleter} size="xs" />
                        <span className="truncate">
                          {getFullName(deleter, locale)}
                        </span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {file.deletedAt ? formatDateTime(file.deletedAt, locale) : "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
                        expiring
                          ? "border-danger/35 bg-danger/15 text-foreground dark:border-danger/45 dark:bg-danger/25"
                          : "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      {t("trash.daysRemaining", { days: remaining })}
                      {expiring ? ` · ${t("trash.expiringSoon")}` : ""}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center justify-end gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setRestoreTarget(file)}
                        data-testid={`restore-${file.id}`}
                      >
                        <RotateCcwIcon className="size-3" aria-hidden="true" />
                        {t("trash.restore")}
                      </Button>
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => setPurgeTarget(file)}
                        data-testid={`purge-${file.id}`}
                      >
                        <Trash2Icon className="size-3" aria-hidden="true" />
                        {t("trash.deleteForever")}
                      </Button>
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={restoreTarget !== null}
        onOpenChange={(open) => !open && setRestoreTarget(null)}
        title={t("trash.confirmRestoreTitle")}
        description={t("trash.confirmRestoreDescription")}
        targetName={restoreTarget?.name}
        confirmLabel={t("trash.restore")}
        onConfirm={async () => {
          const target = restoreTarget
          setRestoreTarget(null)
          if (target) await actions.restoreFromTrash(target)
        }}
      />

      <ConfirmDialog
        open={purgeTarget !== null}
        onOpenChange={(open) => !open && setPurgeTarget(null)}
        title={t("trash.confirmPurgeTitle")}
        description={t("trash.confirmPurgeDescription")}
        targetName={purgeTarget?.name}
        impact={
          purgeTarget
            ? [
                t("trash.confirmPurgeImpact", {
                  count: purgeTarget.versions.length,
                }),
              ]
            : []
        }
        confirmLabel={t("trash.deleteForever")}
        destructive
        onConfirm={async () => {
          const target = purgeTarget
          setPurgeTarget(null)
          if (target) await actions.purgeFile(target)
        }}
      />
    </PageContainer>
  )
}
