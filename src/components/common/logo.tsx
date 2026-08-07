import { APP_NAME } from "@/constants/app"
import { cn } from "@/lib/utils"

/**
 * เครื่องหมายประจำระบบ — ดอกจัน 8 แฉกปลายมน สื่อถึงจุดนัดพบของกิจกรรม
 * ใช้ currentColor เพื่อให้กลืนกับสีข้อความของบริบทที่วาง (sidebar, แผงแบรนด์ Login)
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      {[0, 45, 90, 135].map((angle) => (
        <line
          key={angle}
          x1={16}
          y1={4}
          x2={16}
          y2={28}
          stroke="currentColor"
          strokeWidth={4.5}
          strokeLinecap="round"
          transform={`rotate(${angle} 16 16)`}
        />
      ))}
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
