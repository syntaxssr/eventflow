import { cn } from "@/lib/utils"

/**
 * กุญแจหนึ่งดอกที่แขวนอยู่บนราวในล็อกเกอร์
 * วาดด้วย SVG ทั้งดอกเพื่อให้คมทุกความละเอียดและเปลี่ยนสีตามธีมได้
 */
export function LockerKey({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <li className={cn("flex w-16 flex-col items-center", className)}>
      <span
        className="h-6 w-px bg-gradient-to-b from-status-gray-foreground/70 to-status-gray-foreground/30"
        aria-hidden="true"
      />

      <svg
        viewBox="0 0 40 96"
        className="h-20 w-10 drop-shadow-[0_2px_3px_rgb(0_0_0/0.45)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={`locker-key-body-${name}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#F3E6B8" />
            <stop offset="45%" stopColor="#D6B45C" />
            <stop offset="100%" stopColor="#9A7526" />
          </linearGradient>
        </defs>

        <g
          fill={`url(#locker-key-body-${name})`}
          stroke="#6F5417"
          strokeWidth="1.2"
        >
          <circle cx="20" cy="19" r="13" />
          <rect x="16.5" y="30" width="7" height="52" rx="2" />
          <rect x="23.5" y="60" width="9" height="6" rx="1.5" />
          <rect x="23.5" y="72" width="12" height="6" rx="1.5" />
        </g>

        <circle
          cx="20"
          cy="19"
          r="5.5"
          fill="var(--card)"
          stroke="#6F5417"
          strokeWidth="1.2"
        />
        <path
          d="M13 12.5a9 9 0 0 1 7-4"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.65"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>

      <span className="mt-1 max-w-full rounded-sm bg-white/90 px-1.5 py-0.5 text-center font-mono text-[0.625rem] leading-tight font-semibold text-neutral-900 shadow-sm">
        {name}
      </span>
    </li>
  )
}
