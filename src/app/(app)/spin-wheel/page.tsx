import type { Metadata } from "next"

import { SpinWheelView } from "@/features/spin-wheel/spin-wheel-view"

export const metadata: Metadata = {
  title: "เกมส์วงล้อ",
}

export default function SpinWheelPage() {
  return <SpinWheelView />
}
