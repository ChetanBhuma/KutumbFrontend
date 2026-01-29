"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UserManagement } from "@/components/users/user-management"

export default function UsersPage() {
  return (
    <ProtectedRoute permissionCode="admin.users">
      <DashboardLayout title="User Management" description="Manage users, roles, and permissions" currentPath="/users">
        <UserManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
