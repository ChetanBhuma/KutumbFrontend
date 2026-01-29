"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SecurityDashboard } from "@/components/security/security-dashboard"

function SecurityContent() {
  return (
    <DashboardLayout
      title="Security Dashboard"
      description="Monitor system security, threats, and compliance status"
      currentPath="/security"
    >
      <SecurityDashboard />
    </DashboardLayout>
  )
}

export default function SecurityPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: "security", action: "READ" }}>
      <SecurityContent />
    </ProtectedRoute>
  )
}
