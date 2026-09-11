'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { usePaginatedQuery } from '@/hooks/use-api-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { isShoOrInspectorUser, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExportButton } from '@/components/ui/export-button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Users,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Search,
  X
} from 'lucide-react';

interface Citizen {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  mobileNumber: string;
  permanentAddress: string;
  vulnerabilityLevel: string;
  idVerificationStatus: string;
  createdAt: string;
}

interface CitizenStats {
  total: number;
  verification: {
    verified: number;
    pending: number;
    rejected: number;
  };
  vulnerability: {
    high: number;
    medium: number;
    low: number;
  };
  digitalCards: number;
}

export default function CitizensPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isShoOrInspector = isShoOrInspectorUser(user);
  const [search, setSearch] = useState('');
  const [vulnerabilityFilter, setVulnerabilityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // KPI Statistics state
  const [stats, setStats] = useState<CitizenStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await apiClient.getCitizenStatistics();
        if (isMounted && res?.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch citizen statistics:', err);
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Use the usePaginatedQuery hook with useCallback
  const queryFn = useCallback((page: number, limit: number) => apiClient.getCitizens({
    page,
    limit,
    search: search || undefined,
    vulnerabilityLevel: vulnerabilityFilter || undefined,
    verificationStatus: statusFilter || undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
  }), [search, vulnerabilityFilter, statusFilter, sortBy, sortOrder]);

  const {
    data: citizens,
    loading,
    error,
    pagination,
    page,
    setPage
  } = usePaginatedQuery<Citizen>(
    queryFn,
    1,
    20
  );

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'createdAt' || field === 'age' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground/50 inline-block align-middle" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary inline-block align-middle font-bold" />
    ) : (
      <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary inline-block align-middle font-bold" />
    );
  };

  const getVulnerabilityColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Verified':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderKpiCards = () => {
    const total = stats?.total ?? 0;
    const verified = stats?.verification?.verified ?? 0;
    const pending = stats?.verification?.pending ?? 0;
    const highRisk = stats?.vulnerability?.high ?? 0;

    const kpiItems = [
      {
        id: 'total',
        title: 'Total Citizens',
        value: total.toLocaleString(),
        subtext: 'Registered database',
        icon: Users,
        borderClass: 'border-l-blue-500 hover:border-blue-600',
        cardBg: 'bg-gradient-to-br from-blue-50/60 via-white to-slate-50/40 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-950',
        activeCardBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25',
        iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        countBadge: 'bg-blue-50/90 text-blue-700 border border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
        active: !vulnerabilityFilter && !statusFilter && !search,
        onClick: () => {
          setSearch('');
          setVulnerabilityFilter('');
          setStatusFilter('');
          setPage(1);
        },
      },
      {
        id: 'verified',
        title: 'Verified',
        value: verified.toLocaleString(),
        subtext: total > 0 ? `${Math.round((verified / total) * 100)}% verified` : '0% verified',
        icon: ShieldCheck,
        borderClass: 'border-l-emerald-500 hover:border-emerald-600',
        cardBg: 'bg-gradient-to-br from-emerald-50/60 via-white to-slate-50/40 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-950',
        activeCardBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25',
        iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
        countBadge: 'bg-emerald-50/90 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
        active: statusFilter === 'Verified',
        onClick: () => {
          setStatusFilter(prev => (prev === 'Verified' ? '' : 'Verified'));
          setPage(1);
        },
      },
      {
        id: 'pending',
        title: 'Pending',
        value: pending.toLocaleString(),
        subtext: 'Awaiting action',
        icon: Clock,
        borderClass: 'border-l-amber-500 hover:border-amber-600',
        cardBg: 'bg-gradient-to-br from-amber-50/60 via-white to-slate-50/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-950',
        activeCardBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25',
        iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
        countBadge: 'bg-amber-50/90 text-amber-700 border border-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        active: statusFilter === 'Pending',
        onClick: () => {
          setStatusFilter(prev => (prev === 'Pending' ? '' : 'Pending'));
          setPage(1);
        },
      },
      {
        id: 'high-risk',
        title: 'High Risk',
        value: highRisk.toLocaleString(),
        subtext: 'High vulnerability',
        icon: AlertTriangle,
        borderClass: 'border-l-rose-500 hover:border-rose-600',
        cardBg: 'bg-gradient-to-br from-rose-50/60 via-white to-slate-50/40 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-950',
        activeCardBg: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/25',
        iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
        countBadge: 'bg-rose-50/90 text-rose-700 border border-rose-200/70 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
        active: vulnerabilityFilter === 'High',
        onClick: () => {
          setVulnerabilityFilter(prev => (prev === 'High' ? '' : 'High'));
          setPage(1);
        },
      },
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
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
                    {statsLoading ? (
                      <span className={cn('inline-block h-6 w-10 animate-pulse rounded-md', item.active ? 'bg-white/30' : 'bg-slate-200/80')} />
                    ) : (
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
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading citizens...</p>
        </div>
      );
    }

    if (citizens.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No citizens found</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleSort('fullName')}
              >
                Name {renderSortIcon('fullName')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleSort('age')}
              >
                Age/Gender {renderSortIcon('age')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleSort('mobileNumber')}
              >
                Contact {renderSortIcon('mobileNumber')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleSort('permanentAddress')}
              >
                Address {renderSortIcon('permanentAddress')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleSort('vulnerabilityLevel')}
              >
                Vulnerability {renderSortIcon('vulnerabilityLevel')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleSort('idVerificationStatus')}
              >
                Status {renderSortIcon('idVerificationStatus')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {citizens.map((citizen: Citizen) => (
              <TableRow key={citizen.id} className="text-sm">
                <TableCell className="font-medium">{citizen.fullName}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{citizen.age} yrs</span>
                    <span className="text-muted-foreground">{citizen.gender}</span>
                  </div>
                </TableCell>
                <TableCell>{citizen.mobileNumber}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">{citizen.permanentAddress}</div>
                </TableCell>
                <TableCell>
                  <Badge className={getVulnerabilityColor(citizen.vulnerabilityLevel)}>
                    {citizen.vulnerabilityLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(citizen.idVerificationStatus)}>
                    {citizen.idVerificationStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/citizens/${citizen.id}`)}>
                    View
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => router.push(`/citizens/${citizen.id}/edit`)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-muted-foreground">
          Page {page} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <Button variant="outline" disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute permissionCode="citizens.read">
      <DashboardLayout title="Senior Citizens" description="Manage registrations, statuses, and records" currentPath="/citizens">
        <div className="flex justify-end items-center mb-4 gap-2">
          <ExportButton
            type="citizens"
            filters={{
              search,
              vulnerabilityLevel: vulnerabilityFilter,
              status: statusFilter
            }}
          />
          {!isShoOrInspector && (
            <Button variant="outline" onClick={() => router.push('/citizens/map')}>
              Map View
            </Button>
          )}
          <Button onClick={() => router.push('/citizens/register')}>+ Register Citizen</Button>
        </div>

        {renderKpiCards()}

        <Card className="mb-5 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="filters" className="border-none">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <span>Filters & Search</span>
                  {Boolean(search || vulnerabilityFilter || statusFilter) && (
                    <span className="ml-2 px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-1 pb-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, phone, Aadhaar..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="pl-9 h-9"
                    />
                  </div>

                  <Select
                    value={vulnerabilityFilter || 'all'}
                    onValueChange={(value) => {
                      setVulnerabilityFilter(value === 'all' ? '' : value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Vulnerability Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) => {
                      setStatusFilter(value === 'all' ? '' : value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Verification Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Verified">Verified (Approved)</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => {
                      setSearch('');
                      setVulnerabilityFilter('');
                      setStatusFilter('');
                      setPage(1);
                    }}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear Filters
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {renderTable()}
        {renderPagination()}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

