export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId: string
  userName: string
  userRole: string
  action: string
  category: "authentication" | "data_change" | "system_event" | "security" | "compliance"
  resource: string
  resourceId?: string
  details: string
  ipAddress: string
  userAgent: string
  sessionId: string
  severity: "low" | "medium" | "high" | "critical"
  status: "success" | "failure" | "warning"
  metadata?: Record<string, any>
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
}

export interface AuditLogFilters {
  dateFrom?: Date
  dateTo?: Date
  userId?: string
  category?: string
  action?: string
  severity?: string
  status?: string
  searchTerm?: string
}

export interface AuditLogStats {
  totalEntries: number
  byCategory: Record<string, number>
  bySeverity: Record<string, number>
  byStatus: Record<string, number>
  recentActivity: number
}
