"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon, FolderOpenIcon } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ROUTES } from "@/constants/app"
import { FILE_TYPE_STYLE } from "@/constants/file-type"
import { useLocale } from "@/i18n"
import { formatFileSize, formatRelativeTime } from "@/lib/format"
import { getFullName } from "@/lib/user"
import { cn } from "@/lib/utils"
import type { FileItem } from "@/types/file"
import type { User } from "@/types/user"
import {
  DASHBOARD_LIST_PAGE_SIZE,
  DashboardListPagination,
} from "./dashboard-list-pagination"

export function RecentFilesCard({
  files,
  usersById,
}: {
  files: FileItem[]
  usersById: Map<string, User>
}) {
  const { t, locale } = useLocale()
  const [page, setPage] = React.useState(0)
  const totalPages = Math.ceil(files.length / DASHBOARD_LIST_PAGE_SIZE)
  const currentPage = Math.min(page, Math.max(0, totalPages - 1))
  const visibleFiles = files.slice(
    currentPage * DASHBOARD_LIST_PAGE_SIZE,
    (currentPage + 1) * DASHBOARD_LIST_PAGE_SIZE
  )

  return (
    <Card
      className="dashboard-detail-card"
      data-testid="recent-files"
    >
      <CardHeader>
        <CardTitle>{t("dashboard.recentFiles")}</CardTitle>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.files}>
              {t("common.viewAll")}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {files.length === 0 ? (
          <EmptyState
            compact
            icon={FolderOpenIcon}
            title={t("dashboard.noRecentFiles")}
          />
        ) : (
          <ul className="divide-border divide-y">
            {visibleFiles.map((file) => {
              const style = FILE_TYPE_STYLE[file.type]
              const Icon = style.icon
              const uploader = usersById.get(file.updatedBy)
              const currentVersion =
                file.versions.find((v) => v.id === file.currentVersionId) ??
                file.versions[file.versions.length - 1]

              return (
                <li key={file.id}>
                  <Link
                    href={`${ROUTES.files}?file=${file.id}`}
                    className="hover:bg-muted/60 focus-visible:outline-ring -mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors focus-visible:outline-2"
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        style.dashboardTile
                      )}
                      aria-hidden="true"
                    >
                      <Icon className={cn("size-4.5", style.iconColor)} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {file.name}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {style.label} · {formatFileSize(currentVersion.size, locale)}
                        {file.versions.length > 1
                          ? ` · v${currentVersion.versionNumber}`
                          : ""}
                        {uploader ? ` · ${getFullName(uploader, locale)}` : ""}
                      </span>
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatRelativeTime(file.updatedAt, locale)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
        <DashboardListPagination
          page={currentPage}
          totalItems={files.length}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  )
}
