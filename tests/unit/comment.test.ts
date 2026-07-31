import { describe, expect, it } from "vitest"

import {
  applyMention,
  buildCommentTree,
  countCommentsForTask,
  getMentionContext,
  removeCommentWithReplies,
  splitMentionSegments,
  toggleReaction,
} from "@/lib/comment"
import type { Comment } from "@/types/comment"

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: "c-1",
    taskId: "t-1",
    authorId: "u-1",
    body: { th: "ข้อความ", en: "Message" },
    parentId: null,
    mentionIds: [],
    attachments: [],
    reactions: [],
    createdAt: "2026-07-30T10:00:00+07:00",
    updatedAt: null,
    isEdited: false,
    ...overrides,
  }
}

describe("buildCommentTree", () => {
  it("ประกอบ thread: ระดับบนสุดและ reply เรียงจากเก่าไปใหม่", () => {
    const comments = [
      makeComment({ id: "c-2", createdAt: "2026-07-30T12:00:00+07:00" }),
      makeComment({ id: "c-1", createdAt: "2026-07-30T10:00:00+07:00" }),
      makeComment({
        id: "c-3",
        parentId: "c-1",
        createdAt: "2026-07-30T13:00:00+07:00",
      }),
      makeComment({
        id: "c-4",
        parentId: "c-1",
        createdAt: "2026-07-30T11:00:00+07:00",
      }),
    ]
    const tree = buildCommentTree(comments)
    expect(tree.map((node) => node.id)).toEqual(["c-1", "c-2"])
    expect(tree[0].replies.map((node) => node.id)).toEqual(["c-4", "c-3"])
  })

  it("reply ที่ parent หายไปถูกยกเป็นระดับบนสุด", () => {
    const tree = buildCommentTree([
      makeComment({ id: "c-9", parentId: "missing" }),
    ])
    expect(tree.map((node) => node.id)).toEqual(["c-9"])
  })
})

describe("removeCommentWithReplies", () => {
  it("ลบความคิดเห็นพร้อมลูกหลานทุกชั้น แต่ไม่แตะสายอื่น", () => {
    const comments = [
      makeComment({ id: "c-1" }),
      makeComment({ id: "c-2", parentId: "c-1" }),
      makeComment({ id: "c-3", parentId: "c-2" }),
      makeComment({ id: "c-4" }),
    ]
    const result = removeCommentWithReplies(comments, "c-1")
    expect(result.map((comment) => comment.id)).toEqual(["c-4"])
  })
})

describe("countCommentsForTask", () => {
  it("นับรวม reply ของงานเดียวกัน", () => {
    const comments = [
      makeComment({ id: "c-1" }),
      makeComment({ id: "c-2", parentId: "c-1" }),
      makeComment({ id: "c-3", taskId: "t-2" }),
    ]
    expect(countCommentsForTask(comments, "t-1")).toBe(2)
  })
})

describe("toggleReaction", () => {
  it("กดครั้งแรกเพิ่ม กดซ้ำเอาออก และลบ reaction ที่ว่าง", () => {
    const added = toggleReaction([], "👍", "u-1")
    expect(added).toEqual([{ emoji: "👍", userIds: ["u-1"] }])

    const twoUsers = toggleReaction(added, "👍", "u-2")
    expect(twoUsers[0].userIds).toEqual(["u-1", "u-2"])

    const removed = toggleReaction(twoUsers, "👍", "u-1")
    expect(removed[0].userIds).toEqual(["u-2"])

    expect(toggleReaction(removed, "👍", "u-2")).toEqual([])
  })
})

describe("getMentionContext", () => {
  it("จับ @ ที่ต้นข้อความหรือหลังช่องว่าง", () => {
    expect(getMentionContext("@ปวี", 4)).toEqual({ start: 0, query: "ปวี" })
    expect(getMentionContext("สวัสดี @Tha", 11)).toEqual({
      start: 7,
      query: "Tha",
    })
  })

  it("ไม่จับอีเมลหรือ @ ที่ติดกับตัวอักษรอื่น", () => {
    expect(getMentionContext("a@b", 3)).toBeNull()
  })

  it("ไม่จับเมื่อคำค้นข้ามบรรทัด", () => {
    expect(getMentionContext("@abc\ndef", 8)).toBeNull()
  })
})

describe("applyMention", () => {
  it("แทนคำที่พิมพ์ค้างด้วยชื่อเต็ม แล้วขยับ caret ไปท้ายชื่อ", () => {
    const result = applyMention("สวัสดี @ปวี ครับ", 11, { start: 7, query: "ปวี" }, "ปวีณา ศรีสุวรรณ")
    expect(result.text).toBe("สวัสดี @ปวีณา ศรีสุวรรณ  ครับ")
    expect(result.caret).toBe(7 + "@ปวีณา ศรีสุวรรณ ".length)
  })
})

describe("splitMentionSegments", () => {
  it("แยกช่วง mention ออกจากข้อความ และเลือกชื่อยาวก่อน", () => {
    const segments = splitMentionSegments(
      "ฝาก @ปวีณา ศรีสุวรรณ ตรวจไฟล์ด้วย",
      ["ปวีณา ศรีสุวรรณ", "ปวีณา"]
    )
    expect(segments).toEqual([
      { type: "text", value: "ฝาก " },
      { type: "mention", value: "@ปวีณา ศรีสุวรรณ" },
      { type: "text", value: " ตรวจไฟล์ด้วย" },
    ])
  })

  it("@ ที่ไม่ตรงกับรายชื่อถือเป็นข้อความปกติ", () => {
    expect(splitMentionSegments("คุยกับ @ใครก็ไม่รู้", ["ปวีณา"])).toEqual([
      { type: "text", value: "คุยกับ @ใครก็ไม่รู้" },
    ])
  })
})
