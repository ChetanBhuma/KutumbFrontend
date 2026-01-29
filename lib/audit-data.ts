import type { AuditLogEntry, AuditLogStats } from "@/types/audit"

export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "audit-001",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    userId: "user-001",
    userName: "Inspector Rajesh Kumar",
    userRole: "SHO",
    action: "VISIT_APPROVED",
    category: "data_change",
    resource: "Visit",
    resourceId: "visit-001",
    details: "Approved visit to Mrs. Kamala Sharma",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    sessionId: "sess-001",
    severity: "medium",
    status: "success",
    metadata: { citizenId: "citizen-001", visitDate: "2024-01-15" },
  },
  {
    id: "audit-002",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    userId: "user-002",
    userName: "Constable Amit Singh",
    userRole: "Constable",
    action: "LOGIN_SUCCESS",
    category: "authentication",
    resource: "User Session",
    details: "Successful OTP login",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Android 12; Mobile) AppleWebKit/537.36",
    sessionId: "sess-002",
    severity: "low",
    status: "success",
    metadata: { mobileNumber: "+91-9876543210", otpAttempts: 1 },
  },
  {
    id: "audit-003",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    userId: "user-003",
    userName: "ASI Priya Sharma",
    userRole: "ASI",
    action: "CITIZEN_UPDATED",
    category: "data_change",
    resource: "Citizen",
    resourceId: "citizen-002",
    details: "Updated vulnerability score for Mr. Rajesh Kumar",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    sessionId: "sess-003",
    severity: "medium",
    status: "success",
    changes: [
      { field: "vulnerabilityScore", oldValue: 75, newValue: 82 },
      { field: "riskLevel", oldValue: "medium", newValue: "high" },
    ],
  },
  {
    id: "audit-004",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    userId: "system",
    userName: "System",
    userRole: "System",
    action: "AUTO_ASSIGNMENT",
    category: "system_event",
    resource: "Roster Assignment",
    details: "Auto-assigned 5 citizens to Beat CP-A",
    ipAddress: "127.0.0.1",
    userAgent: "Kutumb-System/1.0",
    sessionId: "system-001",
    severity: "low",
    status: "success",
    metadata: { beatId: "beat-cp-a", citizenCount: 5, algorithm: "proximity-based" },
  },
  {
    id: "audit-005",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    userId: "user-004",
    userName: "Head Constable Suresh Yadav",
    userRole: "Head Constable",
    action: "LOGIN_FAILED",
    category: "security",
    resource: "User Session",
    details: "Failed login attempt - invalid OTP",
    ipAddress: "192.168.1.103",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
    sessionId: "sess-004",
    severity: "high",
    status: "failure",
    metadata: { mobileNumber: "+91-9876543211", otpAttempts: 3, reason: "invalid_otp" },
  },
  {
    id: "audit-006",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    userId: "user-001",
    userName: "Inspector Rajesh Kumar",
    userRole: "SHO",
    action: "VULNERABILITY_CONFIG_UPDATED",
    category: "compliance",
    resource: "Vulnerability Configuration",
    details: "Updated vulnerability scoring weights",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    sessionId: "sess-005",
    severity: "high",
    status: "success",
    changes: [
      { field: "healthWeight", oldValue: 0.3, newValue: 0.35 },
      { field: "isolationWeight", oldValue: 0.25, newValue: 0.3 },
    ],
  },
]

export const getAuditLogStats = (logs: AuditLogEntry[]): AuditLogStats => {
  const stats: AuditLogStats = {
    totalEntries: logs.length,
    byCategory: {},
    bySeverity: {},
    byStatus: {},
    recentActivity: 0,
  }

  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

  logs.forEach((log) => {
    // Category stats
    stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1

    // Severity stats
    stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1

    // Status stats
    stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1

    // Recent activity (last 24 hours)
    if (log.timestamp > last24Hours) {
      stats.recentActivity++
    }
  })

  return stats
}
