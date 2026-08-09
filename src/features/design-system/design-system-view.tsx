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
  {
    name: "default",
    label: "Default",
    version1Background: "#efefed",
    version1Foreground: "#212120",
    version2Background: undefined,
    version2Foreground: undefined,
    version3Background: undefined,
    version3Foreground: undefined,
  },
  {
    name: "gray",
    label: "Gray",
    version1Background: "#e5e5e3",
    version1Foreground: "#393836",
    version2Background: undefined,
    version2Foreground: undefined,
    version3Background: undefined,
    version3Foreground: undefined,
  },
  {
    name: "brown",
    label: "Brown",
    version1Background: "#eaddca",
    version1Foreground: "#48372c",
    version2Background: "#d0b48a",
    version2Foreground: "#75592f",
    version3Background: "#b68a49",
    version3Foreground: "#332714",
  },
  {
    name: "orange",
    label: "Orange",
    version1Background: "#f0d9cc",
    version1Foreground: "#56321a",
    version2Background: "#fed5be",
    version2Foreground: "#702d00",
    version3Background: "#ffb78f",
    version3Foreground: "#702d00",
  },
  {
    name: "yellow",
    label: "Yellow",
    version1Background: "#efdeb9",
    version1Foreground: "#524019",
    version2Background: "#ffe4a9",
    version2Foreground: "#6b4900",
    version3Background: "#ffd67b",
    version3Foreground: "#6b4900",
  },
  {
    name: "green",
    label: "Green",
    version1Background: "#d9e3db",
    version1Foreground: "#21432e",
    version2Background: "#afe1af",
    version2Foreground: "#205520",
    version3Background: "#67c567",
    version3Foreground: "#143414",
  },
  {
    name: "blue",
    label: "Blue",
    version1Background: "#cddef5",
    version1Foreground: "#1d385f",
    version2Background: "#c3dcff",
    version2Foreground: "#00337c",
    version3Background: "#95c1ff",
    version3Foreground: "#00337c",
  },
  {
    name: "purple",
    label: "Purple",
    version1Background: "#e5dbf0",
    version1Foreground: "#432a56",
    version2Background: "#e4d0fb",
    version2Foreground: "#470b75",
    version3Background: "#cb9eff",
    version3Foreground: "#490080",
  },
  {
    name: "pink",
    label: "Pink",
    version1Background: "#f1d8e1",
    version1Foreground: "#54263d",
    version2Background: "#fccdde",
    version2Foreground: "#71093d",
    version3Background: "#ff9cc0",
    version3Foreground: "#7a003d",
  },
  {
    name: "red",
    label: "Red",
    version1Background: "#f5d5d6",
    version1Foreground: "#592725",
    version2Background: "#ffcbcd",
    version2Foreground: "#770b07",
    version3Background: "#ff9da1",
    version3Foreground: "#7e0500",
  },
] as const

type StatusVersion = 1 | 2 | 3
type StatusColorToken = (typeof STATUS_COLOR_TOKENS)[number]

function getStatusVersionColor(
  token: StatusColorToken,
  version: StatusVersion,
  channel: "Background" | "Foreground"
) {
  if (version === 1) return token[`version1${channel}`]
  if (version === 2) return token[`version2${channel}`] ?? token[`version1${channel}`]
  return token[`version3${channel}`] ?? token[`version1${channel}`]
}

function StatusVersionHeading({
  version,
  selectedVersion,
  onSelect,
}: {
  version: StatusVersion
  selectedVersion: StatusVersion
  onSelect: (version: StatusVersion) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        Version {version}
      </p>
      <Checkbox
        checked={selectedVersion === version}
        onCheckedChange={() => onSelect(version)}
        aria-label={`ใช้สี Version ${version}`}
      />
    </div>
  )
}

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
  version = 1,
  version1Background,
  version1Foreground,
  version2Background,
  version2Foreground,
  version3Background,
  version3Foreground,
}: {
  label: string
  colorName: (typeof STATUS_COLOR_TOKENS)[number]["name"]
  sampleText: string
  version?: StatusVersion
  version1Background?: string
  version1Foreground?: string
  version2Background?: string
  version2Foreground?: string
  version3Background?: string
  version3Foreground?: string
}) {
  const isDefault = colorName === "default"
  const backgroundColor =
    version === 3 && version3Background
      ? version3Background
      : version === 2 && version2Background
        ? version2Background
        : version === 1 && version1Background
          ? version1Background
      : `var(--status-${colorName})`
  const color =
    version === 3 && version3Foreground
      ? version3Foreground
      : version === 2 && version2Foreground
        ? version2Foreground
        : version === 1 && version1Foreground
          ? version1Foreground
      : `var(--status-${colorName}-foreground)`

  return (
    <div className="flex items-center gap-2">
      <span
        className={
          isDefault
            ? "border-status-gray size-5 shrink-0 rounded border"
            : "border-border size-5 shrink-0 rounded border"
        }
        style={{ backgroundColor }}
        aria-hidden="true"
      />
      <span className="min-w-16 text-sm">{label}</span>
      <span
        className={`rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-medium whitespace-nowrap${
          isDefault ? " border border-status-gray" : ""
        }`}
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
  const [selectedStatusVersion, setSelectedStatusVersion] =
    React.useState<StatusVersion>(3)

  const selectedStatusPalette = React.useMemo(() => {
    const getColor = (
      name: StatusColorToken["name"],
      channel: "Background" | "Foreground"
    ) => {
      const token = STATUS_COLOR_TOKENS.find((item) => item.name === name)
      return token
        ? getStatusVersionColor(token, selectedStatusVersion, channel)
        : undefined
    }

    return {
      "--status-default": getColor("default", "Background"),
      "--status-default-foreground": getColor("default", "Foreground"),
      "--status-gray": getColor("gray", "Background"),
      "--status-gray-foreground": getColor("gray", "Foreground"),
      "--status-yellow": getColor("yellow", "Background"),
      "--status-yellow-foreground": getColor("yellow", "Foreground"),
      "--status-green": getColor("green", "Background"),
      "--status-green-foreground": getColor("green", "Foreground"),
      "--status-blue": getColor("blue", "Background"),
      "--status-blue-foreground": getColor("blue", "Foreground"),
      "--status-purple": getColor("purple", "Background"),
      "--status-purple-foreground": getColor("purple", "Foreground"),
      "--status-red": getColor("red", "Background"),
      "--status-red-foreground": getColor("red", "Foreground"),
      "--event-status-purple": getColor("purple", "Background"),
      "--event-status-purple-foreground": getColor("purple", "Foreground"),
      "--task-status-orange": getColor("orange", "Background"),
      "--task-status-orange-foreground": getColor("orange", "Foreground"),
      "--success": getColor("green", "Background"),
      "--success-foreground": getColor("green", "Foreground"),
      "--success-surface": getColor("green", "Background"),
      "--warning": getColor("yellow", "Background"),
      "--warning-foreground": getColor("yellow", "Foreground"),
      "--warning-surface": getColor("yellow", "Background"),
      "--info": getColor("blue", "Background"),
      "--info-foreground": getColor("blue", "Foreground"),
      "--info-surface": getColor("blue", "Background"),
      "--danger": getColor("red", "Background"),
      "--danger-foreground": getColor("red", "Foreground"),
      "--danger-surface": getColor("red", "Background"),
    } as React.CSSProperties
  }, [selectedStatusVersion])

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
          <Card style={selectedStatusPalette}>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {t("designSystem.statusColors")}
                </p>
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="space-y-2">
                    <StatusVersionHeading
                      version={1}
                      selectedVersion={selectedStatusVersion}
                      onSelect={setSelectedStatusVersion}
                    />
                    <div className="space-y-2">
                      {STATUS_COLOR_TOKENS.map((token) => (
                        <StatusColorRow
                          key={token.name}
                          colorName={token.name}
                          label={token.label}
                          sampleText={t("designSystem.statusColorSample")}
                          version1Background={token.version1Background}
                          version1Foreground={token.version1Foreground}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="border-border space-y-2 md:border-l md:pl-6">
                    <StatusVersionHeading
                      version={2}
                      selectedVersion={selectedStatusVersion}
                      onSelect={setSelectedStatusVersion}
                    />
                    <div className="space-y-2">
                      {STATUS_COLOR_TOKENS.map((token) => (
                        <StatusColorRow
                          key={token.name}
                          colorName={token.name}
                          label={token.label}
                          sampleText={t("designSystem.statusColorSample")}
                          version={2}
                          version2Background={token.version2Background}
                          version2Foreground={token.version2Foreground}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="border-border space-y-2 md:border-l md:pl-6">
                    <StatusVersionHeading
                      version={3}
                      selectedVersion={selectedStatusVersion}
                      onSelect={setSelectedStatusVersion}
                    />
                    <div className="space-y-2">
                      {STATUS_COLOR_TOKENS.map((token) => (
                        <StatusColorRow
                          key={token.name}
                          colorName={token.name}
                          label={token.label}
                          sampleText={t("designSystem.statusColorSample")}
                          version={3}
                          version3Background={token.version3Background}
                          version3Foreground={token.version3Foreground}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {t("designSystem.semantic")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SEMANTIC_TOKENS.map((token) => (
                    <Badge
                      key={token.name}
                      variant="outline"
                      className={`${token.surface} ${token.foreground} border-current/20 h-auto px-2.5 py-1`}
                    >
                      {token.name}
                    </Badge>
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
