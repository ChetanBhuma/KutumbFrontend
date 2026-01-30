"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCheck, Clock, AlertTriangle, Info, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import apiClient from "@/lib/api-client"

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "visit_reminder":
    case "reminder":
      return <Clock className="h-4 w-4" />
    case "visit_overdue":
    case "alert":
      return <AlertTriangle className="h-4 w-4" />
    case "approval_required":
      return <CheckCheck className="h-4 w-4" />
    case "assignment_new":
      return <User className="h-4 w-4" />
    case "system_alert":
    case "system":
      return <Info className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "urgent":
      return "bg-red-500"
    case "high":
      return "bg-orange-500"
    case "medium":
      return "bg-blue-500"
    case "low":
    case "normal":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}

const formatTimeAgo = (date: string | Date) => {
  const now = new Date()
  const d = new Date(date)
  const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  return `${Math.floor(diffInMinutes / 1440)}d ago`
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [stats, setStats] = useState({ total: 0, unread: 0 })
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getNotifications(1, 50)
      if (response && response.data) {
        setNotifications(response.data.notifications)
        setStats({
          total: response.data.total,
          unread: response.data.unread
        })
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }))

    try {
      await apiClient.markNotificationRead(id)
    } catch (error) {
      console.error("Failed to mark notification read", error)
    }
  }

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setStats((prev) => ({ ...prev, unread: 0 }))

    try {
      await apiClient.markAllNotificationsRead()
    } catch (error) {
      console.error("Failed to mark all read", error)
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unread") return !notification.isRead
    if (activeTab === "urgent") {
      return notification.priority === "urgent" || notification.priority === "high" || notification.priority === "URGENT" || notification.priority === "HIGH"
    }
    return true
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end pt-16 pr-4">
      <Card className="w-96 max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{stats.unread} unread</Badge>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={stats.unread === 0}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({stats.unread})</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No notifications found</div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${!notification.isRead ? "bg-blue-50/50" : ""
                        }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                          <div className="text-white">{getNotificationIcon(notification.type)}</div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                            {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                          </div>

                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
