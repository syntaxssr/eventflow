"use client"

import * as React from "react"
import { Loader2Icon, PaperclipIcon, SendIcon, XIcon } from "lucide-react"
import { appToast } from "@/lib/gif-toast"

import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FILE_TYPE_STYLE } from "@/constants/file-type"
import { useLocale } from "@/i18n"
import {
  applyMention,
  getMentionContext,
  type MentionContext,
} from "@/lib/comment"
import { validateFile } from "@/lib/file"
import { formatFileSize } from "@/lib/format"
import { newId } from "@/lib/id"
import { getFullName, getLegalName } from "@/lib/user"
import { cn } from "@/lib/utils"
import type { CommentAttachment } from "@/types/comment"
import type { FileType } from "@/types/file"
import type { User } from "@/types/user"

export interface CommentDraft {
  body: string
  mentionIds: string[]
  attachments: CommentAttachment[]
}

/**
 * ช่องพิมพ์ความคิดเห็น พร้อม mention autocomplete (พิมพ์ @) และแนบไฟล์
 * ใช้ combobox pattern: textarea เป็น input, รายชื่อเป็น listbox
 */
export function CommentInput({
  users,
  idPrefix,
  initialValue = "",
  submitLabel,
  busy = false,
  autoFocus = false,
  allowAttachments = true,
  onSubmit,
  onCancel,
}: {
  users: User[]
  /** ทำให้ id ของ combobox ไม่ชนกันเมื่อมี input หลายช่องบนจอ */
  idPrefix: string
  initialValue?: string
  submitLabel: string
  busy?: boolean
  autoFocus?: boolean
  allowAttachments?: boolean
  onSubmit: (draft: CommentDraft) => Promise<boolean>
  onCancel?: () => void
}) {
  const { t, locale } = useLocale()
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const [value, setValue] = React.useState(initialValue)
  const [attachments, setAttachments] = React.useState<CommentAttachment[]>([])
  /** ผู้ที่เคยถูกเลือกผ่าน autocomplete: id → ชื่อเต็มที่แทรกลงข้อความ */
  const [mentioned, setMentioned] = React.useState<Map<string, string>>(
    new Map()
  )
  const [context, setContext] = React.useState<MentionContext | null>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)

  const listboxId = `${idPrefix}-mention-listbox`

  const matches = React.useMemo(() => {
    if (!context) return []
    const query = context.query.trim().toLowerCase()
    return users
      .filter((user) => {
        if (query === "") return true
        return [
          getFullName(user, "th"),
          getFullName(user, "en"),
          user.firstName.th,
          user.firstName.en,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      })
      .slice(0, 6)
  }, [context, users])

  const open = context !== null && matches.length > 0

  const refreshContext = (element: HTMLTextAreaElement) => {
    setContext(getMentionContext(element.value, element.selectionStart ?? 0))
    setActiveIndex(0)
  }

  const pickUser = (user: User) => {
    const element = textareaRef.current
    if (!element || !context) return

    // แทรกเป็นชื่อจริงล้วน — วงเล็บชื่อเล่นทำให้ข้อความ mention รกและยาวเกิน
    const mentionName = getLegalName(user, locale)
    const caret = element.selectionStart ?? element.value.length
    const next = applyMention(element.value, caret, context, mentionName)

    setValue(next.text)
    setMentioned((current) => new Map(current).set(user.id, mentionName))
    setContext(null)
    requestAnimationFrame(() => {
      element.focus()
      element.setSelectionRange(next.caret, next.caret)
    })
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open) return
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % matches.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + matches.length) % matches.length)
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault()
      pickUser(matches[activeIndex])
    } else if (event.key === "Escape") {
      event.preventDefault()
      setContext(null)
    }
  }

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const accepted: CommentAttachment[] = []
    for (const file of files) {
      const result = validateFile(file)
      if (!result.valid) {
        appToast.error(
          result.error === "too_large"
            ? t("file.tooLarge", {
                name: file.name,
                size: formatFileSize(file.size, locale),
              })
            : t("file.unsupportedType", { name: file.name })
        )
        continue
      }
      accepted.push({
        id: newId("ca"),
        filename: file.name,
        size: file.size,
        type: result.type as FileType,
      })
    }
    if (accepted.length > 0)
      setAttachments((current) => [...current, ...accepted])
  }

  const submit = async () => {
    const body = value.trim()
    if (body === "") return

    // นับเฉพาะ mention ที่ยังเหลืออยู่ในข้อความจริง
    const mentionIds = [...mentioned.entries()]
      .filter(([, name]) => body.includes(`@${name}`))
      .map(([id]) => id)

    const ok = await onSubmit({ body, mentionIds, attachments })
    if (ok) {
      setValue("")
      setAttachments([])
      setMentioned(new Map())
      setContext(null)
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          rows={3}
          autoFocus={autoFocus}
          disabled={busy}
          placeholder={t("comment.placeholder")}
          aria-label={t("comment.inputLabel")}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={
            open ? `${idPrefix}-mention-${matches[activeIndex]?.id}` : undefined
          }
          aria-autocomplete="list"
          data-testid={`${idPrefix}-input`}
          onChange={(event) => {
            setValue(event.target.value)
            refreshContext(event.target)
          }}
          onClick={(event) => refreshContext(event.currentTarget)}
          onKeyUp={(event) => {
            if (!["ArrowDown", "ArrowUp", "Enter", "Tab", "Escape"].includes(event.key)) {
              refreshContext(event.currentTarget)
            }
          }}
          onKeyDown={onKeyDown}
          onBlur={() => {
            // หน่วงให้คลิกรายชื่อใน listbox ทัน ก่อน dropdown ปิด
            setTimeout(() => setContext(null), 150)
          }}
        />

        {open ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-label={t("comment.mentionListLabel")}
            className="bg-popover text-popover-foreground absolute right-0 left-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-md border p-1 shadow-md"
            data-testid={`${idPrefix}-mention-list`}
          >
            {matches.map((user, index) => (
              <li
                key={user.id}
                id={`${idPrefix}-mention-${user.id}`}
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                  index === activeIndex && "bg-accent text-accent-foreground"
                )}
                onMouseDown={(event) => {
                  event.preventDefault()
                  pickUser(user)
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <UserAvatar user={user} size="xs" />
                <span className="min-w-0 flex-1 truncate">
                  {getFullName(user, locale)}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.position[locale]}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {attachments.length > 0 ? (
        <ul
          className="flex flex-wrap gap-1.5"
          aria-label={t("comment.attachmentLabel", {
            count: attachments.length,
          })}
        >
          {attachments.map((attachment) => {
            const style = FILE_TYPE_STYLE[attachment.type as FileType]
            const Icon = style.icon
            return (
              <li
                key={attachment.id}
                className="bg-muted flex items-center gap-1.5 rounded-full py-1 pr-1 pl-2.5 text-xs"
              >
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="max-w-40 truncate">{attachment.filename}</span>
                <span className="text-muted-foreground">
                  {formatFileSize(attachment.size, locale)}
                </span>
                <button
                  type="button"
                  className="hover:bg-background focus-visible:outline-ring rounded-full p-0.5 focus-visible:outline-2"
                  aria-label={t("comment.removeAttachment", {
                    name: attachment.filename,
                  })}
                  onClick={() =>
                    setAttachments((current) =>
                      current.filter((entry) => entry.id !== attachment.id)
                    )
                  }
                >
                  <XIcon className="size-3" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      <div className="flex items-center gap-2">
        {allowAttachments ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={busy}
              aria-label={t("comment.attach")}
              onClick={() => fileRef.current?.click()}
              data-testid={`${idPrefix}-attach`}
            >
              <PaperclipIcon className="size-4" aria-hidden="true" />
            </Button>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="sr-only"
              aria-label={t("comment.attach")}
              tabIndex={-1}
              onChange={(event) => {
                addFiles(event.target.files)
                event.target.value = ""
              }}
            />
          </>
        ) : null}

        <span className="flex-1" />

        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={busy}
          >
            {t("common.cancel")}
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          onClick={submit}
          disabled={busy || value.trim() === ""}
          data-testid={`${idPrefix}-submit`}
        >
          {busy ? (
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <SendIcon className="size-4" aria-hidden="true" />
          )}
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
