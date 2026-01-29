import type { Notification, NotificationPreferences } from "@/types/notifications"

export const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    type: "visit_overdue",
    title: "Visit Overdue",
    message: "Visit to Mrs. Kamala Sharma (Connaught Place) is 2 days overdue",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isRead: false,
    priority: "urgent",
    relatedId: "visit-001",
    relatedType: "visit",
    actionUrl: "/visits",
    metadata: { citizenName: "Mrs. Kamala Sharma", daysOverdue: 2 },
  },
  {
    id: "notif-002",
    type: "approval_required",
    title: "SHO Approval Required",
    message: "Visit to Mr. Rajesh Kumar requires your approval",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: false,
    priority: "high",
    relatedId: "visit-002",
    relatedType: "visit",
    actionUrl: "/visits",
    metadata: { officerName: "Constable Amit Singh", citizenName: "Mr. Rajesh Kumar" },
  },
  {
    id: "notif-003",
    type: "visit_reminder",
    title: "Visit Reminder",
    message: "Scheduled visit to Mrs. Sunita Devi in 2 hours",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
    priority: "medium",
    relatedId: "visit-003",
    relatedType: "visit",
    actionUrl: "/visits",
    metadata: { citizenName: "Mrs. Sunita Devi", hoursUntil: 2 },
  },
  {
    id: "notif-004",
    type: "assignment_new",
    title: "New Assignment",
    message: "3 new citizens assigned to Beat CP-A for this week",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isRead: true,
    priority: "medium",
    relatedId: "beat-cp-a",
    relatedType: "assignment",
    actionUrl: "/roster",
    metadata: { beatName: "Beat CP-A", citizenCount: 3 },
  },
  {
    id: "notif-005",
    type: "system_alert",
    title: "System Maintenance",
    message: "Scheduled maintenance tonight from 11 PM to 1 AM",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    isRead: true,
    priority: "low",
    actionUrl: "/system",
    metadata: { maintenanceWindow: "11 PM - 1 AM" },
  },
  {
    id: "notif-006",
    type: "visit_reminder",
    title: "Daily Visit Summary",
    message: "5 visits completed, 2 pending for today",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isRead: true,
    priority: "low",
    actionUrl: "/visits",
    metadata: { completed: 5, pending: 2 },
  },
]

export const defaultNotificationPreferences: NotificationPreferences = {
  visitReminders: true,
  overdueAlerts: true,
  approvalRequests: true,
  systemAlerts: true,
  emailNotifications: false,
  pushNotifications: true,
  reminderHours: 2,
}

export const getNotificationStats = (notifications: Notification[]) => {
  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
  }

  notifications.forEach((notification) => {
    stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1
    stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1
  })

  return stats
}
