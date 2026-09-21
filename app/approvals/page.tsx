'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApiQuery } from '@/hooks/use-api-query';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
    FileCheck,
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    CreditCard,
    User,
    Phone,
    MapPin,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';
import { format } from 'date-fns';
import { RegistrationFilter } from './components/registration-filter';

interface Registration {
    id: string;
    mobileNumber: string;
    fullName: string;
    status: string;
    registrationStep: string;
    createdAt: string;
    updatedAt: string;
    citizen?: {
        id: string;
        fullName: string;
        age: number;
        gender: string;
        permanentAddress: string;
        policeStation?: { name: string };
        District?: { name: string };
        beat?: { name: string };
        vulnerabilityLevel: string;
        idVerificationStatus: string;
        digitalCardIssued: boolean;
    };
}

export default function ApprovalsPage() {
    const router = useRouter();
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        status: 'pending',
        districtId: undefined,
        vulnerabilityLevel: undefined,
        search: ''
    });

    const fetchRegistrations = useCallback(() => {
        const params: any = { ...filters };
        if (filters.status === 'pending') params.status = 'PENDING_REVIEW';
        if (filters.status === 'approved') params.status = 'APPROVED';
        if (filters.status === 'rejected') params.status = 'REJECTED';
        if (filters.status === 'all') delete params.status;

        return apiClient.get('/citizen-portal/registrations', { params });
    }, [filters]);

    // Separate fetch for stats - always get all registrations for accurate counts
    const fetchStats = useCallback(() => {
        return apiClient.get('/citizen-portal/registrations', { params: {} });
    }, []);

    const { data: responseData, loading, refetch } = useApiQuery(fetchRegistrations, { refetchOnMount: true });
    const { data: statsData } = useApiQuery(fetchStats, { refetchOnMount: true });

    const handleFilterChange = (newFilters: any) => {
        setFilters(prev => ({
            ...prev,
            districtId: undefined,
            vulnerabilityLevel: undefined,
            search: '',
            ...newFilters
        }));
    };

    const { registrations, stats } = useMemo(() => {
        let data: Registration[] = [];
        const rawData = responseData as any;

        if (rawData) {
            // Check success pattern first
            const mainData = rawData.data || rawData;

            if (Array.isArray(mainData)) {
                data = mainData;
            } else if (mainData.items && Array.isArray(mainData.items)) {
                data = mainData.items;
            } else if (mainData.registrations && Array.isArray(mainData.registrations)) {
                data = mainData.registrations;
            } else if (mainData.data && Array.isArray(mainData.data)) {
                data = mainData.data;
            } else if (mainData.id) {
                // Single object that looks like a registration
                data = [mainData];
            }
        }

        // Calculate stats from ALL registrations (not filtered)
        let allRegistrations: Registration[] = [];
        const rawStatsData = statsData as any;

        if (rawStatsData) {
            const mainStatsData = rawStatsData.data || rawStatsData;

            if (Array.isArray(mainStatsData)) {
                allRegistrations = mainStatsData;
            } else if (mainStatsData.items && Array.isArray(mainStatsData.items)) {
                allRegistrations = mainStatsData.items;
            } else if (mainStatsData.registrations && Array.isArray(mainStatsData.registrations)) {
                allRegistrations = mainStatsData.registrations;
            } else if (mainStatsData.data && Array.isArray(mainStatsData.data)) {
                allRegistrations = mainStatsData.data;
            }
        }

        const total = allRegistrations.length || rawData?.data?.pagination?.total || data.length;

        return {
            registrations: data,
            stats: {
                total,
                pending: allRegistrations.filter((r: Registration) => r.status === 'PENDING_REVIEW').length,
                approved: allRegistrations.filter((r: Registration) => r.status === 'APPROVED').length,
                rejected: allRegistrations.filter((r: Registration) => r.status === 'REJECTED').length,
            }
        };
    }, [responseData, statsData]);

    const kpiItems = [
        {
            id: 'total',
            title: 'Total Applications',
            value: stats.total.toLocaleString(),
            subtext: 'All submissions',
            icon: FileCheck,
            borderClass: 'border-l-blue-500 hover:border-blue-600',
            cardBg: 'bg-gradient-to-br from-blue-50/60 via-white to-slate-50/40 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-950',
            activeCardBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25',
            iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
            countBadge: 'bg-blue-50/90 text-blue-700 border border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
            active: filters.status === 'all',
            onClick: () => {
                setFilters(prev => ({ ...prev, status: 'all' }));
            },
        },
        {
            id: 'pending',
            title: 'Pending Review',
            value: stats.pending.toLocaleString(),
            subtext: 'Awaiting action',
            icon: Clock,
            borderClass: 'border-l-amber-500 hover:border-amber-600',
            cardBg: 'bg-gradient-to-br from-amber-50/60 via-white to-slate-50/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-950',
            activeCardBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25',
            iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
            countBadge: 'bg-amber-50/90 text-amber-700 border border-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
            active: filters.status === 'pending',
            onClick: () => {
                setFilters(prev => ({ ...prev, status: prev.status === 'pending' ? 'all' : 'pending' }));
            },
        },
        {
            id: 'approved',
            title: 'Approved',
            value: stats.approved.toLocaleString(),
            subtext: 'Approved records',
            icon: CheckCircle2,
            borderClass: 'border-l-emerald-500 hover:border-emerald-600',
            cardBg: 'bg-gradient-to-br from-emerald-50/60 via-white to-slate-50/40 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-950',
            activeCardBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25',
            iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
            countBadge: 'bg-emerald-50/90 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
            active: filters.status === 'approved',
            onClick: () => {
                setFilters(prev => ({ ...prev, status: prev.status === 'approved' ? 'all' : 'approved' }));
            },
        },
        {
            id: 'rejected',
            title: 'Rejected',
            value: stats.rejected.toLocaleString(),
            subtext: 'Rejected records',
            icon: XCircle,
            borderClass: 'border-l-rose-500 hover:border-rose-600',
            cardBg: 'bg-gradient-to-br from-rose-50/60 via-white to-slate-50/40 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-950',
            activeCardBg: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/25',
            iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
            countBadge: 'bg-rose-50/90 text-rose-700 border border-rose-200/70 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
            active: filters.status === 'rejected',
            onClick: () => {
                setFilters(prev => ({ ...prev, status: prev.status === 'rejected' ? 'all' : 'rejected' }));
            },
        },
    ];

    return (
        <ProtectedRoute permissionCode="citizens.approve">
            <DashboardLayout
                title="Registration Approvals"
                description="Review and approve senior citizen registration applications"
                currentPath="/approvals"
            >
                {/* Stats Cards */}
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

                {/* Filters */}
                <RegistrationFilter onFilterChange={handleFilterChange} />

                {/* Table */}
                <Card>
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    {filters.status === 'pending' || filters.status === 'PENDING_REVIEW'
                                        ? 'New Applications Awaiting Review'
                                        : filters.status === 'approved'
                                            ? 'Approved Registrations'
                                            : filters.status === 'rejected'
                                                ? 'Rejected Applications'
                                                : 'All Applications'}
                                </CardTitle>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {filters.status === 'pending' || filters.status === 'PENDING_REVIEW'
                                        ? 'Only new submissions awaiting physical verification are displayed here. Verified records are moved to Approved.'
                                        : filters.status === 'approved'
                                            ? 'Citizens whose physical verification visit and assessment have been completed and approved.'
                                            : filters.status === 'rejected'
                                                ? 'Registrations rejected during review or verification.'
                                                : 'Complete list of senior citizen registration applications.'}
                                </p>
                            </div>
                            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1">
                                {registrations.length} {registrations.length === 1 ? 'Record' : 'Records'}
                            </Badge>
                        </div>
                    </CardHeader>
                    {loading ? (
                        <CardContent className="text-center py-12">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">Loading applications...</p>
                        </CardContent>
                    ) : registrations.length === 0 ? (
                        <CardContent className="text-center py-12">
                            <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No applications found matching filters</p>
                        </CardContent>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Applicant Name</TableHead>
                                    <TableHead>Age</TableHead>
                                    <TableHead>Mobile Number</TableHead>
                                    <TableHead>District</TableHead>
                                    <TableHead>Submitted On</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registrations.map((registration: Registration, index: number) => {
                                    const age = registration.citizen?.age ?? (registration as any)?.age;
                                    return (
                                        <TableRow key={registration.id || `reg-${index}`}>
                                            <TableCell className="font-medium">{registration.fullName || 'N/A'}</TableCell>
                                            <TableCell>{age ? `${age} yrs` : 'N/A'}</TableCell>
                                            <TableCell>{registration.mobileNumber}</TableCell>
                                            <TableCell>{(registration.citizen as any)?.District?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                {(() => {
                                                    if (!registration.createdAt) return 'N/A';
                                                    const date = new Date(registration.createdAt);
                                                    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'dd MMM yyyy, hh:mm a');
                                                })()}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(registration.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => router.push(`/approvals/${registration.id}`)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Review
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </Card>
            </DashboardLayout >
        </ProtectedRoute >
    );
}

// Helper function to render status badges
function getStatusBadge(status: string) {
    const statusMap: Record<string, { label: string; className: string }> = {
        'PENDING_REVIEW': { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' },
        'APPROVED': { label: 'Approved', className: 'bg-green-100 text-green-800' },
        'REJECTED': { label: 'Rejected', className: 'bg-red-100 text-red-800' },
        'IN_PROGRESS': { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
        <Badge className={config.className}>
            {config.label}
        </Badge>
    );
}

