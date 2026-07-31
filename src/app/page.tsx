import { redirect } from "next/navigation"

import { ROUTES } from "@/constants/app"

/**
 * หน้าแรกส่งต่อไปหน้า Login เสมอ
 * ถ้ามี session อยู่แล้ว หน้า Login จะพาไป Dashboard ให้เอง
 */
export default function RootPage() {
  redirect(ROUTES.login)
}
