import type { Id, IsoDateTime, LocalizedText } from "./common"

export const FILE_TYPES = [
  "powerpoint",
  "excel",
  "pdf",
  "word",
  "image",
] as const

export type FileType = (typeof FILE_TYPES)[number]

export interface FileCategory {
  id: Id
  eventId: Id | null
  name: LocalizedText
  /** หมวดหมู่เริ่มต้นของระบบ (ลบไม่ได้) */
  isDefault: boolean
  order: number
}

export interface FileVersion {
  id: Id
  versionNumber: number
  filename: string
  uploadedBy: Id
  uploadedAt: IsoDateTime
  /** ขนาดไฟล์ (bytes) */
  size: number
  changeNote: LocalizedText
  /** ใช้แสดง Preview จำลอง (ภาพจริงสำหรับไฟล์รูป) */
  previewUrl: string | null
}

export interface FileItem {
  id: Id
  eventId: Id
  name: string
  categoryId: Id
  type: FileType
  versions: FileVersion[]
  currentVersionId: Id
  uploadedBy: Id
  uploadedAt: IsoDateTime
  updatedAt: IsoDateTime
  updatedBy: Id
  /** ถูกย้ายไป Trash เมื่อใด (null = ยังอยู่ในระบบ) */
  deletedAt: IsoDateTime | null
  deletedBy: Id | null
}

/** สถานะการอัปโหลดที่แสดงบน UI */
export type UploadStatus =
  | "queued"
  | "uploading"
  | "success"
  | "failed"
  | "cancelled"

export interface UploadTask {
  id: Id
  filename: string
  size: number
  type: FileType | null
  progress: number
  status: UploadStatus
  errorKey: string | null
}
