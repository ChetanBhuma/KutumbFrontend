"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Shield,
  Users,
  MapPin,
  Settings,
  Home,
  FileText,
  UserCheck,
  Menu,
  X,
  Calendar,
  ClipboardList,
  AlertTriangle,
  History,
  Bell,
  Lock,
  Database,
  ChevronDown,
  ChevronRight,
  Map,
  Siren,
  CalendarDays,
  FileCheck,
  BarChart3,
  FileBarChart,
  GitGraph,
  List,
  UserCog,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  permission?: {
    resource: string
    action: string
  }
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/admin/dashboard",
  },
  {
    title: "Citizens",
    icon: Users,
    href: "/citizens",
    permission: {
      resource: "citizens",
      action: "read",
    },
  },
  {
    title: "Citizen Map",
    icon: Map,
    permission: {
      resource: "citizens",
      action: "read",
    },
    children: [
      {
        title: "All Citizens",
        icon: MapPin,
        href: "/citizens/map",
        permission: { resource: "citizens", action: "read" },
      },
      {
        title: "Pending Verification",
        icon: AlertTriangle,
        href: "/citizens/map/pending",
        permission: { resource: "citizens", action: "read" },
      },
    ],
  },
  {
    title: "Visits",
    icon: ClipboardList,
    href: "/visits",
    permission: {
      resource: "visits",
      action: "read",
    },
  },
  {
    title: "Registration Approvals",
    icon: FileCheck,
    href: "/approvals",
    permission: {
      resource: "citizens",
      action: "write",
    },
  },
  {
    title: "Operations",
    icon: Shield,
    children: [
      {
        title: "Jurisdiction Map",
        icon: MapPin,
        href: "/maps",
        permission: { resource: "officers", action: "read" },
      },
      {
        title: "SOS Alerts",
        icon: Siren,
        href: "/sos",
        permission: { resource: "sos", action: "read" },
      },
      {
        title: "Duty Roster",
        icon: CalendarDays,
        href: "/roster",
        permission: { resource: "operations", action: "roster" },
      },
    ],
  },
  {
    title: "Personnel",
    icon: Users,
    children: [
      {
        title: "Officers",
        icon: UserCog,
        href: "/officers",
        permission: { resource: "officers", action: "read" },
      },
      {
        title: "Hierarchy",
        icon: GitGraph,
        href: "/hierarchy",
        permission: { resource: "officers", action: "read" },
      },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    children: [
      {
        title: "Reports",
        icon: FileBarChart,
        href: "/reports",
        permission: { resource: "reports", action: "read" },
      },
      {
        title: "Analytics",
        icon: BarChart3,
        href: "/analytics",
        permission: { resource: "reports", action: "read" },
      },
    ],
  },
  {
    title: "Admin",
    icon: Shield,
    permission: {
      resource: "officers",
      action: "manage",
    },
    children: [
      {
        title: "Users",
        icon: Users,
        href: "/users",
        permission: {
          resource: "users",
          action: "manage",
        },
      },
      {
        title: "Roles",
        icon: Shield,
        href: "/admin/masters/roles",
        permission: {
          resource: "system",
          action: "settings",
        },
      },
      {
        title: "Masters",
        icon: Database,
        href: "/admin/masters",
        permission: {
          resource: "system",
          action: "settings",
        },
      },
      {
        title: "Notifications",
        icon: Bell,
        href: "/notifications",
        permission: {
          resource: "notifications",
          action: "manage",
        },
      },
    ],
  },
  {
    title: "System",
    icon: Settings,
    permission: {
      resource: "system",
      action: "settings",
    },
    children: [
      {
        title: "Config",
        icon: Settings,
        href: "/settings",
        permission: {
          resource: "system",
          action: "settings",
        },
      },
      {
        title: "Audit",
        icon: History,
        href: "/audit",
        permission: {
          resource: "audit",
          action: "logs",
        },
      },
      {
        title: "Backups",
        icon: Database,
        href: "/settings?tab=database",
        permission: {
          resource: "system",
          action: "settings",
        },
      },
    ],
  },
]

interface SidebarProps {
  currentPath?: string
}

export function Sidebar({ currentPath }: SidebarProps) {
  const { user, hasPermission } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Citizens", "Operations", "Admin", "System"]))
  const router = useRouter()
  const pathname = usePathname()

  const activePath = currentPath || pathname

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupTitle)) {
        next.delete(groupTitle)
      } else {
        next.add(groupTitle)
      }
      return next
    })
  }

  const hasItemPermission = (item: NavItem): boolean => {
    if (!item.permission) return true
    return hasPermission(item.permission.resource, item.permission.action)
  }

  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter((item) => hasItemPermission(item))
      .map((item) => {
        if (item.children) {
          const filteredChildren = filterNavItems(item.children)
          if (filteredChildren.length === 0) return null
          return { ...item, children: filteredChildren }
        }
        return item
      })
      .filter((item): item is NavItem => item !== null)
  }

  const filteredNavItems = filterNavItems(navigationItems)

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const Icon = item.icon
    const isGroup = !!item.children && item.children.length > 0
    const isExpanded = expandedGroups.has(item.title)
    const isActive = item.href && activePath === item.href
    const hasChildren = item.children && item.children.length > 0

    if (isCollapsed) {
      if (isGroup) {
        return (
          <DropdownMenu key={item.title}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-center px-2 h-10">
                <Icon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-48 ml-2">
              <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {item.children!.map((child) => (
                <DropdownMenuItem key={child.title} onClick={() => child.href && handleNavigation(child.href)}>
                  <child.icon className="mr-2 h-4 w-4" />
                  <span>{child.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }

      return (
        <Tooltip key={item.title}>
          <TooltipTrigger asChild>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-center px-2 h-10",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              onClick={() => item.href && handleNavigation(item.href)}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            {item.title}
          </TooltipContent>
        </Tooltip>
      )
    }

    if (isGroup) {
      return (
        <div key={item.title} className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-10",
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              level > 0 && "pl-8",
            )}
            onClick={() => toggleGroup(item.title)}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 truncate text-left">{item.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
          </Button>
          {isExpanded && hasChildren && (
            <div className="ml-2 space-y-1 border-l border-sidebar-border pl-2">
              {item.children!.map((child) => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Button
        key={item.href}
        variant={isActive ? "default" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 h-10",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          level > 0 && "pl-8",
        )}
        onClick={() => item.href && handleNavigation(item.href)}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{item.title}</span>
      </Button>
    )
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-sidebar-border bg-[#001f3f]">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <img
                src="/delhi-police-logo.png"
                alt="Delhi Police"
                className="h-10 w-auto object-contain"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "text-white hover:bg-white/10",
              isCollapsed && "w-full justify-center"
            )}
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-sidebar-primary-foreground">{user?.name?.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{user?.roleLabel ?? user?.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-2">
            {filteredNavItems.map((item) => renderNavItem(item))}
          </nav>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/60 text-center">
              <p>Senior Citizen Welfare Portal</p>
              <p>Delhi Police | Version 1.0</p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
