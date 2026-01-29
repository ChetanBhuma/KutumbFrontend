"use client"

import { useCallback } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useApiQuery } from "@/hooks/use-api-query"
import apiClient from "@/lib/api-client"

import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, MapPin, FileText, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react"

function DashboardContent() {
  // Fetch real dashboard stats from API
  const fetchStats = useCallback(() => apiClient.getDashboardStats(), [])
  const { data: stats, loading, error, refetch } = useApiQuery(fetchStats, { refetchOnMount: true })

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load dashboard data</span>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Extract data with fallbacks
  const totalCitizens = stats?.citizens?.total || 0
  const pendingApprovals = stats?.citizens?.pending || 0
  const totalVisits = stats?.visits?.total || 0
  const activeOfficers = stats?.officers?.active || 0
  const recentActivities = stats?.recentActivities || []
  const systemHealth = stats?.systemHealth || []

  return (
    <div className="p-6 space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <StatsCard
          title="Total Citizens"
          value={totalCitizens.toLocaleString()}
          description="Registered in system"
          icon={Users}
          trend={{ value: stats?.citizensTrend || 0, isPositive: (stats?.citizensTrend || 0) >= 0 }}
        />
        <StatsCard
          title="Active Officers"
          value={activeOfficers.toString()}
          description="On duty"
          icon={MapPin}
          trend={{ value: stats?.officersTrend || 0, isPositive: (stats?.officersTrend || 0) >= 0 }}
        />
        <StatsCard
          title="Pending Approvals"
          value={pendingApprovals.toString()}
          description="Awaiting review"
          icon={FileText}
          trend={{ value: stats?.approvalsTrend || 0, isPositive: (stats?.approvalsTrend || 0) <= 0 }}
        />
        <StatsCard
          title="Total Visits"
          value={totalVisits.toLocaleString()}
          description="This month"
          icon={AlertTriangle}
          trend={{ value: stats?.visitsTrend || 0, isPositive: (stats?.visitsTrend || 0) >= 0 }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {/* Recent Activities */}
        <Card className="glass-card hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.slice(0, 4).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 p-2 rounded-md transition-colors">
                    <div className="flex items-center gap-3">
                      {activity.status === "success" || activity.type === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-800">{activity.action || activity.description}</p>
                        <p className="text-xs text-muted-foreground">by {activity.user?.name || activity.user || activity.userName || "System"}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time || activity.timestamp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activities</p>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="glass-card hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { service: "Database", status: "operational", uptime: "99.9%" },
                { service: "Authentication", status: "operational", uptime: "100%" },
                { service: "Maps Service", status: "operational", uptime: "98.7%" },
                { service: "Backup System", status: stats?.backupStatus || "operational", uptime: stats?.backupUptime || "95.2%" },
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50/50 rounded-md transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shadow-sm ${service.status === "operational"
                        ? "bg-green-500 shadow-green-200"
                        : service.status === "maintenance"
                          ? "bg-yellow-500 shadow-yellow-200"
                          : "bg-red-500 shadow-red-200"
                        }`}
                    />
                    <span className="text-sm font-medium text-slate-800">{service.service}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        service.status === "operational"
                          ? "default"
                          : service.status === "maintenance"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs capitalize shadow-sm"
                    >
                      {service.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{service.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-primary">Quick Actions</CardTitle>
            <CardDescription>Frequently used administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col gap-3 bg-white/50 hover:bg-primary hover:text-white border-dashed border-2 hover:border-solid transition-all duration-300 group"
                onClick={() => window.location.href = '/citizens/register'}
              >
                <Users className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                <span className="text-sm font-medium">Add Citizen</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-3 bg-white/50 hover:bg-primary hover:text-white border-dashed border-2 hover:border-solid transition-all duration-300 group"
                onClick={() => window.location.href = '/admin/reports'}
              >
                <FileText className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                <span className="text-sm font-medium">New Report</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-3 bg-white/50 hover:bg-primary hover:text-white border-dashed border-2 hover:border-solid transition-all duration-300 group"
                onClick={() => window.location.href = '/citizens/map'}
              >
                <MapPin className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                <span className="text-sm font-medium">View Maps</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-3 bg-white/50 hover:bg-primary hover:text-white border-dashed border-2 hover:border-solid transition-all duration-300 group"
                onClick={() => window.location.href = '/admin/reports'}
              >
                <TrendingUp className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                <span className="text-sm font-medium">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
