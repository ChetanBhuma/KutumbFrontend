'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldCheck, UserCheck, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface AssignModalItem {
    type: 'VERIFICATION' | 'REVISIT';
    id: string; // verificationRequestId or visitRequestId
    citizenId: string;
    citizenName: string;
    mobileNumber?: string;
    policeStationId?: string;
    policeStationName?: string;
    defaultDate?: string;
    visitType?: string;
    notes?: string;
}

interface Officer {
    id: string;
    name: string;
    rank?: string;
    badgeNumber?: string;
    policeStationId?: string;
    beatId?: string;
    Beat?: { name: string; code?: string };
    _count?: { Visit: number };
}

interface SHOAssignmentModalProps {
    item: AssignModalItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function SHOAssignmentModal({ item, open, onOpenChange, onSuccess }: SHOAssignmentModalProps) {
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [loadingOfficers, setLoadingOfficers] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [selectedOfficerId, setSelectedOfficerId] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [visitType, setVisitType] = useState('Verification');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (open && item) {
            setError('');
            setSelectedOfficerId('');
            const defaultDt = item.defaultDate
                ? new Date(item.defaultDate).toISOString().slice(0, 16)
                : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
            setScheduledDate(defaultDt);
            setVisitType(item.type === 'VERIFICATION' ? 'Verification' : item.visitType || 'Follow-up');
            setNotes(item.notes || '');

            fetchStationOfficers(item.policeStationId);
        }
    }, [open, item]);

    const fetchStationOfficers = async (policeStationId?: string) => {
        try {
            setLoadingOfficers(true);
            const params: any = { limit: 100, isActive: true };
            if (policeStationId) {
                params.policeStationId = policeStationId;
            }
            const res: any = await apiClient.get('/officers', { params });
            if (res.success) {
                const list = res.data?.officers || res.data?.data || [];
                setOfficers(list);
            }
        } catch (err: any) {
            console.error('Failed to load station officers', err);
            setError('Could not load station officers. Please try again.');
        } finally {
            setLoadingOfficers(false);
        }
    };

    const handleAssign = async () => {
        if (!item) return;

        if (!selectedOfficerId) {
            setError('Please select an officer for assignment.');
            return;
        }

        if (!scheduledDate) {
            setError('Please select a visit date and time.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            if (item.type === 'VERIFICATION') {
                // Call verification assignment API
                const res: any = await apiClient.assignVerificationRequest(item.id, {
                    officerId: selectedOfficerId,
                    scheduledDate: new Date(scheduledDate).toISOString(),
                    notes: notes || undefined
                });

                if (res.success) {
                    toast.success(`Officer assigned successfully for verification of ${item.citizenName}`);
                    onSuccess();
                    onOpenChange(false);
                } else {
                    setError(res.message || 'Failed to assign officer');
                }
            } else {
                // Call visit scheduling API for revisit / visit request
                const res: any = await apiClient.createVisit({
                    seniorCitizenId: item.citizenId,
                    officerId: selectedOfficerId,
                    scheduledDate: new Date(scheduledDate).toISOString(),
                    visitType: visitType || 'Follow-up',
                    notes: notes || undefined
                });

                if (res.success) {
                    // Mark visit request as Scheduled
                    if (item.id) {
                        try {
                            await apiClient.updateVisitRequest(item.id, 'Scheduled');
                        } catch (e) {
                            console.warn('Could not update visit request status', e);
                        }
                    }
                    toast.success(`Visit assigned successfully for ${item.citizenName}`);
                    onSuccess();
                    onOpenChange(false);
                } else {
                    setError(res.message || 'Failed to schedule visit');
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || err?.message || 'Assignment failed. Please check officer station mapping.');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedOfficer = officers.find(o => o.id === selectedOfficerId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary text-xl">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        {item?.type === 'VERIFICATION' ? 'Assign Officer for Verification' : 'Assign Officer for Re-visit'}
                    </DialogTitle>
                    <DialogDescription>
                        Assign an active field officer from the police station to conduct the visit for{' '}
                        <span className="font-semibold text-slate-800">{item?.citizenName}</span>.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="my-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4 py-2">
                    {/* Citizen summary badge */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-sm">
                        <div>
                            <span className="text-muted-foreground">Citizen: </span>
                            <span className="font-semibold">{item?.citizenName}</span>
                            {item?.mobileNumber && <span className="text-xs text-muted-foreground ml-2">({item.mobileNumber})</span>}
                        </div>
                        <Badge variant="secondary" className="capitalize">
                            {item?.type === 'VERIFICATION' ? 'Initial Verification' : item?.visitType || 'Re-visit'}
                        </Badge>
                    </div>

                    {/* Officer Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                            <span>Select Station Officer</span>
                            {loadingOfficers && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Loading officers...</span>}
                        </label>
                        <Select
                            value={selectedOfficerId}
                            onValueChange={(val) => {
                                setSelectedOfficerId(val);
                                setError('');
                            }}
                            disabled={loadingOfficers}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose a field officer from this Police Station" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                                {officers.length === 0 ? (
                                    <div className="p-3 text-center text-sm text-muted-foreground">No active officers found for this station.</div>
                                ) : (
                                    officers.map((officer) => (
                                        <SelectItem key={officer.id} value={officer.id}>
                                            <div className="flex items-center justify-between gap-4 w-full">
                                                <span className="font-medium">{officer.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {officer.rank || 'Officer'} · {officer.badgeNumber || 'No Badge'}
                                                    {officer.Beat ? ` · Beat: ${officer.Beat.name}` : ''}
                                                    {typeof officer._count?.Visit === 'number' ? ` (${officer._count.Visit} active visits)` : ''}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>

                        {selectedOfficer && (
                            <div className="text-xs bg-blue-50/70 border border-blue-200 text-blue-900 p-2.5 rounded-md flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-blue-600 shrink-0" />
                                <span>
                                    <strong>{selectedOfficer.name}</strong> ({selectedOfficer.rank || 'Field Officer'}) · Badge: {selectedOfficer.badgeNumber || 'N/A'}
                                    {selectedOfficer.Beat && ` · Assigned Beat: ${selectedOfficer.Beat.name}`}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Scheduled Date & Time */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-primary" />
                            Scheduled Visit Date & Time
                        </label>
                        <Input
                            type="datetime-local"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    {/* Visit Type (for Re-visits) */}
                    {item?.type === 'REVISIT' && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Visit Purpose / Type</label>
                            <Select value={visitType} onValueChange={setVisitType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Follow-up">Follow-up Re-visit (Vulnerability Assessment)</SelectItem>
                                    <SelectItem value="Verification">Verification Visit</SelectItem>
                                    <SelectItem value="Routine">Routine Inspection</SelectItem>
                                    <SelectItem value="Emergency">Emergency Welfare Check</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Notes / Special Instructions */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Special Instructions for Officer (Optional)</label>
                        <Textarea
                            placeholder="Enter any priority notes, medical flags, or specific instructions..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleAssign} disabled={submitting || !selectedOfficerId || !scheduledDate} className="gap-1.5">
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Assigning Officer...
                            </>
                        ) : (
                            <>
                                <UserCheck className="h-4 w-4" />
                                Confirm Assignment
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
