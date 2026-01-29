export interface Notification {
  id: string
  type: "visit_reminder" | "visit_overdue" | "approval_required" | "system_alert" | "assignment_new"
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  priority: "low" | "medium" | "high" | "urgent"
  relatedId?: string // visit ID, citizen ID, etc.
  relatedType?: "visit" | "citizen" | "assignment"
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface NotificationPreferences {
  visitReminders: boolean
  overdueAlerts: boolean
  approvalRequests: boolean
  systemAlerts: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  reminderHours: number // hours before visit
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<string, number>
  byPriority: Record<string, number>
}
