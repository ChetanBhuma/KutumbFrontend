"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationCenter } from "./notification-center"
import { mockNotifications, getNotificationStats } from "@/lib/notifications-data"

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const stats = getNotificationStats(mockNotifications)

  return (
    <>
      <Button variant="ghost" size="sm" className="relative" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="h-5 w-5" />
        {stats.unread > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {stats.unread > 9 ? "9+" : stats.unread}
          </Badge>
        )}
      </Button>

      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
