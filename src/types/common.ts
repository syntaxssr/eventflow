/** ภาษาที่ระบบรองรับ */
export type Locale = "th" | "en"

/**
 * ข้อความที่ผู้ใช้มองเห็นและต้องเปลี่ยนตามภาษา
 * ใช้กับ Mock Data ทุกชิ้นที่แสดงผลบนหน้าจอ
 */
export type LocalizedText = Record<Locale, string>

/** วันที่ในรูปแบบ `YYYY-MM-DD` */
export type DateKey = string

/** วันเวลาแบบ ISO 8601 */
export type IsoDateTime = string

/** เวลาในรูปแบบ `HH:mm` */
export type TimeString = string

export type Id = string

/** ข้อมูลผู้สร้าง/ผู้แก้ไข ที่ทุก entity หลักต้องมี */
export interface AuditFields {
  createdAt: IsoDateTime
  createdBy: Id
  updatedAt: IsoDateTime
  updatedBy: Id
}

/** สถานะการบันทึกแบบ Auto Save */
export type SaveState = "idle" | "saving" | "saved" | "error"

/** สถานะการโหลดข้อมูลของแต่ละหน้า */
export type LoadState = "loading" | "ready" | "empty" | "error"
