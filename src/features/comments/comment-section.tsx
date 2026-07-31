"use client"

import * as React from "react"
import { MessageSquareIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useLocale } from "@/i18n"
import { buildCommentTree } from "@/lib/comment"
import { getFullName } from "@/lib/user"
import { useAppState, useCurrentUser } from "@/store"
import type { CommentNode } from "@/types/comment"
import type { Task } from "@/types/task"
import { CommentInput, type CommentDraft } from "./comment-input"
import { CommentItem } from "./comment-item"
import { useCommentActions } from "./use-comment-actions"

/**
 * Comment Section ใน Task Detail
 * thread เรียงเก่า→ใหม่, reply/แก้ไขแสดงฟอร์มแทรกใต้รายการนั้น
 */
export function CommentSection({ task }: { task: Task }) {
  const { t, locale } = useLocale()
  const state = useAppState()
  const currentUser = useCurrentUser()
  const actions = useCommentActions(task)

  const [busy, setBusy] = React.useState(false)
  const [replyTo, setReplyTo] = React.useState<CommentNode | null>(null)
  const [editing, setEditing] = React.useState<CommentNode | null>(null)
  const [deleting, setDeleting] = React.useState<CommentNode | null>(null)
  const [announcement, setAnnouncement] = React.useState("")

  const comments = React.useMemo(
    () => state.comments.filter((comment) => comment.taskId === task.id),
    [state.comments, task.id]
  )
  const tree = React.useMemo(() => buildCommentTree(comments), [comments])
  const usersById = React.useMemo(
    () => new Map(state.users.map((user) => [user.id, user])),
    [state.users]
  )

  if (!currentUser) return null

  const run = async (action: () => Promise<boolean>) => {
    setBusy(true)
    const ok = await action()
    setBusy(false)
    return ok
  }

  const submitNew = async (draft: CommentDraft) => {
    const ok = await run(() =>
      actions.addComment({ ...draft, parentId: null })
    )
    if (ok) setAnnouncement(t("comment.newCommentAnnounce"))
    return ok
  }

  const submitReply = async (draft: CommentDraft) => {
    if (!replyTo) return false
    const ok = await run(() =>
      actions.addComment({ ...draft, parentId: replyTo.id })
    )
    if (ok) {
      setReplyTo(null)
      setAnnouncement(t("comment.newCommentAnnounce"))
    }
    return ok
  }

  const submitEdit = async (draft: CommentDraft) => {
    if (!editing) return false
    const ok = await run(() => actions.updateComment(editing, draft.body))
    if (ok) setEditing(null)
    return ok
  }

  const replyAuthor = replyTo ? usersById.get(replyTo.authorId) : null
  const deleteReplyCount = deleting
    ? comments.filter((comment) => comment.parentId === deleting.id).length
    : 0

  const renderItem = (node: CommentNode) => (
    <React.Fragment key={node.id}>
      <CommentItem
        node={node}
        depth={0}
        usersById={usersById}
        currentUserId={currentUser.id}
        busy={busy}
        onReply={setReplyTo}
        onEdit={setEditing}
        onDelete={setDeleting}
        onReact={(comment, emoji) => actions.react(comment, emoji)}
      />
      {replyTo && findInTree(node, replyTo.id) ? (
        <li className="border-brand-300 ml-4 border-l-2 pb-2 pl-3 sm:ml-6 sm:pl-4">
          <p className="text-muted-foreground mb-1 text-xs">
            {t("comment.replyingTo", {
              name: replyAuthor ? getFullName(replyAuthor, locale) : "—",
            })}
          </p>
          <CommentInput
            users={state.users}
            idPrefix={`reply-${replyTo.id}`}
            submitLabel={t("comment.reply")}
            busy={busy}
            autoFocus
            onSubmit={submitReply}
            onCancel={() => setReplyTo(null)}
          />
        </li>
      ) : null}
    </React.Fragment>
  )

  return (
    <section aria-label={t("comment.title")} data-testid="comment-section">
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        <MessageSquareIcon className="size-4" aria-hidden="true" />
        {t("comment.countLabel", { count: comments.length })}
      </h3>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      {editing ? (
        <div className="border-brand-300 mb-3 rounded-md border-2 p-2">
          <p className="text-muted-foreground mb-1 text-xs">
            {t("comment.editing")}
          </p>
          <CommentInput
            users={state.users}
            idPrefix={`edit-${editing.id}`}
            initialValue={editing.body[locale]}
            submitLabel={t("common.saveChanges")}
            busy={busy}
            autoFocus
            allowAttachments={false}
            onSubmit={submitEdit}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : (
        <CommentInput
          users={state.users}
          idPrefix="new-comment"
          submitLabel={t("comment.send")}
          busy={busy}
          onSubmit={submitNew}
        />
      )}

      {tree.length === 0 ? (
        <div className="text-muted-foreground mt-4 rounded-md border border-dashed px-3 py-6 text-center text-sm">
          <p className="font-medium">{t("comment.empty")}</p>
          <p className="text-xs">{t("comment.emptyDescription")}</p>
        </div>
      ) : (
        <ul className="mt-3 divide-y" data-testid="comment-list">
          {tree.map(renderItem)}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("comment.deleteTitle")}
        description={t("comment.deleteDescription")}
        impact={
          deleteReplyCount > 0
            ? [t("comment.deleteImpactReplies", { count: deleteReplyCount })]
            : undefined
        }
        confirmLabel={t("common.delete")}
        destructive
        loading={busy}
        onConfirm={async () => {
          if (!deleting) return
          const ok = await run(() => actions.deleteComment(deleting))
          if (ok) setDeleting(null)
        }}
      />
    </section>
  )
}

/** หา comment id ภายใน subtree ของ node นี้ (ใช้วางฟอร์ม reply ให้ถูกกลุ่ม) */
function findInTree(node: CommentNode, id: string): boolean {
  if (node.id === id) return true
  return node.replies.some((reply) => findInTree(reply, id))
}
