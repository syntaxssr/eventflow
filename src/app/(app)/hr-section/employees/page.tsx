import type { Metadata } from "next"

import { EmployeesPageView } from "@/features/employees/employees-page-view"

export const metadata: Metadata = {
  title: "รายชื่อพนักงาน",
}

export default function EmployeeDirectoryPage() {
  return <EmployeesPageView />
}
