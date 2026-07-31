import { MAX_FILE_SIZE_BYTES, TRASH_RETENTION_DAYS } from "@/constants/app"
import { detectFileType } from "@/constants/file-type"
import { daysBetween, getToday } from "@/constants/mock-date"
import type { FileItem, FileType, FileVersion } from "@/types/file"

export type FileValidationError = "too_large" | "unsupported_type"

export interface FileValidationResult {
  valid: boolean
  error?: FileValidationError
  type?: FileType
}

/**
 * ตรวจไฟล์ก่อนอัปโหลด
 * ขนาดสูงสุด 50 MB ต่อไฟล์ และรองรับเฉพาะประเภทที่ระบุไว้ใน requirement
 */
export function validateFile(file: {
  name: string
  size: number
}): FileValidationResult {
  const type = detectFileType(file.name)
  if (!type) return { valid: false, error: "unsupported_type" }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "too_large", type }
  }
  return { valid: true, type }
}

/** เวอร์ชันปัจจุบันของไฟล์ */
export function currentVersion(file: FileItem): FileVersion {
  return (
    file.versions.find((version) => version.id === file.currentVersionId) ??
    file.versions[file.versions.length - 1]
  )
}

/**
 * กู้คืนเวอร์ชันเก่า
 *
 * ไม่ได้ย้อนไปทับของเดิม แต่ **สร้างเวอร์ชันใหม่จากเนื้อหาของเวอร์ชันที่เลือก**
 * ประวัติจึงยังครบและย้อนกลับได้เสมอ
 */
export function restoreVersion(
  file: FileItem,
  versionId: string,
  actorId: string,
  now: string
): FileItem {
  const source = file.versions.find((version) => version.id === versionId)
  if (!source) return file

  const nextNumber = file.versions.length + 1
  const restored: FileVersion = {
    ...source,
    id: `${file.id}-v${nextNumber}`,
    versionNumber: nextNumber,
    uploadedBy: actorId,
    uploadedAt: now,
    changeNote: {
      th: `กู้คืนจากเวอร์ชัน ${source.versionNumber}`,
      en: `Restored from version ${source.versionNumber}`,
    },
  }

  return {
    ...file,
    versions: [...file.versions, restored],
    currentVersionId: restored.id,
    updatedAt: now,
    updatedBy: actorId,
  }
}

/** เพิ่มเวอร์ชันใหม่ให้ไฟล์ */
export function appendVersion(
  file: FileItem,
  version: Omit<FileVersion, "id" | "versionNumber">
): FileItem {
  const nextNumber = file.versions.length + 1
  const newVersion: FileVersion = {
    ...version,
    id: `${file.id}-v${nextNumber}`,
    versionNumber: nextNumber,
  }

  return {
    ...file,
    versions: [...file.versions, newVersion],
    currentVersionId: newVersion.id,
    updatedAt: version.uploadedAt,
    updatedBy: version.uploadedBy,
  }
}

/**
 * จำนวนวันที่เหลือก่อนไฟล์ในถังขยะจะถูกลบถาวร
 * คืน 0 เมื่อครบกำหนดแล้ว และ null เมื่อไฟล์ไม่ได้อยู่ในถังขยะ
 */
export function trashDaysRemaining(
  file: Pick<FileItem, "deletedAt">,
  today: Date = getToday()
): number | null {
  if (!file.deletedAt) return null
  const deletedOn = new Date(file.deletedAt)
  const elapsed = daysBetween(deletedOn, today)
  return Math.max(0, TRASH_RETENTION_DAYS - elapsed)
}

/** ไฟล์ที่ใกล้ถูกลบถาวร (เหลือไม่เกิน 7 วัน) */
export function isExpiringSoon(
  file: Pick<FileItem, "deletedAt">,
  today: Date = getToday()
): boolean {
  const remaining = trashDaysRemaining(file, today)
  return remaining !== null && remaining <= 7
}
