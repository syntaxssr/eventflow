import { z } from "zod"

import { PRIORITIES, TASK_STATUSES } from "@/types/task"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const taskSchema = z
  .object({
    title: z.string().trim().min(1, { message: "task.nameRequired" }),
    description: z.string().trim(),
    notes: z.string().trim(),
    eventId: z.string().min(1),
    assigneeIds: z.array(z.string()).min(1, { message: "task.assigneeRequired" }),
    /** ว่างได้ — งานบางงานไม่ระบุวันเริ่ม */
    startDate: z.union([z.literal(""), z.string().regex(DATE_PATTERN)]),
    dueDate: z.string().regex(DATE_PATTERN, { message: "task.dueDateRequired" }),
    priority: z.enum(PRIORITIES),
    status: z.enum(TASK_STATUSES),
  })
  .refine((values) => !values.startDate || values.dueDate >= values.startDate, {
    message: "task.dueBeforeStart",
    path: ["dueDate"],
  })

export type TaskFormValues = z.infer<typeof taskSchema>
