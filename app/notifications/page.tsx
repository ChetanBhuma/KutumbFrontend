"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { NotificationTemplates } from "@/components/notifications/notification-templates"

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout
        title="Notification Management"
        description="Manage notification templates and delivery"
        currentPath="/notifications"
      >
        <NotificationTemplates />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
