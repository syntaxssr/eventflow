import { cn } from "@/lib/utils"

type PixelFaceVariant = "success" | "info" | "warning" | "danger"

const FACE_COLOR: Record<PixelFaceVariant, string> = {
  success: "var(--success)",
  info: "var(--info)",
  warning: "var(--warning)",
  danger: "var(--danger)",
}

const CELL = 4

/** เค้าโครงพิกเซลของหน้า — กริด 8x8 หน่วย ๆ ละ 4px (viewBox 32x32) */
const FACE_CELLS: [number, number][] = [
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0],
  [1, 1],
  [2, 1],
  [3, 1],
  [4, 1],
  [5, 1],
  [6, 1],
  [0, 2],
  [1, 2],
  [2, 2],
  [3, 2],
  [4, 2],
  [5, 2],
  [6, 2],
  [7, 2],
  [0, 3],
  [1, 3],
  [2, 3],
  [3, 3],
  [4, 3],
  [5, 3],
  [6, 3],
  [7, 3],
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 4],
  [5, 4],
  [6, 4],
  [7, 4],
  [0, 5],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [5, 5],
  [6, 5],
  [7, 5],
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 6],
  [6, 6],
  [2, 7],
  [3, 7],
  [4, 7],
  [5, 7],
]

/** ปาก: เรียบสำหรับ success/info/warning, ยิ้มมุมตกสำหรับ danger */
const MOUTH_CELLS: Record<PixelFaceVariant, [number, number][]> = {
  success: [
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
  ],
  info: [
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
  ],
  warning: [
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
  ],
  danger: [
    [2, 5],
    [3, 4],
    [4, 4],
    [5, 5],
  ],
}

const EYE_CELLS: [number, number][] = [
  [2, 3],
  [5, 3],
]

/** อีโมจิพิกเซล 8-bit — ใช้กับ Toast (สื่อความหมายผ่านรูปหน้า ไม่ใช่แค่สี) */
export function PixelFace({
  variant,
  className,
}: {
  variant: PixelFaceVariant
  className?: string
}) {
  const color = FACE_COLOR[variant]
  const mouth = MOUTH_CELLS[variant]

  return (
    <svg
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      role="img"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      {FACE_CELLS.map(([col, row], index) => (
        <rect
          key={index}
          x={col * CELL}
          y={row * CELL}
          width={CELL}
          height={CELL}
          fill={color}
        />
      ))}
      {EYE_CELLS.map(([col, row], index) => (
        <rect
          key={index}
          x={col * CELL}
          y={row * CELL}
          width={CELL}
          height={CELL}
          fill="#1c1c1c"
        />
      ))}
      {mouth.map(([col, row], index) => (
        <rect
          key={index}
          x={col * CELL}
          y={row * CELL}
          width={CELL}
          height={CELL}
          fill="#1c1c1c"
        />
      ))}
    </svg>
  )
}
