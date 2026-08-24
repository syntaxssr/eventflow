"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"

import { Logo, LogoMark } from "@/components/common/logo"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { ROUTES } from "@/constants/app"
import { useT } from "@/i18n"
import {
  MAIN_NAV,
  type NavEntry,
  type NavGroup,
  type NavItem,
  isNavGroup,
  isNavGroupActive,
  isNavItemActive,
} from "./nav-items"

/**
 * เมนูที่กำลังใช้งานอยู่ต้องเห็นชัดโดยไม่พึ่งสีอย่างเดียว
 * จึงใช้ตัวหนา + สลับพื้นหลัง/ตัวอักษรเป็นสีตรงข้าม (ขาวดำ/ดำขาว) แทนการทำ
 * เป็นแค่โทนอ่อนเหมือนเมนูอื่น ๆ
 */
const NAV_BUTTON_CLASS = [
  "data-[active=true]:bg-primary",
  "data-[active=true]:text-primary-foreground",
  "data-[active=true]:[&_svg]:text-primary-foreground",
  "data-[active=true]:font-semibold",
  "data-[active=true]:hover:bg-primary",
  "data-[active=true]:hover:text-primary-foreground",
].join(" ")

/**
 * เมนูแม่ไม่ใช่หน้า จึงไม่ใช้พื้นทึบแบบเมนูปลายทาง — แค่ตัวหนาพอให้รู้ว่า
 * หน้าปัจจุบันอยู่ใต้กลุ่มนี้ (เมนูย่อยที่ active จะเป็นตัวที่ได้พื้นทึบ)
 */
const GROUP_BUTTON_CLASS = "data-[active=true]:font-semibold"

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const t = useT()
  const active = isNavItemActive(pathname, item.href)
  const Icon = item.icon

  return (
    <SidebarMenuItem>
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
}

function NavGroupItem({ group }: { group: NavGroup }) {
  const pathname = usePathname()
  const t = useT()
  const { state, setOpen: setSidebarOpen } = useSidebar()
  const groupActive = isNavGroupActive(pathname, group)
  const [open, setOpen] = React.useState(groupActive)
  const [wasActive, setWasActive] = React.useState(groupActive)
  const Icon = group.icon

  // เข้าหน้าย่อยทางอื่น (เช่นจาก Bottom Nav หรือพิมพ์ URL) ต้องเห็นกลุ่มคลี่ออกเอง
  // ปรับตอน render แทน effect เพื่อไม่ให้เห็นเมนูกระพริบจากการ render สองรอบ
  if (groupActive !== wasActive) {
    setWasActive(groupActive)
    if (groupActive) setOpen(true)
  }

  const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // ตอน Sidebar ย่อเหลือไอคอน เมนูย่อยถูกซ่อนอยู่ — คลิกแล้วให้ขยาย Sidebar
    // พร้อมคลี่กลุ่มออกเสมอ แทนการสลับเปิด/ปิดที่มองไม่เห็น
    if (state === "collapsed") {
      event.preventDefault()
      setSidebarOpen(true)
      setOpen(true)
    }
  }

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={groupActive}
            tooltip={t(group.labelKey)}
            className={GROUP_BUTTON_CLASS}
            data-testid={`nav-group-${group.id}`}
            onClick={handleTriggerClick}
          >
            <Icon aria-hidden="true" />
            <span>{t(group.labelKey)}</span>
            <ChevronRightIcon
              aria-hidden="true"
              className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.children.map((item) => {
              const active = isNavItemActive(pathname, item.href)
              const ChildIcon = item.icon
              return (
                <SidebarMenuSubItem key={item.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={active}
                    className={NAV_BUTTON_CLASS}
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                    >
                      <ChildIcon aria-hidden="true" />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function NavList({ items }: { items: NavEntry[] }) {
  return (
    <SidebarMenu>
      {items.map((entry) =>
        isNavGroup(entry) ? (
          <NavGroupItem key={entry.id} group={entry} />
        ) : (
          <NavLink key={entry.href} item={entry} />
        )
      )}
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
        </nav>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
