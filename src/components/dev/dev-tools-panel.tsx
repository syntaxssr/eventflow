"use client"

import { RotateCcwIcon, WrenchIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useT } from "@/i18n"
import type { TranslationKey } from "@/i18n/types"
import { useResetStore } from "@/store"
import { useDemo, type ForcedScreenState } from "./demo-provider"

const STATE_OPTIONS: { value: ForcedScreenState; labelKey: TranslationKey }[] = [
  { value: "normal", labelKey: "devTools.normal" },
  { value: "loading", labelKey: "devTools.forceLoading" },
  { value: "empty", labelKey: "devTools.forceEmpty" },
  { value: "error", labelKey: "devTools.forceError" },
]

/**
 * แผงเครื่องมือสำหรับผู้ทดสอบ Prototype
 * ใช้บังคับให้หน้าจอแสดง Loading / Empty / Error State และจำลองความล้มเหลว
 */
export function DevToolsPanel() {
  const t = useT()
  const demo = useDemo()
  const resetStore = useResetStore()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          data-testid="dev-tools-trigger"
          aria-label={t("devTools.title")}
          className="bg-background fixed right-4 bottom-20 z-40 rounded-full shadow-lg md:bottom-4"
        >
          <WrenchIcon className="size-4" aria-hidden="true" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" side="top" className="w-72">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold">{t("devTools.title")}</p>
            <p className="text-muted-foreground text-xs">
              {t("devTools.description")}
            </p>
          </div>

          <Separator />

          <fieldset className="space-y-2">
            <legend className="mb-2 text-xs font-semibold">
              {t("devTools.forceState")}
            </legend>
            <RadioGroup
              value={demo.forcedState}
              onValueChange={(value) =>
                demo.setForcedState(value as ForcedScreenState)
              }
              className="gap-2"
            >
              {STATE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`demo-state-${option.value}`}
                  />
                  <Label
                    htmlFor={`demo-state-${option.value}`}
                    className="text-sm font-normal"
                  >
                    {t(option.labelKey)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor="demo-fail-next"
                className="text-sm font-normal"
              >
                {t("devTools.failNextAction")}
              </Label>
              <Switch
                id="demo-fail-next"
                checked={demo.failNextAction}
                onCheckedChange={demo.setFailNextAction}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="demo-slow" className="text-sm font-normal">
                {t("devTools.slowNetwork")}
              </Label>
              <Switch
                id="demo-slow"
                checked={demo.slowNetwork}
                onCheckedChange={demo.setSlowNetwork}
              />
            </div>
          </div>

          <Separator />

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              resetStore()
              demo.setForcedState("normal")
              demo.setFailNextAction(false)
              toast.success(t("devTools.resetDone"))
            }}
          >
            <RotateCcwIcon className="size-4" aria-hidden="true" />
            {t("devTools.reset")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
