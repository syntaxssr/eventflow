"use client"

import * as React from "react"
import {
  MessageSquareReplyIcon,
  PencilIcon,
  SmilePlusIcon,
  Trash2Icon,
} from "lucide-react"

import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FILE_TYPE_STYLE } from "@/constants/file-type"
import { useLocale } from "@/i18n"
import { splitMentionSegments } from "@/lib/comment"
import { formatDateTime, formatFileSize, formatRelativeTime } from "@/lib/format"
import { getFullName, getLegalName } from "@/lib/user"
import { DESTRUCTIVE_ACTION_CLASS } from "@/constants/status"
import { cn } from "@/lib/utils"
import type { CommentNode } from "@/types/comment"
import type { FileType } from "@/types/file"
import type { User } from "@/types/user"

export const REACTION_EMOJIS = ["👍", "❤️", "🎉", "😄", "🙏"]

/**
 * ความคิดเห็นหนึ่งรายการ + reply ใต้มัน
 * indent จำกัดที่ 2 ชั้น — reply ที่ลึกกว่านั้นแสดงชิดระดับ 2 (เหมาะกับจอแคบ)
 */
export function CommentItem({
  node,
  depth,
  usersById,
  currentUserId,
  busy,
  onReply,
  onEdit,
  onDelete,
  onReact,
}: {
  node: CommentNode
  depth: number
  usersById: Map<string, User>
  currentUserId: string
  busy: boolean
  onReply: (node: CommentNode) => void
  onEdit: (node: CommentNode) => void
  onDelete: (node: CommentNode) => void
  onReact: (node: CommentNode, emoji: string) => void
}) {
  const { t, tl, locale } = useLocale()
  const author = usersById.get(node.authorId)
  const isOwn = node.authorId === currentUserId

  // ไฮไลต์ด้วยชื่อจริงล้วน ให้ตรงกับรูปแบบที่ comment-input แทรกลงข้อความ
  const mentionNames = node.mentionIds.flatMap((id) => {
    const user = usersById.get(id)
    return user ? [getLegalName(user, "th"), getLegalName(user, "en")] : []
  })
  const segments = splitMentionSegments(tl(node.body), mentionNames)

  return (
    <li
      className={cn(
        // indent ไม่เกิน 2 ชั้น — reply ที่ลึกกว่าแสดงชิดระดับเดิม (จอแคบไม่ล้น)
        depth > 0 && depth <= 2 && "border-border/70 ml-4 border-l pl-3 sm:ml-6 sm:pl-4"
      )}
      data-testid="comment-item"
    >
      <article className="group py-2">
        <header className="flex items-center gap-2">
          {author ? <UserAvatar user={author} size="xs" /> : null}
          <span className="text-sm font-semibold">
            {author ? getFullName(author, locale) : "—"}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <time
                dateTime={node.createdAt}
                className="text-muted-foreground text-xs"
              >
                {formatRelativeTime(node.createdAt, locale)}
              </time>
            </TooltipTrigger>
            <TooltipContent>
              {formatDateTime(node.createdAt, locale)}
            </TooltipContent>
          </Tooltip>
          {node.isEdited ? (
            <span className="text-muted-foreground text-xs italic">
              · {t("comment.edited")}
            </span>
          ) : null}
        </header>

        <p className="mt-1 text-sm break-words whitespace-pre-wrap">
          {segments.map((segment, index) =>
            segment.type === "mention" ? (
              <span
                key={index}
                className="text-brand-text bg-brand-50 dark:bg-brand-500/15 rounded px-0.5 font-medium"
                data-testid="mention-highlight"
              >
                {segment.value}
              </span>
            ) : (
              <React.Fragment key={index}>{segment.value}</React.Fragment>
            )
          )}
        </p>

        {node.attachments.length > 0 ? (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {node.attachments.map((attachment) => {
              const style = FILE_TYPE_STYLE[attachment.type as FileType]
              const Icon = style?.icon
              return (
                <li
                  key={attachment.id}
                  className="bg-muted flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                  data-testid="comment-attachment"
                >
                  {Icon ? (
                    <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                  ) : null}
                  <span className="max-w-44 truncate">{attachment.filename}</span>
                  <span className="text-muted-foreground">
                    {formatFileSize(attachment.size, locale)}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : null}

        <footer className="mt-1.5 flex flex-wrap items-center gap-1">
          {node.reactions.map((reaction) => {
            const pressed = reaction.userIds.includes(currentUserId)
            return (
              <button
                key={reaction.emoji}
                type="button"
                aria-pressed={pressed}
                aria-label={t("comment.reactionCount", {
                  emoji: reaction.emoji,
                  count: reaction.userIds.length,
                })}
                disabled={busy}
                onClick={() => onReact(node, reaction.emoji)}
                className={cn(
                  "focus-visible:outline-ring flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs focus-visible:outline-2",
                  pressed
                    ? "border-brand-300 bg-brand-50 dark:bg-brand-500/15"
                    : "hover:bg-muted"
                )}
                data-testid="reaction-chip"
              >
                <span aria-hidden="true">{reaction.emoji}</span>
                <span className="tabular-nums">{reaction.userIds.length}</span>
              </button>
            )
          })}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={busy}
                aria-label={t("comment.addReaction", {
                  name: author ? getFullName(author, locale) : "—",
                })}
                data-testid="add-reaction"
              >
                <SmilePlusIcon className="size-3.5" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-auto gap-1 p-1.5">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="hover:bg-muted focus-visible:outline-ring rounded p-1 text-lg focus-visible:outline-2"
                  onClick={() => onReact(node, emoji)}
                  aria-label={emoji}
                >
                  {emoji}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={busy}
            onClick={() => onReply(node)}
            data-testid="reply-comment"
          >
            <MessageSquareReplyIcon className="size-3.5" aria-hidden="true" />
            {t("comment.reply")}
          </Button>

          {isOwn ? (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-7"
                disabled={busy}
                onClick={() => onEdit(node)}
                aria-label={t("common.edit")}
                data-testid="edit-comment"
              >
                <PencilIcon className="size-3.5" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn(DESTRUCTIVE_ACTION_CLASS, "size-7")}
                disabled={busy}
                onClick={() => onDelete(node)}
                aria-label={t("common.delete")}
                data-testid="delete-comment"
              >
                <Trash2Icon className="size-3.5" aria-hidden="true" />
              </Button>
            </>
          ) : null}
        </footer>
      </article>

      {node.replies.length > 0 ? (
        <ul>
          {node.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              node={reply}
              depth={depth + 1}
              usersById={usersById}
              currentUserId={currentUserId}
              busy={busy}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReact={onReact}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
