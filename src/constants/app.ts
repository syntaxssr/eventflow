/** ชื่อระบบ — ใช้ให้สอดคล้องกันทั้งระบบ */
export const APP_NAME = "EventFlow"

export const APP_DESCRIPTION_TH =
  "ระบบบริหาร วางแผน และประสานงานกิจกรรมภายในองค์กร"
export const APP_DESCRIPTION_EN =
  "Internal event planning and coordination platform"

export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  events: "/events",
  eventDetail: (id: string) => `/events/${id}`,
  myTasks: "/my-tasks",
  files: "/files",
  timeline: "/timeline",
  participants: "/participants",
  notifications: "/notifications",
  activity: "/activity",
  trash: "/trash",
  profile: "/profile",
  designSystem: "/design-system",
} as const

/** ขนาดไฟล์สูงสุดต่อไฟล์ = 50 MB */
export const MAX_FILE_SIZE_MB = 50
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

/** ไฟล์ใน Trash จะถูกลบถาวรหลังจากกี่วัน */
export const TRASH_RETENTION_DAYS = 30

/** แจ้งเตือนงานใกล้ครบกำหนดล่วงหน้ากี่วัน */
export const DUE_SOON_DAYS = 1
