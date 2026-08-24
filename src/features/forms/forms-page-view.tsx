"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  Clock3Icon,
  MailCheckIcon,
  MessageSquareTextIcon,
  StarIcon,
  type LucideIcon,
} from "lucide-react"

import { PageContainer, PageHeader } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { cn } from "@/lib/utils"

const COMING_SOON_CARD_COUNT = 1

interface FormCard {
  href: string
  icon: LucideIcon
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  /** สีไอคอนและวงแหวนตอน hover — ใช้โทนเดียวกับการ์ดในหน้า HR Section */
  tile: string
  ring: string
  ringHover: string
}

const FORM_CARDS: FormCard[] = [
  {
    href: ROUTES.rsvpForm,
    icon: MailCheckIcon,
    titleKey: "nav.rsvpForm",
    descriptionKey: "forms.rsvpFormDescription",
    tile: "bg-info text-info-foreground",
    ring: "ring-info/25",
    ringHover: "group-hover:ring-info/60",
  },
  {
    href: ROUTES.eventFeedback,
    icon: StarIcon,
    titleKey: "nav.eventFeedback",
    descriptionKey: "forms.eventFeedbackDescription",
    tile: "bg-event-status-purple text-event-status-purple-foreground",
    ring: "ring-event-status-purple/25",
    ringHover: "group-hover:ring-event-status-purple/60",
  },
  {
    href: ROUTES.formResponses,
    icon: MessageSquareTextIcon,
    titleKey: "nav.formResponses",
    descriptionKey: "forms.formResponsesDescription",
    tile: "bg-success text-success-foreground",
    ring: "ring-success/25",
    ringHover: "group-hover:ring-success/60",
  },
]

export function FormsPageView() {
  const t = useT()

  return (
    <PageContainer>
      <PageHeader title={t("nav.forms")} description={t("forms.subtitle")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FORM_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="focus-visible:ring-ring group rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Card
              className={cn(
                "h-full min-h-44 transition-[transform,box-shadow,--tw-ring-color] group-hover:-translate-y-0.5 group-hover:shadow-md",
                card.ring,
                card.ringHover
              )}
            >
              <CardContent className="flex h-full flex-col justify-between gap-6">
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl",
                    card.tile
                  )}
                >
                  <card.icon className="size-6" aria-hidden="true" />
                </span>
                <span className="flex items-end justify-between gap-3">
                  <span>
                    <span className="block text-lg font-semibold">
                      {t(card.titleKey)}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-sm">
                      {t(card.descriptionKey)}
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
        ))}

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
              <Badge variant="secondary">{t("forms.comingSoon")}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
