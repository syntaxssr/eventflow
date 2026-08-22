import {
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PresentationIcon,
  type LucideIcon,
} from "lucide-react"

import type { FileType } from "@/types/file"

interface FileTypeStyle {
  icon: LucideIcon
  /** class ของกล่องไอคอน (พื้นหลัง + สีไอคอน) — ใช้ --icon-tile-* (เฉด Version 3)
   *  โดยจับคู่สีให้ใกล้เคียงสีประจำนามสกุลไฟล์ */
  tile: string
  label: string
}

export const FILE_TYPE_STYLE: Record<FileType, FileTypeStyle> = {
  powerpoint: {
    icon: PresentationIcon,
    tile: "bg-icon-tile-orange text-icon-tile-orange-foreground",
    label: "PowerPoint",
  },
  excel: {
    icon: FileSpreadsheetIcon,
    tile: "bg-icon-tile-green text-icon-tile-green-foreground",
    label: "Excel",
  },
  pdf: {
    icon: FileTextIcon,
    tile: "bg-icon-tile-red text-icon-tile-red-foreground",
    label: "PDF",
  },
  word: {
    icon: FileTextIcon,
    tile: "bg-icon-tile-blue text-icon-tile-blue-foreground",
    label: "Word",
  },
  image: {
    icon: FileImageIcon,
    tile: "bg-icon-tile-purple text-icon-tile-purple-foreground",
    label: "Image",
  },
}

/** เดาประเภทไฟล์จากนามสกุล */
export function detectFileType(filename: string): FileType | null {
  const extension = filename.split(".").pop()?.toLowerCase() ?? ""
  if (["ppt", "pptx"].includes(extension)) return "powerpoint"
  if (["xls", "xlsx", "csv"].includes(extension)) return "excel"
  if (extension === "pdf") return "pdf"
  if (["doc", "docx"].includes(extension)) return "word"
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension))
    return "image"
  return null
}
