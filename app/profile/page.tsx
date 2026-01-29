"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, User, Shield, MapPin } from "lucide-react"
import apiClient from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default function ProfilePage() {
    const { user: authUser } = useAuth()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.getCurrentUser()
                if (response.success && response.data?.user) {
                    setProfile(response.data.user)
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const user = profile || authUser
    if (!user) return <div>Failed to load profile.</div>

    const roleLabel = user.roleDetails?.name || user.role
    const lastSeen = user.lastLogin
        ? `${formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}`
        : "Just now"

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <Header title="My Profile" description="Manage your account details and view assigned jurisdiction" />
                </div>
                <div className="space-y-6 max-w-4xl mx-auto p-6">

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Main Profile Card */}
                        <Card className="md:col-span-2">
                            <CardHeader className="flex flex-row items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                                        {user.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{user.name}</CardTitle>
                                        <CardDescription>{user.email}</CardDescription>
                                        <div className="mt-1 text-sm text-muted-foreground">{user.mobile || user.phone}</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-sm px-3 py-1">
                                    {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </CardHeader>
                        </Card>

                        {/* Officer Details & Jurisdiction */}
                        {user.officerProfile && (
                            <Card className="md:col-span-2 border-blue-100 dark:border-blue-900 bg-blue-50/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                        Officer Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase">Rank</p>
                                            <Badge className="mt-1 bg-blue-600 hover:bg-blue-700">{user.officerProfile.rank}</Badge>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase">PIS Number</p>
                                            <p className="text-sm font-medium mt-1 font-mono">{user.officerProfile.badgeNumber || "-"}</p>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <p className="text-xs font-semibold mb-3 text-muted-foreground uppercase flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> Assigned Jurisdiction
                                        </p>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                                            <div className="p-3 rounded bg-background border">
                                                <span className="block text-xs text-muted-foreground">Range</span>
                                                <span className="font-medium text-foreground">{user.officerProfile.Range?.name || "-"}</span>
                                            </div>
                                            <div className="p-3 rounded bg-background border">
                                                <span className="block text-xs text-muted-foreground">District</span>
                                                <span className="font-medium text-foreground">{user.officerProfile.District?.name || "-"}</span>
                                            </div>
                                            <div className="p-3 rounded bg-background border">
                                                <span className="block text-xs text-muted-foreground">Sub-Division</span>
                                                <span className="font-medium text-foreground">{user.officerProfile.SubDivision?.name || "-"}</span>
                                            </div>
                                            <div className="p-3 rounded bg-background border">
                                                <span className="block text-xs text-muted-foreground">Police Station</span>
                                                <span className="font-medium text-foreground">{user.officerProfile.PoliceStation?.name || "-"}</span>
                                            </div>
                                            <div className="p-3 rounded bg-background border">
                                                <span className="block text-xs text-muted-foreground">Beat</span>
                                                <span className="font-medium text-foreground">{user.officerProfile.Beat?.name || "-"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* System Role */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">System Role</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium">Role Code</span>
                                        <span className="text-sm">{user.role}</span>
                                    </div>
                                    {user.roleDetails?.description && (
                                        <p className="text-xs text-muted-foreground">{user.roleDetails.description}</p>
                                    )}
                                </div>
                                <div className="pt-2 border-t">
                                    <span className="text-xs text-muted-foreground">Permissions: {user.roleDetails?.permissions?.length || user.permissions?.length || 0}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Account Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Last Login</span>
                                    <span>{lastSeen}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Joined On</span>
                                    <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</span>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </main>
        </div>
    )
}
