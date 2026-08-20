import { z } from "zod"

import { EVENT_COLORS } from "@/constants/event-colors"
import { EVENT_STATUSES } from "@/types/event"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^\d{2}:\d{2}$/

/**
 * ข้อความ error เก็บเป็น translation key เพื่อให้เปลี่ยนภาษาได้ทันที
 * (`FormMessage` เป็นผู้แปลให้ตอนแสดงผล)
 */
export const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { message: "event.nameRequired" })
      .max(120, { message: "event.nameTooLong" }),
    description: z.string().trim(),
    startDate: z.string().regex(DATE_PATTERN, { message: "event.dateRequired" }),
    endDate: z.string().regex(DATE_PATTERN, { message: "event.dateRequired" }),
    startTime: z.string().regex(TIME_PATTERN, { message: "event.dateRequired" }),
    endTime: z.string().regex(TIME_PATTERN, { message: "event.dateRequired" }),
    location: z.string().trim().min(1, { message: "event.locationRequired" }),
    ownerId: z.string().min(1),
    expectedAttendees: z
      .number({ message: "event.attendeesInvalid" })
      .int({ message: "event.attendeesInvalid" })
      .min(0, { message: "event.attendeesInvalid" }),
    status: z.enum(EVENT_STATUSES),
    color: z.enum(EVENT_COLORS),
    coverImage: z.string(),
  })
  .refine((values) => values.endDate >= values.startDate, {
    message: "event.endBeforeStart",
    path: ["endDate"],
  })
  .refine(
    (values) =>
      values.startDate !== values.endDate || values.endTime > values.startTime,
    { message: "event.endTimeBeforeStart", path: ["endTime"] }
  )

export type EventFormValues = z.infer<typeof eventSchema>

/**
 * ภาพปกให้เลือกใน Prototype (การอัปโหลดจริงอยู่ใน Phase 6)
 * แต่ละไฟล์คือสีพื้นไล่ระดับบนลงล่าง + เกรน สร้างจากสคริปต์ ไม่ได้วาดมือ
 *
 * เป็นชุดของตัวเอง ไม่ผูกกับพาเลต avatar แล้ว — ภาพปกเป็นของตกแต่งที่ไม่สื่อสถานะ
 * จึงใช้โทนนุ่มชุดนี้ต่อได้ ขณะที่ avatar ย้ายไปใช้ 8 สีสถานะ
 */
export const COVER_OPTIONS = [
  "butter",
  "olive-gold",
  "moss",
  "peach",
  "apricot",
  "coral-red",
  "mist",
  "sage-teal",
  "deep-ocean",
  "orchid",
  "taupe",
  "sky",
  "periwinkle",
  "linen",
].map((name) => `/covers/${name}.svg`)
