"use client"

import * as React from "react"

import {
  SaveIndicator,
  useAutoSaveState,
} from "@/components/common/save-indicator"
import { useDemo } from "@/components/dev/demo-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { useAppDispatch, useAppState, useCurrentUser } from "@/store"
import {
  NOTIFICATION_SETTING_KEYS,
  type NotificationSettingKey,
} from "@/types/notification"

const SETTING_LABELS: Record<
  NotificationSettingKey,
  { label: TranslationKey; description: TranslationKey }
> = {
  assignedTask: {
    label: "notification.settingAssignedTask",
    description: "notification.settingAssignedTaskDescription",
  },
  dueSoon: {
    label: "notification.settingDueSoon",
    description: "notification.settingDueSoonDescription",
  },
  fileChange: {
    label: "notification.settingFileChange",
    description: "notification.settingFileChangeDescription",
  },
  mention: {
    label: "notification.settingMention",
    description: "notification.settingMentionDescription",
  },
  timelineChange: {
    label: "notification.settingTimelineChange",
    description: "notification.settingTimelineChangeDescription",
  },
}

/**
 * ตั้งค่าการแจ้งเตือน — Auto Save ตามข้อกำหนด
 * ประเภทที่ปิดจะถูก useNotify ข้ามตอนสร้างการแจ้งเตือนใหม่
 *
 * เป็น dialog ไม่ใช่หน้าเต็ม เพราะมีแค่ 5 สวิตช์ที่บันทึกเอง ไม่มีสถานะที่ต้อง deep-link
 * ปิดได้ทุกเมื่อโดยไม่ต้องยืนยัน
 */
export function NotificationSettingsDialog({
  children,
  open,
  onOpenChange,
}: {
  /** ปุ่มเปิด — ละไว้ได้ถ้าคุมสถานะเปิด/ปิดจากภายนอก */
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { t } = useLocale()
  const state = useAppState()
  const dispatch = useAppDispatch()
  const currentUser = useCurrentUser()
  const demo = useDemo()
  const { state: saveState, run } = useAutoSaveState()

  if (!currentUser) return null
  const settings = state.notificationSettings[currentUser.id]

  const toggle = (key: NotificationSettingKey, value: boolean) => {
    void run(async () => {
      await demo.simulate()
      dispatch({
        type: "notification/updateSettings",
        userId: currentUser.id,
        settings: { [key]: value },
      })
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent
        className="sm:max-w-lg"
        data-testid="notification-settings-dialog"
      >
        <DialogHeader>
          <DialogTitle>{t("shell.notificationSettings")}</DialogTitle>
          <DialogDescription>
            {t("notification.settingsSubtitle")}
          </DialogDescription>
        </DialogHeader>

        {/* คำอธิบาย + สถานะบันทึกอัตโนมัติอยู่แถวเดียวกัน ไม่ชนปุ่มปิดมุมขวาบน */}
        <div className="-mt-2 flex min-h-5 items-center justify-between gap-4">
          <p className="text-muted-foreground min-w-0 flex-1 text-xs">
            {t("notification.settingsHint")}
          </p>
          <SaveIndicator state={saveState} className="shrink-0" />
        </div>

        <div className="divide-y">
          {NOTIFICATION_SETTING_KEYS.map((key) => {
            const meta = SETTING_LABELS[key]
            const id = `setting-${key}`
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <Label htmlFor={id} className="text-sm font-medium">
                    {t(meta.label)}
                  </Label>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {t(meta.description)}
                  </p>
                </div>
                <Switch
                  id={id}
                  checked={settings?.[key] ?? true}
                  onCheckedChange={(value) => toggle(key, value)}
                  data-testid={id}
                />
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
