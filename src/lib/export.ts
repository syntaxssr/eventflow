import { getToday } from "@/constants/mock-date"
import { calculateEventProgress } from "@/lib/progress"
import { sortTimeline } from "@/lib/timeline"
import type { Activity } from "@/types/activity"
import type { EventItem, EventProgress } from "@/types/event"
import type { FileItem } from "@/types/file"
import type { Participant, RsvpSummary } from "@/types/participant"
import type { Task } from "@/types/task"
import type { TimelineItem } from "@/types/timeline"
import type { User } from "@/types/user"

/**
 * รวบรวมข้อมูลของกิจกรรมหนึ่งงานสำหรับการส่งออก (PDF/Excel)
 * เป็น pure function เพื่อให้ unit test ยืนยันขอบเขตข้อมูลได้
 */

export const EXPORT_SECTIONS = [
  "overview",
  "tasks",
  "timeline",
  "participants",
  "files",
  "activity",
] as const

export type ExportSection = (typeof EXPORT_SECTIONS)[number]

export interface ExportSource {
  events: EventItem[]
  tasks: Task[]
  timeline: TimelineItem[]
  participants: Participant[]
  files: FileItem[]
  activities: Activity[]
  users: User[]
}

export interface EventExportData {
  event: EventItem
  progress: EventProgress
  rsvp: RsvpSummary
  tasks: Task[]
  timeline: TimelineItem[]
  participants: Participant[]
  files: FileItem[]
  activities: Activity[]
  usersById: Map<string, User>
}

export function collectEventExportData(
  source: ExportSource,
  eventId: string,
  today: Date = getToday()
): EventExportData | null {
  const event = source.events.find((entry) => entry.id === eventId)
  if (!event) return null

  const tasks = source.tasks.filter((task) => task.eventId === eventId)
  const participants = source.participants.filter(
    (participant) => participant.eventId === eventId
  )

  return {
    event,
    progress: calculateEventProgress(tasks, today),
    rsvp: {
      total: participants.length,
      attending: participants.filter((p) => p.rsvpStatus === "attending").length,
      notAttending: participants.filter((p) => p.rsvpStatus === "not_attending")
        .length,
      pending: participants.filter((p) => p.rsvpStatus === "pending").length,
    },
    tasks,
    timeline: sortTimeline(
      source.timeline.filter((item) => item.eventId === eventId)
    ),
    participants,
    files: source.files.filter(
      (file) => file.eventId === eventId && file.deletedAt === null
    ),
    activities: source.activities
      .filter((activity) => activity.eventId === eventId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    usersById: new Map(source.users.map((user) => [user.id, user])),
  }
}
