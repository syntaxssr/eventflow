"use client"

import Image from "next/image"
import { CheckIcon, ImageIcon, LockIcon } from "lucide-react"

import {
  SaveIndicator,
  useAutoSaveState,
} from "@/components/common/save-indicator"
import { useDemo } from "@/components/dev/demo-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AVATAR_OPTIONS, type AvatarOption } from "@/constants/avatar-options"
import { useLocale } from "@/i18n"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppState, useCurrentUser } from "@/store"

/** เลือกมาสคอตของตัวเอง โดยมาสคอตหนึ่งตัวถูกใช้ได้ครั้งละหนึ่งคน */
export function AvatarPicker() {
  const { t, locale } = useLocale()
  const state = useAppState()
  const currentUser = useCurrentUser()
  const dispatch = useAppDispatch()
  const demo = useDemo()
  const { state: saveState, run } = useAutoSaveState()

  if (!currentUser) return null

  const avatarsUsedByOthers = new Set(
    state.users
      .filter((user) => user.id !== currentUser.id)
      .map((user) => user.avatarUrl)
      .filter(Boolean)
  )

  const select = (option: AvatarOption) => {
    if (
      option.src === currentUser.avatarUrl ||
      avatarsUsedByOthers.has(option.src)
    ) {
      return
    }

    void run(async () => {
      await demo.simulate()
      dispatch({
        type: "user/setAvatar",
        userId: currentUser.id,
        avatarUrl: option.src,
        avatarColor: option.backgroundColor,
      })
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="open-avatar-picker">
          <ImageIcon className="size-4" aria-hidden="true" />
          {t("profile.chooseAvatar")}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl"
        data-testid="avatar-picker"
      >
        <DialogHeader className="pr-8">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>{t("profile.chooseAvatar")}</DialogTitle>
            <SaveIndicator state={saveState} className="shrink-0" />
          </div>
          <DialogDescription>{t("profile.chooseAvatarHint")}</DialogDescription>
        </DialogHeader>

        <div
          role="listbox"
          aria-label={t("profile.chooseAvatar")}
          className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8"
        >
          {AVATAR_OPTIONS.map((option) => {
            const selected = option.src === currentUser.avatarUrl
            const unavailable = avatarsUsedByOthers.has(option.src)
            const label = option.name[locale]

            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-label={
                  unavailable
                    ? `${label} — ${t("profile.avatarInUse")}`
                    : label
                }
                aria-selected={selected}
                disabled={unavailable || saveState === "saving"}
                title={unavailable ? t("profile.avatarInUse") : label}
                data-testid={`avatar-option-${option.id}`}
                data-selected={selected}
                data-unavailable={unavailable}
                onClick={() => select(option)}
                className={cn(
                  "focus-visible:outline-ring relative aspect-square overflow-hidden rounded-xl ring-1 ring-foreground/10 transition-[transform,opacity,filter,box-shadow] hover:-translate-y-0.5 hover:ring-foreground/30 focus-visible:outline-2 focus-visible:outline-offset-2 data-[selected=true]:ring-2 data-[selected=true]:ring-primary",
                  unavailable &&
                    "cursor-not-allowed opacity-35 grayscale hover:translate-y-0"
                )}
              >
                <Image
                  src={option.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 88px, (min-width: 640px) 96px, 22vw"
                  className="object-cover"
                />

                {selected ? (
                  <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <CheckIcon className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">{t("profile.currentAvatar")}</span>
                  </span>
                ) : null}

                {unavailable ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/25">
                    <LockIcon className="size-5 text-foreground" aria-hidden="true" />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
