"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  FilterIcon,
  FolderOpenIcon,
  LayoutGridIcon,
  PlusIcon,
  TableIcon,
} from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { FilterChips, type FilterChip } from "@/components/common/filter-chips"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
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
import { usePageState } from "@/hooks/use-page-state"
import { useLocale } from "@/i18n"
import { currentVersion } from "@/lib/file"
import { formatFileSize, formatRelativeTime } from "@/lib/format"
import { getFullName } from "@/lib/user"
import { cn } from "@/lib/utils"
import { useAppState } from "@/store"
import { selectActiveEvents } from "@/store/selectors"
import { FILE_TYPES, type FileItem, type FileType } from "@/types/file"
import { FileDetailDialog } from "./file-detail-dialog"
import { FileTypeBadge } from "./file-type-badge"
import { FileUploadZone } from "./file-upload-zone"
import { useFileActions } from "./use-file-actions"

type ViewMode = "grid" | "list"

/** มุมมองไฟล์ที่ใช้ร่วมกันระหว่างหน้า Files กับแท็บในหน้ากิจกรรม */
export function FilesView({ eventId }: { eventId?: string }) {
  const { t, tl, locale } = useLocale()
  const state = useAppState()
  const actions = useFileActions()
  const searchParams = useSearchParams()

  // เปิดไฟล์ทันทีเมื่อมาจากลิงก์ Global Search (?file=...)
  const linkedFile = React.useMemo(() => {
    const fileId = searchParams.get("file")
    return fileId
      ? (state.files.find(
          (file) => file.id === fileId && file.deletedAt === null
        ) ?? null)
      : null
    // อ่านเฉพาะตอน mount — การเปิด/ปิดหลังจากนั้นเป็นของผู้ใช้
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const events = selectActiveEvents(state)
  const [selectedEventId, setSelectedEventId] = React.useState(
    () => eventId ?? linkedFile?.eventId ?? events[0]?.id ?? ""
  )
  const activeEventId = eventId ?? selectedEventId

  const [view, setView] = React.useState<ViewMode>("grid")
  const [categoryId, setCategoryId] = React.useState("all")
  const [fileType, setFileType] = React.useState<FileType | "all">("all")
  const [uploaderId, setUploaderId] = React.useState("all")
  const [detailFile, setDetailFile] = React.useState<FileItem | null>(linkedFile)
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false)

  const categories = React.useMemo(
    () =>
      state.fileCategories.filter(
        (category) =>
          category.eventId === null || category.eventId === activeEventId
      ),
    [state.fileCategories, activeEventId]
  )

  const scopedFiles = React.useMemo(
    () =>
      state.files.filter(
        (file) => file.eventId === activeEventId && file.deletedAt === null
      ),
    [state.files, activeEventId]
  )

  const files = React.useMemo(() => {
    const filtered = scopedFiles.filter((file) => {
      if (categoryId !== "all" && file.categoryId !== categoryId) return false
      if (fileType !== "all" && file.type !== fileType) return false
      if (uploaderId !== "all" && file.uploadedBy !== uploaderId) return false
      return true
    })
    return [...filtered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [scopedFiles, categoryId, fileType, uploaderId])

  // ให้กล่องรายละเอียดอ่านข้อมูลล่าสุดเสมอ แม้จะเพิ่งเพิ่มเวอร์ชันใหม่
  const openFile = detailFile
    ? (state.files.find((file) => file.id === detailFile.id) ?? null)
    : null

  const usersById = React.useMemo(
    () => new Map(state.users.map((user) => [user.id, user])),
    [state.users]
  )

  const clearAll = () => {
    setCategoryId("all")
    setFileType("all")
    setUploaderId("all")
  }

  const chips: FilterChip[] = [
    ...(categoryId !== "all"
      ? [
          {
            key: "category",
            label: tl(
              categories.find((category) => category.id === categoryId)?.name
            ),
            onRemove: () => setCategoryId("all"),
          },
        ]
      : []),
    ...(fileType !== "all"
      ? [
          {
            key: "type",
            label: FILE_TYPE_STYLE[fileType].label,
            onRemove: () => setFileType("all"),
          },
        ]
      : []),
    ...(uploaderId !== "all"
      ? [
          {
            key: "uploader",
            label: `${t("file.uploader")}: ${
              usersById.get(uploaderId)
                ? getFullName(usersById.get(uploaderId)!, locale)
                : uploaderId
            }`,
            onRemove: () => setUploaderId("all"),
          },
        ]
      : []),
  ]

  const { state: pageState, retry } = usePageState(scopedFiles.length === 0)

  if (pageState === "error") return <ErrorState onRetry={retry} />

  if (pageState === "loading") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {!eventId ? (
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger
              size="sm"
              className="w-64"
              data-testid="file-event-select"
              aria-label={t("timeline.selectEvent")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title[locale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-pressed={view === "grid"}
            aria-label={t("file.gridView")}
            onClick={() => setView("grid")}
          >
            <LayoutGridIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-pressed={view === "list"}
            aria-label={t("file.listView")}
            onClick={() => setView("list")}
          >
            <TableIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <FileUploadZone
        eventId={activeEventId}
        categoryId={categoryId === "all" ? categories[0]?.id ?? "" : categoryId}
      />

      {/* หมวดหมู่เป็น chip เพื่อให้เลือกได้เร็วกว่า dropdown */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          size="xs"
          variant={categoryId === "all" ? "secondary" : "ghost"}
          onClick={() => setCategoryId("all")}
        >
          {t("file.allCategories")}
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            size="xs"
            variant={categoryId === category.id ? "secondary" : "ghost"}
            onClick={() => setCategoryId(category.id)}
          >
            {tl(category.name)}
          </Button>
        ))}
        <Button
          size="xs"
          variant="outline"
          onClick={() => setCategoryDialogOpen(true)}
          data-testid="add-category"
        >
          <PlusIcon className="size-3" aria-hidden="true" />
          {t("file.addCategory")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={fileType}
          onValueChange={(value) => setFileType(value as FileType | "all")}
        >
          <SelectTrigger size="sm" className="w-40" aria-label={t("file.fileType")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("file.allTypes")}</SelectItem>
            {FILE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {FILE_TYPE_STYLE[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={uploaderId} onValueChange={setUploaderId}>
          <SelectTrigger size="sm" className="w-44" aria-label={t("file.uploader")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("file.uploader")}: {t("common.all")}
            </SelectItem>
            {state.users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {getFullName(user, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FilterChips chips={chips} onClearAll={clearAll} />

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {t("file.resultCount", { count: files.length })}
      </p>

      {scopedFiles.length === 0 ? (
        <EmptyState
          icon={FolderOpenIcon}
          title={t("file.noFiles")}
          description={t("file.noFilesDescription")}
        />
      ) : files.length === 0 ? (
        <EmptyState
          icon={FilterIcon}
          title={t("file.noFilesMatch")}
          description={t("file.noFilesMatchDescription")}
          action={
            <Button variant="outline" onClick={clearAll}>
              {t("common.clearAll")}
            </Button>
          }
        />
      ) : view === "grid" ? (
        <ul
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          data-testid="file-grid"
        >
          {files.map((file) => {
            const style = FILE_TYPE_STYLE[file.type]
            const Icon = style.icon
            const version = currentVersion(file)
            const uploader = usersById.get(file.updatedBy)

            return (
              <li key={file.id}>
                <Card className="hover:border-brand-300 h-full transition-colors">
                  <CardContent className="p-0">
                    <button
                      type="button"
                      onClick={() => setDetailFile(file)}
                      className="focus-visible:outline-ring flex h-full w-full flex-col gap-2 rounded-lg p-3 text-left focus-visible:outline-2"
                    >
                      <span className="flex items-start gap-2">
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                            style.tile
                          )}
                          aria-hidden="true"
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium">
                          {file.name}
                        </span>
                      </span>

                      <span className="text-muted-foreground text-xs">
                        {style.label} · {formatFileSize(version.size, locale)}
                        {file.versions.length > 1
                          ? ` · v${version.versionNumber}`
                          : ""}
                      </span>

                      <span className="text-muted-foreground mt-auto flex items-center justify-between gap-2 pt-1 text-xs">
                        {uploader ? (
                          <span className="flex items-center gap-1.5">
                            <UserAvatar user={uploader} size="xs" />
                            <span className="truncate">
                              {getFullName(uploader, locale)}
                            </span>
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="shrink-0">
                          {formatRelativeTime(file.updatedAt, locale)}
                        </span>
                      </span>
                    </button>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="overflow-x-auto rounded-lg border" data-testid="file-list">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-64">{t("file.newName")}</TableHead>
                <TableHead className="min-w-24">{t("file.fileType")}</TableHead>
                <TableHead className="min-w-28">{t("file.category")}</TableHead>
                <TableHead className="min-w-20">{t("file.size")}</TableHead>
                <TableHead className="min-w-20">{t("file.version")}</TableHead>
                <TableHead className="min-w-40">{t("file.updatedAt")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => {
                const version = currentVersion(file)
                const category = categories.find(
                  (entry) => entry.id === file.categoryId
                )
                return (
                  <TableRow key={file.id}>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setDetailFile(file)}
                        className="hover:text-brand-text focus-visible:outline-ring text-left font-medium focus-visible:outline-2"
                      >
                        {file.name}
                      </button>
                    </TableCell>
                    <TableCell>
                      <FileTypeBadge type={file.type} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {category ? tl(category.name) : "—"}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatFileSize(version.size, locale)}
                    </TableCell>
                    <TableCell className="text-sm">
                      v{version.versionNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {formatRelativeTime(file.updatedAt, locale)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <FileDetailDialog
        file={openFile}
        open={openFile !== null}
        onOpenChange={(open) => !open && setDetailFile(null)}
      />

      <AddCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSubmit={(name) => actions.addCategory(name, activeEventId)}
      />
    </div>
  )
}

function AddCategoryDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => Promise<void> | void
}) {
  const { t } = useLocale()
  const [name, setName] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("file.addCategory")}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="category-name">{t("file.newCategoryName")}</Label>
          <Input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={busy}
          />
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
            disabled={busy || name.trim() === ""}
            data-testid="confirm-add-category"
            onClick={async () => {
              setBusy(true)
              await onSubmit(name.trim())
              setBusy(false)
              setName("")
              onOpenChange(false)
            }}
          >
            {t("common.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
