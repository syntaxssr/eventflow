import type { Locale } from "@/types/common"
import type {
  EventFeedback,
  FeedbackAspect,
  FeedbackSummary,
} from "@/types/feedback"
import { FEEDBACK_ASPECTS } from "@/types/feedback"

function emptyAverages(): Record<FeedbackAspect, number> {
  return Object.fromEntries(
    FEEDBACK_ASPECTS.map((aspect) => [aspect, 0])
  ) as Record<FeedbackAspect, number>
}

/** ปัดเป็นทศนิยมหนึ่งตำแหน่ง — พอสำหรับคะแนน 1–5 และอ่านง่ายบนการ์ดสรุป */
function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10
}

/** คำตอบของกิจกรรมหนึ่ง เรียงจากใหม่ไปเก่า */
export function selectFeedbackByEvent(
  feedback: EventFeedback[],
  eventId: string
): EventFeedback[] {
  return feedback
    .filter((entry) => entry.eventId === eventId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

/** สรุปคะแนนเฉลี่ยรายหัวข้อและภาพรวมของชุดคำตอบที่ส่งเข้ามา */
export function summariseFeedback(feedback: EventFeedback[]): FeedbackSummary {
  const averages = emptyAverages()
  if (feedback.length === 0) {
    return { total: 0, averages, overallAverage: 0, wouldJoinAgain: 0 }
  }

  for (const aspect of FEEDBACK_ASPECTS) {
    const sum = feedback.reduce((total, entry) => total + entry.ratings[aspect], 0)
    averages[aspect] = roundToTenth(sum / feedback.length)
  }

  const overallAverage = roundToTenth(
    FEEDBACK_ASPECTS.reduce((total, aspect) => total + averages[aspect], 0) /
      FEEDBACK_ASPECTS.length
  )

  return {
    total: feedback.length,
    averages,
    overallAverage,
    wouldJoinAgain: feedback.filter((entry) => entry.wouldJoinAgain).length,
  }
}

/** สัดส่วนผู้เข้าร่วมที่ตอบแบบประเมินแล้ว ปัดเป็นจำนวนเต็ม */
export function feedbackResponseRate(
  responded: number,
  invited: number
): number {
  if (invited === 0) return 0
  return Math.round((responded / invited) * 100)
}

/** true เมื่อผู้ตอบคนนี้ส่งแบบประเมินของกิจกรรมนี้ไปแล้ว */
export function hasSubmittedFeedback(
  feedback: EventFeedback[],
  eventId: string,
  participantId: string
): boolean {
  return feedback.some(
    (entry) =>
      entry.eventId === eventId && entry.participantId === participantId
  )
}

/** ความเห็นที่มีข้อความจริง เรียงจากใหม่ไปเก่า */
export function listFeedbackComments(
  feedback: EventFeedback[],
  locale: Locale
): EventFeedback[] {
  return feedback.filter((entry) => entry.comment[locale].trim() !== "")
}
