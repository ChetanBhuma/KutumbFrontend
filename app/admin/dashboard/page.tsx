"use client"

import { useState, useCallback } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useApiQuery } from "@/hooks/use-api-query"
import apiClient from "@/lib/api-client"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SHOAssignmentModal, AssignModalItem } from "@/components/dashboard/sho-assignment-modal"
import {
  Users,
  UserCheck,
  UserX,
  MapPin,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Calendar,
  Shield,
  ShieldCheck,
  ArrowUpRight
} from "lucide-react"

function DashboardContent() {
  // Current user context for role-based customization
  const { user } = useAuth()

  // 1. Fetch real dashboard stats from API
  const fetchStats = useCallback(() => apiClient.getDashboardStats(), [])
  const { data: stats, loading, error, refetch: refetchStats } = useApiQuery(fetchStats, { refetchOnMount: true })

  // 2. Fetch pending verification requests (for SHO assignment)
  const fetchVerifications = useCallback(async () => {
    try {
      const res: any = await apiClient.getVerificationRequests({ status: 'Pending' })
      if (res.success) {
        return { data: res.data?.requests || [] }
      }
      return { data: [] }
    } catch {
      return { data: [] }
    }
  }, [])
  const { data: verificationsData, loading: loadingVerifications, refetch: refetchVerifications } = useApiQuery(fetchVerifications, { refetchOnMount: true })

  // 3. Fetch pending re-visit & visit requests (for SHO assignment)
  const fetchVisitRequests = useCallback(async () => {
    try {
      const res: any = await apiClient.getVisitRequests({ status: 'Pending' })
      if (res.success) {
        return { data: res.data?.visitRequests || [] }
      }
      return { data: [] }
    } catch {
      return { data: [] }
    }
  }, [])
  const { data: visitRequestsData, loading: loadingVisitRequests, refetch: refetchVisitRequests } = useApiQuery(fetchVisitRequests, { refetchOnMount: true })

  // Modal State
  const [modalItem, setModalItem] = useState<AssignModalItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleRefreshAll = () => {
    refetchStats()
    refetchVerifications()
    refetchVisitRequests()
  }

  // Open modal for Verification Assignment
  const openVerificationAssignModal = (req: any) => {
    setModalItem({
      type: 'VERIFICATION',
      id: req.id,
      citizenId: req.seniorCitizen?.id || req.seniorCitizenId,
      citizenName: req.seniorCitizen?.fullName || 'Senior Citizen',
      mobileNumber: req.seniorCitizen?.mobileNumber,
      policeStationId: req.seniorCitizen?.policeStationId,
      policeStationName: req.seniorCitizen?.policeStationName,
      defaultDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      notes: req.remarks
    })
    setModalOpen(true)
  }

  // Open modal for Re-visit Assignment
  const openRevisitAssignModal = (req: any) => {
    setModalItem({
      type: 'REVISIT',
      id: req.id,
      citizenId: req.seniorCitizen?.id || req.seniorCitizenId,
      citizenName: req.seniorCitizen?.fullName || 'Senior Citizen',
      mobileNumber: req.seniorCitizen?.mobileNumber,
      policeStationId: req.seniorCitizen?.policeStationId,
      policeStationName: req.seniorCitizen?.policeStationName,
      defaultDate: req.preferredDate,
      visitType: req.visitType || 'Follow-up',
      notes: req.notes
    })
    setModalOpen(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">Loading police station dashboard data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md shadow-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load dashboard data</span>
            <Button variant="outline" size="sm" onClick={handleRefreshAll}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Extract KPI metrics
  const totalCitizens = stats?.citizens?.total || 0
  const totalOfficers = stats?.officers?.total || (stats?.officers?.assigned || 0) + (stats?.officers?.unassigned || 0)
  const assignedOfficers = stats?.officers?.assigned || 0
  const unassignedOfficers = stats?.officers?.unassigned || 0
  const totalVisits = stats?.visits?.total || 0
  const pendingVisits = stats?.visits?.pending || 0
  const recentActivities = stats?.recentActivities || []

  const pendingVerifications = verificationsData?.data || []

  // Dynamic Dashboard Header info based on logged-in user role
  const getDashboardHeader = () => {
    const role = (user?.role || '').toUpperCase()

    switch (role) {
      case 'SUPER_ADMIN':
        return {
          title: 'Super Administrator Command Dashboard',
          description: 'Global jurisdiction oversight, policy administration, station governance, and system-wide monitoring.',
          queueTitle: 'Officer Assignment Queue',
          queueDescription: 'Assign field officers for initial verifications and scheduled re-visits across jurisdictions.'
        }
      case 'ADMIN':
        return {
          title: 'Administrator Control Dashboard',
          description: 'Administrative command, jurisdiction oversight, officer management, and operational analytics.',
          queueTitle: 'Officer Assignment Queue',
          queueDescription: 'Assign field officers for initial verifications and scheduled re-visits.'
        }
      case 'SHO':
        return {
          title: 'Station House Officer (SHO) Command Dashboard',
          description: 'Real-time jurisdiction monitoring, officer workload allocation, and citizen verification queues.',
          queueTitle: 'SHO Officer Assignment Queue',
          queueDescription: 'Assign field officers mapped to this Police Station for initial verifications and scheduled re-visits.'
        }
      case 'INSPECTOR':
        return {
          title: 'Inspector Command Dashboard',
          description: 'Jurisdiction supervision, officer task allocation, and inspection queues.',
          queueTitle: 'Inspector Officer Assignment Queue',
          queueDescription: 'Assign field officers mapped to this area for initial verifications and scheduled re-visits.'
        }
      case 'SUPERVISOR':
        return {
          title: 'Field Supervisor Dashboard',
          description: 'Beat monitoring, officer visit tracking, and operational field oversight.',
          queueTitle: 'Field Officer Assignment Queue',
          queueDescription: 'Assign and track field officers for verifications and scheduled visits.'
        }
      case 'CONTROL_ROOM':
        return {
          title: 'Emergency & Control Room Dashboard',
          description: 'Real-time SOS monitoring, emergency dispatch, and incident coordination.',
          queueTitle: 'Officer Dispatch & Assignment Queue',
          queueDescription: 'Monitor emergency response and officer task allocation.'
        }
      case 'OFFICER':
      case 'BEAT_OFFICER':
      case 'CONSTABLE':
      case 'HEAD_CONSTABLE':
      case 'ASI':
      case 'SI':
        return {
          title: 'Officer Operations Dashboard',
          description: 'Assigned beat operations, citizen safety monitoring, and visit schedules.',
          queueTitle: 'Officer Assignment Queue',
          queueDescription: 'Initial verifications and scheduled re-visits.'
        }
      case 'VIEWER':
      case 'DATA_ENTRY':
        return {
          title: 'Operations & Data Dashboard',
          description: 'Jurisdiction records, citizen registry data, and reporting overview.',
          queueTitle: 'Officer Assignment Queue',
          queueDescription: 'Initial verifications and scheduled re-visits.'
        }
      default:
        return {
          title: user?.roleLabel ? `${user.roleLabel} Dashboard` : 'Command & Operations Dashboard',
          description: 'Real-time jurisdiction monitoring, officer workload allocation, and citizen verification queues.',
          queueTitle: 'Officer Assignment Queue',
          queueDescription: 'Assign field officers for initial verifications and scheduled re-visits.'
        }
    }
  }

  const headerInfo = getDashboardHeader()
  const pendingVisitRequests = visitRequestsData?.data || []

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header bar with jurisdiction context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            {headerInfo.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {headerInfo.description}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefreshAll} className="self-start sm:self-auto gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Core KPIs Grid - 2 rows of 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* KPI 1: Total Officers */}
        <StatsCard
          title="Total Officers"
          value={totalOfficers.toString()}
          description="Station officer strength"
          icon={Shield}
        />

        {/* KPI 2: Assigned Officers */}
        <StatsCard
          title="Assigned Officers"
          value={assignedOfficers.toString()}
          description="Assigned to station beats"
          icon={UserCheck}
        />

        {/* KPI 3: Unassigned Officers */}
        <StatsCard
          title="Unassigned Officers"
          value={unassignedOfficers.toString()}
          description="Pending beat assignment"
          icon={UserX}
        />

        {/* KPI 4: Total Visits */}
        <StatsCard
          title="Total Visits"
          value={totalVisits.toLocaleString()}
          description="All recorded visits"
          icon={Calendar}
        />

        {/* KPI 5: Pending Visits */}
        <StatsCard
          title="Pending Visits"
          value={pendingVisits.toString()}
          description="Awaiting completion"
          icon={Clock}
        />

        {/* KPI 6: Registered Citizens */}
        <StatsCard
          title="Registered Citizens"
          value={totalCitizens.toLocaleString()}
          description="Registered citizens"
          icon={Users}
        />
      </div>

      {/* SHO Operational Queues: Verification & Re-visits */}
      <Card className="glass-card shadow-sm border border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {headerInfo.queueTitle}
              </CardTitle>
              <CardDescription>
                {headerInfo.queueDescription}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {pendingVerifications.length > 0 && (
                <Badge variant="destructive" className="px-2.5 py-0.5">
                  {pendingVerifications.length} Verifications Pending
                </Badge>
              )}
              {pendingVisitRequests.length > 0 && (
                <Badge variant="secondary" className="px-2.5 py-0.5 bg-amber-100 text-amber-900">
                  {pendingVisitRequests.length} Re-visits Due
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="verifications" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="verifications" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                New Citizen Verifications ({pendingVerifications.length})
              </TabsTrigger>
              <TabsTrigger value="revisits" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Re-visits & Citizen Requests ({pendingVisitRequests.length})
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: New Citizen Verifications */}
            <TabsContent value="verifications">
              {loadingVerifications ? (
                <div className="py-8 text-center text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading pending registrations...
                </div>
              ) : pendingVerifications.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">All registered citizens have been assigned for verification!</p>
                  <p className="text-xs text-muted-foreground mt-1">No unassigned verification requests in queue.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-slate-200">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow>
                        <TableHead>Citizen Details</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingVerifications.map((req: any) => (
                        <TableRow key={req.id} className="hover:bg-slate-50/60 transition-colors">
                          <TableCell>
                            <div className="font-semibold text-slate-900">{req.seniorCitizen?.fullName || 'Senior Citizen'}</div>
                            <div className="text-xs text-muted-foreground">{req.seniorCitizen?.mobileNumber}</div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-slate-700">
                            {req.seniorCitizen?.permanentAddress || 'Address on record'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={req.priority === 'High' || req.priority === 'Urgent' ? 'destructive' : 'outline'}>
                              {req.priority || 'Normal'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              className="gap-1.5 shadow-sm"
                              onClick={() => openVerificationAssignModal(req)}
                            >
                              <UserCheck className="h-4 w-4" />
                              Assign Officer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: Re-visits & Citizen Requests */}
            <TabsContent value="revisits">
              {loadingVisitRequests ? (
                <div className="py-8 text-center text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading pending re-visit requests...
                </div>
              ) : pendingVisitRequests.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No pending re-visits awaiting officer assignment</p>
                  <p className="text-xs text-muted-foreground mt-1">All follow-ups and citizen requests are scheduled.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-slate-200">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow>
                        <TableHead>Citizen</TableHead>
                        <TableHead>Visit Purpose</TableHead>
                        <TableHead>Due / Preferred Date</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingVisitRequests.map((req: any) => (
                        <TableRow key={req.id} className="hover:bg-slate-50/60 transition-colors">
                          <TableCell>
                            <div className="font-semibold text-slate-900">{req.seniorCitizen?.fullName || 'Senior Citizen'}</div>
                            <div className="text-xs text-muted-foreground">{req.seniorCitizen?.mobileNumber}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {req.visitType || 'Follow-up'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-slate-800">
                            {req.preferredDate ? new Date(req.preferredDate).toLocaleDateString() : 'TBD'}
                            {req.preferredTimeSlot && <span className="text-xs text-muted-foreground block">{req.preferredTimeSlot}</span>}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-xs text-slate-600">
                            {req.notes || 'Re-visit triggered by vulnerability assessment'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="gap-1.5 shadow-sm border border-slate-300"
                              onClick={() => openRevisitAssignModal(req)}
                            >
                              <UserCheck className="h-4 w-4" />
                              Assign Officer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Main Content Grid: Recent Activities & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audit & Operation Activities */}
        <Card className="glass-card shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary text-base font-bold">
              <Clock className="h-5 w-5" />
              Recent Station Activities & Audits
            </CardTitle>
            <CardDescription>Latest assignment and operational events</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 p-2 rounded-md transition-colors">
                    <div className="flex items-center gap-3">
                      {activity.status === "success" || activity.type === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-800">{activity.action || activity.description}</p>
                        <p className="text-xs text-muted-foreground">by {activity.user?.name || activity.user || activity.userName || "System"}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time || activity.timestamp ? new Date(activity.time || activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activities recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Station Navigation & Quick Actions */}
        <Card className="glass-card shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="text-primary text-base font-bold">Station Operations & Modules</CardTitle>
            <CardDescription>Direct navigation to jurisdiction management modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 justify-center bg-white/60 hover:bg-primary hover:text-white border border-slate-200 transition-all group"
                onClick={() => window.location.href = '/citizens'}
              >
                <Users className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                <span className="text-xs font-semibold">Senior Citizens</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col gap-2 justify-center bg-white/60 hover:bg-primary hover:text-white border border-slate-200 transition-all group"
                onClick={() => window.location.href = '/officers'}
              >
                <UserCheck className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                <span className="text-xs font-semibold">Station Officers</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col gap-2 justify-center bg-white/60 hover:bg-primary hover:text-white border border-slate-200 transition-all group"
                onClick={() => window.location.href = '/visits'}
              >
                <Calendar className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                <span className="text-xs font-semibold">All Visits & Schedule</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col gap-2 justify-center bg-white/60 hover:bg-primary hover:text-white border border-slate-200 transition-all group"
                onClick={() => window.location.href = '/citizens/map'}
              >
                <MapPin className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                <span className="text-xs font-semibold">Jurisdiction Map</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reusable SHO Officer Assignment Dialog Modal */}
      <SHOAssignmentModal
        item={modalItem}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleRefreshAll}
      />
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
