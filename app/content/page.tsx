"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ContentManagement } from "@/components/content/content-management"

export default function ContentPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout
        title="Content Management"
        description="Manage educational content and resources"
        currentPath="/content"
      >
        <ContentManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
