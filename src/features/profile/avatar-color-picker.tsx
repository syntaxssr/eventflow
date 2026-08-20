"use client"

import * as React from "react"
import { CheckIcon, PaletteIcon } from "lucide-react"

import {
  SaveIndicator,
  useAutoSaveState,
} from "@/components/common/save-indicator"
import { useDemo } from "@/components/dev/demo-provider"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AVATAR_PALETTE_ITEMS } from "@/constants/avatar-colors"
import { useLocale } from "@/i18n"
import { useAppDispatch, useCurrentUser } from "@/store"

/**
 * เลือกสี Avatar ของตัวเอง — บันทึกทันทีแบบ Auto Save
 *
 * เลือกได้เฉพาะ 8 สีในพาเลต avatar เท่านั้น เพราะตัวอักษรย่อใช้สีคู่ประจำของ
 * แต่ละสีที่ผ่าน WCAG AA มาแล้ว (ดู colors.md) — ไม่เปิดให้กรอก hex เอง
 */
export function AvatarColorPicker() {
  const { t } = useLocale()
  const dispatch = useAppDispatch()
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const { state: saveState, run } = useAutoSaveState()

  if (!currentUser) return null

  const select = (color: string) => {
    if (color.toLowerCase() === currentUser.avatarColor.toLowerCase()) return
    void run(async () => {
      await demo.simulate()
      dispatch({
        type: "user/setAvatarColor",
        userId: currentUser.id,
        color,
      })
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" data-testid="open-avatar-color">
          <PaletteIcon className="size-4" aria-hidden="true" />
          {t("profile.avatarColor")}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" data-testid="avatar-color-picker">
        <PopoverHeader className="flex-row items-center justify-between gap-2">
          <div className="min-w-0">
            <PopoverTitle>{t("profile.avatarColor")}</PopoverTitle>
            <PopoverDescription className="text-xs">
              {t("profile.avatarColorHint")}
            </PopoverDescription>
          </div>
          <SaveIndicator state={saveState} className="shrink-0" />
        </PopoverHeader>

        <div
          role="radiogroup"
          aria-label={t("profile.avatarColor")}
          className="grid grid-cols-4 gap-2"
        >
          {AVATAR_PALETTE_ITEMS.map((item) => {
            const selected =
              item.hex.toLowerCase() === currentUser.avatarColor.toLowerCase()
            return (
              <button
                key={item.hex}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={item.name}
                title={item.name}
                data-testid={`avatar-color-${item.name.toLowerCase()}`}
                onClick={() => select(item.hex)}
                /* วงแหวนรอบสีที่เลือกใช้ foreground ไม่ใช่สีเดิมจาง ๆ
                   เพื่อให้เห็นว่าเลือกอันไหนอยู่แม้สีพาเลตจะอ่อนใกล้กัน */
                className="focus-visible:outline-ring flex h-10 items-center justify-center rounded-lg ring-1 ring-foreground/10 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 data-[selected=true]:ring-2 data-[selected=true]:ring-foreground"
                data-selected={selected}
                style={{ backgroundColor: item.hex, color: item.foreground }}
              >
                {selected ? (
                  <CheckIcon className="size-4" aria-hidden="true" />
                ) : null}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
