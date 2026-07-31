import { APP_NAME } from "@/constants/app"
import { cn } from "@/lib/utils"

/** เครื่องหมายประจำระบบ — ปฏิทินที่มีเครื่องหมายถูก สื่อถึงกิจกรรมที่จัดสำเร็จ */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <rect x="2" y="5" width="28" height="25" rx="6" fill="var(--brand-500)" />
      <rect x="2" y="5" width="28" height="7" rx="3.5" fill="var(--brand-600)" />
      <rect x="8" y="2" width="3" height="7" rx="1.5" fill="var(--brand-700)" />
      <rect x="21" y="2" width="3" height="7" rx="1.5" fill="var(--brand-700)" />
      <path
        d="M10 21.5l4 4 8-8"
        fill="none"
        stroke="#2a1705"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({
  className,
  showWordmark = true,
  size = "default",
}: {
  className?: string
  showWordmark?: boolean
  size?: "sm" | "default" | "lg"
}) {
  const markSize =
    size === "sm" ? "size-6" : size === "lg" ? "size-10" : "size-8"
  const textSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"

  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark className={markSize} />
      {showWordmark ? (
        <span className={cn("font-extrabold tracking-tight", textSize)}>
          {APP_NAME}
        </span>
      ) : null}
    </span>
  )
}
