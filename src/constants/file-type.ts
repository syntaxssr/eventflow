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
  /** class ของกล่องไอคอน (พื้นหลัง + สีไอคอน) */
  tile: string
  label: string
}

export const FILE_TYPE_STYLE: Record<FileType, FileTypeStyle> = {
  powerpoint: {
    icon: PresentationIcon,
    tile: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    label: "PowerPoint",
  },
  excel: {
    icon: FileSpreadsheetIcon,
    tile: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
    label: "Excel",
  },
  pdf: {
    icon: FileTextIcon,
    tile: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    label: "PDF",
  },
  word: {
    icon: FileTextIcon,
    tile: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    label: "Word",
  },
  image: {
    icon: FileImageIcon,
    tile: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
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
