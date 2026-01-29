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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        setFilters(prev => ({ ...prev, ...newFilters }));
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

    return (
        <ProtectedRoute permissionCode="citizens.approve">
            <DashboardLayout
                title="Registration Approvals"
                description="Review and approve senior citizen registration applications"
                currentPath="/approvals"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <FileCheck className="h-8 w-8" />
                            Registration Approvals
                        </h1>
                        <p className="text-muted-foreground">Inbox for senior citizen registration applications</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <RegistrationFilter onFilterChange={handleFilterChange} />

                {/* Tabs */}
                <Tabs value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))} className="mb-6">
                    <TabsList>
                        <TabsTrigger value="pending">Pending Review</TabsTrigger>
                        <TabsTrigger value="approved">Approved</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Table */}
                <Card>
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
                                    <TableHead>Application ID</TableHead>
                                    <TableHead>Applicant Name</TableHead>
                                    <TableHead>Mobile Number</TableHead>
                                    <TableHead>District</TableHead>
                                    <TableHead>Submitted On</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registrations.map((registration: Registration, index: number) => (
                                    <TableRow key={registration.id || `reg-${index}`}>
                                        <TableCell className="font-mono text-sm">{registration.id?.substring(0, 8) || 'N/A'}...</TableCell>
                                        <TableCell className="font-medium">{registration.fullName || 'N/A'}</TableCell>
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
                                ))}
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

