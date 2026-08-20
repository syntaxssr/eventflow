"use client"

import {
  CheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { useTheme } from "@/components/theme/theme-provider"
import { cn } from "@/lib/utils"

/**
 * ไอคอนวงกลมสี — พื้นวงกลมใช้ pastel Version 2 ของสถานะนั้น + ไอคอนใช้สีคู่
 * (foreground) เหมือนกับ badge ทั่วระบบ วางแทนไอคอนเส้นสีเดียวเริ่มต้นของ Sonner
 * วงกลมกว้าง 16px เท่ากับกล่องไอคอนเดิมของ Sonner พอดี จึงไม่ต้อง override ขนาด
 */
function ToastIcon({
  icon: Icon,
  className,
}: {
  icon: LucideIcon
  className: string
}) {
  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-full",
        className
      )}
    >
      <Icon className="size-2.5" strokeWidth={3} aria-hidden="true" />
    </span>
  )
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme}
      position="top-center"
      richColors
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // richColors ปกติมีชุดสีของตัวเอง (เขียว/แดง/เหลือง/ฟ้าคนละพาเลตกับ
          // ระบบ) ผูกกลับมาที่ token สถานะของเราแทน — พื้นเป็น pastel V2
          // ตัวอักษรเป็นสีคู่ และเส้นขอบใช้ดำ/ขาวลดความทึบตามกติกาปกติของระบบ
          // (ไม่ใช่ค่าที่ตายตัว ธีมมืด/สว่างจึงสลับให้เองผ่าน var เดิม)
          "--success-bg": "var(--success)",
          "--success-text": "var(--success-foreground)",
          "--success-border": "var(--border)",
          "--warning-bg": "var(--warning)",
          "--warning-text": "var(--warning-foreground)",
          "--warning-border": "var(--border)",
          "--info-bg": "var(--info)",
          "--info-text": "var(--info-foreground)",
          "--info-border": "var(--border)",
          "--error-bg": "var(--danger)",
          "--error-text": "var(--danger-foreground)",
          "--error-border": "var(--border)",
        } as React.CSSProperties
      }
      icons={{
        success: (
          <ToastIcon
            icon={CheckIcon}
            className="bg-success text-success-foreground"
          />
        ),
        warning: (
          <ToastIcon
            icon={TriangleAlertIcon}
            className="bg-warning text-warning-foreground"
          />
        ),
        info: (
          <ToastIcon
            icon={InfoIcon}
            className="bg-info text-info-foreground"
          />
        ),
        error: (
          <ToastIcon
            icon={XIcon}
            className="bg-danger text-danger-foreground"
          />
        ),
      }}
      {...props}
    />
  )
}

export { Toaster }
