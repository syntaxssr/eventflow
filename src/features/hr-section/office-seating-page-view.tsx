"use client"

import { PageContainer } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useLocale } from "@/i18n"

const OFFICE_AREA = [
  "M 0 186",
  "H 432",
  "L 500 237",
  "H 672",
  "V 0",
  "H 1100",
  "V 378",
  "H 980",
  "V 417",
  "L 820 450",
  "L 812 411",
  "H 684",
  "V 438",
  "L 516 492",
  "L 564 606",
  "L 308 705",
  "L 252 660",
  "L 188 708",
  "L 124 654",
  "L 60 705",
  "L 0 606",
  "Z",
].join(" ")

const PERIMETER_WALL = [
  "M 0 186 H 372",
  "M 432 0 V 186 L 500 237 H 672 V 0",
  "M 0 186 V 606",
  "L 60 705 L 124 654 L 188 708 L 252 660 L 308 705",
  "L 564 606 L 516 492 L 684 438 V 411 H 812 L 820 450",
  "L 980 417 V 378 H 1100",
].join(" ")

const STRUCTURAL_COLUMNS = [
  { x: 216, y: 342, rotation: 45 },
  { x: 60, y: 660, rotation: 45 },
  { x: 360, y: 534, rotation: 45 },
  { x: 664, y: 216, rotation: 0 },
  { x: 724, y: 420, rotation: 0 },
  { x: 1056, y: 180, rotation: 0 },
  { x: 1056, y: 384, rotation: 0 },
] as const

export function OfficeSeatingPageView() {
  const { t } = useLocale()

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-muted-foreground text-sm">
          {t("officeSeating.location")}
        </span>
        <Badge className="border-status-pink bg-status-pink text-status-pink-foreground">
          {t("officeSeating.shellBadge")}
        </Badge>
      </div>

      <Card className="gap-3 overflow-hidden bg-status-pink/15 py-3 ring-status-pink-foreground/20">
        <CardContent className="px-3 sm:px-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-foreground">
            <span
              className="size-2.5 shrink-0 rounded-full bg-status-pink-foreground"
              aria-hidden="true"
            />
            <span>{t("officeSeating.shellNote")}</span>
          </div>

          <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <PlanLegend swatch="wall" label={t("officeSeating.wallLegend")} />
            <PlanLegend swatch="column" label={t("officeSeating.columnLegend")} />
            <PlanLegend swatch="door" label={t("officeSeating.doorLegend")} />
            <PlanLegend swatch="outside" label={t("officeSeating.outsideLegend")} />
          </div>

          <div className="overflow-x-auto rounded-xl bg-white/75 p-4 shadow-inner dark:bg-black/15 sm:p-6">
            <svg
              viewBox="0 0 1100 760"
              className="mx-auto min-w-[760px] max-w-[1180px]"
              role="img"
              aria-labelledby="office-shell-title office-shell-description"
            >
              <title id="office-shell-title">
                {t("officeSeating.shellTitle")}
              </title>
              <desc id="office-shell-description">
                {t("officeSeating.shellDescription")}
              </desc>

              <defs>
                <pattern
                  id="outside-hatch"
                  width="18"
                  height="18"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(35)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="18"
                    stroke="var(--status-gray-foreground)"
                    strokeWidth="5"
                    opacity="0.22"
                  />
                </pattern>
                <pattern
                  id="office-grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.045"
                  />
                </pattern>
                <filter
                  id="office-shell-shadow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="10"
                    stdDeviation="12"
                    floodColor="currentColor"
                    floodOpacity="0.13"
                  />
                </filter>
              </defs>

              <path
                d={OFFICE_AREA}
                fill="var(--status-pink)"
                fillOpacity="0.22"
                filter="url(#office-shell-shadow)"
              />
              <path
                d={OFFICE_AREA}
                fill="url(#office-grid)"
              />

              <rect
                x="0"
                y="0"
                width="432"
                height="186"
                fill="var(--status-gray)"
              />
              <rect
                x="0"
                y="0"
                width="432"
                height="186"
                fill="url(#outside-hatch)"
              />
              <text
                x="185"
                y="82"
                textAnchor="middle"
                className="fill-status-gray-foreground text-[26px] font-semibold"
              >
                {t("officeSeating.outsideOffice")}
              </text>
              <text
                x="185"
                y="116"
                textAnchor="middle"
                className="fill-status-gray-foreground text-[17px]"
                opacity="0.65"
              >
                OUTSIDE OFFICE
              </text>

              <path
                d="M 432 0 H 672 V 237 H 500 L 432 186 Z"
                fill="var(--status-gray)"
                stroke="var(--foreground)"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              <text
                x="558"
                y="92"
                textAnchor="middle"
                className="fill-status-gray-foreground text-[22px] font-semibold"
              >
                {t("officeSeating.buildingCore")}
              </text>

              <path
                d={PERIMETER_WALL}
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="14"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              <path
                d={PERIMETER_WALL}
                fill="none"
                stroke="var(--card)"
                strokeWidth="5"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />

              <g aria-label={t("officeSeating.officeDoor")}>
                <line
                  x1="432"
                  y1="186"
                  x2="390"
                  y2="228"
                  stroke="var(--foreground)"
                  strokeWidth="5"
                />
                <path
                  d="M 372 186 A 60 60 0 0 0 390 228"
                  fill="none"
                  stroke="var(--status-gray-foreground)"
                  strokeWidth="3"
                  strokeDasharray="7 6"
                />
                <circle cx="432" cy="186" r="5" fill="var(--foreground)" />
              </g>
              <text
                x="340"
                y="264"
                textAnchor="middle"
                className="fill-foreground text-[20px] font-semibold"
              >
                {t("officeSeating.officeDoor")}
              </text>

              {STRUCTURAL_COLUMNS.map((column, index) => (
                <g
                  key={`${column.x}-${column.y}`}
                  transform={`translate(${column.x} ${column.y}) rotate(${column.rotation})`}
                  aria-label={t("officeSeating.columnNumber", {
                    number: index + 1,
                  })}
                >
                  <rect
                    x="-17"
                    y="-17"
                    width="34"
                    height="34"
                    fill="var(--card)"
                    stroke="var(--foreground)"
                    strokeWidth="5"
                  />
                  <path
                    d="M -7 0 H 7 M 0 -7 V 7"
                    stroke="var(--foreground)"
                    strokeWidth="4"
                    strokeLinecap="square"
                  />
                </g>
              ))}

              <text
                x="565"
                y="365"
                textAnchor="middle"
                className="fill-foreground text-[28px] font-bold"
                opacity="0.55"
              >
                {t("officeSeating.officeArea")}
              </text>
            </svg>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

function PlanLegend({
  swatch,
  label,
}: {
  swatch: "wall" | "column" | "door" | "outside"
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={
          swatch === "wall"
            ? "h-1 w-6 bg-foreground"
            : swatch === "column"
              ? "size-3 rotate-45 border-2 border-foreground bg-card"
              : swatch === "door"
                ? "size-3 rounded-tr-full border-t-2 border-r-2 border-foreground"
                : "h-3 w-5 border border-status-gray-foreground/40 bg-status-gray"
        }
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  )
}
