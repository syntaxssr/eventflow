"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CalendarDaysIcon,
  ChevronsUpDownIcon,
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  MapPinIcon,
  SendIcon,
  UserCheckIcon,
} from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  useFormField,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RSVP_STATUS_STYLE } from "@/constants/status"
import { useLocale } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { formatDateRange, formatTimeRange } from "@/lib/format"
import { getParticipantFullName } from "@/lib/participant"
import { findParticipantForUser, searchParticipants } from "@/lib/rsvp-form"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/store"
import type { EventItem } from "@/types/event"
import type { Participant } from "@/types/participant"
import { useRsvpActions, type RsvpResponse } from "./use-rsvp-actions"

const RESPONSES: RsvpResponse[] = ["attending", "not_attending"]

const RESPONSE_LABEL_KEY: Record<RsvpResponse, TranslationKey> = {
  attending: "rsvpForm.attending",
  not_attending: "rsvpForm.notAttending",
}

const rsvpSchema = z.object({
  eventId: z.string().min(1, "rsvpForm.eventRequired"),
  participantId: z.string().min(1, "rsvpForm.participantRequired"),
  // ค่าว่าง = ยังไม่เลือก — ต้องอยู่ใน enum เพื่อให้ฟอร์มเริ่มต้นโดยไม่มีคำตอบได้
  rsvpStatus: z
    .enum(["attending", "not_attending", ""])
    .refine((value) => value !== "", "rsvpForm.responseRequired"),
  note: z.string().trim(),
})

/** ค่าในฟอร์มยอมให้คำตอบว่างได้ แต่ค่าที่ผ่าน validation แล้วต้องมีคำตอบเสมอ */
type FormInput = z.input<typeof rsvpSchema>
type FormOutput = z.output<typeof rsvpSchema>

/**
 * FormMessage แปล key ให้อัตโนมัติเฉพาะ section ที่เป็นตัวพิมพ์เล็กล้วน
 * "rsvpForm" เป็น camelCase จึงต้องแปลเอง แต่ยังใช้ id เดิมให้ aria-describedby ชี้มาถูกที่
 */
function RsvpFieldError({ messageKey }: { messageKey?: string }) {
  const { t } = useLocale()
  const { formMessageId } = useFormField()

  if (!messageKey) return null

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className="text-destructive-message text-sm"
    >
      {t(messageKey as TranslationKey)}
    </p>
  )
}

interface RsvpResponseFormProps {
  events: EventItem[]
  eventId: string
  onEventChange: (eventId: string) => void
  /** ผู้เข้าร่วมของกิจกรรมที่เลือกอยู่ */
  participants: Participant[]
}

/**
 * แบบฟอร์มตอบรับ — Manual Save
 * ผู้ตอบเลือกชื่อตัวเองจากรายชื่อผู้เข้าร่วมของกิจกรรม แล้วส่งคำตอบทับสถานะเดิมได้
 */
export function RsvpResponseForm({
  events,
  eventId,
  onEventChange,
  participants,
}: RsvpResponseFormProps) {
  const { t, tl, locale } = useLocale()
  const currentUser = useCurrentUser()
  const actions = useRsvpActions()
  const baseId = React.useId()

  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [notInList, setNotInList] = React.useState(false)
  const [submitted, setSubmitted] = React.useState<{
    participantId: string
    rsvpStatus: RsvpResponse
  } | null>(null)
  const successRef = React.useRef<HTMLDivElement>(null)

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { eventId, participantId: "", rsvpStatus: "", note: "" },
  })
  const { isSubmitting } = form.formState

  React.useEffect(() => {
    if (form.getValues("eventId") !== eventId) form.setValue("eventId", eventId)
  }, [eventId, form])

  // ฟอร์มถูกแทนที่ด้วยผลลัพธ์ ปุ่มที่โฟกัสอยู่หายไป จึงย้ายโฟกัสมาที่กล่องผลลัพธ์แทน
  React.useEffect(() => {
    if (submitted) successRef.current?.focus()
  }, [submitted])

  const participantId = useWatch({ control: form.control, name: "participantId" })
  const selectedEvent = events.find((event) => event.id === eventId)
  const selectedParticipant = participants.find(
    (participant) => participant.id === participantId
  )
  const submittedParticipant = submitted
    ? participants.find((participant) => participant.id === submitted.participantId)
    : undefined

  const results = React.useMemo(
    () => searchParticipants(participants, query, locale),
    [participants, query, locale]
  )

  const selectParticipant = (participant: Participant) => {
    form.setValue("participantId", participant.id, { shouldValidate: true })
    form.setValue("note", tl(participant.note))
    setNotInList(false)
    setPickerOpen(false)
    setQuery("")
  }

  const changeEvent = (id: string, onChange: (value: string) => void) => {
    onChange(id)
    onEventChange(id)
    form.setValue("participantId", "")
    form.setValue("rsvpStatus", "")
    form.setValue("note", "")
    form.clearErrors()
    setNotInList(false)
    setQuery("")
  }

  const respondAsMe = () => {
    if (!currentUser) return
    const mine = findParticipantForUser(participants, currentUser)
    if (mine) selectParticipant(mine)
    else setNotInList(true)
  }

  const onSubmit = async (values: FormOutput) => {
    const participant = participants.find(
      (entry) => entry.id === values.participantId
    )
    const event = events.find((entry) => entry.id === values.eventId)
    if (!participant || !event) return

    const ok = await actions.submitRsvp({
      participant,
      rsvpStatus: values.rsvpStatus,
      note: values.note,
      event,
    })
    if (ok) {
      setSubmitted({ participantId: participant.id, rsvpStatus: values.rsvpStatus })
      form.reset({ eventId: values.eventId, participantId: "", rsvpStatus: "", note: "" })
    }
  }

  // กลับไปแก้คำตอบ — เติมคำตอบที่เพิ่งส่งไว้ให้ ผู้ตอบจะได้กดเปลี่ยนแค่จุดที่ต้องการ
  const changeAnswer = () => {
    const previous = submitted
    const participant = submittedParticipant
    setSubmitted(null)
    if (participant) selectParticipant(participant)
    if (previous) form.setValue("rsvpStatus", previous.rsvpStatus)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("rsvpForm.formTitle")}</CardTitle>
        <CardDescription>{t("rsvpForm.formDescription")}</CardDescription>
      </CardHeader>

      <CardContent>
        {submitted && submittedParticipant ? (
          <div
            ref={successRef}
            role="status"
            tabIndex={-1}
            className="flex flex-col items-center gap-3 py-8 text-center focus-visible:outline-none"
            data-testid="rsvp-success"
          >
            <span
              className="bg-icon-tile-green text-icon-tile-green-foreground flex size-14 items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <CircleCheckIcon className="size-7" />
            </span>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{t("rsvpForm.thanks")}</p>
              <p className="text-muted-foreground text-sm">
                {getParticipantFullName(submittedParticipant, locale)}
              </p>
            </div>
            <StatusBadge style={RSVP_STATUS_STYLE[submitted.rsvpStatus]} />
            <Button
              variant="outline"
              onClick={changeAnswer}
              data-testid="rsvp-change-answer"
            >
              {t("rsvpForm.changeAnswer")}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
              data-testid="rsvp-form"
            >
              <FormField
                control={form.control}
                name="eventId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("rsvpForm.event")}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(id) => changeEvent(id, field.onChange)}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full" data-testid="rsvp-event">
                          <SelectValue placeholder={t("rsvpForm.selectEvent")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {tl(event.title)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedEvent ? (
                      <dl className="text-muted-foreground grid gap-1 text-xs sm:grid-cols-2">
                        <div className="flex items-center gap-1.5">
                          <CalendarDaysIcon className="size-3.5 shrink-0" aria-hidden="true" />
                          <dt className="sr-only">{t("rsvpForm.eventDate")}</dt>
                          <dd className="truncate">
                            {formatDateRange(
                              selectedEvent.startDate,
                              selectedEvent.endDate,
                              locale
                            )}{" "}
                            ·{" "}
                            {formatTimeRange(
                              selectedEvent.startTime,
                              selectedEvent.endTime,
                              locale
                            )}
                          </dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
                          <dt className="sr-only">{t("rsvpForm.eventVenue")}</dt>
                          <dd className="truncate">{tl(selectedEvent.location) || "—"}</dd>
                        </div>
                      </dl>
                    ) : null}
                    <RsvpFieldError messageKey={fieldState.error?.message} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="participantId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <FormLabel>{t("rsvpForm.participant")}</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={respondAsMe}
                        disabled={isSubmitting || !currentUser}
                        data-testid="rsvp-respond-as-me"
                      >
                        <UserCheckIcon className="size-4" aria-hidden="true" />
                        {t("rsvpForm.respondAsMe")}
                      </Button>
                    </div>
                    <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={pickerOpen}
                            disabled={isSubmitting}
                            className={cn(
                              "w-full justify-between font-normal",
                              !selectedParticipant && "text-muted-foreground"
                            )}
                            data-testid="rsvp-participant"
                          >
                            <span className="truncate">
                              {selectedParticipant
                                ? getParticipantFullName(selectedParticipant, locale)
                                : t("rsvpForm.selectParticipant")}
                            </span>
                            <ChevronsUpDownIcon
                              className="size-4 shrink-0 opacity-50"
                              aria-hidden="true"
                            />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-(--radix-popover-trigger-width) p-0"
                      >
                        <Command shouldFilter={false}>
                          <CommandInput
                            value={query}
                            onValueChange={setQuery}
                            placeholder={t("rsvpForm.participantPlaceholder")}
                            clearLabel={t("common.clearSearch")}
                            data-testid="rsvp-participant-search"
                          />
                          <CommandList data-testid="rsvp-participant-list">
                            {results.length === 0 ? (
                              <CommandEmpty>{t("rsvpForm.noParticipantMatch")}</CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {results.map((participant) => (
                                  <CommandItem
                                    key={participant.id}
                                    value={participant.id}
                                    onSelect={() => selectParticipant(participant)}
                                    data-checked={participant.id === field.value}
                                  >
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate">
                                        {getParticipantFullName(participant, locale)}
                                      </span>
                                      <span className="text-muted-foreground block truncate text-xs">
                                        {tl(participant.department) || participant.email}
                                      </span>
                                    </span>
                                    <StatusBadge
                                      size="sm"
                                      style={RSVP_STATUS_STYLE[participant.rsvpStatus]}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {notInList ? (
                      <p
                        role="status"
                        className="text-muted-foreground flex items-center gap-1.5 text-sm"
                        data-testid="rsvp-not-in-list"
                      >
                        <InfoIcon className="size-4 shrink-0" aria-hidden="true" />
                        {t("rsvpForm.notInList")}
                      </p>
                    ) : null}
                    <RsvpFieldError messageKey={fieldState.error?.message} />
                  </FormItem>
                )}
              />

              {selectedParticipant ? (
                <div
                  className="bg-muted/50 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                  data-testid="rsvp-current-status"
                >
                  <span className="text-muted-foreground">
                    {t("rsvpForm.currentStatus")}:
                  </span>
                  <StatusBadge
                    size="sm"
                    style={RSVP_STATUS_STYLE[selectedParticipant.rsvpStatus]}
                  />
                  {selectedParticipant.rsvpStatus !== "pending" ? (
                    <span className="text-muted-foreground basis-full text-xs">
                      {t("rsvpForm.alreadyResponded", {
                        status: t(
                          RSVP_STATUS_STYLE[selectedParticipant.rsvpStatus]
                            .labelKey as TranslationKey
                        ),
                      })}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <FormField
                control={form.control}
                name="rsvpStatus"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("rsvpForm.response")}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                        aria-label={t("rsvpForm.response")}
                        className="grid gap-2 sm:grid-cols-2"
                        data-testid="rsvp-response"
                      >
                        {RESPONSES.map((response) => {
                          const style = RSVP_STATUS_STYLE[response]
                          const Icon = style.icon
                          const checked = field.value === response
                          const id = `${baseId}-${response}`
                          return (
                            <Label
                              key={response}
                              htmlFor={id}
                              data-checked={checked}
                              className={cn(
                                "hover:bg-muted/50 cursor-pointer gap-3 rounded-lg border p-3 transition-colors",
                                checked && "border-primary bg-primary/5"
                              )}
                            >
                              <RadioGroupItem
                                value={response}
                                id={id}
                                data-testid={`rsvp-response-${response}`}
                              />
                              <span
                                className={cn(
                                  "flex size-8 shrink-0 items-center justify-center rounded-full border",
                                  style.badge
                                )}
                                aria-hidden="true"
                              >
                                <Icon className="size-4" />
                              </span>
                              <span className="text-sm font-medium">
                                {t(RESPONSE_LABEL_KEY[response])}
                              </span>
                            </Label>
                          )
                        })}
                      </RadioGroup>
                    </FormControl>
                    <RsvpFieldError messageKey={fieldState.error?.message} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("rsvpForm.note")}
                      <span className="text-muted-foreground font-normal">
                        ({t("common.optional")})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder={t("rsvpForm.notePlaceholder")}
                        disabled={isSubmitting}
                        data-testid="rsvp-note"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} data-testid="rsvp-submit">
                  {isSubmitting ? (
                    <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <SendIcon className="size-4" aria-hidden="true" />
                  )}
                  {isSubmitting ? t("rsvpForm.submitting") : t("rsvpForm.submit")}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
