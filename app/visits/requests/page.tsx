'use client';

import { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type VisitRequestStatus = 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled';

interface VisitRequest {
    id: string;
    preferredDate?: string;
    preferredTimeSlot?: string;
    visitType?: string;
    status: VisitRequestStatus;
    notes?: string;
    createdAt: string;
    seniorCitizen?: {
        id: string;
        fullName: string;
        mobileNumber: string;
        vulnerabilityLevel?: string;
        policeStationName?: string;
        beatName?: string;
    };
    registration?: {
        id: string;
        fullName?: string;
        mobileNumber: string;
        status: string;
    };
}

interface OfficerOption {
    id: string;
    name: string;
    rank?: string;
}

const statusColors: Record<VisitRequestStatus, string> = {
    Pending: 'bg-amber-100 text-amber-800',
    Scheduled: 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-gray-100 text-gray-800'
};

export default function VisitRequestQueuePage() {

    const [statusFilter, setStatusFilter] = useState<string>('Pending');
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [scheduleRequest, setScheduleRequest] = useState<VisitRequest | null>(null);
    const [scheduleForm, setScheduleForm] = useState({
        officerId: '',
        scheduledDate: '',
        visitType: 'Routine',
        notes: ''
    });
    const fetchOfficers = useCallback(async () => {
        const response = await apiClient.get('/officers', { params: { limit: 100 } }) as any;
        if (response.success) {
            return { data: response.data.officers || response.data.data || [] };
        }
        return { data: [] };
    }, []);

    const fetchRequests = useCallback(async () => {
        const response = await apiClient.getVisitRequests({
            status: statusFilter === 'all' ? undefined : statusFilter
        });
        if (response.success) {
            return { data: response.data.visitRequests };
        }
        return { data: [] };
    }, [statusFilter]);

    const { data: officersData } = useApiQuery<{ data: OfficerOption[] }>(fetchOfficers, { refetchOnMount: true });
    const { data: requestsData, loading, refetch: refetchRequests } = useApiQuery<{ data: VisitRequest[] }>(fetchRequests, { refetchOnMount: true });

    const officers = officersData?.data || [];
    const requests = requestsData?.data || [];

    const updateStatus = async (id: string, status: VisitRequestStatus) => {
        try {
            setUpdatingId(id);
            await apiClient.updateVisitRequest(id, status);
            refetchRequests();
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to update visit request');
        } finally {
            setUpdatingId(null);
        }
    };

    const openScheduleDialog = (request: VisitRequest) => {
        if (!request.seniorCitizen) {
            setError('Citizen record must exist before scheduling.');
            return;
        }
        setScheduleRequest(request);
        setScheduleForm({
            officerId: '',
            scheduledDate: request.preferredDate ? new Date(request.preferredDate).toISOString().slice(0, 16) : '',
            visitType: request.visitType || 'Routine',
            notes: request.notes || ''
        });
        setError('');
    };

    const scheduleVisit = async () => {
        if (!scheduleRequest?.seniorCitizen?.id) {
            setError('Citizen record missing for scheduling.');
            return;
        }
        if (!scheduleForm.officerId || !scheduleForm.scheduledDate) {
            setError('Officer and visit date/time are required.');
            return;
        }
        try {
            setUpdatingId(scheduleRequest.id);
            await apiClient.createVisit({
                seniorCitizenId: scheduleRequest.seniorCitizen.id,
                officerId: scheduleForm.officerId,
                scheduledDate: new Date(scheduleForm.scheduledDate).toISOString(),
                visitType: scheduleForm.visitType,
                notes: scheduleForm.notes
            });
            await apiClient.updateVisitRequest(scheduleRequest.id, 'Scheduled');
            setScheduleRequest(null);
            refetchRequests();
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to schedule visit');
        } finally {
            setUpdatingId(null);
        }
    };

    const renderTable = () => {
        if (loading) return <p className="text-muted-foreground">Loading visit requests…</p>;
        if (!requests.length) return <p className="text-muted-foreground">No visit requests found.</p>;

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Citizen</TableHead>
                        <TableHead>Preferred Slot</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map((request) => (
                        <TableRow key={request.id}>
                            <TableCell>
                                {request.seniorCitizen ? (
                                    <>
                                        <div className="font-medium">{request.seniorCitizen.fullName}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {request.seniorCitizen.mobileNumber} · {request.seniorCitizen.policeStationName || '—'}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="font-medium">{request.registration?.fullName || 'Registration pending'}</div>
                                        <div className="text-xs text-muted-foreground">{request.registration?.mobileNumber}</div>
                                    </>
                                )}
                            </TableCell>
                            <TableCell>
                                <div>{request.preferredTimeSlot || 'Any time'}</div>
                                <div className="text-xs text-muted-foreground">
                                    {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'Date TBD'}
                                </div>
                            </TableCell>
                            <TableCell>{request.visitType || 'Routine'}</TableCell>
                            <TableCell>
                                <Badge className={statusColors[request.status]}>{request.status}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                                {new Date(request.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                {request.status !== 'Scheduled' && request.status !== 'Completed' && (
                                    <Button
                                        size="sm"
                                        onClick={() => updateStatus(request.id, 'Scheduled')}
                                        disabled={updatingId === request.id}
                                    >
                                        Mark Scheduled
                                    </Button>
                                )}
                                {request.status === 'Scheduled' && (
                                    <Button
                                        size="sm"
                                        onClick={() => updateStatus(request.id, 'Completed')}
                                        disabled={updatingId === request.id}
                                    >
                                        Complete
                                    </Button>
                                )}
                                {request.status === 'Pending' && request.seniorCitizen && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => openScheduleDialog(request)}
                                        disabled={updatingId === request.id}
                                    >
                                        Schedule Visit
                                    </Button>
                                )}
                                {request.status !== 'Cancelled' && request.status !== 'Completed' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateStatus(request.id, 'Cancelled')}
                                        disabled={updatingId === request.id}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <ProtectedRoute permissionCode="visits.read">
            <DashboardLayout
                title="Visit Request Queue"
                description="Review and act on visit requests submitted by citizens"
                currentPath="/visits/requests"
            >
                <Card>
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle>Visit Requests</CardTitle>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Scheduled">Scheduled</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>{error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : renderTable()}</CardContent>
                </Card>

                <Dialog open={!!scheduleRequest} onOpenChange={(open) => !open && setScheduleRequest(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Schedule Visit</DialogTitle>
                            <DialogDescription>
                                Assign an officer and confirm date/time to create a visit for {scheduleRequest?.seniorCitizen?.fullName}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Officer</label>
                                <Select
                                    value={scheduleForm.officerId}
                                    onValueChange={(value) => setScheduleForm((prev) => ({ ...prev, officerId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select officer" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {officers.map((officer) => (
                                            <SelectItem key={officer.id} value={officer.id}>
                                                {officer.name} {officer.rank ? `· ${officer.rank}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Visit Date & Time</label>
                                <Input
                                    type="datetime-local"
                                    value={scheduleForm.scheduledDate}
                                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Visit Type</label>
                                <Select
                                    value={scheduleForm.visitType}
                                    onValueChange={(value) => setScheduleForm((prev) => ({ ...prev, visitType: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Routine">Routine</SelectItem>
                                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                                        <SelectItem value="Emergency">Emergency</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea
                                    value={scheduleForm.notes}
                                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Additional instructions for the officer"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setScheduleRequest(null)}>
                                Cancel
                            </Button>
                            <Button onClick={scheduleVisit} disabled={updatingId === scheduleRequest?.id}>
                                {updatingId === scheduleRequest?.id ? 'Scheduling…' : 'Create Visit'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
