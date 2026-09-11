'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Phone,
  Mail,
  MapPin,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  Building2,
  RefreshCw,
  Search,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Officer {
  id: string;
  name: string;
  rank: string;
  badgeNumber: string;
  mobileNumber: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  policeStationId?: string;
  beatId?: string;
  PoliceStation?: {
    id: string;
    name: string;
    code: string;
  };
  District?: {
    id: string;
    name: string;
  };
  Beat?: {
    id: string;
    name: string;
    code: string;
    SeniorCitizen?: any[];
  };
  Visit?: any[];
}

export default function OfficerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const officerId = params?.id as string;

  const [officer, setOfficer] = useState<Officer | null>(null);
  const [loading, setLoading] = useState(true);
  const [workload, setWorkload] = useState<any>(null);
  const [copiedPis, setCopiedPis] = useState(false);

  // Visit Filters
  const [visitSearch, setVisitSearch] = useState('');
  const [visitStatusFilter, setVisitStatusFilter] = useState('ALL');

  // Reassign Beat Sheet State
  const [isAssignSheetOpen, setIsAssignSheetOpen] = useState(false);
  const [stationBeats, setStationBeats] = useState<any[]>([]);
  const [selectedBeatId, setSelectedBeatId] = useState<string>('reserve');
  const [assigningLoading, setAssigningLoading] = useState(false);

  const fetchOfficer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getOfficerById(officerId);

      if (response.success) {
        setOfficer(response.data.officer);
        setWorkload(response.data.workload);
      }
    } catch (error) {
      console.error('Failed to fetch officer:', error);
      toast.error('Failed to load officer details.');
    } finally {
      setLoading(false);
    }
  }, [officerId]);

  useEffect(() => {
    if (officerId) {
      fetchOfficer();
    }
  }, [officerId, fetchOfficer]);

  // Load Station Beats for Reassignment Modal
  const loadStationBeats = async () => {
    if (!officer?.policeStationId) return;
    try {
      const res: any = await apiClient.get('/beats', {
        params: { policeStationId: officer.policeStationId }
      });
      const beats = res?.data?.beats || (Array.isArray(res?.data) ? res.data : []) || [];
      setStationBeats(beats);
      setSelectedBeatId(officer.beatId || 'reserve');
      setIsAssignSheetOpen(true);
    } catch (err) {
      console.error('Failed to load beats for reassignment', err);
      toast.error('Could not load station beats.');
    }
  };

  const handleSaveBeatAssignment = async () => {
    if (!officer) return;
    try {
      setAssigningLoading(true);
      const isReserve = !selectedBeatId || selectedBeatId === 'reserve' || selectedBeatId === 'none';
      const res: any = await apiClient.post(`/officers/${officer.id}/assign-beat`, {
        beatId: isReserve ? null : selectedBeatId
      });

      if (res.success || res.data) {
        toast.success(
          !isReserve
            ? `Officer ${officer.name} assigned to beat successfully.`
            : `Officer ${officer.name} moved to PS reserve pool.`
        );
        setIsAssignSheetOpen(false);
        fetchOfficer();
      } else {
        toast.error(res.message || 'Failed to update beat assignment.');
      }
    } catch (error: any) {
      console.error('Failed to assign beat', error);
      toast.error(error.message || 'Error occurred during beat assignment.');
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleCopyPis = () => {
    if (officer?.badgeNumber) {
      navigator.clipboard.writeText(officer.badgeNumber);
      setCopiedPis(true);
      toast.success(`Copied PIS No (${officer.badgeNumber}) to clipboard`);
      setTimeout(() => setCopiedPis(false), 2000);
    }
  };

  const getRankBadgeClass = (rank: string) => {
    switch (rank?.toLowerCase()) {
      case 'inspector':
      case 'sub-inspector':
      case 'si':
      case 'asi':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'head constable':
      case 'hc':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'constable':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getVisitStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold text-xs">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold text-xs">In Progress</Badge>;
      case 'SCHEDULED':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-semibold text-xs">Scheduled</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-semibold text-xs">Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="font-semibold text-xs">{status}</Badge>;
    }
  };

  // Filtered Visits
  const filteredVisits = useMemo(() => {
    if (!officer?.Visit) return [];
    return officer.Visit.filter((visit: any) => {
      const matchesStatus = visitStatusFilter === 'ALL' || visit.status?.toUpperCase() === visitStatusFilter;
      const citizenName = visit.SeniorCitizen?.fullName || '';
      const visitType = visit.visitType || '';
      const notes = visit.notes || '';
      const matchesSearch =
        !visitSearch ||
        citizenName.toLowerCase().includes(visitSearch.toLowerCase()) ||
        visitType.toLowerCase().includes(visitSearch.toLowerCase()) ||
        notes.toLowerCase().includes(visitSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [officer?.Visit, visitStatusFilter, visitSearch]);

  if (loading) {
    return (
      <ProtectedRoute permissionCode="officers.read">
        <DashboardLayout title="Officer Profile" description="Loading profile..." currentPath="/officers">
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              <Shield className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Loading officer profile & duty records...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!officer) {
    return (
      <ProtectedRoute permissionCode="officers.read">
        <DashboardLayout title="Officer Not Found" description="Officer profile" currentPath="/officers">
          <Card className="max-w-md mx-auto my-12 text-center p-6 border-slate-200 shadow-sm">
            <CardContent className="pt-4 space-y-4">
              <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Officer Record Not Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The requested police officer profile does not exist or may have been removed.
                </p>
              </div>
              <Button onClick={() => router.push('/officers')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Officers Roster
              </Button>
            </CardContent>
          </Card>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Calculated Metrics
  const assignedCitizensCount = workload?.assignedCitizens ?? (officer.Beat?.SeniorCitizen?.length || 0);
  const completedVisitsCount = workload?.completedVisits ?? (officer.Visit?.filter((v: any) => v.status === 'COMPLETED').length || 0);
  const pendingVisitsCount = workload?.pendingVisits ?? (officer.Visit?.filter((v: any) => ['SCHEDULED', 'IN_PROGRESS'].includes(v.status)).length || 0);
  const totalVisitsCount = officer.Visit?.length || 0;
  const visitCompletionRate = totalVisitsCount > 0 ? Math.round((completedVisitsCount / totalVisitsCount) * 100) : 0;

  // KPI Definition aligned with SHOKpiGrid & Application Theme
  const kpiCards = [
    {
      id: 'assigned_citizens',
      title: 'Assigned Seniors',
      value: assignedCitizensCount,
      subtext: officer.Beat ? `${officer.Beat.name} (${officer.Beat.code})` : 'No Beat Assigned',
      icon: Users,
      borderClass: 'border-l-blue-500 hover:border-blue-600',
      cardBg: 'bg-gradient-to-br from-blue-50/60 via-white to-slate-50/40',
      iconBg: 'bg-blue-100 text-blue-700',
      countBadge: 'bg-blue-50 text-blue-700 border border-blue-200/70'
    },
    {
      id: 'completed_visits',
      title: 'Completed Visits',
      value: completedVisitsCount,
      subtext: `${visitCompletionRate}% overall completion rate`,
      icon: CheckCircle2,
      borderClass: 'border-l-emerald-500 hover:border-emerald-600',
      cardBg: 'bg-gradient-to-br from-emerald-50/60 via-white to-slate-50/40',
      iconBg: 'bg-emerald-100 text-emerald-700',
      countBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
    },
    {
      id: 'pending_visits',
      title: 'Pending & Active Visits',
      value: pendingVisitsCount,
      subtext: pendingVisitsCount > 0 ? `${pendingVisitsCount} scheduled duties` : 'Up to date',
      icon: Clock,
      borderClass: pendingVisitsCount > 0 ? 'border-l-amber-500 hover:border-amber-600' : 'border-l-slate-300',
      cardBg: 'bg-gradient-to-br from-amber-50/60 via-white to-slate-50/40',
      iconBg: 'bg-amber-100 text-amber-700',
      countBadge: 'bg-amber-50 text-amber-700 border border-amber-200/70'
    },
    {
      id: 'total_visits',
      title: 'Total Lifetime Visits',
      value: totalVisitsCount,
      subtext: `Member since ${new Date(officer.createdAt).toLocaleDateString()}`,
      icon: Calendar,
      borderClass: 'border-l-purple-500 hover:border-purple-600',
      cardBg: 'bg-gradient-to-br from-purple-50/60 via-white to-slate-50/40',
      iconBg: 'bg-purple-100 text-purple-700',
      countBadge: 'bg-purple-50 text-purple-700 border border-purple-200/70'
    }
  ];

  return (
    <ProtectedRoute permissionCode="officers.read">
      <DashboardLayout
        title={officer.name}
        description={`PIS No: ${officer.badgeNumber} • ${officer.rank || 'Officer'} Profile`}
        currentPath="/officers"
      >
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
          {/* Top Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/officers')}
              className="gap-2 text-slate-700 hover:text-blue-700 hover:bg-blue-50 border-slate-200 shadow-2xs font-semibold h-9"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Officers Roster
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadStationBeats}
                className="gap-2 text-slate-700 hover:text-blue-700 hover:bg-blue-50 border-slate-300 font-semibold h-9"
              >
                <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
                Assign / Reassign Beat
              </Button>

              {officer.mobileNumber && (
                <Button
                  size="sm"
                  asChild
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 shadow-2xs"
                >
                  <a href={`tel:${officer.mobileNumber}`}>
                    <Phone className="h-3.5 w-3.5" />
                    Call Officer
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* IMMERSIVE HERO OFFICER PROFILE CARD                         */}
          {/* ============================================================ */}
          <div className="overflow-hidden rounded-2xl border border-blue-200/80 shadow-md bg-white">
            {/* Signature Gradient Hero Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Shield className="h-44 w-44 text-white" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                {/* Officer Avatar + Identity */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center border-2 border-white/30 shadow-lg shadow-black/20">
                      {officer.name?.charAt(0) || 'O'}
                    </div>
                    <span
                      className={cn(
                        'absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white shadow-xs',
                        officer.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                      )}
                      title={officer.isActive ? 'Active Duty' : 'Inactive'}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {officer.name}
                      </h1>
                      <Badge className={cn('font-bold text-xs uppercase px-2.5 py-0.5 shadow-2xs', getRankBadgeClass(officer.rank))}>
                        {officer.rank || 'Constable'}
                      </Badge>
                      <Badge
                        className={cn(
                          'text-xs font-semibold px-2 py-0.5',
                          officer.isActive ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' : 'bg-rose-500/20 text-rose-200 border-rose-400/40'
                        )}
                      >
                        {officer.isActive ? 'Active Duty' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* PIS Number Badge with Copy */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button
                        onClick={handleCopyPis}
                        className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-indigo-100 px-2.5 py-1 rounded-lg border border-white/20 font-mono transition-colors"
                        title="Click to copy PIS Number"
                      >
                        <span className="font-semibold text-slate-300">PIS No:</span>
                        <span className="font-bold text-white tracking-wider">{officer.badgeNumber || 'N/A'}</span>
                        {copiedPis ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3 w-3 text-indigo-300" />}
                      </button>

                      {officer.Beat ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-400/30 font-semibold">
                          <MapPin className="h-3 w-3 text-emerald-400" />
                          Beat: {officer.Beat.name} ({officer.Beat.code})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-400/30 font-semibold">
                          <Users className="h-3 w-3 text-amber-400" />
                          In PS Reserve Pool
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Contact Quick Chips */}
                <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs text-indigo-100">
                  {officer.mobileNumber && (
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                      <Phone className="h-3.5 w-3.5 text-cyan-300" />
                      <span className="font-mono font-semibold text-white">{officer.mobileNumber}</span>
                    </div>
                  )}
                  {officer.email && (
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                      <Mail className="h-3.5 w-3.5 text-cyan-300" />
                      <span className="text-slate-200">{officer.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Jurisdiction Quick Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 bg-slate-50/80 border-t border-slate-200 text-xs">
              <div className="p-3 sm:px-4 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Police Station
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                  <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{officer.PoliceStation?.name || 'Unassigned Station'}</span>
                </span>
              </div>
              <div className="p-3 sm:px-4 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  District
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                  <Shield className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">{officer.District?.name || 'Delhi Police'}</span>
                </span>
              </div>
              <div className="p-3 sm:px-4 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Beat Area Assignment
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{officer.Beat?.name ? `${officer.Beat.name} (${officer.Beat.code})` : 'PS Reserve Pool'}</span>
                </span>
              </div>
              <div className="p-3 sm:px-4 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Onboarding Date
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                  <Calendar className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span>{new Date(officer.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* DASHBOARD-STYLE KPI METRIC CARDS (SHOKpiGrid ALIGNED)        */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {kpiCards.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card
                  key={kpi.id}
                  className={cn(
                    'group relative shadow-2xs hover:shadow-md transition-all duration-200 border border-slate-200/80 border-l-[4px] overflow-hidden hover:-translate-y-0.5',
                    kpi.borderClass,
                    kpi.cardBg
                  )}
                >
                  <CardContent className="p-3.5 px-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn('p-2 rounded-lg shrink-0 transition-transform group-hover:scale-105 shadow-2xs', kpi.iconBg)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 tracking-tight truncate leading-tight">
                            {kpi.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5 font-medium">
                            {kpi.subtext}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <div className={cn('text-lg font-black px-2.5 py-0.5 rounded-lg tracking-tight shadow-2xs min-w-[2.5rem] text-center', kpi.countBadge)}>
                          {kpi.value}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ============================================================ */}
          {/* OFFICER VISIT HISTORY & LOGS SECTION                         */}
          {/* ============================================================ */}
          <Card className="border-slate-200 shadow-2xs">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Officer Visit History & Logs ({filteredVisits.length})
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Complete log of physical safety visits and senior citizen interactions.
                  </CardDescription>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[200px]">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search citizen or visit..."
                      value={visitSearch}
                      onChange={(e) => setVisitSearch(e.target.value)}
                      className="h-8 pl-8 text-xs bg-white border-slate-300"
                    />
                  </div>

                  <Select value={visitStatusFilter} onValueChange={setVisitStatusFilter}>
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-300 min-w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white">
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredVisits.length === 0 ? (
                <div className="p-10 text-center text-slate-500 space-y-2">
                  <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">No Visit Logs Found</p>
                  <p className="text-xs">No visit records match the current filter criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="text-xs font-bold text-slate-700">Senior Citizen</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700">Visit Type</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700">Scheduled Date</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700">Status</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700">Notes & Summary</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisits.map((visit: any) => (
                        <TableRow key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="py-3">
                            <div>
                              <span className="font-bold text-xs text-slate-900 block">
                                {visit.SeniorCitizen?.fullName || 'Senior Citizen'}
                              </span>
                              {visit.SeniorCitizen?.mobileNumber && (
                                <span className="text-[11px] text-slate-500 font-mono block">
                                  {visit.SeniorCitizen.mobileNumber}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge variant="outline" className="text-[11px] font-semibold bg-slate-50 border-slate-300">
                              {visit.visitType || 'Standard Visit'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-xs text-slate-700 font-medium">
                            {new Date(visit.scheduledDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-3">
                            {getVisitStatusBadge(visit.status)}
                          </TableCell>
                          <TableCell className="py-3 text-xs text-slate-600 max-w-xs truncate">
                            {visit.notes || 'No remarks recorded'}
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            {visit.SeniorCitizen?.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 gap-1"
                                onClick={() => router.push(`/citizens/${visit.SeniorCitizen.id}`)}
                              >
                                View Citizen
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ============================================================ */}
        {/* REASSIGN BEAT DUTY OFFCANVAS (SHEET)                         */}
        {/* ============================================================ */}
        <Sheet open={isAssignSheetOpen} onOpenChange={setIsAssignSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col bg-white border-l border-slate-200 z-50">
            {/* Header with Signature Theme Gradient */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-5 sm:p-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 text-white backdrop-blur-xs border border-white/20">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-bold text-white tracking-tight">
                    Assign / Reassign Beat Duty
                  </SheetTitle>
                  <SheetDescription className="text-sm text-indigo-100 font-medium mt-0.5">
                    Allocate beat duty for {officer.name} ({officer.rank || 'Officer'})
                  </SheetDescription>
                </div>
              </div>
            </div>

            {/* Form Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/70">
              {/* Officer Profile Card */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0">
                      {officer.name?.charAt(0) || 'O'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 truncate text-base block">
                        {officer.name}
                      </span>
                      <span className="text-xs text-slate-500 font-mono block mt-0.5">
                        PIS No: {officer.badgeNumber || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200 text-xs font-bold shrink-0 px-3 py-1">
                    {officer.rank || 'Constable'}
                  </Badge>
                </div>
                {officer.mobileNumber && (
                  <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="font-mono font-medium">{officer.mobileNumber}</span>
                  </div>
                )}
              </div>

              {/* Current Deployment Status Notice */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block">
                  Current Deployment Status
                </span>
                {officer.Beat ? (
                  <div className="flex items-center gap-2.5 text-blue-950 font-semibold text-sm">
                    <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span>Assigned to: {officer.Beat.name} ({officer.Beat.code})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
                    <div className="p-1.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <span>Currently in Police Station Reserve Pool</span>
                  </div>
                )}
              </div>

              {/* Beat Selection Card */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <Label htmlFor="officer-beat-select" className="text-sm font-bold text-slate-900 block">
                  Assign Beat Area ({stationBeats.length} Station Beat{stationBeats.length > 1 ? 's' : ''} available)
                </Label>
                <Select value={selectedBeatId} onValueChange={setSelectedBeatId}>
                  <SelectTrigger id="officer-beat-select" className="w-full text-sm h-10 bg-white border-slate-300 font-medium text-slate-900">
                    <SelectValue placeholder="Choose a beat or keep in reserve..." />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white border-slate-300 max-h-64">
                    <SelectItem value="reserve" className="font-semibold text-indigo-700 text-sm">
                      -- Keep in Police Station Reserve (Available) --
                    </SelectItem>
                    {stationBeats.filter((b) => b && b.id).map((b) => (
                      <SelectItem key={b.id} value={b.id} className="text-sm py-2">
                        {b.name} ({b.code}) • {b._count?.SeniorCitizen || 0} Seniors
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select a target beat area to deploy this officer, or retain them in the police station reserve pool for emergency duties.
                </p>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <Button
                size="default"
                variant="outline"
                onClick={() => setIsAssignSheetOpen(false)}
                disabled={assigningLoading}
                className="text-sm font-semibold h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                size="default"
                onClick={handleSaveBeatAssignment}
                disabled={assigningLoading}
                className="text-sm font-bold gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all"
              >
                {assigningLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Save Beat Assignment
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
