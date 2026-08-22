"use client"

import * as React from "react"
import Link from "next/link"
import { ActivityIcon, ArrowRightIcon } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ACTIVITY_META } from "@/constants/activity"
import { ROUTES } from "@/constants/app"
import { useLocale } from "@/i18n"
import { formatRelativeTime } from "@/lib/format"
import { getFullName } from "@/lib/user"
import type { Activity } from "@/types/activity"
import type { User } from "@/types/user"

/**
 * ความเคลื่อนไหวล่าสุดแสดงยาวรวดเดียว ไม่แบ่งหน้า
 *
 * ต่างจากการ์ดงานด่วนและไฟล์ล่าสุดที่ยังแบ่งหน้าอยู่ เพราะรายการนี้เรียงตามเวลา
 * การกดข้ามหน้าไปมาทำให้เสียลำดับเวลาที่เป็นสาระของมัน เลื่อนอ่านรวดเดียวตรงกว่า
 *
 * แท็บนี้จึงยืดการ์ดให้ยาวจนจบรายการแทนการ scroll ซ้อนอยู่ในการ์ด
 * (ดู [data-detail-card-expand] ใน globals.css)
 */
export function RecentActivityCard({
  activities,
  usersById,
}: {
  activities: Activity[]
  usersById: Map<string, User>
}) {
  const { t, tl, locale } = useLocale()

  return (
    <Card
      className="dashboard-detail-card"
      data-testid="recent-activity"
    >
      <CardHeader>
        <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.activity}>
              {t("common.viewAll")}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            compact
            icon={ActivityIcon}
            title={t("dashboard.noRecentActivity")}
          />
        ) : (
          <ol className="space-y-3">
            {activities.map((activity) => {
              const actor = usersById.get(activity.actorId)
              const meta = ACTIVITY_META[activity.action]
              const Icon = meta.icon

              return (
                <li key={activity.id} className="flex items-start gap-3">
                  {actor ? (
                    <UserAvatar user={actor} size="xs" className="mt-0.5" />
                  ) : (
                    <span
                      className="bg-muted text-muted-foreground mt-0.5 flex size-6 items-center justify-center rounded-full"
                      aria-hidden="true"
                    >
                      <Icon className="size-3" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1 text-sm">
                    <p className="text-pretty">
                      {actor ? (
                        <span className="font-medium">
                          {getFullName(actor, locale)}
                        </span>
                      ) : null}{" "}
                      <span className="text-muted-foreground">
                        {t(meta.labelKey)}
                      </span>{" "}
                      <span className="font-medium">
                        {tl(activity.targetName)}
                      </span>
                    </p>
                    {activity.before && activity.after ? (
                      <p className="text-muted-foreground text-xs">
                        {tl(activity.before)} → {tl(activity.after)}
                      </p>
                    ) : null}
                    <time
                      dateTime={activity.createdAt}
                      className="text-muted-foreground text-xs"
                    >
                      {formatRelativeTime(activity.createdAt, locale)}
                    </time>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
