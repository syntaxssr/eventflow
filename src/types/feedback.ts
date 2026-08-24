import type { Id, IsoDateTime, LocalizedText } from "./common"

/**
 * หัวข้อที่ให้คะแนนในแบบประเมินหลังจบงาน
 * ใช้ชุดเดียวกันทุกกิจกรรม เพื่อให้เทียบผลข้ามงานได้
 */
export const FEEDBACK_ASPECTS = [
  "overall",
  "content",
  "venue",
  "catering",
  "organization",
] as const

export type FeedbackAspect = (typeof FEEDBACK_ASPECTS)[number]

/** คะแนนต่ำสุด–สูงสุดของแต่ละหัวข้อ */
export const FEEDBACK_RATING_MIN = 1
export const FEEDBACK_RATING_MAX = 5

/** คำตอบแบบประเมินหนึ่งชุด — หนึ่งคนต่อหนึ่งกิจกรรม */
export interface EventFeedback {
  id: Id
  eventId: Id
  /** ผู้ตอบ — null เมื่อเลือกตอบแบบไม่ระบุตัวตน */
  participantId: Id | null
  /** ชื่อผู้ตอบ ณ เวลาที่ตอบ — ว่างเมื่อไม่ระบุตัวตน */
  participantName: LocalizedText
  ratings: Record<FeedbackAspect, number>
  /** ผู้ตอบกรอกภาษาเดียว จึงเก็บข้อความเดียวกันทั้งสองภาษา */
  comment: LocalizedText
  wouldJoinAgain: boolean
  submittedAt: IsoDateTime
}

/** สรุปผลประเมินของกิจกรรมหนึ่ง */
export interface FeedbackSummary {
  total: number
  /** คะแนนเฉลี่ยรายหัวข้อ — 0 เมื่อยังไม่มีคำตอบ */
  averages: Record<FeedbackAspect, number>
  /** คะแนนเฉลี่ยรวมทุกหัวข้อ */
  overallAverage: number
  /** จำนวนคนที่ตอบว่าจะกลับมาร่วมงานอีก */
  wouldJoinAgain: number
}
