"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Logo, LogoMark } from "@/components/common/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"
import { ACCOUNT_NAV, MAIN_NAV, type NavItem, isNavItemActive } from "./nav-items"

/**
 * เมนูที่กำลังใช้งานอยู่ต้องเห็นชัดโดยไม่พึ่งสีอย่างเดียว
 * จึงใช้แถบสีส้มด้านซ้าย + ตัวหนา ประกอบกับพื้นหลังอ่อน
 */
const NAV_BUTTON_CLASS = [
  "relative",
  "data-[active=true]:font-semibold",
  "data-[active=true]:text-brand-900",
  "data-[active=true]:before:absolute",
  "data-[active=true]:before:inset-y-1.5",
  "data-[active=true]:before:left-0",
  "data-[active=true]:before:w-1",
  "data-[active=true]:before:rounded-r-full",
  "data-[active=true]:before:bg-brand-500",
].join(" ")

function NavList({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const t = useT()

  return (
    <SidebarMenu>
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href)
        const Icon = item.icon
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={t(item.labelKey)}
              className={NAV_BUTTON_CLASS}
            >
              <Link href={item.href} aria-current={active ? "page" : undefined}>
                <Icon aria-hidden="true" />
                <span>{t(item.labelKey)}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

export function AppSidebar() {
  const t = useT()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href={ROUTES.dashboard}
          className="focus-visible:outline-ring flex items-center gap-2 rounded-md px-1 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {collapsed ? <LogoMark className="size-6" /> : <Logo />}
          <span className="sr-only">EventFlow</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <nav
          aria-label={t("shell.mainNavigation")}
          data-testid="sidebar-nav"
          className="flex min-h-0 flex-1 flex-col"
        >
          <SidebarGroup>
            <SidebarGroupLabel>{t("shell.mainNavigation")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavList items={MAIN_NAV} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarSeparator className="mb-1" />
            <SidebarGroupContent>
              <NavList items={ACCOUNT_NAV} />
            </SidebarGroupContent>
          </SidebarGroup>
        </nav>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
