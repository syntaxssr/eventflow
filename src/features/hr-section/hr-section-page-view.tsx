"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  Clock3Icon,
  LockKeyholeIcon,
  MapPinnedIcon,
  UsersRoundIcon,
} from "lucide-react"

import { PageContainer, PageHeader } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"

const COMING_SOON_CARD_COUNT = 5

export function HrSectionPageView() {
  const t = useT()

  return (
    <PageContainer>
      <PageHeader
        title={t("nav.employees")}
        description={t("hrSection.subtitle")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href={ROUTES.employeeDirectory}
          className="focus-visible:ring-ring group rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Card className="h-full min-h-44 ring-info/25 transition-[transform,box-shadow,--tw-ring-color] group-hover:-translate-y-0.5 group-hover:ring-info/60 group-hover:shadow-md">
            <CardContent className="flex h-full flex-col justify-between gap-6">
              <span className="bg-info text-info-foreground flex size-11 items-center justify-center rounded-xl">
                <UsersRoundIcon className="size-6" aria-hidden="true" />
              </span>
              <span className="flex items-end justify-between gap-3">
                <span>
                  <span className="block text-lg font-semibold">
                    {t("employee.title")}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-sm">
                    {t("hrSection.employeeDirectoryDescription")}
                  </span>
                </span>
                <ArrowRightIcon
                  className="size-5 shrink-0 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link
          href={ROUTES.employeeLockers}
          className="focus-visible:ring-ring group rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Card className="h-full min-h-44 ring-event-status-purple/25 transition-[transform,box-shadow,--tw-ring-color] group-hover:-translate-y-0.5 group-hover:ring-event-status-purple/60 group-hover:shadow-md">
            <CardContent className="flex h-full flex-col justify-between gap-6">
              <span className="bg-event-status-purple text-event-status-purple-foreground flex size-11 items-center justify-center rounded-xl">
                <LockKeyholeIcon className="size-6" aria-hidden="true" />
              </span>
              <span className="flex items-end justify-between gap-3">
                <span>
                  <span className="block text-lg font-semibold">
                    {t("hrSection.employeeLockersTitle")}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-sm">
                    {t("hrSection.employeeLockersDescription")}
                  </span>
                </span>
                <ArrowRightIcon
                  className="size-5 shrink-0 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link
          href={ROUTES.officeSeating}
          className="focus-visible:ring-ring group rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Card className="h-full min-h-44 ring-task-status-orange/25 transition-[transform,box-shadow,--tw-ring-color] group-hover:-translate-y-0.5 group-hover:ring-task-status-orange/60 group-hover:shadow-md">
            <CardContent className="flex h-full flex-col justify-between gap-6">
              <span className="bg-icon-tile-orange text-icon-tile-orange-foreground flex size-11 items-center justify-center rounded-xl">
                <MapPinnedIcon className="size-6" aria-hidden="true" />
              </span>
              <span className="flex items-end justify-between gap-3">
                <span>
                  <span className="block text-lg font-semibold">
                    {t("hrSection.officeSeatingTitle")}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-sm">
                    {t("hrSection.officeSeatingDescription")}
                  </span>
                </span>
                <ArrowRightIcon
                  className="size-5 shrink-0 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </CardContent>
          </Card>
        </Link>

        {Array.from({ length: COMING_SOON_CARD_COUNT }, (_, index) => (
          <Card
            key={index}
            className="bg-muted/30 min-h-44 border-dashed opacity-70"
          >
            <CardContent className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Clock3Icon
                className="text-muted-foreground size-7"
                aria-hidden="true"
              />
              <Badge variant="secondary">{t("hrSection.comingSoon")}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
