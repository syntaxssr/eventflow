import type { Metadata } from "next"

import { EmployeesPageView } from "@/features/employees/employees-page-view"

export const metadata: Metadata = {
  title: "รายชื่อ-ข้อมูลพนักงาน",
}

export default function EmployeesPage() {
  return <EmployeesPageView />
}
