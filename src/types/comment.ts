import type { Id, IsoDateTime, LocalizedText } from "./common"

export interface CommentAttachment {
  id: Id
  filename: string
  size: number
  type: string
}

export interface CommentReaction {
  emoji: string
  userIds: Id[]
}

export interface Comment {
  id: Id
  taskId: Id
  authorId: Id
  body: LocalizedText
  /** null = comment ระดับบนสุด, มีค่า = reply ใน thread */
  parentId: Id | null
  /** ผู้ใช้ที่ถูก mention ด้วย @ */
  mentionIds: Id[]
  attachments: CommentAttachment[]
  reactions: CommentReaction[]
  createdAt: IsoDateTime
  updatedAt: IsoDateTime | null
  isEdited: boolean
}

/** โครงสร้าง thread ที่ใช้เรนเดอร์ */
export interface CommentNode extends Comment {
  replies: CommentNode[]
}
