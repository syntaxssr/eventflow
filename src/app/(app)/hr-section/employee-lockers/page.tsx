import type { Metadata } from "next"

import { EmployeeLockersPageView } from "@/features/hr-section/employee-lockers-page-view"

export const metadata: Metadata = {
  title: "ตำแหน่งล็อกเกอร์พนักงาน",
}

export default function EmployeeLockersPage() {
  return <EmployeeLockersPageView />
}
