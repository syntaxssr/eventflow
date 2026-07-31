"use client"

import { PageContainer, PageHeader } from "@/components/common/page-header"
import {
  SaveIndicator,
  useAutoSaveState,
} from "@/components/common/save-indicator"
import { useDemo } from "@/components/dev/demo-provider"
import { Card, CardContent } from "@/components/ui/card"
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
 */
export function NotificationSettingsView() {
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
    <PageContainer>
      <PageHeader
        title={t("shell.notificationSettings")}
        description={t("notification.settingsSubtitle")}
        actions={<SaveIndicator state={saveState} />}
      />

      <p className="text-muted-foreground -mt-2 text-sm">
        {t("notification.settingsHint")}
      </p>

      <Card className="max-w-2xl">
        <CardContent className="divide-y p-0">
          {NOTIFICATION_SETTING_KEYS.map((key) => {
            const meta = SETTING_LABELS[key]
            const id = `setting-${key}`
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-4 px-4 py-3.5"
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
        </CardContent>
      </Card>
    </PageContainer>
  )
}
