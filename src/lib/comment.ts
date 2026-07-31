import type { Id } from "@/types/common"
import type {
  Comment,
  CommentNode,
  CommentReaction,
} from "@/types/comment"

/**
 * ตรรกะของความคิดเห็นทั้งหมดเป็น pure function
 * ทั้งการประกอบ thread, การ mention ด้วย @ และการกด reaction
 */

/* -------------------------------------------------------------------------
   Thread
   ------------------------------------------------------------------------- */

/**
 * ประกอบความคิดเห็นเป็น thread — ระดับบนสุดและ reply เรียงจากเก่าไปใหม่
 * reply ที่หา parent ไม่เจอ (เช่น parent ถูกลบ) จะถูกยกขึ้นเป็นระดับบนสุด
 */
export function buildCommentTree(comments: Comment[]): CommentNode[] {
  const nodes = new Map<Id, CommentNode>(
    comments.map((comment) => [comment.id, { ...comment, replies: [] }])
  )
  const roots: CommentNode[] = []

  const sorted = [...nodes.values()].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  )

  for (const node of sorted) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined
    if (parent) parent.replies.push(node)
    else roots.push(node)
  }
  return roots
}

/** ลบความคิดเห็นพร้อม reply ทั้งสายที่อยู่ใต้มัน */
export function removeCommentWithReplies(
  comments: Comment[],
  commentId: Id
): Comment[] {
  const doomed = new Set<Id>([commentId])
  let grew = true
  // ไล่เก็บลูกหลานทุกชั้นจนไม่มีเพิ่ม
  while (grew) {
    grew = false
    for (const comment of comments) {
      if (
        comment.parentId &&
        doomed.has(comment.parentId) &&
        !doomed.has(comment.id)
      ) {
        doomed.add(comment.id)
        grew = true
      }
    }
  }
  return comments.filter((comment) => !doomed.has(comment.id))
}

/** จำนวนความคิดเห็นทั้ง thread (รวม reply) ของงานหนึ่งงาน */
export function countCommentsForTask(
  comments: Comment[],
  taskId: Id
): number {
  return comments.filter((comment) => comment.taskId === taskId).length
}

/* -------------------------------------------------------------------------
   Reaction
   ------------------------------------------------------------------------- */

/**
 * กด/ยกเลิก reaction — คนเดิมกด emoji เดิมซ้ำ = เอาออก
 * reaction ที่ไม่เหลือใครกดจะถูกลบทิ้ง
 */
export function toggleReaction(
  reactions: CommentReaction[],
  emoji: string,
  userId: Id
): CommentReaction[] {
  const existing = reactions.find((reaction) => reaction.emoji === emoji)

  if (!existing) {
    return [...reactions, { emoji, userIds: [userId] }]
  }

  const userIds = existing.userIds.includes(userId)
    ? existing.userIds.filter((id) => id !== userId)
    : [...existing.userIds, userId]

  return reactions
    .map((reaction) =>
      reaction.emoji === emoji ? { ...reaction, userIds } : reaction
    )
    .filter((reaction) => reaction.userIds.length > 0)
}

/* -------------------------------------------------------------------------
   Mention — พิมพ์ @ แล้วเลือกชื่อ
   ------------------------------------------------------------------------- */

export interface MentionContext {
  /** ตำแหน่งของ `@` ในข้อความ */
  start: number
  /** ข้อความหลัง `@` จนถึง caret ใช้เป็นคำค้น */
  query: string
}

/**
 * ตรวจว่า caret กำลังพิมพ์ mention อยู่หรือไม่
 * `@` ต้องอยู่ต้นข้อความหรือตามหลังช่องว่าง และคำค้นต้องไม่มีขึ้นบรรทัดใหม่
 */
export function getMentionContext(
  text: string,
  caret: number
): MentionContext | null {
  const before = text.slice(0, caret)
  const at = before.lastIndexOf("@")
  if (at === -1) return null
  if (at > 0 && !/\s/.test(before[at - 1])) return null

  const query = before.slice(at + 1)
  if (/[\n\r]/.test(query)) return null
  return { start: at, query }
}

/** แทนคำที่กำลังพิมพ์ด้วยชื่อเต็มของคนที่เลือก แล้วคืนข้อความใหม่ + ตำแหน่ง caret */
export function applyMention(
  text: string,
  caret: number,
  context: MentionContext,
  fullName: string
): { text: string; caret: number } {
  const inserted = `@${fullName} `
  const next =
    text.slice(0, context.start) + inserted + text.slice(caret)
  return { text: next, caret: context.start + inserted.length }
}

export interface MentionSegment {
  type: "text" | "mention"
  value: string
}

/**
 * แยกเนื้อหาเป็นช่วงข้อความปกติสลับกับช่วง mention เพื่อไฮไลต์
 * เทียบกับรายชื่อที่ถูก mention จริงเท่านั้น ข้อความ `@` อื่นถือเป็นข้อความปกติ
 */
export function splitMentionSegments(
  body: string,
  mentionNames: string[]
): MentionSegment[] {
  if (mentionNames.length === 0 || body === "")
    return body === "" ? [] : [{ type: "text", value: body }]

  // ชื่อยาวก่อน กัน "@สมชาย ใจดี" ถูกตัดด้วย "@สมชาย"
  const names = [...mentionNames].sort((a, b) => b.length - a.length)
  const segments: MentionSegment[] = []
  let rest = body

  while (rest.length > 0) {
    let earliest: { index: number; token: string } | null = null
    for (const name of names) {
      const token = `@${name}`
      const index = rest.indexOf(token)
      if (index !== -1 && (earliest === null || index < earliest.index)) {
        earliest = { index, token }
      }
    }

    if (!earliest) {
      segments.push({ type: "text", value: rest })
      break
    }
    if (earliest.index > 0) {
      segments.push({ type: "text", value: rest.slice(0, earliest.index) })
    }
    segments.push({ type: "mention", value: earliest.token })
    rest = rest.slice(earliest.index + earliest.token.length)
  }
  return segments
}
