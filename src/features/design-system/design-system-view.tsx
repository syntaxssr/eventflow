"use client"

import * as React from "react"
import { toast } from "sonner"

import { LanguageToggle } from "@/components/common/language-toggle"
import { StatusBadge } from "@/components/common/status-badge"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { APP_NAME } from "@/constants/app"
import { AVATAR_PALETTE_ITEMS } from "@/constants/avatar-colors"
import {
  DUE_SOON_STYLE,
  EVENT_STATUS_STYLE,
  OVERDUE_STYLE,
  PARTICIPANT_TYPE_STYLE,
  PRIORITY_STYLE,
  READINESS_STYLE,
  RSVP_STATUS_STYLE,
  TASK_STATUS_STYLE,
  type StatusStyle,
} from "@/constants/status"
import { useT } from "@/i18n"
import { getReadableTextColor } from "@/lib/color"

const BRAND_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const

const SEMANTIC_TOKENS = [
  {
    name: "success",
    surface: "bg-success-surface",
    solid: "bg-success",
    foreground: "text-success-foreground",
  },
  {
    name: "warning",
    surface: "bg-warning-surface",
    solid: "bg-warning",
    foreground: "text-warning-foreground",
  },
  {
    name: "info",
    surface: "bg-info-surface",
    solid: "bg-info",
    foreground: "text-info-foreground",
  },
  {
    name: "danger",
    surface: "bg-danger-surface",
    solid: "bg-danger",
    foreground: "text-danger-foreground",
  },
] as const

const STATUS_COLOR_TOKENS = [
  { name: "default", label: "Default" },
  { name: "gray", label: "Gray" },
  { name: "brown", label: "Brown" },
  { name: "orange", label: "Orange" },
  { name: "yellow", label: "Yellow" },
  { name: "green", label: "Green" },
  { name: "blue", label: "Blue" },
  { name: "purple", label: "Purple" },
  { name: "pink", label: "Pink" },
  { name: "red", label: "Red" },
] as const

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function BadgeRow({
  label,
  styles,
}: {
  label: string
  styles: Record<string, StatusStyle>
}) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(styles).map(([key, style]) => (
          <StatusBadge key={key} style={style} />
        ))}
      </div>
    </div>
  )
}

function StatusColorRow({
  label,
  colorName,
  sampleText,
}: {
  label: string
  colorName: (typeof STATUS_COLOR_TOKENS)[number]["name"]
  sampleText: string
}) {
  const backgroundColor = `var(--status-${colorName})`
  const color = `var(--status-${colorName}-foreground)`

  return (
    <div className="flex items-center gap-3">
      <span
        className="border-border size-5 shrink-0 rounded border"
        style={{ backgroundColor }}
        aria-hidden="true"
      />
      <span className="min-w-20 text-sm">{label}</span>
      <span
        className="rounded-sm px-1.5 py-0.5 text-xs font-medium"
        style={{ backgroundColor, color }}
      >
        {sampleText}
      </span>
    </div>
  )
}

export function DesignSystemView() {
  const t = useT()
  const [progress, setProgress] = React.useState(42)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-brand-text text-sm font-semibold">{APP_NAME}</p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("designSystem.title")}
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            {t("designSystem.description")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="space-y-12">
        <Section
          title={t("designSystem.colors")}
          description={t("designSystem.contrastNote")}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {t("designSystem.brandScale")}
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
                {BRAND_STEPS.map((step) => (
                  <div key={step} className="space-y-1">
                    <div
                      className="border-border h-12 rounded-md border"
                      style={{ background: `var(--brand-${step})` }}
                    />
                    <p className="text-muted-foreground text-center text-[0.6875rem]">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {t("designSystem.semantic")}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {SEMANTIC_TOKENS.map((token) => (
                  <div
                    key={token.name}
                    className="border-border overflow-hidden rounded-lg border"
                  >
                    <div className={`${token.solid} h-10`} />
                    <div
                      className={`${token.surface} ${token.foreground} px-3 py-2`}
                    >
                      <p className="text-sm font-semibold">{token.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                สีของ avatar
              </p>
              <p className="text-muted-foreground text-xs">
                ชุดสีตายตัว 14 สี — ใช้กำหนดสีพื้นหลัง Avatar ของผู้ใช้แต่ละคน
                แบบไม่ซ้ำได้ถึง 14 คน เกินจากนั้นจะวนซ้ำสี
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                {AVATAR_PALETTE_ITEMS.map((item) => (
                  <div
                    key={item.hex}
                    className="border-border flex h-16 flex-col items-center justify-center gap-0.5 rounded-md border text-center"
                    style={{
                      background: item.hex,
                      color: getReadableTextColor(item.hex),
                    }}
                  >
                    <p className="text-[0.6875rem] leading-tight font-semibold">
                      {item.name}
                    </p>
                    <p className="text-[0.625rem] leading-tight opacity-90">
                      {item.hex}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section
          title={t("designSystem.typography")}
          description="LINE Seed Sans TH"
        >
          <Card>
            <CardContent className="space-y-3">
              <p className="text-3xl font-extrabold">
                EventFlow — จัดงานเลี้ยงประจำปีให้ราบรื่น
              </p>
              <p className="text-xl font-bold">
                Heading Bold 700 · หัวข้อรองของหน้า
              </p>
              <p className="text-base">
                Body Regular 400 · ข้อความปกติที่ใช้ในเนื้อหาทั่วไปของระบบ
                The quick brown fox jumps over the lazy dog 0123456789
              </p>
              <p className="text-muted-foreground text-sm">
                Muted Small · คำอธิบายประกอบและข้อความรอง
              </p>
              <p className="text-xs font-thin">
                Thin 100 · ใช้เฉพาะกรณีพิเศษ
              </p>
            </CardContent>
          </Card>
        </Section>

        <Section title={t("designSystem.statuses")}>
          <Card>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {t("designSystem.statusColors")}
                </p>
                <div className="space-y-2">
                  {STATUS_COLOR_TOKENS.map((token) => (
                    <StatusColorRow
                      key={token.name}
                      colorName={token.name}
                      label={token.label}
                      sampleText={t("designSystem.statusColorSample")}
                    />
                  ))}
                </div>
              </div>
              <BadgeRow
                label={t("designSystem.eventStatuses")}
                styles={EVENT_STATUS_STYLE}
              />
              <BadgeRow
                label={t("designSystem.taskStatuses")}
                styles={TASK_STATUS_STYLE}
              />
              <BadgeRow label={t("priority.label")} styles={PRIORITY_STYLE} />
              <BadgeRow label={t("rsvp.label")} styles={RSVP_STATUS_STYLE} />
              <BadgeRow
                label={t("participantType.label")}
                styles={PARTICIPANT_TYPE_STYLE}
              />
              <BadgeRow
                label={t("readiness.label")}
                styles={READINESS_STYLE}
              />
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {t("task.dueDate")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge style={OVERDUE_STYLE} />
                  <StatusBadge style={DUE_SOON_STYLE} />
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section title={t("designSystem.components")}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>
                  ปุ่มหลักใช้โทนเทาเข้ม/ดำแบบมินิมอลพร้อมข้อความสีขาวเพื่อให้ผ่าน WCAG AA
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button>{t("common.save")}</Button>
                <Button variant="secondary">{t("common.cancel")}</Button>
                <Button variant="outline">{t("common.edit")}</Button>
                <Button variant="ghost">{t("common.more")}</Button>
                <Button variant="destructive">{t("common.delete")}</Button>
                <Button variant="destructive-solid">
                  {t("common.confirm")}
                </Button>
                <Button variant="link">{t("common.viewAll")}</Button>
                <Button disabled>{t("common.saving")}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form</CardTitle>
                <CardDescription>
                  ทุก Label ผูกกับ Input และมี Focus State ที่มองเห็นชัดเจน
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="ds-email">{t("auth.email")}</Label>
                  <Input
                    id="ds-email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ds-note">{t("task.checklist")}</Label>
                  <Textarea id="ds-note" rows={2} />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox id="ds-check" defaultChecked />
                    <Label htmlFor="ds-check">{t("auth.rememberMe")}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="ds-switch" defaultChecked />
                    <Label htmlFor="ds-switch">{t("common.open")}</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress &amp; Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("common.saved")}</span>
                    <span className="font-semibold tabular-nums">
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setProgress((value) => Math.max(0, value - 10))
                      }
                    >
                      -10%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setProgress((value) => Math.min(100, value + 10))
                      }
                    >
                      +10%
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      toast.success(t("toast.success"), {
                        description: "คุณกำลังไปได้สวย",
                      })
                    }
                  >
                    Toast success
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast.info("สถานะปกติ", {
                        description: "ทุกอย่างเรียบร้อยดี",
                      })
                    }
                  >
                    Toast info
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      toast.error(t("toast.genericError"), {
                        description: "ตอนนี้ต้องรีบดูแลด่วน",
                      })
                    }
                  >
                    Toast error
                  </Button>
                </div>
                <Alert>
                  <AlertTitle>{t("state.errorTitle")}</AlertTitle>
                  <AlertDescription>
                    {t("state.errorDescription")}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tabs, Badge &amp; Skeleton</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="table">
                  <TabsList>
                    <TabsTrigger value="table">Table</TabsTrigger>
                    <TabsTrigger value="kanban">Kanban</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="table"
                    className="text-muted-foreground pt-3 text-sm"
                  >
                    มุมมองตาราง
                  </TabsContent>
                  <TabsContent
                    value="kanban"
                    className="text-muted-foreground pt-3 text-sm"
                  >
                    มุมมองคัมบัง
                  </TabsContent>
                  <TabsContent
                    value="calendar"
                    className="text-muted-foreground pt-3 text-sm"
                  >
                    มุมมองปฏิทิน
                  </TabsContent>
                </Tabs>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  )
}
