"use client"

import { useState, useCallback, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useApiQuery } from "@/hooks/use-api-query"
import apiClient from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SHOAssignmentModal, AssignModalItem } from "@/components/dashboard/sho-assignment-modal"
import { SHOAlertRibbon } from "@/components/dashboard/sho/sho-alert-ribbon"
import { SHOKpiGrid } from "@/components/dashboard/sho/sho-kpi-grid"
import { SHOVerificationTab } from "@/components/dashboard/sho/tabs/sho-verification-tab"
import { SHORevisitTab } from "@/components/dashboard/sho/tabs/sho-revisit-tab"
import { SHOSosTab } from "@/components/dashboard/sho/tabs/sho-sos-tab"
import { SHORosterTab } from "@/components/dashboard/sho/tabs/sho-roster-tab"
import { SHOOfficerLeaderboard } from "@/components/dashboard/sho/sho-officer-leaderboard"
import {
  ShieldCheck,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Siren,
  Clock,
  MapPin
} from "lucide-react"

function DashboardContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<string>("verifications")

  // 1. Fetch real dashboard stats from API
  const fetchStats = useCallback(() => {
    const psId = user?.policeStationId || user?.officerProfile?.policeStationId;
    return apiClient.getDashboardStats(psId ? { policeStationId: psId } : undefined);
  }, [user?.policeStationId, user?.officerProfile?.policeStationId])
  const { data: statsData, loading, error, refetch: refetchStats } = useApiQuery(fetchStats, { refetchOnMount: true })
  const stats = statsData?.data || statsData

  // 2. Fetch pending verification requests (for SHO assignment)
  const fetchVerifications = useCallback(async () => {
    try {
      const psId = user?.policeStationId || user?.officerProfile?.policeStationId;
      const res: any = await apiClient.getVerificationRequests({
        status: 'Pending',
        ...(psId ? { policeStationId: psId } : {})
      })
      if (res.success) {
        return { data: res.data?.requests || res.data?.items || (Array.isArray(res.data) ? res.data : []) }
      }
      return { data: [] }
    } catch {
      return { data: [] }
    }
  }, [user?.policeStationId, user?.officerProfile?.policeStationId])
  const { data: verificationsData, loading: loadingVerifications, refetch: refetchVerifications } = useApiQuery(fetchVerifications, { refetchOnMount: true })

  // 3. Fetch pending re-visit & visit requests (for SHO assignment)
  const fetchVisitRequests = useCallback(async () => {
    try {
      const psId = user?.policeStationId || user?.officerProfile?.policeStationId;
      const res: any = await apiClient.getRevisitsDue({
        ...(psId ? { policeStationId: psId } : {})
      })
      if (res.success) {
        return { data: res.data?.items || (Array.isArray(res.data) ? res.data : []) }
      }
      return { data: [] }
    } catch {
      return { data: [] }
    }
  }, [user?.policeStationId, user?.officerProfile?.policeStationId])
  const { data: visitRequestsData, loading: loadingVisitRequests, refetch: refetchVisitRequests } = useApiQuery(fetchVisitRequests, { refetchOnMount: true })

  // 4. Fetch SOS Alerts (for SHO police station)
  const fetchSOS = useCallback(async () => {
    try {
      const psId = user?.policeStationId || user?.officerProfile?.policeStationId;
      const res: any = await apiClient.get('/sos', {
        params: {
          limit: 100,
          ...(psId ? { policeStationId: psId } : {})
        }
      })
      if (res.success || res.data) {
        return { data: res.data?.items || res.data?.alerts || (Array.isArray(res.data) ? res.data : []) }
      }
      return { data: [] }
    } catch {
      return { data: [] }
    }
  }, [user?.policeStationId, user?.officerProfile?.policeStationId])
  const { data: sosData, loading: loadingSOS, refetch: refetchSOS } = useApiQuery(fetchSOS, { refetchOnMount: true })

  // Auto-polling for SOS alerts & counters (every 15 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats()
      refetchSOS()
    }, 15000)
    return () => clearInterval(interval)
  }, [refetchStats, refetchSOS])

  // Modal State for Officer Assignment
  const [modalItem, setModalItem] = useState<AssignModalItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleRefreshAll = () => {
    refetchStats()
    refetchVerifications()
    refetchVisitRequests()
    refetchSOS()
  }

  const handleOpenAssignModal = (item: AssignModalItem) => {
    setModalItem(item)
    setModalOpen(true)
  }

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab)
    setTimeout(() => {
      const el = document.getElementById('operations-workbench')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
  }

  // Loading state
  if (loading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">Loading Station Command Center data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md shadow-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load station dashboard data</span>
            <Button variant="outline" size="sm" onClick={handleRefreshAll}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const pendingVerifications: any[] = Array.isArray(verificationsData) ? verificationsData : (verificationsData as any)?.data || []
  const pendingVisitRequests: any[] = Array.isArray(visitRequestsData) ? visitRequestsData : (visitRequestsData as any)?.data || []
  const activeSOSList: any[] = Array.isArray(sosData) ? sosData : (sosData as any)?.data || []

  const activeSOSCount = stats?.sos?.active ?? activeSOSList.length
  const unassignedBeats = stats?.beats?.unassigned ?? 0
  const overdueVisits = stats?.citizens?.overdueHighRiskVisits ?? 0

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Action toolbar */}
      <div className="flex justify-end items-center">
        <Button variant="outline" size="sm" onClick={handleRefreshAll} className="gap-2 font-semibold text-xs shadow-2xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Station Data
        </Button>
      </div>

      {/* 1. Critical Operational Alert Ribbon */}
      <SHOAlertRibbon
        activeSOS={activeSOSCount}
        unassignedBeats={unassignedBeats}
        overdueVisits={overdueVisits}
        onSelectTab={handleSelectTab}
      />

      {/* 2. Hero 8-Card KPI Grid */}
      <SHOKpiGrid
        stats={stats}
        onSelectTab={handleSelectTab}
        activeTab={activeTab}
      />

      {/* 3. Central Operational Action Workbench (Multi-Tab Container) */}
      <Card id="operations-workbench" className="border border-slate-200 shadow-sm bg-white overflow-hidden scroll-mt-6">
        <CardHeader className="py-2.5 px-4 sm:px-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                Daily Police Station Work & Tasks
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Manage senior citizen verifications, regular follow-up visits, emergency SOS calls, and beat officer duty.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {pendingVerifications.length > 0 && (
                <Badge variant="outline" className="px-2 py-0.5 text-xs bg-blue-50 text-blue-900 border-blue-200 font-bold">
                  {pendingVerifications.length} Verifications Pending
                </Badge>
              )}
              {pendingVisitRequests.length > 0 && (
                <Badge variant="outline" className="px-2 py-0.5 text-xs bg-amber-50 text-amber-900 border-amber-200 font-bold">
                  {pendingVisitRequests.length} Follow-up Visits Due
                </Badge>
              )}
              {activeSOSCount > 0 && (
                <Badge variant="destructive" className="px-2 py-0.5 text-xs font-bold animate-pulse">
                  {activeSOSCount} Active SOS Alert{activeSOSCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2.5 pb-4 px-4 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-3">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1.5 bg-slate-100/90 gap-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <TabsTrigger
                value="verifications"
                className="text-xs py-2.5 px-3 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-slate-700 hover:text-indigo-900 hover:bg-slate-200/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:[&_svg]:text-white"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Verifications ({pendingVerifications.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="revisits"
                className="text-xs py-2.5 px-3 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-slate-700 hover:text-indigo-900 hover:bg-slate-200/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:[&_svg]:text-white"
              >
                <Clock className="h-4 w-4" />
                <span>Follow-up Visits ({pendingVisitRequests.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="sos"
                className="text-xs py-2.5 px-3 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-slate-700 hover:text-indigo-900 hover:bg-slate-200/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:[&_svg]:text-white"
              >
                <Siren className={`h-4 w-4 ${activeSOSCount > 0 ? 'text-red-500 animate-pulse data-[state=active]:text-white' : ''}`} />
                <span>Emergency SOS ({activeSOSCount})</span>
              </TabsTrigger>
              <TabsTrigger
                value="roster"
                className="text-xs py-2.5 px-3 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-slate-700 hover:text-indigo-900 hover:bg-slate-200/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:[&_svg]:text-white"
              >
                <MapPin className="h-4 w-4" />
                <span>Beat Duty List</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Verifications Queue */}
            <TabsContent value="verifications" className="mt-4 focus-visible:outline-hidden">
              <SHOVerificationTab
                verifications={pendingVerifications}
                loading={loadingVerifications}
                onOpenAssignModal={handleOpenAssignModal}
                onRefresh={handleRefreshAll}
              />
            </TabsContent>

            {/* TAB 2: Re-visits Due Queue */}
            <TabsContent value="revisits" className="mt-4 focus-visible:outline-hidden">
              <SHORevisitTab
                visitRequests={pendingVisitRequests}
                loading={loadingVisitRequests}
                policeStationId={user?.policeStationId}
                onOpenAssignModal={handleOpenAssignModal}
                onRefresh={handleRefreshAll}
              />
            </TabsContent>

            {/* TAB 3: SOS Live Console */}
            <TabsContent value="sos" className="mt-4 focus-visible:outline-hidden">
              <SHOSosTab
                alerts={activeSOSList}
                loading={loadingSOS}
                onRefresh={handleRefreshAll}
              />
            </TabsContent>

            {/* TAB 4: Beat Force Roster */}
            <TabsContent value="roster" className="mt-4 focus-visible:outline-hidden">
              <SHORosterTab
                policeStationId={user?.policeStationId}
                onRefresh={handleRefreshAll}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 4. Beat Officer Performance & Export Hub */}
      <SHOOfficerLeaderboard
        policeStationId={user?.policeStationId}
      />

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
