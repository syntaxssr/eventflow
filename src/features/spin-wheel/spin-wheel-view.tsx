"use client"

import * as React from "react"
import {
  AccessibilityIcon,
  DicesIcon,
  FerrisWheelIcon,
  ListPlusIcon,
  Loader2Icon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { PageContainer, PageHeader } from "@/components/common/page-header"
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
import { appToast } from "@/lib/gif-toast"
import { newId } from "@/lib/id"
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

type EntrySource = "employees" | "participants" | "custom"

const SOURCE_OPTIONS: {
  value: EntrySource
  labelKey: "spinWheel.sourceEmployees" | "spinWheel.sourceParticipants" | "spinWheel.sourceCustom"
}[] = [
  { value: "employees", labelKey: "spinWheel.sourceEmployees" },
  { value: "participants", labelKey: "spinWheel.sourceParticipants" },
  { value: "custom", labelKey: "spinWheel.sourceCustom" },
]

type LoadNotice = "spinWheel.noEmployees" | "spinWheel.noParticipants" | null

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

  /** ผู้ชนะที่สุ่มไว้ตอนเริ่มหมุน — รอประกาศเมื่อวงล้อหยุด */
  const pendingWinnerRef = React.useRef<WheelEntry | null>(null)
  /** ข้อความผลรอบล่าสุดที่รอประกาศ — ดูเงื่อนไขเวลาประกาศใน useEffect ด้านล่าง */
  const pendingAnnouncementRef = React.useRef("")
  const entryInputRef = React.useRef<HTMLInputElement>(null)

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
    appToast.success(t("spinWheel.loaded", { count: loaded.length }))
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
    appToast.delete(t("spinWheel.winnerRemoved", { name: current.label }))
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
      <PageContainer>
        <PageHeader
          title={t("spinWheel.title")}
          description={t("spinWheel.subtitle")}
        />
        <ErrorState onRetry={retry} />
      </PageContainer>
    )
  }

  if (pageState === "loading") {
    return (
      <PageContainer>
        <PageHeader
          title={t("spinWheel.title")}
          description={t("spinWheel.subtitle")}
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <Skeleton className="aspect-square w-full max-w-[480px] justify-self-center rounded-full" />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
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
      data-testid={testId}
    >
      <ListPlusIcon className="size-4" aria-hidden="true" />
      {t("spinWheel.loadNames")}
    </Button>
  )

  return (
    <PageContainer>
      <PageHeader
        title={t("spinWheel.title")}
        description={t("spinWheel.subtitle")}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_380px] lg:items-start">
        <Card data-testid="wheel-card">
          <CardContent className="flex flex-col items-center gap-5">
            {pageState === "empty" ? (
              <EmptyState
                icon={FerrisWheelIcon}
                title={t("spinWheel.empty")}
                description={t("spinWheel.emptyDescription")}
                action={
                  source === "custom" ? (
                    <Button
                      variant="outline"
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
                className="w-full sm:w-auto sm:min-w-56"
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
                  className="text-muted-foreground text-center text-sm"
                >
                  {t("spinWheel.minEntries")}
                </p>
              ) : null}
              {reducedMotion ? (
                <p
                  role="note"
                  className="text-muted-foreground flex items-start gap-2 text-center text-xs"
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

        <div className="space-y-4">
          <Card size="sm" data-testid="source-card">
            <CardHeader>
              <CardTitle>{t("spinWheel.source")}</CardTitle>
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
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`wheel-source-${option.value}`}
                        data-testid={`wheel-source-${option.value}`}
                      />
                      <Label
                        htmlFor={`wheel-source-${option.value}`}
                        className="font-normal"
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
                    <Label htmlFor="wheel-event-select">
                      {t("spinWheel.selectEvent")}
                    </Label>
                    {events.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
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
                          className="w-full"
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
                      data-testid="wheel-only-attending"
                    />
                    <Label htmlFor="wheel-only-attending" className="font-normal">
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
                    data-testid="wheel-only-active"
                  />
                  <Label htmlFor="wheel-only-active" className="font-normal">
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
                      className="text-muted-foreground text-sm"
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

          <Card size="sm">
            <CardHeader>
              <CardTitle>{t("spinWheel.prizeLabel")}</CardTitle>
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
                  autoComplete="off"
                  data-testid="wheel-prize"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="wheel-remove-winner" className="font-normal">
                  {t("spinWheel.removeWinner")}
                </Label>
                <Switch
                  id="wheel-remove-winner"
                  checked={removeWinner}
                  onCheckedChange={setRemoveWinner}
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
