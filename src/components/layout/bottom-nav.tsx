"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { EllipsisIcon } from "lucide-react"

import { Logo } from "@/components/common/logo"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useT } from "@/i18n"
import { cn } from "@/lib/utils"
import { MOBILE_MORE_NAV, MOBILE_NAV, isNavItemActive } from "./nav-items"

/** แถบนำทางล่างจอสำหรับมือถือ — เมนูที่เหลืออยู่ในแผง "เพิ่มเติม" */
export function BottomNav() {
  const pathname = usePathname()
  const t = useT()
  const [moreOpen, setMoreOpen] = React.useState(false)

  const moreActive = MOBILE_MORE_NAV.some((item) =>
    isNavItemActive(pathname, item.href)
  )

  return (
    <nav
      aria-label={t("shell.mainNavigation")}
      data-testid="bottom-nav"
      className="bg-background fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {MOBILE_NAV.map((item) => {
        const active = isNavItemActive(pathname, item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "mx-1 flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[0.6875rem] font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="truncate">{t(item.labelKey)}</span>
          </Link>
        )
      })}

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              "mx-1 flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[0.6875rem] font-medium transition-colors",
              moreActive
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <EllipsisIcon className="size-5" aria-hidden="true" />
            <span>{t("nav.more")}</span>
          </button>
        </SheetTrigger>

        <SheetContent side="bottom" className="max-h-[85svh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Logo size="sm" />
            </SheetTitle>
          </SheetHeader>

          <ul className="grid grid-cols-2 gap-2 px-4 pb-6">
            {MOBILE_MORE_NAV.map((item) => {
              const active = isNavItemActive(pathname, item.href)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-3 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{t(item.labelKey)}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
