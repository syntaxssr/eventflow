"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/i18n"
import { cn } from "@/lib/utils"
import type { FileType, FileVersion } from "@/types/file"

const MOCK_PAGES = 4
const MOCK_SLIDES = 6

/**
 * Preview จำลองตามประเภทไฟล์
 *
 * Prototype ไม่ได้อ่านเนื้อหาไฟล์จริง แต่จำลองหน้าตาให้ใกล้เคียงของจริง
 * ยกเว้นรูปภาพที่แสดงไฟล์จริงได้เมื่อเป็นไฟล์ที่ผู้ใช้เพิ่งอัปโหลด
 */
export function FilePreview({
  type,
  version,
  name,
}: {
  type: FileType
  version: FileVersion
  name: string
}) {
  switch (type) {
    case "image":
      return <ImagePreview url={version.previewUrl} name={name} />
    case "powerpoint":
      return <SlidePreview name={name} />
    case "excel":
      return <SheetPreview name={name} />
    default:
      return <DocumentPreview name={name} />
  }
}

function PreviewHint() {
  const { t } = useLocale()
  return (
    <p className="text-muted-foreground text-center text-xs">
      {t("file.previewPdfHint")}
    </p>
  )
}

function ImagePreview({ url, name }: { url: string | null; name: string }) {
  if (!url) return <DocumentPreview name={name} />

  return (
    <div className="bg-muted relative h-[60svh] w-full overflow-hidden rounded-lg">
      <Image
        src={url}
        alt={name}
        fill
        sizes="100vw"
        className="object-contain"
        unoptimized
      />
    </div>
  )
}

function SlidePreview({ name }: { name: string }) {
  const { t } = useLocale()
  const [slide, setSlide] = React.useState(1)

  return (
    <div className="space-y-3">
      <div className="bg-muted flex aspect-video w-full flex-col justify-center gap-3 rounded-lg border p-8">
        <div className="bg-brand-500 h-2 w-16 rounded-full" aria-hidden="true" />
        <p className="text-xl font-bold text-balance">
          {slide === 1 ? name.replace(/\.[^.]+$/, "") : `หัวข้อที่ ${slide - 1}`}
        </p>
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-muted-foreground/20 h-2.5 rounded-full"
              style={{ width: `${75 - index * 12}%` }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => setSlide((value) => Math.max(1, value - 1))}
          disabled={slide === 1}
          aria-label={t("common.previous")}
        >
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
        </Button>
        <span className="text-muted-foreground text-xs tabular-nums">
          {t("file.previewSlide", { current: slide, total: MOCK_SLIDES })}
        </span>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => setSlide((value) => Math.min(MOCK_SLIDES, value + 1))}
          disabled={slide === MOCK_SLIDES}
          aria-label={t("common.next")}
        >
          <ChevronRightIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <ul className="flex justify-center gap-2" aria-hidden="true">
        {Array.from({ length: MOCK_SLIDES }).map((_, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => setSlide(index + 1)}
              className={cn(
                "h-8 w-12 rounded border transition-colors",
                slide === index + 1
                  ? "border-brand-500 bg-brand-50"
                  : "bg-muted border-border"
              )}
            />
          </li>
        ))}
      </ul>

      <PreviewHint />
    </div>
  )
}

function SheetPreview({ name }: { name: string }) {
  const { t } = useLocale()
  const columns = ["A", "B", "C", "D", "E"]
  const rows = Array.from({ length: 10 }, (_, index) => index + 1)

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-xs">
          <caption className="sr-only">{name}</caption>
          <thead>
            <tr>
              <th className="bg-muted text-muted-foreground w-10 border p-1.5" />
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="bg-muted text-muted-foreground border p-1.5 font-medium"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <th
                  scope="row"
                  className="bg-muted text-muted-foreground border p-1.5 font-normal"
                >
                  {row}
                </th>
                {columns.map((column) => (
                  <td key={column} className="border p-1.5">
                    <span
                      className="bg-muted-foreground/15 block h-2.5 rounded"
                      style={{ width: `${40 + ((row * 7 + column.charCodeAt(0)) % 55)}%` }}
                      aria-hidden="true"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-muted-foreground text-xs">
        {t("file.previewSheet")} 1 · {name}
      </p>
      <PreviewHint />
    </div>
  )
}

function DocumentPreview({ name }: { name: string }) {
  const { t } = useLocale()
  const [page, setPage] = React.useState(1)

  return (
    <div className="space-y-3">
      <div className="bg-background mx-auto w-full max-w-lg space-y-3 rounded-lg border p-8 shadow-sm">
        <p className="text-base font-bold text-balance">
          {name.replace(/\.[^.]+$/, "")}
        </p>
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, index) => (
            <div
              key={index}
              className="bg-muted-foreground/15 h-2.5 rounded-full"
              style={{
                width: `${index % 5 === 4 ? 55 : 92 - ((index * 13) % 18)}%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          disabled={page === 1}
          aria-label={t("common.previous")}
        >
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
        </Button>
        <span className="text-muted-foreground text-xs tabular-nums">
          {t("file.previewPage", { current: page, total: MOCK_PAGES })}
        </span>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => setPage((value) => Math.min(MOCK_PAGES, value + 1))}
          disabled={page === MOCK_PAGES}
          aria-label={t("common.next")}
        >
          <ChevronRightIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <PreviewHint />
    </div>
  )
}
