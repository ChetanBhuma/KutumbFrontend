import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AuditLogViewer } from "@/components/audit/audit-log-viewer"

export default function AuditPage() {
  return (
    <ProtectedRoute permissionCode="audit.logs">
      <DashboardLayout title="Audit Logs" description="Comprehensive audit trail for compliance and security monitoring">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">Comprehensive audit trail for compliance and security monitoring</p>
          </div>

          <AuditLogViewer />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
