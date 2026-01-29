"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "./login-form"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: {
    resource: string
    action: string
  }
  permissionCode?: string // NEW: Dynamic permission code (e.g., "citizens.read")
  roles?: string[]
  excludeRoles?: string[]
}

export function ProtectedRoute({
  children,
  requiredPermission,
  permissionCode,
  roles,
  excludeRoles
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, checkPermission, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  if (excludeRoles && user && excludeRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this resource.</p>
        </div>
      </div>
    )
  }

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this resource.</p>
        </div>
      </div>
    )
  }

  // NEW: Check permission code (dynamic permission system)
  if (permissionCode) {
    const hasPerm = checkPermission(permissionCode); // Changed to checkPermission as per context
    console.log(`[ProtectedRoute] Checking '${permissionCode}': ${hasPerm}`, {
      userRole: user?.role,
      userPermissions: user?.permissions
    });

    if (!hasPerm) {
      return <div className="p-4 text-center text-red-500">Access Denied: Missing permission '{permissionCode}'</div>;
    }
  }

  // OLD: Check legacy permission format (backward compatibility)
  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this resource.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

