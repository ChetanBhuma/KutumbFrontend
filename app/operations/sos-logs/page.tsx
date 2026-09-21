'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import apiClient from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Siren,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Battery,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  XCircle,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SOSLogItem {
  id: string;
  seniorCitizenId: string;
  latitude: number;
  longitude: number;
  address?: string;
  batteryLevel?: number;
  deviceInfo?: any;
  status: 'Active' | 'Responded' | 'Resolved' | 'False Alarm';
  respondedBy?: string;
  respondedAt?: string;
  resolvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  SeniorCitizen?: {
    id: string;
    fullName: string;
    mobileNumber: string;
    age: number;
    gender?: string;
    permanentAddress?: string;
    vulnerabilityLevel?: string;
    PoliceStation?: { id: string; name: string; code?: string };
    Beat?: { id: string; name: string; beatNumber?: string };
    EmergencyContact?: Array<{ id: string; name: string; relationship: string; mobileNumber: string }>;
  };
  metrics?: {
    responseTimeMinutes: number | null;
    resolutionTimeMinutes: number | null;
    isResponseSLABreached: boolean;
    isResolutionSLABreached: boolean;
    isCurrentBreached?: boolean;
    minutesElapsed?: number;
  };
  locationUpdates?: any[];
  _count?: { locationUpdates: number };
}

type SortField = 'createdAt' | 'fullName' | 'status' | 'responseTime';
type SortDirection = 'asc' | 'desc';

export default function SOSLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<SOSLogItem[]>([]);
  const [allLogsForStats, setAllLogsForStats] = useState<SOSLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, TODAY, WEEK, MONTH
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Drawer / Modal state
  const [selectedLog, setSelectedLog] = useState<SOSLogItem | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [actionAlert, setActionAlert] = useState<SOSLogItem | null>(null);
  const [actionType, setActionType] = useState<'RESPOND' | 'RESOLVE' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Stats (unfiltered baseline)
  const fetchAllStats = useCallback(async () => {
    try {
      const res: any = await apiClient.getSOSLogs({ page: 1, limit: 1000 });
      if (res.success && res.data?.items) {
        setAllLogsForStats(res.data.items);
      }
    } catch {
      // Ignore background stats fetch errors
    }
  }, []);

  // Fetch Paginated SOS Logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit
      };

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      if (appliedSearch.trim()) {
        params.search = appliedSearch.trim();
      }

      // Calculate date filters
      const now = new Date();
      if (dateFilter === 'TODAY') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        params.startDate = startOfDay;
      } else if (dateFilter === 'WEEK') {
        const pastWeek = new Date();
        pastWeek.setDate(pastWeek.getDate() - 7);
        params.startDate = pastWeek.toISOString();
      } else if (dateFilter === 'MONTH') {
        const pastMonth = new Date();
        pastMonth.setDate(pastMonth.getDate() - 30);
        params.startDate = pastMonth.toISOString();
      }

      const res: any = await apiClient.getSOSLogs(params);
      if (res.success && res.data) {
        setLogs(res.data.items || []);
        if (res.data.pagination) {
          setTotalItems(res.data.pagination.total || 0);
          setTotalPages(res.data.pagination.totalPages || 1);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch SOS logs', err);
      toast({
        variant: 'destructive',
        title: 'Error loading SOS logs',
        description: err?.message || 'Could not retrieve SOS incident logs from the server.'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, limit, statusFilter, dateFilter, appliedSearch, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchLogs();
    fetchAllStats();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchTerm);
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setDateFilter('ALL');
    setSearchTerm('');
    setAppliedSearch('');
    setPage(1);
  };

  // Active filter count for Accordion badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'ALL') count++;
    if (dateFilter !== 'ALL') count++;
    if (appliedSearch.trim()) count++;
    return count;
  }, [statusFilter, dateFilter, appliedSearch]);

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorted Logs
  const sortedLogs = useMemo(() => {
    const list = [...logs];
    list.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortField === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (sortField === 'fullName') {
        valA = a.SeniorCitizen?.fullName?.toLowerCase() || '';
        valB = b.SeniorCitizen?.fullName?.toLowerCase() || '';
      } else if (sortField === 'status') {
        valA = a.status || '';
        valB = b.status || '';
      } else if (sortField === 'responseTime') {
        valA = a.metrics?.responseTimeMinutes ?? 999999;
        valB = b.metrics?.responseTimeMinutes ?? 999999;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [logs, sortField, sortDirection]);

  // Aggregated Stats for Dashboard KPI Cards
  const stats = useMemo(() => {
    const source = allLogsForStats.length > 0 ? allLogsForStats : logs;
    const total = allLogsForStats.length || totalItems || logs.length;
    const active = source.filter(l => l.status === 'Active').length;
    const responded = source.filter(l => l.status === 'Responded').length;
    const resolved = source.filter(l => l.status === 'Resolved').length;

    return { total, active, responded, resolved };
  }, [allLogsForStats, logs, totalItems]);

  // Dashboard-Style KPI Items matching approvals / admin dashboard
  const kpiItems = [
    {
      id: 'total',
      title: 'Total Incidents',
      value: stats.total.toLocaleString(),
      subtext: 'All emergency triggers',
      icon: Siren,
      borderClass: 'border-l-blue-500 hover:border-blue-600',
      cardBg: 'bg-gradient-to-br from-blue-50/60 via-white to-slate-50/40 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-950',
      activeCardBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25',
      iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      countBadge: 'bg-blue-50/90 text-blue-700 border border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
      active: statusFilter === 'ALL',
      onClick: () => {
        setStatusFilter('ALL');
        setPage(1);
      },
    },
    {
      id: 'active',
      title: 'Active Alerts',
      value: stats.active.toLocaleString(),
      subtext: 'Awaiting dispatch',
      icon: AlertTriangle,
      borderClass: 'border-l-rose-500 hover:border-rose-600',
      cardBg: 'bg-gradient-to-br from-rose-50/60 via-white to-slate-50/40 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-950',
      activeCardBg: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/25',
      iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
      countBadge: 'bg-rose-50/90 text-rose-700 border border-rose-200/70 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
      active: statusFilter === 'Active',
      onClick: () => {
        setStatusFilter(prev => (prev === 'Active' ? 'ALL' : 'Active'));
        setPage(1);
      },
    },
    {
      id: 'responded',
      title: 'In Progress / Responded',
      value: stats.responded.toLocaleString(),
      subtext: 'Officers dispatched',
      icon: Clock,
      borderClass: 'border-l-amber-500 hover:border-amber-600',
      cardBg: 'bg-gradient-to-br from-amber-50/60 via-white to-slate-50/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-950',
      activeCardBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25',
      iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
      countBadge: 'bg-amber-50/90 text-amber-700 border border-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
      active: statusFilter === 'Responded',
      onClick: () => {
        setStatusFilter(prev => (prev === 'Responded' ? 'ALL' : 'Responded'));
        setPage(1);
      },
    },
    {
      id: 'resolved',
      title: 'Resolved & Closed',
      value: stats.resolved.toLocaleString(),
      subtext: 'Successfully handled',
      icon: CheckCircle2,
      borderClass: 'border-l-emerald-500 hover:border-emerald-600',
      cardBg: 'bg-gradient-to-br from-emerald-50/60 via-white to-slate-50/40 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-950',
      activeCardBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
      countBadge: 'bg-emerald-50/90 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
      active: statusFilter === 'Resolved',
      onClick: () => {
        setStatusFilter(prev => (prev === 'Resolved' ? 'ALL' : 'Resolved'));
        setPage(1);
      },
    },
  ];

  // Status Action Handlers
  const handleOpenAction = (alert: SOSLogItem, type: 'RESPOND' | 'RESOLVE') => {
    setActionAlert(alert);
    setActionType(type);
    setActionNotes(type === 'RESOLVE' ? 'Resolved on site by beat officer team.' : 'Beat officer dispatched to citizen location.');
  };

  const handleExecuteAction = async () => {
    if (!actionAlert || !actionType) return;
    try {
      setActionLoading(true);
      const targetStatus = actionType === 'RESOLVE' ? 'Resolved' : 'Responded';
      await apiClient.updateSOSStatus(actionAlert.id, targetStatus, actionNotes);
      toast({
        title: actionType === 'RESOLVE' ? 'Alert Resolved' : 'Alert Acknowledged',
        description: `SOS alert for ${actionAlert.SeniorCitizen?.fullName || 'Citizen'} has been updated to ${targetStatus}.`
      });
      setActionAlert(null);
      setActionType(null);
      fetchLogs();
      fetchAllStats();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: err?.message || 'Could not update SOS alert status.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast({ title: 'No records', description: 'There are no SOS log records to export.' });
      return;
    }

    const headers = [
      'Incident ID',
      'Citizen Name',
      'Mobile Number',
      'Age',
      'Police Station',
      'Beat',
      'Status',
      'Address',
      'Latitude',
      'Longitude',
      'Battery Level (%)',
      'Triggered At',
      'Responded By',
      'Responded At',
      'Response Time (Mins)',
      'Resolved At',
      'Resolution Time (Mins)',
      'Resolution Notes'
    ];

    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${l.SeniorCitizen?.fullName || 'Unknown'}"`,
      `"${l.SeniorCitizen?.mobileNumber || 'N/A'}"`,
      l.SeniorCitizen?.age || 'N/A',
      `"${l.SeniorCitizen?.PoliceStation?.name || 'N/A'}"`,
      `"${l.SeniorCitizen?.Beat?.name || 'N/A'}"`,
      `"${l.status}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      l.latitude,
      l.longitude,
      l.batteryLevel ?? 'N/A',
      `"${l.createdAt ? format(new Date(l.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}"`,
      `"${l.respondedBy || 'N/A'}"`,
      `"${l.respondedAt ? format(new Date(l.respondedAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}"`,
      l.metrics?.responseTimeMinutes ?? 'N/A',
      `"${l.resolvedAt ? format(new Date(l.resolvedAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}"`,
      l.metrics?.resolutionTimeMinutes ?? 'N/A',
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SOS_Incident_Logs_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: `Downloaded ${logs.length} SOS log records to CSV.`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-300">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse shrink-0"></span>
            Active
          </span>
        );
      case 'Responded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="h-3 w-3 text-amber-600 shrink-0" />
            Responded
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
            Resolved
          </span>
        );
      case 'False Alarm':
      case 'FalseAlarm':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-900 dark:text-slate-300">
            False Alarm
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-slate-400 group-hover:text-slate-700" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 ml-1 text-red-600 font-bold" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 ml-1 text-red-600 font-bold" />
    );
  };

  return (
    <ProtectedRoute permissionCode="sos.read">
      <DashboardLayout
        title="SOS Incident Logs"
        description="Comprehensive audit trail and operational log of all senior citizen emergency SOS alerts"
        currentPath="/operations/sos-logs"
      >
        <div className="space-y-4">
          {/* Top Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500 font-medium">
                {totalItems} total SOS emergency events recorded across jurisdictions
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={loading || refreshing}
                className="text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', refreshing && 'animate-spin')} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Dashboard-Style KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {kpiItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.id}
                  onClick={item.onClick}
                  className={cn(
                    'group relative shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer backdrop-blur-sm select-none hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] overflow-hidden',
                    item.active
                      ? cn('border-0 ring-0', item.activeCardBg)
                      : cn('border border-slate-200/70 dark:border-slate-800 border-l-[3.5px]', item.borderClass, item.cardBg)
                  )}
                >
                  <CardContent className="p-2.5 px-3">
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            'p-1.5 rounded-md shrink-0 transition-transform group-hover:scale-105 shadow-xs',
                            item.active ? 'bg-white/20 text-white' : item.iconBg
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              'text-xs font-semibold tracking-tight truncate leading-tight transition-colors',
                              item.active
                                ? 'text-white font-bold'
                                : 'text-slate-800 dark:text-slate-200 group-hover:text-primary'
                            )}
                          >
                            {item.title}
                          </p>
                          <p
                            className={cn(
                              'text-[10px] truncate leading-tight mt-0.5 font-medium',
                              item.active ? 'text-white/85' : 'text-muted-foreground'
                            )}
                          >
                            {item.subtext}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <div
                          className={cn(
                            'text-base font-black px-2 py-0.5 rounded-md tracking-tight shadow-xs min-w-[2.2rem] text-center transition-transform group-hover:scale-105',
                            item.active
                              ? 'bg-white text-slate-900 border-0 shadow-sm'
                              : item.countBadge
                          )}
                        >
                          {item.value}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Search & Filters Accordion */}
          <Accordion type="single" collapsible defaultValue="filters" className="w-full">
            <AccordionItem value="filters" className="border border-slate-200/90 bg-white dark:bg-slate-900 rounded-xl shadow-2xs overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm">
                  <SlidersHorizontal className="h-4 w-4 text-red-600 shrink-0" />
                  <span>Search & Filter SOS Logs</span>
                  {activeFilterCount > 0 && (
                    <Badge className="bg-red-100 text-red-900 border-red-200 text-[10px] font-bold px-2 py-0.5 ml-1">
                      {activeFilterCount} Active
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search by citizen name, mobile number, address, or incident ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 text-xs h-9 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="h-9 text-xs font-semibold px-4 bg-red-600 hover:bg-red-700 text-white">
                        <Filter className="h-3.5 w-3.5 mr-1.5" />
                        Apply Search
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="h-9 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Incident Status</label>
                      <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                        <SelectTrigger className="text-xs h-9 bg-white dark:bg-slate-900">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Statuses</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Responded">Responded</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="False Alarm">False Alarm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Date Range</label>
                      <Select value={dateFilter} onValueChange={(val) => { setDateFilter(val); setPage(1); }}>
                        <SelectTrigger className="text-xs h-9 bg-white dark:bg-slate-900">
                          <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Time</SelectItem>
                          <SelectItem value="TODAY">Today</SelectItem>
                          <SelectItem value="WEEK">Last 7 Days</SelectItem>
                          <SelectItem value="MONTH">Last 30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Page Size</label>
                      <Select value={String(limit)} onValueChange={(val) => { setLimit(Number(val)); setPage(1); }}>
                        <SelectTrigger className="text-xs h-9 bg-white dark:bg-slate-900">
                          <SelectValue placeholder="Page Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 per page</SelectItem>
                          <SelectItem value="20">20 per page</SelectItem>
                          <SelectItem value="50">50 per page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Incident Log Table */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    SOS Incident Records
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Showing {sortedLogs.length} of {totalItems} total SOS alerts recorded in the system
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
                    Page {page} of {totalPages}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-600 mb-3" />
                <p className="text-xs font-medium text-slate-500">Loading SOS log records...</p>
              </div>
            ) : sortedLogs.length === 0 ? (
              <div className="py-16 text-center">
                <Siren className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No SOS Incidents Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No emergency SOS incidents match your current search and filter criteria.
                </p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-4 text-xs">
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70 dark:bg-slate-900/70 text-xs">
                      {/* Sortable: Incident & Time */}
                      <TableHead
                        onClick={() => handleSort('createdAt')}
                        className="font-bold cursor-pointer select-none group"
                      >
                        <div className="flex items-center">
                          <span>Incident & Time</span>
                          {renderSortIcon('createdAt')}
                        </div>
                      </TableHead>

                      {/* Sortable: Citizen */}
                      <TableHead
                        onClick={() => handleSort('fullName')}
                        className="font-bold cursor-pointer select-none group"
                      >
                        <div className="flex items-center">
                          <span>Citizen</span>
                          {renderSortIcon('fullName')}
                        </div>
                      </TableHead>

                      <TableHead className="font-bold">Jurisdiction</TableHead>
                      <TableHead className="font-bold">Location & GPS</TableHead>

                      {/* Sortable: Status */}
                      <TableHead
                        onClick={() => handleSort('status')}
                        className="font-bold cursor-pointer select-none group"
                      >
                        <div className="flex items-center">
                          <span>Status</span>
                          {renderSortIcon('status')}
                        </div>
                      </TableHead>

                      {/* Sortable: Response & SLA */}
                      <TableHead
                        onClick={() => handleSort('responseTime')}
                        className="font-bold cursor-pointer select-none group"
                      >
                        <div className="flex items-center">
                          <span>Response & SLA</span>
                          {renderSortIcon('responseTime')}
                        </div>
                      </TableHead>

                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {sortedLogs.map((log) => {
                      const citizen = log.SeniorCitizen;
                      const createdAt = new Date(log.createdAt);
                      const relativeTime = formatDistanceToNow(createdAt, { addSuffix: true });
                      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`;

                      return (
                        <TableRow key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                          {/* Incident ID & Time */}
                          <TableCell className="align-top py-3">
                            <div className="space-y-1">
                              <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {log.id.slice(0, 10)}...
                              </span>
                              <div className="text-[11px] text-slate-900 dark:text-slate-100 font-semibold">
                                {format(createdAt, 'dd MMM yyyy, hh:mm a')}
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium">{relativeTime}</span>
                            </div>
                          </TableCell>

                          {/* Citizen Details */}
                          <TableCell className="align-top py-3">
                            <div className="space-y-1">
                              <div className="font-bold text-slate-900 dark:text-slate-100">
                                {citizen?.fullName || 'Anonymous / Unregistered'}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                                <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                <span>{citizen?.mobileNumber || 'No Mobile'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span className="text-slate-500">{citizen?.age ? `${citizen.age} yrs` : ''} {citizen?.gender ? `· ${citizen.gender}` : ''}</span>
                                {citizen?.vulnerabilityLevel && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                    {citizen.vulnerabilityLevel}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Jurisdiction */}
                          <TableCell className="align-top py-3">
                            <div className="space-y-0.5 text-[11px]">
                              <div className="font-medium text-slate-800 dark:text-slate-200">
                                {citizen?.PoliceStation?.name || 'Unassigned PS'}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {citizen?.Beat?.name ? `Beat: ${citizen.Beat.name}` : 'Beat unassigned'}
                              </div>
                            </div>
                          </TableCell>

                          {/* Location & GPS */}
                          <TableCell className="align-top py-3 max-w-[200px]">
                            <div className="space-y-1">
                              <p className="text-[11px] text-slate-700 dark:text-slate-300 truncate" title={log.address || 'GPS Coordinates only'}>
                                {log.address || 'Address not resolved'}
                              </p>
                              <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span>{log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                              {log.batteryLevel !== null && log.batteryLevel !== undefined && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <Battery className="h-3 w-3 text-slate-400" />
                                  <span>{log.batteryLevel}% Battery</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="align-top py-3">
                            {getStatusBadge(log.status)}
                          </TableCell>

                          {/* Response & SLA */}
                          <TableCell className="align-top py-3">
                            <div className="space-y-1 text-[11px]">
                              {log.respondedBy ? (
                                <div className="text-slate-700 dark:text-slate-300">
                                  <span className="text-[10px] text-slate-400 block">Responded by:</span>
                                  <span className="font-medium truncate max-w-[130px] block" title={log.respondedBy}>
                                    {log.respondedBy}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-red-600 font-medium">Pending response</span>
                              )}

                              {log.metrics?.responseTimeMinutes !== null && log.metrics?.responseTimeMinutes !== undefined ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-slate-500">Delay: {log.metrics.responseTimeMinutes}m</span>
                                  {log.metrics.isResponseSLABreached ? (
                                    <span className="text-[9px] font-bold text-red-600 bg-red-50 dark:bg-red-950 px-1 py-0.2 rounded border border-red-200">
                                      Breached
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 py-0.2 rounded border border-emerald-200">
                                      Within SLA
                                    </span>
                                  )}
                                </div>
                              ) : null}

                              {log.resolvedAt && (
                                <div className="text-[10px] text-slate-500">
                                  Resolved: {format(new Date(log.resolvedAt), 'hh:mm a')}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="align-top py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2.5 font-medium"
                                onClick={() => {
                                  setSelectedLog(log);
                                  setIsDetailDrawerOpen(true);
                                }}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Details
                              </Button>

                              {log.status === 'Active' && (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs"
                                  onClick={() => handleOpenAction(log, 'RESPOND')}
                                >
                                  Respond
                                </Button>
                              )}

                              {log.status === 'Responded' && (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                                  onClick={() => handleOpenAction(log, 'RESOLVE')}
                                >
                                  Resolve
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination Controls Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <span>
                  Showing {totalItems > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, totalItems)} of {totalItems} incidents
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs font-semibold"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs font-semibold"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Prev
                </Button>

                <div className="flex items-center gap-1 px-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{page}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-500">{totalPages || 1}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs font-semibold"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs font-semibold"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          </Card>

          {/* Incident Detail Drawer */}
          <Sheet open={isDetailDrawerOpen} onOpenChange={setIsDetailDrawerOpen}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-6">
              {selectedLog && (
                <div className="space-y-6">
                  <SheetHeader className="text-left pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-base font-bold flex items-center gap-2">
                        <Siren className="h-5 w-5 text-red-600" />
                        <span>SOS Incident Details</span>
                      </SheetTitle>
                      {getStatusBadge(selectedLog.status)}
                    </div>
                    <SheetDescription className="text-xs font-mono text-slate-400 mt-1">
                      ID: {selectedLog.id}
                    </SheetDescription>
                  </SheetHeader>

                  {/* Citizen Profile Card */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-600" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {selectedLog.SeniorCitizen?.fullName || 'Unregistered Citizen'}
                        </h4>
                      </div>
                      {selectedLog.SeniorCitizen?.vulnerabilityLevel && (
                        <Badge variant="outline" className="text-[10px]">
                          {selectedLog.SeniorCitizen.vulnerabilityLevel} Vulnerability
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Mobile Number</span>
                        <a href={`tel:${selectedLog.SeniorCitizen?.mobileNumber}`} className="font-semibold text-blue-600 hover:underline">
                          {selectedLog.SeniorCitizen?.mobileNumber || 'N/A'}
                        </a>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Age & Gender</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {selectedLog.SeniorCitizen?.age ? `${selectedLog.SeniorCitizen.age} yrs` : 'N/A'} · {selectedLog.SeniorCitizen?.gender || 'N/A'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 block">Jurisdiction</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {selectedLog.SeniorCitizen?.PoliceStation?.name || 'N/A'} {selectedLog.SeniorCitizen?.Beat?.name ? `(Beat: ${selectedLog.SeniorCitizen.Beat.name})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  {selectedLog.SeniorCitizen?.EmergencyContact && selectedLog.SeniorCitizen.EmergencyContact.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Registered Emergency Contacts
                      </h4>
                      <div className="space-y-1.5">
                        {selectedLog.SeniorCitizen.EmergencyContact.map((contact) => (
                          <div key={contact.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs border border-slate-100 dark:border-slate-800">
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{contact.name}</span>
                              <span className="text-slate-400 ml-1.5 text-[10px]">({contact.relationship})</span>
                            </div>
                            <a href={`tel:${contact.mobileNumber}`} className="text-blue-600 hover:underline font-medium">
                              {contact.mobileNumber}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Incident Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Incident Response Timeline
                    </h4>

                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {/* Event 1: Triggered */}
                      <div className="relative">
                        <span className="absolute -left-6 top-0.5 h-4 w-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold">
                          1
                        </span>
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 dark:text-slate-100">SOS Triggered</span>
                          <span className="text-[10px] text-slate-400 ml-2">
                            {format(new Date(selectedLog.createdAt), 'dd MMM yyyy, hh:mm:ss a')}
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                            Distress signal activated. Battery level: {selectedLog.batteryLevel !== null && selectedLog.batteryLevel !== undefined ? `${selectedLog.batteryLevel}%` : 'Unknown'}.
                          </p>
                        </div>
                      </div>

                      {/* Event 2: Responded */}
                      <div className="relative">
                        <span className={cn(
                          'absolute -left-6 top-0.5 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white',
                          selectedLog.respondedAt ? 'bg-amber-600' : 'bg-slate-300'
                        )}>
                          2
                        </span>
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 dark:text-slate-100">Officer Acknowledged</span>
                          {selectedLog.respondedAt ? (
                            <>
                              <span className="text-[10px] text-slate-400 ml-2">
                                {format(new Date(selectedLog.respondedAt), 'dd MMM yyyy, hh:mm:ss a')}
                              </span>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                                Responding authority: <span className="font-medium">{selectedLog.respondedBy || 'Police Personnel'}</span>.
                                Response latency: <span className="font-semibold">{selectedLog.metrics?.responseTimeMinutes ?? 'N/A'} mins</span>.
                              </p>
                            </>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting acknowledgement.</p>
                          )}
                        </div>
                      </div>

                      {/* Event 3: Resolved */}
                      <div className="relative">
                        <span className={cn(
                          'absolute -left-6 top-0.5 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white',
                          selectedLog.resolvedAt ? 'bg-emerald-600' : 'bg-slate-300'
                        )}>
                          3
                        </span>
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 dark:text-slate-100">Incident Resolved</span>
                          {selectedLog.resolvedAt ? (
                            <>
                              <span className="text-[10px] text-slate-400 ml-2">
                                {format(new Date(selectedLog.resolvedAt), 'dd MMM yyyy, hh:mm:ss a')}
                              </span>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                                Resolution Notes: {selectedLog.notes || 'Alert closed successfully.'}
                              </p>
                              {selectedLog.metrics?.resolutionTimeMinutes && (
                                <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                  Total incident duration: {selectedLog.metrics.resolutionTimeMinutes} minutes
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-0.5">Incident open / in progress.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location & GPS Box */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-red-600" />
                        Incident Location Coordinates
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedLog.latitude},${selectedLog.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        Open Maps <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{selectedLog.address || 'Address not resolved'}</p>
                    <div className="text-[10px] font-mono text-slate-400">
                      Latitude: {selectedLog.latitude} · Longitude: {selectedLog.longitude}
                    </div>
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsDetailDrawerOpen(false)}>
                      Close
                    </Button>
                    {selectedLog.status === 'Active' && (
                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
                        onClick={() => {
                          setIsDetailDrawerOpen(false);
                          handleOpenAction(selectedLog, 'RESPOND');
                        }}
                      >
                        Respond Now
                      </Button>
                    )}
                    {selectedLog.status === 'Responded' && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                        onClick={() => {
                          setIsDetailDrawerOpen(false);
                          handleOpenAction(selectedLog, 'RESOLVE');
                        }}
                      >
                        Mark as Resolved
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Action Dialog (Respond / Resolve) */}
          <Dialog open={!!actionAlert} onOpenChange={(open) => { if (!open) setActionAlert(null); }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Siren className="h-5 w-5 text-red-600" />
                  <span>{actionType === 'RESOLVE' ? 'Resolve SOS Alert' : 'Acknowledge & Respond to SOS'}</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Citizen: <strong className="text-slate-900 dark:text-slate-100">{actionAlert?.SeniorCitizen?.fullName}</strong> · {actionAlert?.SeniorCitizen?.mobileNumber}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <Label htmlFor="actionNotes" className="text-xs font-semibold">
                  {actionType === 'RESOLVE' ? 'Resolution Notes & Outcome' : 'Response Notes & Officer Dispatch'}
                </Label>
                <Textarea
                  id="actionNotes"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={actionType === 'RESOLVE' ? 'e.g. Beat officer visited citizen on site. Condition verified safe.' : 'e.g. Dispatched Beat Officer Rajesh to citizen address.'}
                  className="text-xs min-h-[90px]"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setActionAlert(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className={cn(
                    'text-xs font-semibold text-white',
                    actionType === 'RESOLVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                  )}
                  disabled={actionLoading}
                  onClick={handleExecuteAction}
                >
                  {actionLoading ? 'Updating...' : actionType === 'RESOLVE' ? 'Confirm Resolution' : 'Confirm Dispatch'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
