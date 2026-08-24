import { permanentRedirect } from "next/navigation"

import { ROUTES } from "@/constants/app"

export default function LegacySpinWheelPage() {
  permanentRedirect(ROUTES.spinWheel)
}
