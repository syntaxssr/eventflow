import { getParticipantFullName } from "@/lib/participant"
import type { EventFeedback, FeedbackAspect } from "@/types/feedback"
import { FEEDBACK_ASPECTS } from "@/types/feedback"
import { MOCK_PARTICIPANTS } from "./participants"

/** กิจกรรมที่จบไปแล้วและมีผลประเมินให้ดู */
const FEEDBACK_EVENT_ID = "e-5"

/** จำนวนผู้ตอบแบบประเมิน — น้อยกว่าจำนวนผู้เข้าร่วม เพื่อให้ Response Rate ไม่เต็ม 100% */
const RESPONDENT_COUNT = 26

/**
 * คะแนนชุดคงที่ต่อหัวข้อ วนใช้ตามลำดับผู้ตอบ
 * ใช้ค่าตายตัวแทนการสุ่ม เพื่อให้ค่าเฉลี่ยเท่าเดิมทุกครั้งที่โหลด
 */
const RATING_PATTERN: Record<FeedbackAspect, number[]> = {
  overall: [5, 4, 5, 4, 3, 5, 4, 5],
  content: [4, 5, 4, 4, 3, 4, 5, 4],
  venue: [5, 5, 4, 3, 4, 5, 3, 4],
  catering: [3, 4, 3, 5, 2, 4, 3, 4],
  organization: [5, 4, 5, 5, 4, 4, 5, 5],
}

/** ความเห็นตัวอย่าง — ช่องว่างคือคนที่ให้แต่คะแนนโดยไม่เขียนอะไร */
const COMMENTS: { th: string; en: string }[] = [
  {
    th: "จัดงานได้ลื่นไหลมาก ทีมงานดูแลดีตั้งแต่ลงทะเบียนจนจบงาน",
    en: "The event ran very smoothly and the team took good care of us from check-in to the end.",
  },
  { th: "", en: "" },
  {
    th: "เนื้อหาช่วงเช้ามีประโยชน์ แต่ช่วงบ่ายอัดแน่นไปหน่อย",
    en: "The morning sessions were useful, but the afternoon felt too packed.",
  },
  { th: "", en: "" },
  {
    th: "อาหารว่างหมดเร็วมาก อยากให้เตรียมเผื่อมากกว่านี้",
    en: "The snacks ran out very quickly — please prepare more next time.",
  },
  {
    th: "ห้องประชุมกว้างและเสียงชัดดี นั่งหลังสุดก็ยังได้ยิน",
    en: "The hall was spacious with clear audio, even from the very back row.",
  },
  { th: "", en: "" },
  {
    th: "อยากให้มีช่วงถาม-ตอบยาวกว่านี้ คำถามยังค้างอยู่หลายข้อ",
    en: "I would like a longer Q&A — a lot of questions were left unanswered.",
  },
]

/** เวลาที่ตอบ กระจายในวันถัดจากวันจบงาน (`e-5` จบวันที่ 2026-06-26) */
function submittedAt(index: number): string {
  const hour = 9 + (index % 8)
  const minute = (index * 7) % 60
  return `2026-06-27T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+07:00`
}

function buildFeedback(): EventFeedback[] {
  const participants = MOCK_PARTICIPANTS.filter(
    (participant) => participant.eventId === FEEDBACK_EVENT_ID
  ).slice(0, RESPONDENT_COUNT)

  return participants.map((participant, index) => {
    // ทุกคนที่ 5 เลือกตอบแบบไม่ระบุตัวตน เพื่อให้หน้าสรุปมีทั้งสองแบบให้เห็น
    const anonymous = index % 5 === 4
    const ratings = Object.fromEntries(
      FEEDBACK_ASPECTS.map((aspect) => [
        aspect,
        RATING_PATTERN[aspect][index % RATING_PATTERN[aspect].length],
      ])
    ) as Record<FeedbackAspect, number>

    return {
      id: `fb-${FEEDBACK_EVENT_ID}-${index + 1}`,
      eventId: FEEDBACK_EVENT_ID,
      participantId: anonymous ? null : participant.id,
      participantName: anonymous
        ? { th: "", en: "" }
        : {
            th: getParticipantFullName(participant, "th"),
            en: getParticipantFullName(participant, "en"),
          },
      ratings,
      comment: COMMENTS[index % COMMENTS.length],
      wouldJoinAgain: ratings.overall >= 4,
      submittedAt: submittedAt(index),
    }
  })
}

export const MOCK_FEEDBACK: EventFeedback[] = buildFeedback()
