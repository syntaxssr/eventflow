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

/** ทุกประเภทไฟล์ใช้ tile สีเทาเดียวกัน — แยกแยะด้วยไอคอนแทนสี */
const FILE_TILE = "bg-muted text-muted-foreground"

export const FILE_TYPE_STYLE: Record<FileType, FileTypeStyle> = {
  powerpoint: {
    icon: PresentationIcon,
    tile: FILE_TILE,
    label: "PowerPoint",
  },
  excel: {
    icon: FileSpreadsheetIcon,
    tile: FILE_TILE,
    label: "Excel",
  },
  pdf: {
    icon: FileTextIcon,
    tile: FILE_TILE,
    label: "PDF",
  },
  word: {
    icon: FileTextIcon,
    tile: FILE_TILE,
    label: "Word",
  },
  image: {
    icon: FileImageIcon,
    tile: FILE_TILE,
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
