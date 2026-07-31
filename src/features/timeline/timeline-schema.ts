import { z } from "zod"

import { READINESS_STATUSES } from "@/types/timeline"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^\d{2}:\d{2}$/

export const timelineSchema = z
  .object({
    title: z.string().trim().min(1, { message: "timeline.nameRequired" }),
    date: z.string().regex(DATE_PATTERN, { message: "event.dateRequired" }),
    startTime: z.string().regex(TIME_PATTERN, { message: "event.dateRequired" }),
    endTime: z.string().regex(TIME_PATTERN, { message: "event.dateRequired" }),
    location: z.string().trim().min(1, { message: "timeline.locationRequired" }),
    ownerIds: z.array(z.string()).min(1, { message: "timeline.ownerRequired" }),
    readiness: z.enum(READINESS_STATUSES),
    note: z.string().trim(),
    /** ค่าว่างแปลว่าไม่ผูกกับงานใด */
    linkedTaskId: z.string(),
  })
  .refine((values) => values.endTime > values.startTime, {
    message: "timeline.endBeforeStart",
    path: ["endTime"],
  })

export type TimelineFormValues = z.infer<typeof timelineSchema>
