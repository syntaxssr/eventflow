"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Loader2Icon } from "lucide-react"

import { PixelFace } from "@/components/common/pixel-face"
import { useTheme } from "@/components/theme/theme-provider"

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      icons={{
        success: <PixelFace variant="success" />,
        info: <PixelFace variant="info" />,
        warning: <PixelFace variant="warning" />,
        error: <PixelFace variant="danger" />,
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
