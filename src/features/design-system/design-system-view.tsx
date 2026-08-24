"use client"

import * as React from "react"
import {
  BellIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  FilterIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { appToast } from "@/lib/gif-toast"

import { AvatarGroup } from "@/components/common/avatar-group"
import { DatePickerField } from "@/components/common/date-picker-field"
import { LanguageToggle } from "@/components/common/language-toggle"
import { StatusBadge } from "@/components/common/status-badge"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { UserAvatar } from "@/components/common/user-avatar"
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
import { FILE_TYPE_STYLE } from "@/constants/file-type"
import { NOTIFICATION_META } from "@/constants/notification"
import { MOCK_USERS } from "@/mock"
import {
  DESTRUCTIVE_ACTION_CLASS,
  DUE_SOON_STYLE,
  EMPLOYEE_STATUS_STYLE,
  EVENT_STATUS_STYLE,
  OVERDUE_STYLE,
  PARTICIPANT_TYPE_STYLE,
  PRIORITY_STYLE,
  READINESS_STYLE,
  RSVP_STATUS_STYLE,
  TASK_STATUS_CHART_TONE,
  TASK_STATUS_STYLE,
  type StatusStyle,
} from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { getFullName } from "@/lib/user"
import { FILE_TYPES } from "@/types/file"
import { TASK_STATUSES } from "@/types/task"
import { cn } from "@/lib/utils"

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

type DisplayStatusStyle = Pick<StatusStyle, "labelKey" | "icon" | "badge">

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

/** ลำดับชั้นพื้นผิว — เรียงจากชั้นล่างสุดขึ้นไปหาชั้นที่ลอยสูงสุด */
const SURFACE_TOKENS = [
  {
    token: "--background",
    swatch: "bg-background",
    labelKey: "designSystem.surfacePage",
    noteKey: "designSystem.surfacePageNote",
  },
  {
    token: "--card",
    swatch: "bg-card",
    labelKey: "designSystem.surfaceCard",
    noteKey: "designSystem.surfaceCardNote",
  },
  {
    token: "--sidebar",
    swatch: "bg-sidebar",
    labelKey: "designSystem.surfaceSidebar",
    noteKey: "designSystem.surfaceSidebarNote",
  },
  {
    token: "--popover",
    swatch: "bg-popover",
    labelKey: "designSystem.surfacePopover",
    noteKey: "designSystem.surfacePopoverNote",
  },
  {
    token: "--muted",
    swatch: "bg-muted",
    labelKey: "designSystem.surfaceMuted",
    noteKey: "designSystem.surfaceMutedNote",
  },
] as const

/**
 * ช่วงสีของแถบความคืบหน้า — ค่า sample เลือกให้ตกกลางช่วงของแต่ละสี
 *
 * ไม่เก็บค่า hex ไว้ที่นี่ เพราะแถบตัวอย่างเรนเดอร์ด้วย <Progress tone="completion">
 * ตัวจริง สีจึงมาจาก progress.tsx เสมอ ไม่มีทางที่หน้านี้กับของจริงจะไม่ตรงกัน
 */
const PROGRESS_BANDS = [
  { label: "0–19%", sample: 10 },
  { label: "20–49%", sample: 35 },
  { label: "50–99%", sample: 75 },
  { label: "100%", sample: 100 },
] as const

/** ตัวแทนสีไอคอนแจ้งเตือนอย่างละ 1 ชนิด (ฟ้า/เหลือง/เขียว/แดง + กลาง) */
const NOTIFICATION_ICON_SAMPLES = [
  "task_assigned",
  "task_due_soon",
  "checklist_completed",
  "task_overdue",
  "file_updated",
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
    version4Background: undefined,
    version4Foreground: undefined,
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
    version4Background: undefined,
    version4Foreground: undefined,
  },
  {
    name: "brown",
    label: "Brown",
    version1Background: "#eaddca",
    version1Foreground: "#48372c",
    version2Background: "#d0b48a",
    // V2 เดิมคู่กับ #75592f แต่ได้ contrast แค่ 3.28:1 ไม่ผ่าน WCAG AA
    // จึงใช้ #332714 (ค่าเดียวกับ V3) ให้ตรงกับ --status-brown-foreground ที่ใช้จริง
    version2Foreground: "#332714",
    version3Background: "#b68a49",
    version3Foreground: "#332714",
    version4Background: undefined,
    version4Foreground: undefined,
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
    version4Background: "#fd9851",
    version4Foreground: "#662b01",
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
    version4Background: "#fed93b",
    version4Foreground: "#6a5601",
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
    version4Background: "#58d66b",
    version4Foreground: "#14501d",
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
    version4Background: "#3e95ff",
    version4Foreground: "#00244f",
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
    version4Background: "#d933f1",
    version4Foreground: "#27032c",
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
    version4Background: "#fd53a8",
    version4Foreground: "#500128",
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
    version4Background: "#fd535e",
    version4Foreground: "#490106",
  },
] as const

type StatusVersion = 1 | 2 | 3 | 4
type StatusColorToken = (typeof STATUS_COLOR_TOKENS)[number]

function getStatusVersionColor(
  token: StatusColorToken,
  version: StatusVersion,
  channel: "Background" | "Foreground"
) {
  if (version === 1) return token[`version1${channel}`]
  if (version === 2) return token[`version2${channel}`] ?? token[`version1${channel}`]
  if (version === 3) return token[`version3${channel}`] ?? token[`version1${channel}`]
  // V4 สีไหนไม่ได้กำหนดใหม่ ให้ตกกลับไปใช้ V3 (Default/Gray/Brown ใช้ค่าเดิม)
  return (
    token[`version4${channel}`] ??
    token[`version3${channel}`] ??
    token[`version1${channel}`]
  )
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

function LayoutRule({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <Card size="sm">
      <CardContent className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
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
  version4Background,
  version4Foreground,
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
  version4Background?: string
  version4Foreground?: string
}) {
  const isDefault = colorName === "default"
  // V4 สีไหนไม่ได้กำหนดใหม่ ให้ตกกลับไปใช้ V3 ตามลำดับ
  const byVersion = (
    v1?: string,
    v2?: string,
    v3?: string,
    v4?: string
  ): string | undefined => {
    if (version === 4) return v4 ?? v3 ?? v2 ?? v1
    if (version === 3) return v3 ?? v1
    if (version === 2) return v2 ?? v1
    return v1
  }
  const backgroundColor =
    byVersion(
      version1Background,
      version2Background,
      version3Background,
      version4Background
    ) ?? `var(--status-${colorName})`
  const color =
    byVersion(
      version1Foreground,
      version2Foreground,
      version3Foreground,
      version4Foreground
    ) ?? `var(--status-${colorName}-foreground)`

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
  const { t, locale } = useLocale()
  const [progress, setProgress] = React.useState(42)
  const [sampleStartDate, setSampleStartDate] = React.useState("")
  const [sampleEndDate, setSampleEndDate] = React.useState("2026-12-31")
  const [selectedStatusVersion, setSelectedStatusVersion] =
    React.useState<StatusVersion>(2)

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
          title={t("designSystem.surfaces")}
          description={t("designSystem.surfacesNote")}
        >
          <Card>
            <CardContent className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {SURFACE_TOKENS.map((surface) => (
                <div key={surface.token} className="flex items-center gap-3">
                  {/* ตัวอย่างใช้คลาสจริงของแต่ละชั้น ไม่ได้ hardcode สี */}
                  <span
                    className={cn(
                      "ring-foreground/15 size-10 shrink-0 rounded-lg ring-1",
                      surface.swatch
                    )}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">
                      {t(surface.labelKey as TranslationKey)}
                    </p>
                    <p className="text-muted-foreground font-mono text-[0.6875rem]">
                      {surface.token}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t(surface.noteKey as TranslationKey)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
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
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
                  <div className="border-border space-y-2 md:border-l md:pl-6">
                    <StatusVersionHeading
                      version={4}
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
                          version={4}
                          version3Background={token.version3Background}
                          version3Foreground={token.version3Foreground}
                          version4Background={token.version4Background}
                          version4Foreground={token.version4Foreground}
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
              <BadgeRow
                label={t("employeeStatus.label")}
                styles={EMPLOYEE_STATUS_STYLE}
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
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {t("designSystem.iconColors")}
                </p>
                {/* ไม่ใส่กรอบและไม่แบ่งคอลัมน์ตายตัว ให้เข้าชุดกับหัวข้ออื่นในการ์ดนี้
                    ทั้งสองตัวอย่างจึงกว้างตามเนื้อหาและอยู่ชิดกัน */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="bg-info text-info-foreground flex size-9 shrink-0 items-center justify-center rounded-lg"
                      aria-hidden="true"
                    >
                      <CalendarDaysIcon className="size-4" />
                    </span>
                    <p className="text-sm">{t("designSystem.iconWithBackground")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon
                      className="text-info size-5 shrink-0"
                      aria-hidden="true"
                    />
                    <p className="text-sm">{t("designSystem.iconWithoutBackground")}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {t("designSystem.notificationColors")}
                </p>
                <div className="flex items-center gap-3">
                  {/* ป้ายตัวอย่างใช้คลาสชุดเดียวกับปุ่มระฆังจริง สีจึงเปลี่ยนตามกันเสมอ */}
                  <span className="relative inline-flex size-9 items-center justify-center">
                    <BellIcon
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span
                      className="bg-notification-badge text-notification-badge-foreground absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[0.625rem] font-bold"
                      aria-hidden="true"
                    >
                      3
                    </span>
                  </span>
                  <p className="text-sm">
                    {t("designSystem.notificationBadgeSample")}
                  </p>
                </div>
                {/* ดึงไอคอน/สีจาก NOTIFICATION_META ตรง ๆ ตัวอย่างจึงตรงกับรายการจริงเสมอ */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {NOTIFICATION_ICON_SAMPLES.map((type) => {
                    const meta = NOTIFICATION_META[type]
                    const Icon = meta.icon
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                            meta.tile
                          )}
                          aria-hidden="true"
                        >
                          <Icon className="size-4" />
                        </span>
                        <p className="text-sm">{t(meta.labelKey)}</p>
                      </div>
                    )
                  })}
                </div>
                <p className="text-muted-foreground text-xs">
                  {t("designSystem.notificationColorsNote")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("designSystem.notificationIconColorsNote")}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {t("designSystem.destructiveActionColors")}
                </p>
                {/* ตัวอย่างใช้คลาสชุดเดียวกับปุ่มลบจริง สีจึงเปลี่ยนตามกันเสมอ
                    ตัวขวาบังคับสถานะ hover ค้างไว้ เพราะชี้เมาส์ทีละปุ่มจะเทียบไม่ได้ */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className={DESTRUCTIVE_ACTION_CLASS}
                      aria-label={t("common.delete")}
                    >
                      <Trash2Icon className="size-4" aria-hidden="true" />
                    </Button>
                    <p className="text-sm">
                      {t("designSystem.destructiveActionIdle")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-destructive-action bg-destructive-action/15 dark:bg-destructive-action/20 flex size-7 items-center justify-center rounded-[min(var(--radius-md),10px)]"
                      aria-hidden="true"
                    >
                      <Trash2Icon className="size-4" />
                    </span>
                    <p className="text-sm">
                      {t("designSystem.destructiveActionHover")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className={DESTRUCTIVE_ACTION_CLASS}
                      aria-label={t("common.clearSearch")}
                    >
                      <XIcon className="size-4" aria-hidden="true" />
                    </Button>
                    <p className="text-sm">
                      {t("designSystem.clearSearchSample")}
                    </p>
                  </div>
                  <p className="text-sm">
                    {t("designSystem.destructiveActionSample")}
                  </p>
                </div>
                {/* เมนูลบ — จำลองแถวในเมนูจริง ทั้งสถานะปกติและตอนชี้เมาส์ */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  {[
                    { key: "destructiveActionMenuIdle", focus: false },
                    { key: "destructiveActionMenuHover", focus: true },
                  ].map(({ key, focus }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-destructive-action flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm",
                          focus && "bg-destructive-action/15"
                        )}
                        aria-hidden="true"
                      >
                        <Trash2Icon className="size-4" />
                        {t("common.delete")}
                      </span>
                      <p className="text-sm">
                        {t(`designSystem.${key}` as TranslationKey)}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  {t("designSystem.destructiveActionColorsNote")}
                </p>
              </div>
              {/* ไอคอนประเภทไฟล์ — ดึงจาก FILE_TYPE_STYLE ตัวจริง สีจึงตรงกับหน้าไฟล์เสมอ */}
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {t("designSystem.fileTypeColors")}
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {FILE_TYPES.map((type) => {
                    const style = FILE_TYPE_STYLE[type]
                    const Icon = style.icon
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                            style.tile
                          )}
                          aria-hidden="true"
                        >
                          <Icon className="size-4" />
                        </span>
                        <p className="text-sm">{style.label}</p>
                      </div>
                    )
                  })}
                </div>
                <p className="text-muted-foreground text-xs">
                  {t("designSystem.fileTypeColorsNote")}
                </p>
              </div>
              {/* Avatar — ดึงจากพาเลตตัวจริง ทั้งพื้นและสีตัวอักษรคู่ของมัน */}
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {t("designSystem.avatarColors")}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {AVATAR_PALETTE_ITEMS.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: item.hex,
                          color: item.foreground,
                        }}
                        aria-hidden="true"
                      >
                        AB
                      </span>
                      <div className="leading-tight">
                        <p className="text-sm">{item.name}</p>
                        <p className="text-muted-foreground font-mono text-[0.6875rem]">
                          {item.hex.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  {t("designSystem.avatarColorsNote")}
                </p>
              </div>
              {/* จุดสีในการ์ดสรุปงานตามสถานะ — ใช้กราฟจริงเพื่อไม่ให้ค่าหลุดจากกัน */}
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {t("designSystem.chartColors")}
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  {TASK_STATUSES.map((status) => (
                    <div key={status} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          TASK_STATUS_CHART_TONE[status].dot
                        )}
                        aria-hidden="true"
                      />
                      <p className="text-sm">
                        {t(
                          TASK_STATUS_STYLE[status].labelKey as TranslationKey
                        )}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  {t("designSystem.chartColorsNote")}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {t("designSystem.progressColors")}
                </p>
                {/* แบ่งความกว้างการ์ดเท่า ๆ กัน แถบยืดเต็มช่องที่เหลือของแต่ละช่อง
                    จอแคบลดเหลือ 2 ช่องต่อแถว ไม่งั้นแถบจะสั้นจนดูสีไม่ออก */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                  {PROGRESS_BANDS.map((band) => (
                    <div key={band.label} className="flex items-center gap-2">
                      <span className="shrink-0 text-xs font-medium tabular-nums">
                        {band.label}
                      </span>
                      <Progress
                        value={band.sample}
                        tone="completion"
                        className="h-2 flex-1"
                        aria-label={`${band.label} ${band.sample}%`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  {t("designSystem.progressColorsNote")}
                </p>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section title={t("designSystem.layout")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LayoutRule
              label={t("designSystem.topbarContentSpacing")}
              value="20px"
              description={t("designSystem.topbarContentSpacingDescription")}
            />
            <LayoutRule
              label={t("designSystem.pagePadding")}
              value="16 / 24 / 32px"
              description={t("designSystem.pagePaddingDescription")}
            />
            <LayoutRule
              label={t("designSystem.contentSpacing")}
              value="24px"
              description={t("designSystem.contentSpacingDescription")}
            />
            <LayoutRule
              label={t("designSystem.progressHeight")}
              value="8px"
              description={t("designSystem.progressHeightDescription")}
            />
          </div>
        </Section>

        <Section title={t("designSystem.components")}>
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {t("designSystem.selectDropdown")}
            </p>
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="font-medium">{t("designSystem.selectStatusColor")}</p>
                    <p className="text-muted-foreground text-sm">
                      {t("designSystem.selectStatusColorDescription")}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs font-medium">
                        Dropdown
                      </p>
                      <div className="border-border space-y-1 rounded-lg border p-1">
                        <StatusBadge size="sm" style={TASK_STATUS_STYLE.in_progress} />
                        <StatusBadge size="sm" style={PRIORITY_STYLE.high} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs font-medium">
                        {t("designSystem.selectFilterInput")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <div className="border-input flex h-8 items-center gap-2 rounded-md border px-2.5">
                          <FilterIcon className="size-4" aria-hidden="true" />
                          <SelectionIconStack
                            styles={[
                              TASK_STATUS_STYLE.in_progress,
                              TASK_STATUS_STYLE.blocked,
                            ]}
                          />
                        </div>
                        <div className="border-input flex h-8 items-center gap-2 rounded-md border px-2.5">
                          <FilterIcon className="size-4" aria-hidden="true" />
                          <SelectionIconStack
                            styles={[PRIORITY_STYLE.high, PRIORITY_STYLE.urgent]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs font-medium">
                      {t("designSystem.activeFilterChips")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <FilterChipSample style={TASK_STATUS_STYLE.in_progress} />
                      <FilterChipSample style={PRIORITY_STYLE.high} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="font-medium">{t("designSystem.selectDueDate")}</p>
                    <p className="text-muted-foreground text-sm">
                      {t("designSystem.selectDueDateDescription")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs font-medium">
                      Dropdown
                    </p>
                    <div className="border-border space-y-1 rounded-lg border p-1">
                      <StatusBadge size="sm" style={OVERDUE_STYLE} />
                      <StatusBadge size="sm" style={DUE_SOON_STYLE} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs font-medium">
                        {t("designSystem.selectFilterInput")}
                      </p>
                      <div className="border-input flex h-8 items-center justify-between rounded-md border px-2.5 text-sm">
                        <span>{t("task.dueSoonFilter")}</span>
                        <ChevronDownIcon
                          className="text-muted-foreground size-4"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs font-medium">
                        {t("designSystem.activeFilterChips")}
                      </p>
                      <FilterChipSample style={DUE_SOON_STYLE} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="font-medium">{t("designSystem.selectPeople")}</p>
                    <p className="text-muted-foreground text-sm">
                      {t("designSystem.selectPeopleDescription")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {/* ช่องที่เลือกแล้วเป็นพื้นเรียบ ไม่มี avatar และไม่ย้อมสีประจำตัว
                        ส่วนรายการข้างล่างยังเป็น avatar เต็ม */}
                    <div className="border-input bg-status-default dark:bg-input/30 flex h-7 w-72 items-center justify-between rounded-[min(var(--radius-md),10px)] border px-2.5 text-sm">
                      <span className="truncate">
                        {getFullName(MOCK_USERS[0], locale)}
                      </span>
                      <span className="text-muted-foreground">⌄</span>
                    </div>
                    <div className="border-border w-72 rounded-lg border p-1">
                      <div className="flex items-center gap-2 rounded-md px-1.5 py-1">
                        <UserAvatar user={MOCK_USERS[0]} size="sm" />
                        <span className="text-sm">{getFullName(MOCK_USERS[0], locale)}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {t("designSystem.selectPeopleWidth")}
                    </p>
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-muted-foreground text-xs">
                        {t("designSystem.avatarStackRule")}
                      </span>
                      <AvatarGroup users={MOCK_USERS.slice(0, 3)} max={3} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {t("designSystem.datePicker")}
            </p>
            <Card>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="font-medium">{t("designSystem.datePickerFields")}</p>
                  <p className="text-muted-foreground text-sm">
                    {t("designSystem.datePickerDescription")}
                  </p>
                </div>
                <div className="grid max-w-xl gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("task.startDate")}</Label>
                    <DatePickerField
                      label={t("task.startDate")}
                      value={sampleStartDate}
                      onChange={setSampleStartDate}
                      max={sampleEndDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("task.dueDate")}</Label>
                    <DatePickerField
                      label={t("task.dueDate")}
                      value={sampleEndDate}
                      onChange={setSampleEndDate}
                      min={sampleStartDate}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                      appToast.success(t("toast.success"), {
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
                      appToast.error(t("toast.genericError"), {
                        description: "ตอนนี้ต้องรีบดูแลด่วน",
                      })
                    }
                  >
                    Toast error
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => appToast.welcome("WELCOME")}
                  >
                    Toast welcome
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => appToast.delete("ลบเรียบร้อยแล้ว")}
                  >
                    Toast delete
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

function SelectionIconStack({ styles }: { styles: DisplayStatusStyle[] }) {
  return (
    <span className="-space-x-1.5 flex items-center" aria-hidden="true">
      {styles.map((style, index) => {
        const Icon = style.icon

        return (
          <span
            key={style.labelKey}
            className={`relative flex size-5 items-center justify-center rounded-full border ${style.badge}`}
            style={{ zIndex: styles.length - index }}
          >
            <Icon className="size-2.5" />
          </span>
        )
      })}
    </span>
  )
}

function FilterChipSample({ style }: { style: DisplayStatusStyle }) {
  const { t } = useLocale()
  const Icon = style.icon

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border py-1 pr-1 pl-2.5 text-xs font-medium ${style.badge}`}
    >
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      {t(style.labelKey as TranslationKey)}
      <span className="flex size-5 items-center justify-center rounded-full" aria-hidden="true">
        <XIcon className="size-3" />
      </span>
    </span>
  )
}
