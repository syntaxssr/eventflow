import type { Activity, ActivityAction } from "@/types/activity"

/**
 * ตัวกรองของหน้า Activity History — pure function เพื่อให้ unit test ได้
 */

export interface ActivityFilters {
  /** ค้นจากชื่อข้อมูลที่ถูกกระทำ และสรุปค่าก่อน–หลัง */
  query: string
  actorId: string | "all"
  action: ActivityAction | "all"
  eventId: string | "all"
  /** ช่วงวันที่แบบ `YYYY-MM-DD` — ว่าง = ไม่จำกัด */
  dateFrom: string
  dateTo: string
}

export const EMPTY_ACTIVITY_FILTERS: ActivityFilters = {
  query: "",
  actorId: "all",
  action: "all",
  eventId: "all",
  dateFrom: "",
  dateTo: "",
}

/** วันที่ (เขตเวลาไทย) ของ activity — ISO ในระบบเป็น +07:00 เสมอ */
function dateKeyOf(activity: Activity): string {
  return activity.createdAt.slice(0, 10)
}

/** กรองและเรียงจากใหม่ไปเก่า */
export function filterActivities(
  activities: Activity[],
  filters: ActivityFilters
): Activity[] {
  const query = filters.query.trim().toLowerCase()

  return activities
    .filter((activity) => {
      if (filters.actorId !== "all" && activity.actorId !== filters.actorId)
        return false
      if (filters.action !== "all" && activity.action !== filters.action)
        return false
      if (filters.eventId !== "all" && activity.eventId !== filters.eventId)
        return false

      const dateKey = dateKeyOf(activity)
      if (filters.dateFrom !== "" && dateKey < filters.dateFrom) return false
      if (filters.dateTo !== "" && dateKey > filters.dateTo) return false

      if (query === "") return true
      return [
        activity.targetName.th,
        activity.targetName.en,
        activity.before?.th ?? "",
        activity.before?.en ?? "",
        activity.after?.th ?? "",
        activity.after?.en ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
