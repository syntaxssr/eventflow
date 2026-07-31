"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

import {
  EVENT_STATUS_STYLE,
  PARTICIPANT_TYPE_STYLE,
  PRIORITY_STYLE,
  READINESS_STYLE,
  RSVP_STATUS_STYLE,
  TASK_STATUS_STYLE,
} from "@/constants/status"
import { ACTIVITY_META } from "@/constants/activity"
import type { TranslationKey } from "@/i18n/types"
import { currentVersion } from "@/lib/file"
import { formatFileSize } from "@/lib/format"
import { getFullName } from "@/lib/user"
import type { EventExportData, ExportSection } from "@/lib/export"
import type { Locale } from "@/types/common"

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string

/** helper: ชื่อผู้ใช้หลายคนต่อกันด้วย comma */
function names(
  ids: string[],
  data: EventExportData,
  locale: Locale
): string {
  return ids
    .map((id) => {
      const user = data.usersById.get(id)
      return user ? getFullName(user, locale) : id
    })
    .join(", ")
}

/* -------------------------------------------------------------------------
   Excel — ข้อมูลรายละเอียดแยกชีตตาม section ที่เลือก
   ------------------------------------------------------------------------- */

export function buildEventWorkbook(
  data: EventExportData,
  sections: ExportSection[],
  locale: Locale,
  t: Translate
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new()
  const label = (key: string) => t(key as TranslationKey)

  const appendSheet = (name: string, rows: (string | number)[][]) => {
    const sheet = XLSX.utils.aoa_to_sheet(rows)
    sheet["!cols"] = (rows[0] ?? []).map(() => ({ wch: 24 }))
    XLSX.utils.book_append_sheet(workbook, sheet, name.slice(0, 31))
  }

  if (sections.includes("overview")) {
    appendSheet("Overview", [
      [t("event.name"), data.event.title[locale]],
      [t("event.startDate"), data.event.startDate],
      [t("event.endDate"), data.event.endDate],
      [t("event.location"), data.event.location[locale]],
      [
        t("event.status"),
        label(EVENT_STATUS_STYLE[data.event.status].labelKey),
      ],
      [t("dashboard.progress"), `${data.progress.percent}%`],
      [
        t("dashboard.totalTasks"),
        `${data.progress.completedTasks}/${data.progress.totalTasks}`,
      ],
      [t("participant.summaryTotal"), data.rsvp.total],
      [t("rsvp.attending"), data.rsvp.attending],
      [t("rsvp.notAttending"), data.rsvp.notAttending],
      [t("rsvp.pending"), data.rsvp.pending],
    ])
  }

  if (sections.includes("tasks")) {
    appendSheet("Tasks", [
      [
        t("task.name"),
        t("event.status"),
        t("priority.label"),
        t("task.assignees"),
        t("task.startDate"),
        t("task.dueDate"),
        t("task.checklist"),
      ],
      ...data.tasks.map((task) => [
        task.title[locale],
        label(TASK_STATUS_STYLE[task.status].labelKey),
        label(PRIORITY_STYLE[task.priority].labelKey),
        names(task.assigneeIds, data, locale),
        task.startDate ?? "",
        task.dueDate ?? "",
        `${task.checklist.filter((item) => item.done).length}/${task.checklist.length}`,
      ]),
    ])
  }

  if (sections.includes("timeline")) {
    appendSheet("Timeline", [
      [
        t("timeline.date"),
        t("timeline.startTime"),
        t("timeline.endTime"),
        t("timeline.name"),
        t("timeline.owners"),
        t("timeline.location"),
        t("readiness.label"),
      ],
      ...data.timeline.map((item) => [
        item.date,
        item.startTime,
        item.endTime,
        item.title[locale],
        names(item.ownerIds, data, locale),
        item.location[locale],
        label(READINESS_STYLE[item.readiness].labelKey),
      ]),
    ])
  }

  if (sections.includes("participants")) {
    appendSheet("Participants", [
      [
        t("participant.firstName"),
        t("participant.lastName"),
        t("participant.email"),
        t("participant.department"),
        t("participant.phone"),
        t("rsvp.label"),
        t("participantType.label"),
        t("participant.note"),
      ],
      ...data.participants.map((participant) => [
        participant.firstName[locale],
        participant.lastName[locale],
        participant.email,
        participant.department[locale],
        participant.phone,
        label(RSVP_STATUS_STYLE[participant.rsvpStatus].labelKey),
        label(PARTICIPANT_TYPE_STYLE[participant.type].labelKey),
        participant.note[locale],
      ]),
    ])
  }

  if (sections.includes("files")) {
    appendSheet("Files", [
      [
        t("file.newName"),
        t("file.fileType"),
        t("file.size"),
        t("file.version"),
        t("file.updatedAt"),
      ],
      ...data.files.map((file) => {
        const version = currentVersion(file)
        return [
          file.name,
          file.type,
          formatFileSize(version.size, locale),
          `v${version.versionNumber}`,
          file.updatedAt.slice(0, 10),
        ]
      }),
    ])
  }

  if (sections.includes("activity")) {
    appendSheet("Activity", [
      [
        t("activity.filterActor"),
        t("activity.filterAction"),
        t("common.more"),
        t("activity.dateFrom"),
      ],
      ...data.activities.map((activity) => [
        names([activity.actorId], data, locale),
        label(ACTIVITY_META[activity.action].labelKey),
        activity.targetName[locale],
        activity.createdAt.replace("T", " ").slice(0, 16),
      ]),
    ])
  }

  return workbook
}

/* -------------------------------------------------------------------------
   PDF — สรุปภาพรวม ใช้ข้อความอังกฤษเพื่อให้ glyph ถูกต้องทุกเครื่อง
   (ฟอนต์ไทยของโปรเจกต์เป็น woff2 ซึ่ง jsPDF ฝังไม่ได้)
   ------------------------------------------------------------------------- */

export function buildEventPdf(
  data: EventExportData,
  sections: ExportSection[]
): jsPDF {
  const doc = new jsPDF()
  const withY = doc as unknown as { lastAutoTable?: { finalY: number } }
  let y = 18

  doc.setFontSize(18)
  doc.text(data.event.title.en, 14, y)
  y += 7
  doc.setFontSize(10)
  doc.setTextColor(110)
  doc.text(
    `${data.event.startDate} – ${data.event.endDate} · ${data.event.location.en}`,
    14,
    y
  )
  doc.setTextColor(0)
  y += 8

  const table = (head: string[], body: (string | number)[][]) => {
    autoTable(doc, {
      startY: y,
      head: [head],
      body,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [249, 155, 53] },
    })
    y = (withY.lastAutoTable?.finalY ?? y) + 8
  }

  if (sections.includes("overview")) {
    table(
      ["Overview", ""],
      [
        ["Status", data.event.status.replace("_", " ")],
        ["Progress", `${data.progress.percent}%`],
        [
          "Tasks completed",
          `${data.progress.completedTasks} of ${data.progress.totalTasks}`,
        ],
        ["Expected attendees", data.event.expectedAttendees],
      ]
    )
  }

  if (sections.includes("tasks")) {
    const byStatus = (status: string) =>
      data.tasks.filter((task) => task.status === status).length
    table(
      ["Task summary", "Count"],
      [
        ["Not started", byStatus("not_started")],
        ["In progress", byStatus("in_progress")],
        ["Awaiting review", byStatus("awaiting_review")],
        ["Completed", byStatus("completed")],
        ["Blocked", byStatus("blocked")],
      ]
    )
  }

  if (sections.includes("timeline")) {
    table(
      ["Date", "Time", "Item", "Phase"],
      data.timeline.map((item) => [
        item.date,
        `${item.startTime}–${item.endTime}`,
        item.title.en,
        item.phase,
      ])
    )
  }

  if (sections.includes("participants")) {
    table(
      ["Participant summary", "Count"],
      [
        ["Total", data.rsvp.total],
        ["Attending", data.rsvp.attending],
        ["Not attending", data.rsvp.notAttending],
        ["Pending", data.rsvp.pending],
      ]
    )
  }

  if (sections.includes("files")) {
    table(
      ["File", "Type", "Version"],
      data.files.map((file) => [
        file.name,
        file.type,
        `v${currentVersion(file).versionNumber}`,
      ])
    )
  }

  return doc
}
