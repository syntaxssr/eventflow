"use client"

import * as React from "react"
import {
  DownloadIcon,
  FolderInputIcon,
  PencilLineIcon,
  RotateCcwIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"
import { appToast } from "@/lib/gif-toast"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { FILE_TYPE_STYLE } from "@/constants/file-type"
import { useLocale } from "@/i18n"
import { currentVersion } from "@/lib/file"
import { formatDateTime, formatFileSize } from "@/lib/format"
import { getFullName } from "@/lib/user"
import { cn } from "@/lib/utils"
import { useAppState } from "@/store"
import type { FileItem } from "@/types/file"
import { downloadMockFile } from "./download-file"
import { FilePreview } from "./file-preview"
import { useFileActions } from "./use-file-actions"

export function FileDetailDialog({
  file,
  open,
  onOpenChange,
}: {
  file: FileItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t, tl, locale } = useLocale()
  const state = useAppState()
  const actions = useFileActions()

  const [renameOpen, setRenameOpen] = React.useState(false)
  const [moveOpen, setMoveOpen] = React.useState(false)
  const [versionOpen, setVersionOpen] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [restoreTarget, setRestoreTarget] = React.useState<string | null>(null)

  if (!file) return null

  const style = FILE_TYPE_STYLE[file.type]
  const Icon = style.icon
  const version = currentVersion(file)
  const category = state.fileCategories.find(
    (entry) => entry.id === file.categoryId
  )
  const event = state.events.find((entry) => entry.id === file.eventId)
  const usersById = new Map(state.users.map((user) => [user.id, user]))

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[92svh] overflow-y-auto sm:max-w-3xl"
          data-testid="file-detail"
        >
          <DialogHeader>
            <DialogTitle className="flex items-start gap-2 pr-6 text-balance">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  style.tile
                )}
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </span>
              {file.name}
            </DialogTitle>
            <DialogDescription>
              {style.label} · {formatFileSize(version.size, locale)} ·{" "}
              {t("file.version")} {version.versionNumber}
              {category ? ` · ${tl(category.name)}` : ""}
              {event ? ` · ${tl(event.title)}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void downloadMockFile(file)
                appToast.success(t("file.downloadStarted"))
              }}
              data-testid="download-file"
            >
              <DownloadIcon className="size-4" aria-hidden="true" />
              {t("file.download")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setVersionOpen(true)}>
              <UploadIcon className="size-4" aria-hidden="true" />
              {t("file.uploadNewVersion")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setRenameOpen(true)}>
              <PencilLineIcon className="size-4" aria-hidden="true" />
              {t("file.rename")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setMoveOpen(true)}>
              <FolderInputIcon className="size-4" aria-hidden="true" />
              {t("file.moveCategory")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="ml-auto"
              onClick={() => setConfirmDelete(true)}
              data-testid="delete-file"
            >
              <Trash2Icon className="size-4" aria-hidden="true" />
              {t("file.delete")}
            </Button>
          </div>

          <Tabs defaultValue="preview" className="pt-2">
            <TabsList>
              <TabsTrigger value="preview">{t("file.preview")}</TabsTrigger>
              <TabsTrigger value="versions">
                {t("file.versionHistory")} ({file.versions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="pt-4">
              <FilePreview type={file.type} version={version} name={file.name} />
            </TabsContent>

            <TabsContent value="versions" className="pt-4">
              <ol className="space-y-2" data-testid="version-list">
                {[...file.versions]
                  .sort((a, b) => b.versionNumber - a.versionNumber)
                  .map((entry) => {
                    const uploader = usersById.get(entry.uploadedBy)
                    const isCurrent = entry.id === file.currentVersionId

                    return (
                      <li
                        key={entry.id}
                        className={cn(
                          "rounded-lg border p-3",
                          isCurrent && "border-brand-400 bg-brand-50/50"
                        )}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">
                            v{entry.versionNumber}
                          </span>
                          {isCurrent ? (
                            <span className="bg-brand-500 text-brand-950 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold">
                              {t("file.currentVersion")}
                            </span>
                          ) : null}
                          <span className="text-muted-foreground text-xs">
                            {formatFileSize(entry.size, locale)}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {formatDateTime(entry.uploadedAt, locale)}
                          </span>

                          {!isCurrent ? (
                            <Button
                              size="xs"
                              variant="outline"
                              className="ml-auto"
                              onClick={() => setRestoreTarget(entry.id)}
                              data-testid={`restore-version-${entry.versionNumber}`}
                            >
                              <RotateCcwIcon className="size-3" aria-hidden="true" />
                              {t("file.restoreVersion")}
                            </Button>
                          ) : null}
                        </div>

                        <p className="mt-1 truncate text-xs">{entry.filename}</p>
                        {tl(entry.changeNote) ? (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {tl(entry.changeNote)}
                          </p>
                        ) : null}

                        {uploader ? (
                          <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
                            <UserAvatar user={uploader} size="xs" />
                            {getFullName(uploader, locale)}
                          </p>
                        ) : null}
                      </li>
                    )
                  })}
              </ol>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        file={file}
        onSubmit={(name) => actions.renameFile(file, name)}
      />

      <MoveCategoryDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        file={file}
        onSubmit={(categoryId) => actions.moveCategory(file, categoryId)}
      />

      <NewVersionDialog
        open={versionOpen}
        onOpenChange={setVersionOpen}
        file={file}
        onSubmit={(input) => actions.addVersion(file, input)}
      />

      <ConfirmDialog
        open={restoreTarget !== null}
        onOpenChange={(nextOpen) => !nextOpen && setRestoreTarget(null)}
        title={t("file.confirmRestoreVersionTitle")}
        description={t("file.confirmRestoreVersionDescription")}
        targetName={file.name}
        confirmLabel={t("file.restoreVersion")}
        onConfirm={async () => {
          const versionId = restoreTarget
          setRestoreTarget(null)
          if (versionId) await actions.restoreVersionTo(file, versionId)
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("file.confirmDeleteTitle")}
        description={t("file.confirmDeleteDescription")}
        targetName={file.name}
        impact={[t("file.versionCount", { count: file.versions.length })]}
        confirmLabel={t("file.delete")}
        destructive
        onConfirm={async () => {
          setConfirmDelete(false)
          onOpenChange(false)
          await actions.moveToTrash(file)
        }}
      />
    </>
  )
}

function RenameDialog({
  open,
  onOpenChange,
  file,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileItem
  onSubmit: (name: string) => Promise<void> | void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open ? (
          <RenameForm
            initialName={file.name}
            onDone={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function RenameForm({
  initialName,
  onSubmit,
  onDone,
}: {
  initialName: string
  onSubmit: (name: string) => Promise<void> | void
  onDone: () => void
}) {
  const { t } = useLocale()
  const [name, setName] = React.useState(initialName)
  const [busy, setBusy] = React.useState(false)

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("file.renameTitle")}</DialogTitle>
        <DialogDescription>{initialName}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-2">
        <Label htmlFor="rename-input">{t("file.newName")}</Label>
        <Input
          id="rename-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={busy}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={busy}>
          {t("common.cancel")}
        </Button>
        <Button
          disabled={busy || name.trim() === ""}
          onClick={async () => {
            setBusy(true)
            await onSubmit(name.trim())
            setBusy(false)
            onDone()
          }}
        >
          {t("common.save")}
        </Button>
      </DialogFooter>
    </>
  )
}

function MoveCategoryDialog({
  open,
  onOpenChange,
  file,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileItem
  onSubmit: (categoryId: string) => Promise<void> | void
}) {
  const { t, tl } = useLocale()
  const state = useAppState()
  const [categoryId, setCategoryId] = React.useState(file.categoryId)
  const [busy, setBusy] = React.useState(false)

  const categories = state.fileCategories.filter(
    (category) => category.eventId === null || category.eventId === file.eventId
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("file.moveCategoryTitle")}</DialogTitle>
          <DialogDescription>{file.name}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="move-category">{t("file.category")}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="move-category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {tl(category.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {t("common.cancel")}
          </Button>
          <Button
            disabled={busy || categoryId === file.categoryId}
            onClick={async () => {
              setBusy(true)
              await onSubmit(categoryId)
              setBusy(false)
              onOpenChange(false)
            }}
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NewVersionDialog({
  open,
  onOpenChange,
  file,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileItem
  onSubmit: (input: {
    filename: string
    size: number
    changeNote: string
    previewUrl: string | null
  }) => Promise<void> | void
}) {
  const { t } = useLocale()
  const [note, setNote] = React.useState("")
  const [picked, setPicked] = React.useState<File | null>(null)
  const [busy, setBusy] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("file.uploadNewVersion")}</DialogTitle>
          <DialogDescription>{file.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="version-file">{t("file.browse")}</Label>
            <input
              ref={inputRef}
              id="version-file"
              type="file"
              className="text-sm"
              data-testid="version-file-input"
              onChange={(event) => setPicked(event.target.files?.[0] ?? null)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="version-note">{t("file.changeNote")}</Label>
            <Textarea
              id="version-note"
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("file.changeNotePlaceholder")}
              disabled={busy}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {t("common.cancel")}
          </Button>
          <Button
            disabled={busy || !picked || note.trim() === ""}
            data-testid="confirm-new-version"
            onClick={async () => {
              if (!picked) return
              setBusy(true)
              await onSubmit({
                filename: picked.name,
                size: picked.size,
                changeNote: note.trim(),
                previewUrl:
                  file.type === "image" ? URL.createObjectURL(picked) : null,
              })
              setBusy(false)
              setNote("")
              setPicked(null)
              onOpenChange(false)
            }}
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
