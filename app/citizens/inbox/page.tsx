'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Eye, CheckCircle2, Clock3, AlertTriangle, LucideIcon } from 'lucide-react';

type RegistrationStatus = 'IN_PROGRESS' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

interface Registration {
    id: string;
    mobileNumber: string;
    fullName?: string;
    status: RegistrationStatus;
    registrationStep?: string;
    createdAt: string;
    updatedAt?: string;
    otpVerified?: boolean;
    draftData?: Record<string, any> | null;
    citizen?: CitizenDetail;
    visitRequests?: Array<{
        id: string;
        status: string;
        preferredDate?: string;
        visitType?: string;
    }>;
}

interface TimelineEntry {
    key: string;
    title: string;
    description?: string;
    status: 'completed' | 'pending' | 'blocked';
    timestamp?: string;
    metadata?: Record<string, any>;
}

interface VerificationSummary {
    citizenId?: string | null;
    requestId?: string | null;
    requestStatus?: string | null;
    requestCreatedAt?: string | null;
    preferredDate?: string | null;
    visitId?: string | null;
    visitStatus?: string | null;
    scheduledDate?: string | null;
    completedDate?: string | null;
    assignedOfficer?: {
        id: string;
        name: string;
        rank?: string | null;
        badgeNumber?: string | null;
    } | null;
    notes?: string | null;
    allowApproval?: boolean;
    blockingReason?: string | null;
}

interface CitizenDetail {
    id: string;
    fullName: string;
    mobileNumber?: string;
    permanentAddress?: string;
    presentAddress?: string;
    vulnerabilityLevel?: string;
    idVerificationStatus?: string;
    policeStationName?: string;
    beatName?: string;
    preferredVisitDay?: string;
    preferredVisitTime?: string;
    lastVisitDate?: string | null;
    nextScheduledVisitDate?: string | null;
    familyMembers?: Array<{ id: string; name: string; relation: string; mobileNumber?: string }>;
    emergencyContacts?: Array<{ id: string; name: string; relation: string; mobileNumber: string; isPrimary?: boolean }>;
    householdHelp?: Array<{ id: string; name: string; category: string; mobileNumber?: string; verificationStatus?: string }>;
    documents?: Array<{ id: string; type?: string; number?: string; createdAt?: string }>;
    visits?: Array<{
        id: string;
        scheduledDate: string;
        status: string;
        visitType: string;
        officer?: { id: string; name: string; rank?: string | null };
    }>;
    visitRequests?: Array<{ id: string; status: string; preferredDate?: string; visitType?: string }>;
    serviceRequests?: Array<{ id: string; serviceType: string; status: string; createdAt: string }>;
    sosAlerts?: Array<{ id: string; status: string; createdAt: string }>;
}

interface RegistrationDetailPayload {
    registration: Registration & {
        citizen?: CitizenDetail;
        visitRequests?: Registration['visitRequests'];
        draftData?: Record<string, any> | null;
    };
    timeline: TimelineEntry[];
    verificationSummary: VerificationSummary;
    reviewGuard: {
        allowApproval: boolean;
        blockingReason?: string | null;
    };
}

const statusLabels: Record<RegistrationStatus, { label: string; color: string }> = {
    IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-100 text-amber-800' },
    PENDING_REVIEW: { label: 'Pending Review', color: 'bg-blue-100 text-blue-800' },
    APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800' },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
};

const statusList: RegistrationStatus[] = ['IN_PROGRESS', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'];

export default function CitizenRegistrationInboxPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [statusCounts, setStatusCounts] = useState<Record<RegistrationStatus, number>>({
        IN_PROGRESS: 0,
        PENDING_REVIEW: 0,
        APPROVED: 0,
        REJECTED: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [actionRegistration, setActionRegistration] = useState<Registration | null>(null);
    const [actionStatus, setActionStatus] = useState<RegistrationStatus>('APPROVED');
    const [remarks, setRemarks] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [detailRegistration, setDetailRegistration] = useState<Registration | null>(null);
    const [detailData, setDetailData] = useState<RegistrationDetailPayload | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');

    const loadRegistrations = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiClient.getCitizenRegistrations({
                status: statusFilter === 'all' ? undefined : statusFilter
            });
            if (response.success) {
                const fetched: Registration[] = response.data.registrations;
                setRegistrations(fetched);
                const summary = fetched.reduce<Record<RegistrationStatus, number>>((acc, item) => {
                    acc[item.status] = (acc[item.status] ?? 0) + 1;
                    return acc;
                }, {
                    IN_PROGRESS: 0,
                    PENDING_REVIEW: 0,
                    APPROVED: 0,
                    REJECTED: 0
                });
                setStatusCounts(summary);
            }
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to load registrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRegistrations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const filteredRegistrations = useMemo(() => {
        if (!searchTerm.trim()) return registrations;
        const term = searchTerm.toLowerCase();
        return registrations.filter((item) => {
            const candidate = [
                item.fullName,
                item.mobileNumber,
                item.citizen?.fullName,
                item.citizen?.policeStationName,
                item.citizen?.beatName
            ].filter(Boolean).join(' ').toLowerCase();
            return candidate.includes(term);
        });
    }, [registrations, searchTerm]);

    const openActionDialog = (registration: Registration, status: RegistrationStatus, presetRemarks = '') => {
        setActionRegistration(registration);
        setActionStatus(status);
        setRemarks(presetRemarks);
    };

    const submitAction = async () => {
        if (!actionRegistration) return;
        try {
            setActionLoading(true);
            await apiClient.updateCitizenRegistrationStatus(actionRegistration.id, {
                status: actionStatus,
                remarks: remarks || undefined
            });
            setActionRegistration(null);
            await loadRegistrations();
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to update registration');
        } finally {
            setActionLoading(false);
        }
    };

    const handleViewDetails = async (registrationRow: Registration) => {
        try {
            setDetailRegistration(registrationRow);
            setDetailData(null);
            setDetailLoading(true);
            setDetailError('');
            const response = await apiClient.getCitizenRegistrationDetails(registrationRow.id);
            if (response.success) {
                setDetailData(response.data as RegistrationDetailPayload);
                setDetailRegistration(response.data.registration);
            }
        } catch (err: any) {
            setDetailError(err?.response?.data?.message || 'Unable to load registration details');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetails = () => {
        setDetailRegistration(null);
        setDetailData(null);
        setDetailError('');
        setDetailLoading(false);
    };

    const timelineStyles: Record<'completed' | 'pending' | 'blocked', { icon: LucideIcon; color: string }> = {
        completed: { icon: CheckCircle2, color: 'text-emerald-600' },
        pending: { icon: Clock3, color: 'text-blue-600' },
        blocked: { icon: AlertTriangle, color: 'text-red-600' }
    };

    const formatDateTime = (value?: string | Date | null) => {
        if (!value) return '—';
        const date = value instanceof Date ? value : new Date(value);
        return isNaN(date.getTime()) ? '—' : date.toLocaleString();
    };

    const formatDate = (value?: string | Date | null) => {
        if (!value) return '—';
        const date = value instanceof Date ? value : new Date(value);
        return isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
    };

    const activeRegistration = detailData?.registration ?? detailRegistration ?? null;
    const detailCitizen = detailData?.registration?.citizen ?? detailRegistration?.citizen ?? null;
    const timelineEntries = detailData?.timeline ?? [];
    const verificationSummary = detailData?.verificationSummary;
    const reviewGuard = detailData?.reviewGuard;
    const visitRequests = detailData?.registration?.visitRequests ?? detailRegistration?.visitRequests ?? [];
    const primitiveDraftEntries = activeRegistration?.draftData
        ? Object.entries(activeRegistration.draftData)
            .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
            .slice(0, 8)
        : [];

    const renderTable = () => {
        if (loading) {
            return <p className="text-muted-foreground">Loading registrations…</p>;
        }

        if (filteredRegistrations.length === 0) {
            return <p className="text-muted-foreground">No registrations found.</p>;
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Citizen Record</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRegistrations.map((registration) => (
                        <TableRow key={registration.id}>
                            <TableCell>
                                <div className="font-medium">{registration.fullName || '—'}</div>
                                <div className="text-xs text-muted-foreground">
                                    Created {new Date(registration.createdAt).toLocaleString()}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>{registration.mobileNumber}</div>
                                <div className="text-xs text-muted-foreground">Step: {registration.registrationStep || '—'}</div>
                            </TableCell>
                            <TableCell>
                                <Badge className={statusLabels[registration.status].color}>
                                    {statusLabels[registration.status].label}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {registration.citizen ? (
                                    <div className="text-sm">
                                        <div className="font-medium">{registration.citizen.fullName}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {registration.citizen.policeStationName || 'Station N/A'} ·{' '}
                                            {registration.citizen.idVerificationStatus || 'Pending'}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Not created</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                {registration.status !== 'APPROVED' && (
                                    <Button size="sm" onClick={() => openActionDialog(registration, 'APPROVED')}>
                                        Approve
                                    </Button>
                                )}
                                {registration.status !== 'REJECTED' && (
                                    <Button size="sm" variant="outline" onClick={() => openActionDialog(registration, 'REJECTED')}>
                                        Reject
                                    </Button>
                                )}
                                <Button size="sm" variant="ghost" onClick={() => handleViewDetails(registration)}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <ProtectedRoute permissionCode="citizens.approve">
            <DashboardLayout
                title="Citizen Registration Inbox"
                description="Review new submissions from the citizen portal"
                currentPath="/citizens/inbox"
            >
                <Card className="mb-6">
                    <CardHeader className="space-y-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle>Registrations</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Track citizen portal submissions, status, and verification workflow.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Input
                                    placeholder="Search name, mobile, station…"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-64"
                                />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="PENDING_REVIEW">Pending review</SelectItem>
                                        <SelectItem value="APPROVED">Approved</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`rounded-lg border p-3 text-left transition ${statusFilter === 'all' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/60'
                                    }`}
                            >
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">All</div>
                                <div className="text-2xl font-semibold">{registrations.length}</div>
                            </button>
                            {statusList.map((status) => {
                                const isActive = statusFilter === status;
                                return (
                                    <button
                                        type="button"
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`rounded-lg border p-3 text-left transition ${isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/60'
                                            }`}
                                    >
                                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                            {statusLabels[status].label}
                                        </div>
                                        <div className="text-2xl font-semibold">{statusCounts[status] ?? 0}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error ? (
                            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
                        ) : (
                            renderTable()
                        )}
                    </CardContent>
                </Card>
                <Dialog open={!!detailRegistration} onOpenChange={(open) => !open && handleCloseDetails()}>
                    <DialogContent className="max-w-5xl">
                        <DialogHeader>
                            <DialogTitle>Registration Details</DialogTitle>
                            <DialogDescription>
                                Review submitted information, drafts, and linked citizen record.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-y-auto space-y-4">
                            {detailLoading ? (
                                <p className="text-muted-foreground">Loading registration details…</p>
                            ) : detailError ? (
                                <Alert variant="destructive">
                                    <AlertDescription>{detailError}</AlertDescription>
                                </Alert>
                            ) : activeRegistration ? (
                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader className="space-y-2">
                                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                <CardTitle>{activeRegistration.fullName || 'Applicant overview'}</CardTitle>
                                                <Badge className={statusLabels[activeRegistration.status].color}>
                                                    {statusLabels[activeRegistration.status].label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Registration #{activeRegistration.id.slice(0, 8)} · Created {formatDateTime(activeRegistration.createdAt)}
                                            </p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-4 text-sm md:grid-cols-3">
                                                <div>
                                                    <p className="text-muted-foreground">Mobile</p>
                                                    <p className="font-medium">{activeRegistration.mobileNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">OTP</p>
                                                    <p className="font-medium">{activeRegistration.otpVerified ? 'Verified' : 'Pending'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Current step</p>
                                                    <p className="font-medium">{activeRegistration.registrationStep || '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Citizen record</p>
                                                    <p className="font-medium">
                                                        {activeRegistration.citizen ? activeRegistration.citizen.fullName : 'Not created'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Linked station</p>
                                                    <p className="font-medium">
                                                        {activeRegistration.citizen?.policeStationName || '—'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Last updated</p>
                                                    <p className="font-medium">{formatDateTime(activeRegistration.updatedAt)}</p>
                                                </div>
                                            </div>
                                            {reviewGuard && !reviewGuard.allowApproval && (
                                                <Alert variant="destructive" className="mt-4">
                                                    <AlertDescription>
                                                        {reviewGuard.blockingReason || 'Verification visit must be completed before approval.'}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                            <Separator className="my-4" />
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    onClick={() => openActionDialog(activeRegistration, 'APPROVED')}
                                                    disabled={reviewGuard ? !reviewGuard.allowApproval : false}
                                                >
                                                    Approve registration
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        openActionDialog(
                                                            activeRegistration,
                                                            'REJECTED',
                                                            'Please provide the requested documents and resubmit your application.'
                                                        )
                                                    }
                                                >
                                                    Request resubmission
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => openActionDialog(activeRegistration, 'REJECTED')}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Workflow timeline</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {timelineEntries.length ? (
                                                    <div className="space-y-4">
                                                        {timelineEntries.map((entry) => {
                                                            const style = timelineStyles[entry.status] || timelineStyles.pending;
                                                            const Icon = style.icon;
                                                            return (
                                                                <div key={entry.key} className="flex gap-3">
                                                                    <div className="mt-1 rounded-full border p-2">
                                                                        <Icon className={`h-4 w-4 ${style.color}`} />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center justify-between text-sm font-medium">
                                                                            <span>{entry.title}</span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {formatDateTime(entry.timestamp)}
                                                                            </span>
                                                                        </div>
                                                                        {entry.description && (
                                                                            <p className="text-sm text-muted-foreground">{entry.description}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">Timeline data unavailable.</p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Verification status & visits</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4 text-sm">
                                                {verificationSummary ? (
                                                    <>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="text-xs uppercase text-muted-foreground">Verification request</p>
                                                                <p className="font-medium">
                                                                    {verificationSummary.requestId ? `Request ${verificationSummary.requestId.slice(0, 7)}` : 'Auto-generated'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Raised {formatDate(verificationSummary.requestCreatedAt)}
                                                                </p>
                                                            </div>
                                                            <Badge className="bg-slate-100 text-slate-800">
                                                                {verificationSummary.requestStatus || 'Missing'}
                                                            </Badge>
                                                        </div>
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            <div>
                                                                <p className="text-xs uppercase text-muted-foreground">Preferred date</p>
                                                                <p className="font-medium">{formatDate(verificationSummary.preferredDate)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs uppercase text-muted-foreground">Visit status</p>
                                                                <p className="font-medium">
                                                                    {verificationSummary.visitStatus || 'Not scheduled'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs uppercase text-muted-foreground">Scheduled</p>
                                                                <p className="font-medium">{formatDate(verificationSummary.scheduledDate)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs uppercase text-muted-foreground">Completed</p>
                                                                <p className="font-medium">{formatDate(verificationSummary.completedDate)}</p>
                                                            </div>
                                                        </div>
                                                        {verificationSummary.assignedOfficer && (
                                                            <div className="rounded-lg border p-3">
                                                                <p className="text-xs uppercase text-muted-foreground">Assigned officer</p>
                                                                <p className="font-medium">
                                                                    {verificationSummary.assignedOfficer.name}{' '}
                                                                    {verificationSummary.assignedOfficer.rank
                                                                        ? `(${verificationSummary.assignedOfficer.rank})`
                                                                        : ''}
                                                                </p>
                                                                {verificationSummary.notes && (
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Notes: {verificationSummary.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        No verification visit has been scheduled yet.
                                                    </p>
                                                )}

                                                {visitRequests.length > 0 && (
                                                    <>
                                                        <Separator />
                                                        <p className="text-xs uppercase text-muted-foreground">Visit requests</p>
                                                        <div className="space-y-2">
                                                            {visitRequests.slice(0, 3).map((request) => (
                                                                <div key={request.id} className="rounded-lg border p-3">
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <div>
                                                                            <p className="font-medium">{request.visitType || 'Visit'}</p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Preferred {request.preferredDate ? formatDate(request.preferredDate) : 'TBD'}
                                                                            </p>
                                                                        </div>
                                                                        <Badge>{request.status}</Badge>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Applicant submission</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3 text-sm">
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <p className="text-muted-foreground">Step progress</p>
                                                        <p className="font-medium">{activeRegistration.registrationStep || 'Not started'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Portal status</p>
                                                        <p className="font-medium">{statusLabels[activeRegistration.status].label}</p>
                                                    </div>
                                                </div>
                                                {primitiveDraftEntries.length > 0 && (
                                                    <>
                                                        <Separator />
                                                        <p className="text-xs uppercase text-muted-foreground">Key submitted fields</p>
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            {primitiveDraftEntries.map(([key, value]) => (
                                                                <div key={key}>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                                                    </p>
                                                                    <p className="font-medium break-words">{String(value)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Citizen profile & risk</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3 text-sm">
                                                {detailCitizen ? (
                                                    <>
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            <div>
                                                                <p className="text-muted-foreground">Citizen</p>
                                                                <p className="font-medium">{detailCitizen.fullName}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">Station / Beat</p>
                                                                <p className="font-medium">
                                                                    {detailCitizen.policeStationName || '—'} · {detailCitizen.beatName || '—'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">Verification</p>
                                                                <p className="font-medium">{detailCitizen.idVerificationStatus || 'Pending'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">Vulnerability level</p>
                                                                <p className="font-medium">{detailCitizen.vulnerabilityLevel || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">Next scheduled visit</p>
                                                                <p className="font-medium">{formatDate(detailCitizen.nextScheduledVisitDate)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">Preferred slot</p>
                                                                <p className="font-medium">
                                                                    {detailCitizen.preferredVisitDay || '—'} · {detailCitizen.preferredVisitTime || '—'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {detailCitizen.emergencyContacts && detailCitizen.emergencyContacts.length > 0 && (
                                                            <>
                                                                <Separator />
                                                                <p className="text-xs uppercase text-muted-foreground">Emergency contacts</p>
                                                                <div className="space-y-2">
                                                                    {detailCitizen.emergencyContacts.slice(0, 2).map((contact) => (
                                                                        <div key={contact.id} className="rounded-lg border p-3">
                                                                            <p className="font-medium">{contact.name}</p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {contact.relation} · {contact.mobileNumber}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        Citizen profile will populate after submission is approved.
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Select a registration to inspect.</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseDetails}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>


                <Dialog open={!!actionRegistration} onOpenChange={(open) => !open && setActionRegistration(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{actionStatus === 'APPROVED' ? 'Approve' : 'Reject'} registration</DialogTitle>
                            <DialogDescription>
                                {actionStatus === 'APPROVED'
                                    ? 'Approve this registration and mark the citizen as verified.'
                                    : 'Reject this registration and notify the citizen.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">{actionRegistration?.fullName}</p>
                            <Textarea
                                placeholder="Remarks (optional)"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setActionRegistration(null)}>
                                Cancel
                            </Button>
                            <Button onClick={submitAction} disabled={actionLoading}>
                                {actionLoading ? 'Saving…' : 'Confirm'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
