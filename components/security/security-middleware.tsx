"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { logSecurityEvent, logAuditEvent } from "@/lib/security"

interface SecurityMiddlewareProps {
  children: React.ReactNode
}

export function SecurityMiddleware({ children }: SecurityMiddlewareProps) {
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    // Log page access
    if (isAuthenticated && user) {
      logAuditEvent({
        userId: user.id,
        userEmail: user.email,
        action: "PAGE_ACCESS",
        resource: "dashboard",
        ipAddress: "192.168.1.100", // In real app, get from request
        userAgent: navigator.userAgent,
        sessionId: "current-session",
        success: true,
        metadata: {
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        },
      })
    }

    // Set up security headers (in real app, this would be done server-side)
    const setSecurityHeaders = () => {
      // Content Security Policy
      const meta = document.createElement("meta")
      meta.httpEquiv = "Content-Security-Policy"
      meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
      document.head.appendChild(meta)

      // X-Frame-Options
      const frameOptions = document.createElement("meta")
      frameOptions.httpEquiv = "X-Frame-Options"
      frameOptions.content = "DENY"
      document.head.appendChild(frameOptions)

      // X-Content-Type-Options
      const contentType = document.createElement("meta")
      contentType.httpEquiv = "X-Content-Type-Options"
      contentType.content = "nosniff"
      document.head.appendChild(contentType)
    }

    setSecurityHeaders()

    // Monitor for suspicious activity
    const handleSuspiciousActivity = (event: Event) => {
      // Detect rapid clicking or automated behavior
      const now = Date.now()
      const lastActivity = Number.parseInt(localStorage.getItem("lastActivity") || "0")

      if (now - lastActivity < 100) {
        // Less than 100ms between actions
        logSecurityEvent({
          type: "SECURITY_VIOLATION",
          severity: "MEDIUM",
          ipAddress: "192.168.1.100",
          userAgent: navigator.userAgent,
          details: {
            violationType: "rapid_clicking",
            suspiciousActivity: true,
            timeBetweenActions: now - lastActivity,
          },
        })
      }

      localStorage.setItem("lastActivity", now.toString())
    }

    // Add event listeners for security monitoring
    document.addEventListener("click", handleSuspiciousActivity)
    document.addEventListener("keydown", handleSuspiciousActivity)

    // Session timeout monitoring
    let sessionTimeout: NodeJS.Timeout
    const resetSessionTimeout = () => {
      clearTimeout(sessionTimeout)
      sessionTimeout = setTimeout(
        () => {
          if (isAuthenticated) {
            logSecurityEvent({
              type: "LOGOUT",
              severity: "LOW",
              userId: user?.id,
              userEmail: user?.email,
              ipAddress: "192.168.1.100",
              userAgent: navigator.userAgent,
              details: {
                reason: "session_timeout",
                duration: "30_minutes",
              },
            })
            // In real app, would trigger logout
          }
        },
        30 * 60 * 1000,
      ) // 30 minutes
    }

    if (isAuthenticated) {
      resetSessionTimeout()
      document.addEventListener("mousemove", resetSessionTimeout)
      document.addEventListener("keypress", resetSessionTimeout)
    }

    return () => {
      document.removeEventListener("click", handleSuspiciousActivity)
      document.removeEventListener("keydown", handleSuspiciousActivity)
      document.removeEventListener("mousemove", resetSessionTimeout)
      document.removeEventListener("keypress", resetSessionTimeout)
      clearTimeout(sessionTimeout)
    }
  }, [isAuthenticated, user])

  return <>{children}</>
}
