"use client"

import React, { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Home,
    User,
    Calendar,
    FileText,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    X,
    Shield,
    ChevronRight,
    ChevronDown,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
    title: string
    icon: React.ComponentType<{ className?: string }>
    href: string
    children?: NavItem[]
}

const citizenNavItems: NavItem[] = [
    {
        title: "Emergency SOS",
        icon: AlertCircle,
        href: "/citizen-portal/emergency",
    },
    {
        title: "Dashboard",
        icon: Home,
        href: "/citizen-portal/dashboard",
    },
    {
        title: "My Profile",
        icon: User,
        href: "/citizen-portal/profile",
    },
    {
        title: "Visits",
        icon: Calendar,
        href: "/citizen-portal/visits",
    },
    {
        title: "Documents",
        icon: FileText,
        href: "/citizen-portal/documents",
    },
    {
        title: "Settings",
        icon: Settings,
        href: "/citizen-portal/settings",
    },
    {
        title: "Help & Support",
        icon: HelpCircle,
        href: "/citizen-portal/support",
    },
]

export function CitizenSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [citizenName, setCitizenName] = useState("Citizen")
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Load citizen name from local storage or API
        // For now, just a placeholder or decode from token if available
        const token = localStorage.getItem('citizenToken')
        if (token) {
            // In a real app, we'd decode the token or fetch user details
            setCitizenName("Senior Citizen")
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('citizenToken')
        localStorage.removeItem('citizenRefreshToken')
        router.push('/')
    }

    const renderNavItem = (item: NavItem) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
            <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                    "w-full justify-start gap-3 h-10",
                    isActive
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600",
                    isCollapsed && "px-2 justify-center",
                )}
                onClick={() => router.push(item.href)}
            >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Button>
        )
    }

    return (
        <div
            className={cn(
                "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 sticky top-0",
                isCollapsed ? "w-16" : "w-64",
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-[#001f3f]">
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
                    className="text-white hover:bg-white/10"
                >
                    {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </Button>
            </div>

            {/* User Info */}
            {!isCollapsed && (
                <div className="p-4 border-b border-gray-100 bg-blue-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{citizenName}</p>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                Online
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
                <nav className="space-y-1">
                    {citizenNavItems.map((item) => renderNavItem(item))}
                </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 space-y-2">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700",
                        isCollapsed && "px-2 justify-center"
                    )}
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </Button>

                {!isCollapsed && (
                    <div className="text-xs text-gray-400 text-center pt-2">
                        <p>Delhi Police Senior Citizen</p>
                        <p>Welfare Portal v1.0</p>
                    </div>
                )}
            </div>
        </div>
    )
}
