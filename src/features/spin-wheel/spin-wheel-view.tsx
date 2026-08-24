"use client"

import * as React from "react"
import {
  AccessibilityIcon,
  DicesIcon,
  FerrisWheelIcon,
  ListPlusIcon,
  Loader2Icon,
  Maximize2Icon,
  Minimize2Icon,
  SparklesIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { PageContainer } from "@/components/common/page-header"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { usePageState } from "@/hooks/use-page-state"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useLocale } from "@/i18n"
import { nowIso } from "@/lib/clock"
import { newId } from "@/lib/id"
import { cn } from "@/lib/utils"
import {
  computeSpinTarget,
  entriesFromEmployees,
  entriesFromParticipants,
  MIN_WHEEL_ENTRIES,
  normalizeEntryLabel,
  pickWinnerIndex,
  WHEEL_EXTRA_TURNS,
  type WheelEntry,
} from "@/lib/spin-wheel"
import { useAppState } from "@/store"
import {
  selectActiveEvents,
  selectParticipantsByEvent,
} from "@/store/selectors"
import { EntryEditor } from "./entry-editor"
import { SpinHistory } from "./spin-history"
import { Wheel } from "./wheel"
import { WinnerDialog, type SpinRecord } from "./winner-dialog"
import styles from "./spin-wheel.module.css"

type EntrySource = "employees" | "participants" | "custom"

const SOURCE_OPTIONS: {
  value: EntrySource
  labelKey:
    | "spinWheel.sourceEmployees"
    | "spinWheel.sourceParticipants"
    | "spinWheel.sourceCustom"
}[] = [
  { value: "employees", labelKey: "spinWheel.sourceEmployees" },
  { value: "participants", labelKey: "spinWheel.sourceParticipants" },
  { value: "custom", labelKey: "spinWheel.sourceCustom" },
]

type LoadNotice = "spinWheel.noEmployees" | "spinWheel.noParticipants" | null

const CONTROL_CARD_CLASS = cn(styles.controlCard, "border-0 ring-0")
const CONTROL_INPUT_CLASS =
  "h-10 border-white/20 bg-white/10 text-white placeholder:text-violet-200/55 focus-visible:border-cyan-300 focus-visible:ring-cyan-300/30 dark:bg-white/10"
const CONTROL_BUTTON_CLASS =
  "h-10 border-white/20 bg-white/10 text-white hover:border-cyan-300/70 hover:bg-white/15 hover:text-white"

const CIRCUS_HORIZONTAL_LIGHTS = Array.from({ length: 30 }, (_, index) => index)
const CIRCUS_VERTICAL_LIGHTS = Array.from({ length: 14 }, (_, index) => index)
const CIRCUS_GARLAND_LIGHTS = Array.from({ length: 19 }, (_, index) => index)

function CircusBackdrop() {
  const renderLights = (lights: number[], prefix: string) =>
    lights.map((index) => (
      <span
        key={`${prefix}-${index}`}
        className={styles.circusLight}
        style={{ "--light-index": index } as React.CSSProperties}
      />
    ))

  return (
    <div
      className={styles.circusBackdrop}
      data-testid="circus-backdrop"
      aria-hidden="true"
    >
      <div className={styles.circusTent} />
      <div className={styles.circusValance} />
      <div className={cn(styles.circusCurtain, styles.circusCurtainLeft)} />
      <div className={cn(styles.circusCurtain, styles.circusCurtainRight)} />
      <div
        className={cn(
          styles.circusSpotlight,
          styles.circusSpotlightLeft
        )}
      />
      <div
        className={cn(
          styles.circusSpotlight,
          styles.circusSpotlightRight
        )}
      />

      <div className={styles.circusGarland}>
        {CIRCUS_GARLAND_LIGHTS.map((index) => {
          const center = (CIRCUS_GARLAND_LIGHTS.length - 1) / 2
          const normalized = (index - center) / center
          const y = 1.2 + (1 - normalized * normalized) * 5.2
          return (
            <span
              key={index}
              style={
                {
                  left: `${(index / (CIRCUS_GARLAND_LIGHTS.length - 1)) * 100}%`,
                  top: `${y}rem`,
                  "--light-index": index,
                } as React.CSSProperties
              }
            />
          )
        })}
      </div>

      <div className={styles.circusSign}>
        <span className={styles.circusSignKicker}>The Grand</span>
        <span className={styles.circusSignTitle}>Lucky Circus</span>
      </div>

      <div className={cn(styles.lightRail, styles.lightRailTop)}>
        {renderLights(CIRCUS_HORIZONTAL_LIGHTS, "top")}
      </div>
      <div className={cn(styles.lightRail, styles.lightRailRight)}>
        {renderLights(CIRCUS_VERTICAL_LIGHTS, "right")}
      </div>
      <div className={cn(styles.lightRail, styles.lightRailBottom)}>
        {renderLights(CIRCUS_HORIZONTAL_LIGHTS, "bottom")}
      </div>
      <div className={cn(styles.lightRail, styles.lightRailLeft)}>
        {renderLights(CIRCUS_VERTICAL_LIGHTS, "left")}
      </div>

      <div className={styles.circusFloor} />
      <div className={styles.circusFootlights} />
    </div>
  )
}

/**
 * เกมส์วงล้อ — สุ่มรายชื่อจากทะเบียนพนักงาน / ผู้ตอบรับกิจกรรม / พิมพ์เอง
 *
 * ผู้ชนะถูกสุ่ม "ก่อน" เริ่มหมุน แล้วคำนวณมุมปลายทางให้วงล้อไปหยุดตรงช่องนั้นพอดี
 * มุมหมุนสะสมไปเรื่อย ๆ ไม่รีเซ็ตเป็น 0 เพื่อให้รอบถัดไปหมุนต่อจากตำแหน่งเดิม
 * รายชื่อและประวัติอยู่ใน state ของหน้าเท่านั้น ไม่บันทึกลง store
 */
export function SpinWheelView() {
  const { t, tl, locale } = useLocale()
  const state = useAppState()
  const reducedMotion = useReducedMotion()

  const events = selectActiveEvents(state)

  const [source, setSource] = React.useState<EntrySource>("employees")
  const [eventId, setEventId] = React.useState(() => events[0]?.id ?? "")
  const [onlyAttending, setOnlyAttending] = React.useState(true)
  const [onlyActiveEmployees, setOnlyActiveEmployees] = React.useState(true)
  const [loadNotice, setLoadNotice] = React.useState<LoadNotice>(null)

  const [entries, setEntries] = React.useState<WheelEntry[]>([])
  const [prize, setPrize] = React.useState("")
  const [removeWinner, setRemoveWinner] = React.useState(true)

  const [rotation, setRotation] = React.useState(0)
  const [spinning, setSpinning] = React.useState(false)
  const [history, setHistory] = React.useState<SpinRecord[]>([])
  const [winner, setWinner] = React.useState<SpinRecord | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState("")
  const [clearEntriesOpen, setClearEntriesOpen] = React.useState(false)
  const [clearHistoryOpen, setClearHistoryOpen] = React.useState(false)
  const [presentationMode, setPresentationMode] = React.useState(false)

  /** ผู้ชนะที่สุ่มไว้ตอนเริ่มหมุน — รอประกาศเมื่อวงล้อหยุด */
  const pendingWinnerRef = React.useRef<WheelEntry | null>(null)
  /** ข้อความผลรอบล่าสุดที่รอประกาศ — ดูเงื่อนไขเวลาประกาศใน useEffect ด้านล่าง */
  const pendingAnnouncementRef = React.useRef("")
  const entryInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setPresentationMode(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && presentationMode && !document.fullscreenElement) {
        setPresentationMode(false)
      }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [presentationMode])

  React.useEffect(() => {
    if (!presentationMode) return

    const root = document.documentElement
    const body = document.body
    const previousRootOverflow = root.style.overflow
    const previousBodyOverflow = body.style.overflow
    const previousOverscrollBehavior = root.style.overscrollBehavior

    root.style.overflow = "hidden"
    body.style.overflow = "hidden"
    root.style.overscrollBehavior = "none"

    return () => {
      root.style.overflow = previousRootOverflow
      body.style.overflow = previousBodyOverflow
      root.style.overscrollBehavior = previousOverscrollBehavior
    }
  }, [presentationMode])

  const openPresentationMode = () => {
    setPresentationMode(true)
    document.documentElement.requestFullscreen?.().catch(() => {
      // overlay เต็ม viewport ยังทำงานต่อได้เมื่อเบราว์เซอร์ไม่อนุญาต Fullscreen API
    })
  }

  const closePresentationMode = () => {
    setPresentationMode(false)
    if (document.fullscreenElement) void document.exitFullscreen()
  }

  const { state: pageState, retry } = usePageState(entries.length === 0)

  // กิจกรรมที่เลือกอาจถูกย้ายไปถังขยะระหว่างใช้งาน ให้ถอยไปใช้กิจกรรมแรกแทน
  const activeEventId = events.some((event) => event.id === eventId)
    ? eventId
    : (events[0]?.id ?? "")

  // สถานะว่าง (รวมที่บังคับจาก Dev Utility Panel) ซ่อนวงล้อไว้ ปุ่มหมุนจึงต้องดับตามด้วย
  const canSpin =
    entries.length >= MIN_WHEEL_ENTRIES && !spinning && pageState !== "empty"
  const canLoad =
    source === "employees" || (source === "participants" && activeEventId !== "")

  const loadNames = () => {
    if (spinning || !canLoad) return
    const loaded =
      source === "employees"
        ? entriesFromEmployees(state.employees, locale, onlyActiveEmployees)
        : entriesFromParticipants(
            selectParticipantsByEvent(state, activeEventId),
            locale,
            onlyAttending
          )
    if (loaded.length === 0) {
      setLoadNotice(
        source === "employees"
          ? "spinWheel.noEmployees"
          : "spinWheel.noParticipants"
      )
      return
    }
    setLoadNotice(null)
    setEntries(loaded)
  }

  const addEntry = (label: string) => {
    setEntries((current) => [...current, { id: newId("wheel"), label }])
  }

  const removeEntry = (entry: WheelEntry) => {
    setEntries((current) => current.filter((item) => item.id !== entry.id))
  }

  const startSpin = (pool: WheelEntry[]) => {
    if (spinning || pool.length < MIN_WHEEL_ENTRIES) return
    const winnerIndex = pickWinnerIndex(pool.length)
    pendingWinnerRef.current = pool[winnerIndex]
    setRotation((current) =>
      computeSpinTarget({
        currentRotation: current,
        winnerIndex,
        count: pool.length,
        extraTurns: WHEEL_EXTRA_TURNS,
      })
    )
    setSpinning(true)
  }

  const handleSpinEnd = React.useCallback(() => {
    const winnerEntry = pendingWinnerRef.current
    pendingWinnerRef.current = null
    setSpinning(false)
    if (!winnerEntry) return

    const record: SpinRecord = {
      round: history.length + 1,
      entryId: winnerEntry.id,
      label: winnerEntry.label,
      prize: normalizeEntryLabel(prize),
      at: nowIso(),
    }
    setHistory((current) => [...current, record])
    setWinner(record)
    pendingAnnouncementRef.current = t("spinWheel.resultAnnounce", {
      round: record.round,
      name: record.label,
    })
    setDialogOpen(true)
  }, [history.length, prize, t])

  /**
   * ประกาศผลรอบล่าสุดหลังกล่องผู้ชนะปิดแล้วเท่านั้น
   *
   * ระหว่างกล่องเปิด Radix ใส่ aria-hidden ให้ทุกโหนดนอก Portal รวมถึง live region ก้อนนี้
   * ข้อความที่เปลี่ยนตอนนั้นจะไม่ถูกอ่าน (ช่วงนั้นชื่อและคำบรรยายในกล่องทำหน้าที่ประกาศแทน)
   */
  React.useEffect(() => {
    if (dialogOpen || !pendingAnnouncementRef.current) return
    setAnnouncement(pendingAnnouncementRef.current)
    pendingAnnouncementRef.current = ""
  }, [dialogOpen])

  /**
   * ปิดกล่องผู้ชนะ — ถ้าเปิดตัวเลือกไว้ จะนำผู้ชนะออกจากวงล้อตอนนี้
   * คืนรายชื่อหลังปรับ เพื่อให้ "หมุนอีกครั้ง" ใช้รายชื่อชุดใหม่ได้ทันทีโดยไม่รอ state
   */
  const settleRound = (): WheelEntry[] => {
    setDialogOpen(false)
    const current = winner
    setWinner(null)
    if (!current || !removeWinner) return entries

    const next = entries.filter((entry) => entry.id !== current.entryId)
    if (next.length === entries.length) return entries
    setEntries(next)
    return next
  }

  const spinAgain = () => {
    const next = settleRound()
    startSpin(next)
  }

  const remainingAfterRound =
    winner && removeWinner ? entries.length - 1 : entries.length

  if (pageState === "error") {
    return (
      <PageContainer
        className={cn(styles.page, "!space-y-0 px-3 sm:px-5 lg:px-6")}
      >
        <h1 className="sr-only">{t("spinWheel.title")}</h1>
        <div
          className={cn(
            styles.controlCard,
            "mx-auto max-w-2xl rounded-2xl p-6"
          )}
        >
          <ErrorState onRetry={retry} />
        </div>
      </PageContainer>
    )
  }

  if (pageState === "loading") {
    return (
      <PageContainer
        className={cn(styles.page, "!space-y-0 px-3 sm:px-5 lg:px-6")}
      >
        <h1 className="sr-only">{t("spinWheel.title")}</h1>
        <div className="grid gap-5 min-[1180px]:grid-cols-[minmax(0,1fr)_360px]">
          <Skeleton className="aspect-square w-full max-w-[540px] justify-self-center rounded-full bg-white/15" />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full bg-white/15" />
            <Skeleton className="h-64 w-full bg-white/15" />
            <Skeleton className="h-40 w-full bg-white/15" />
          </div>
        </div>
      </PageContainer>
    )
  }

  // ปุ่มเดียวกันโผล่สองที่พร้อมกันได้ (ใน Empty State และในการ์ดแหล่งรายชื่อ) จึงต้องแยก test id
  const renderLoadButton = (testId: string) => (
    <Button
      variant="outline"
      onClick={loadNames}
      disabled={spinning || !canLoad}
      className={CONTROL_BUTTON_CLASS}
      data-testid={testId}
    >
      <ListPlusIcon className="size-4" aria-hidden="true" />
      {t("spinWheel.loadNames")}
    </Button>
  )

  return (
    <PageContainer
      className={cn(
        styles.page,
        "!space-y-0 px-3 pt-4 pb-6 sm:px-5 sm:pt-5 lg:px-6 lg:pb-8",
        presentationMode && "z-50"
      )}
    >
      <h1 className="sr-only">{t("spinWheel.title")}</h1>

      <div
        className="relative grid gap-5 min-[1180px]:grid-cols-[minmax(0,1fr)_360px] min-[1180px]:items-start"
        data-testid="spin-wheel-page"
      >
        <div
          className={cn(
            presentationMode && styles.presentationOverlay,
            presentationMode &&
              "fixed inset-0 z-60 flex h-dvh w-screen items-center justify-center overflow-hidden"
          )}
          data-testid="wheel-stage"
        >
          {presentationMode ? <CircusBackdrop /> : null}
          <Card
            data-testid="wheel-card"
            className={cn(
              styles.stageCard,
              "relative border-0 py-0 ring-0",
              presentationMode &&
                cn(
                  styles.presentationCard,
                  "z-10 h-full w-full bg-transparent shadow-none"
                )
            )}
          >
            <CardContent
              className={cn(
                "relative z-10 flex min-h-[620px] flex-col items-center justify-center gap-4 px-4 py-5 sm:px-6 sm:py-6",
                presentationMode &&
                  cn(styles.presentationContent, "h-full justify-center")
              )}
            >
            <SparklesIcon
              className={cn(
                "absolute top-[9%] left-[8%] size-8 rotate-[-14deg] text-cyan-300/70",
                presentationMode && "hidden"
              )}
              aria-hidden="true"
            />
            <SparklesIcon
              className={cn(
                "absolute right-[9%] bottom-[15%] size-6 rotate-12 text-amber-300/80",
                presentationMode && "hidden"
              )}
              aria-hidden="true"
            />
            <div
              className={cn(
                "absolute top-4 right-4 z-20 flex justify-end",
                presentationMode && "absolute top-4 right-4 z-10 w-auto"
              )}
            >
              <Button
                type="button"
                variant="outline"
                size={presentationMode ? "lg" : "sm"}
                className={cn(
                  "border-white/25 bg-violet-950/35 text-white shadow-lg backdrop-blur-sm hover:border-amber-300/70 hover:bg-white/15 hover:text-white",
                  presentationMode && styles.circusExitButton
                )}
                onClick={
                  presentationMode ? closePresentationMode : openPresentationMode
                }
                data-testid="wheel-fullscreen"
              >
                {presentationMode ? (
                  <Minimize2Icon className="size-4" aria-hidden="true" />
                ) : (
                  <Maximize2Icon className="size-4" aria-hidden="true" />
                )}
                {presentationMode
                  ? t("spinWheel.exitFullscreen")
                  : t("spinWheel.fullscreen")}
              </Button>
            </div>
            {pageState === "empty" ? (
              <EmptyState
                icon={FerrisWheelIcon}
                title={t("spinWheel.empty")}
                description={t("spinWheel.emptyDescription")}
                className="relative z-10 min-h-[390px] text-white [&>div:first-child]:bg-white/12 [&>div:first-child]:text-amber-300 [&_.text-muted-foreground]:text-violet-100/70"
                action={
                  source === "custom" ? (
                    <Button
                      variant="outline"
                      className={CONTROL_BUTTON_CLASS}
                      onClick={() => entryInputRef.current?.focus()}
                    >
                      {t("spinWheel.addEntry")}
                    </Button>
                  ) : (
                    renderLoadButton("load-names-empty")
                  )
                }
              />
            ) : (
              <Wheel
                entries={entries}
                rotation={rotation}
                spinning={spinning}
                onSpinEnd={handleSpinEnd}
                className={
                  presentationMode
                    ? styles.presentationWheel
                    : "max-w-[34rem]"
                }
              />
            )}

            <div className="flex w-full flex-col items-center gap-2">
              <Button
                size="lg"
                onClick={() => startSpin(entries)}
                disabled={!canSpin}
                aria-describedby={
                  entries.length < MIN_WHEEL_ENTRIES ? "wheel-min-entries" : undefined
                }
                className="h-12 w-full rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-pink-500 px-8 text-base font-extrabold text-violet-950 shadow-[0_8px_0_#9d174d,0_14px_30px_rgba(15,2,28,0.34)] transition-[transform,filter,box-shadow] hover:brightness-110 active:translate-y-1 active:shadow-[0_4px_0_#9d174d,0_8px_20px_rgba(15,2,28,0.32)] sm:w-auto sm:min-w-64"
                data-testid="spin-button"
              >
                {spinning ? (
                  <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <DicesIcon className="size-4" aria-hidden="true" />
                )}
                {spinning ? t("spinWheel.spinning") : t("spinWheel.spin")}
              </Button>
              {entries.length < MIN_WHEEL_ENTRIES ? (
                <p
                  id="wheel-min-entries"
                  className="text-center text-sm text-violet-100/70"
                >
                  {t("spinWheel.minEntries")}
                </p>
              ) : null}
              {reducedMotion ? (
                <p
                  role="note"
                  className="flex items-start gap-2 text-center text-xs text-violet-100/70"
                >
                  <AccessibilityIcon
                    className="mt-0.5 size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {t("spinWheel.reducedMotion")}
                </p>
              ) : null}
            </div>

            <p className="sr-only" role="status" aria-live="polite">
              {announcement}
            </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card
            size="sm"
            data-testid="source-card"
            className={CONTROL_CARD_CLASS}
          >
            <CardHeader>
              <CardTitle className="text-white">{t("spinWheel.source")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <fieldset>
                <legend className="sr-only">{t("spinWheel.source")}</legend>
                <RadioGroup
                  value={source}
                  onValueChange={(value) => {
                    setSource(value as EntrySource)
                    setLoadNotice(null)
                  }}
                  disabled={spinning}
                  className="gap-2"
                >
                  {SOURCE_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex min-h-9 items-center gap-2 rounded-lg px-2 transition-colors hover:bg-white/8"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`wheel-source-${option.value}`}
                        className="border-white/45 data-checked:border-cyan-300 data-checked:bg-cyan-400"
                        data-testid={`wheel-source-${option.value}`}
                      />
                      <Label
                        htmlFor={`wheel-source-${option.value}`}
                        className="font-normal text-violet-50"
                      >
                        {t(option.labelKey)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </fieldset>

              {source === "participants" ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="wheel-event-select" className="text-violet-50">
                      {t("spinWheel.selectEvent")}
                    </Label>
                    {events.length === 0 ? (
                      <p className="text-sm text-violet-100/65">
                        {t("spinWheel.noEvents")}
                      </p>
                    ) : (
                      <Select
                        value={activeEventId}
                        onValueChange={(value) => {
                          setEventId(value)
                          setLoadNotice(null)
                        }}
                        disabled={spinning}
                      >
                        <SelectTrigger
                          id="wheel-event-select"
                          className={cn(CONTROL_INPUT_CLASS, "w-full")}
                          data-testid="wheel-event-select"
                        >
                          <SelectValue placeholder={t("spinWheel.selectEvent")} />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {tl(event.title)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="wheel-only-attending"
                      checked={onlyAttending}
                      onCheckedChange={(checked) =>
                        setOnlyAttending(checked === true)
                      }
                      disabled={spinning}
                      className="border-white/45 data-checked:border-cyan-300 data-checked:bg-cyan-400"
                      data-testid="wheel-only-attending"
                    />
                    <Label
                      htmlFor="wheel-only-attending"
                      className="font-normal text-violet-50"
                    >
                      {t("spinWheel.onlyAttending")}
                    </Label>
                  </div>
                </div>
              ) : null}

              {source === "employees" ? (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="wheel-only-active"
                    checked={onlyActiveEmployees}
                    onCheckedChange={(checked) =>
                      setOnlyActiveEmployees(checked === true)
                    }
                    disabled={spinning}
                    className="border-white/45 data-checked:border-cyan-300 data-checked:bg-cyan-400"
                    data-testid="wheel-only-active"
                  />
                  <Label
                    htmlFor="wheel-only-active"
                    className="font-normal text-violet-50"
                  >
                    {t("spinWheel.onlyActiveEmployees")}
                  </Label>
                </div>
              ) : null}

              {source !== "custom" ? (
                <div className="space-y-2">
                  {renderLoadButton("load-names")}
                  {loadNotice ? (
                    <p
                      role="status"
                      className="text-sm text-violet-100/65"
                      data-testid="load-notice"
                    >
                      {t(loadNotice)}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <EntryEditor
            entries={entries}
            onAdd={addEntry}
            onRemove={removeEntry}
            onClear={() => setClearEntriesOpen(true)}
            disabled={spinning}
            inputRef={entryInputRef}
          />

          <Card size="sm" className={CONTROL_CARD_CLASS}>
            <CardHeader>
              <CardTitle className="text-white">
                {t("spinWheel.prizeLabel")}
              </CardTitle>
              <CardDescription className="sr-only">
                {t("spinWheel.prizePlaceholder")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="wheel-prize" className="sr-only">
                  {t("spinWheel.prizeLabel")}
                </Label>
                <Input
                  id="wheel-prize"
                  value={prize}
                  onChange={(event) => setPrize(event.target.value)}
                  placeholder={t("spinWheel.prizePlaceholder")}
                  className={CONTROL_INPUT_CLASS}
                  autoComplete="off"
                  data-testid="wheel-prize"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor="wheel-remove-winner"
                  className="font-normal text-violet-50"
                >
                  {t("spinWheel.removeWinner")}
                </Label>
                <Switch
                  id="wheel-remove-winner"
                  checked={removeWinner}
                  onCheckedChange={setRemoveWinner}
                  className="data-checked:bg-pink-500 data-unchecked:bg-white/20"
                  data-testid="wheel-remove-winner"
                />
              </div>
            </CardContent>
          </Card>

          <SpinHistory
            records={history}
            onClear={() => setClearHistoryOpen(true)}
            disabled={spinning}
          />
        </div>
      </div>

      <WinnerDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) settleRound()
        }}
        record={winner}
        canSpinAgain={remainingAfterRound >= MIN_WHEEL_ENTRIES}
        onSpinAgain={spinAgain}
      />

      <ConfirmDialog
        open={clearEntriesOpen}
        onOpenChange={setClearEntriesOpen}
        title={t("spinWheel.confirmClearEntriesTitle")}
        description={t("spinWheel.confirmClearEntriesDescription")}
        impact={[
          t("spinWheel.confirmClearEntriesImpact", { count: entries.length }),
        ]}
        confirmLabel={t("spinWheel.clearEntries")}
        destructive
        onConfirm={() => {
          setEntries([])
          setClearEntriesOpen(false)
        }}
      />

      <ConfirmDialog
        open={clearHistoryOpen}
        onOpenChange={setClearHistoryOpen}
        title={t("spinWheel.confirmClearHistoryTitle")}
        description={t("spinWheel.confirmClearHistoryDescription")}
        impact={[
          t("spinWheel.confirmClearHistoryImpact", { count: history.length }),
        ]}
        confirmLabel={t("spinWheel.clearHistory")}
        destructive
        onConfirm={() => {
          setHistory([])
          setClearHistoryOpen(false)
        }}
      />
    </PageContainer>
  )
}
