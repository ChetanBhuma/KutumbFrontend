"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ReportsExports } from "@/components/reports/reports-exports"

export default function ReportsPage() {
  return (
    <ProtectedRoute permissionCode="reports.read">
      <DashboardLayout
        title="Reports & Exports"
        description="Generate reports and schedule exports"
        currentPath="/reports"
      >
        <ReportsExports />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
