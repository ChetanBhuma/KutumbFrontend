"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationCenter } from "./notification-center"
import apiClient from "@/lib/api-client"

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = async () => {
    try {
      if (typeof window === 'undefined' || !apiClient.getAccessToken()) {
        return;
      }
      const response = await apiClient.getNotifications(1, 1)
      if (response && response.data) {
        setUnreadCount(response.data.unread || 0)
      }
    } catch (error) {
      // Silently catch background polling errors to avoid noisy console alerts
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    fetchUnreadCount()
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="relative" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationCenter isOpen={isOpen} onClose={handleClose} />
    </>
  )
}
