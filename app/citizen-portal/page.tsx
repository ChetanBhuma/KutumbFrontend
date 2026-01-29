'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

interface VisitRequest {
    id: string;
    preferredDate?: string;
    preferredTimeSlot?: string;
    visitType?: string;
    status: string;
    createdAt: string;
    notes?: string;
}

interface RegistrationRecord {
    id: string;
    mobileNumber: string;
    fullName?: string;
    status: string;
    otpVerified: boolean;
    registrationStep?: string;
    citizen?: {
        id: string;
        fullName: string;
        vulnerabilityLevel?: string;
        idVerificationStatus?: string;
        digitalCardIssued?: boolean;
    };
    visitRequests: VisitRequest[];
    createdAt: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-100 text-amber-800' },
    PENDING_REVIEW: { label: 'Pending Review', color: 'bg-blue-100 text-blue-800' },
    APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800' },
    REJECTED: { label: 'Needs Attention', color: 'bg-red-100 text-red-800' }
};

export default function CitizenPortalHome() {
    const { toast } = useToast();
    const [registrationId, setRegistrationId] = useState('');
    const [registration, setRegistration] = useState<RegistrationRecord | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadFromStorage = async () => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('citizenPortalRegistrationId') : null;
        if (stored) {
            setRegistrationId(stored);
            await fetchRegistration(stored);
        }
    };

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = () => {
            if (typeof window !== 'undefined') {
                const accessToken = localStorage.getItem('accessToken');
                const userType = localStorage.getItem('userType');

                // If citizen is logged in, redirect to dashboard
                if (accessToken && (userType === 'citizen' || userType === 'CITIZEN')) {
                    window.location.href = '/citizen-portal/dashboard';
                    return;
                }
            }
        };

        checkAuth();
        loadFromStorage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchRegistration = async (id: string) => {
        if (!id) return;
        try {
            setLoading(true);
            setError('');
            const response = await apiClient.getCitizenRegistration(id);
            if (response.success) {
                setRegistration(response.data.registration);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('citizenPortalRegistrationId', response.data.registration.id);
                }
            }
        } catch (err: any) {
            console.error('Failed to load registration', err);
            setRegistration(null);
            const msg = err?.response?.data?.message || 'Registration not found';
            setError(msg);
            toast({
                variant: "destructive",
                title: "Error",
                description: msg,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLookup = async (event: React.FormEvent) => {
        event.preventDefault();
        await fetchRegistration(registrationId.trim());
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Senior Citizen Portal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Register yourself or a family member and track the status of your application. Once approved, you
                        can request police visits, update details, and download the digital ID card.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild>
                            <Link href="/citizen-portal/register">Start New Registration</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Track Registration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Enter the registration ID sent via SMS/email to view progress and next steps.
                    </p>
                    <form onSubmit={handleLookup} className="flex flex-col gap-3 sm:flex-row">
                        <Input
                            placeholder="Registration ID"
                            value={registrationId}
                            onChange={(e) => setRegistrationId(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Checking…' : 'Check Status'}
                        </Button>
                    </form>
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {registration && (
                        <div className="rounded-lg border p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Registration ID</p>
                                    <p className="font-semibold">{registration.id}</p>
                                    <p className="text-sm text-muted-foreground">Mobile: {registration.mobileNumber}</p>
                                </div>
                                <Badge className={statusLabels[registration.status]?.color || 'bg-gray-100 text-gray-800'}>
                                    {statusLabels[registration.status]?.label || registration.status}
                                </Badge>
                            </div>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Applicant</p>
                                    <p className="font-medium">{registration.fullName || 'Pending details'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Step: {registration.registrationStep || 'Not started'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">OTP Verification</p>
                                    <p className="font-medium">{registration.otpVerified ? 'Verified' : 'Pending'}</p>
                                </div>
                            </div>
                            {registration.citizen && (
                                <div className="mt-4 rounded-md border bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-green-700">Citizen profile created</p>
                                    <p className="text-sm text-muted-foreground">ID: {registration.citizen.id}</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {registration.citizen.idVerificationStatus && (
                                            <Badge variant="outline">{registration.citizen.idVerificationStatus}</Badge>
                                        )}
                                        {registration.citizen.digitalCardIssued && (
                                            <Badge variant="outline">Digital ID ready</Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                            {registration.citizen && (
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <Button size="sm" asChild>
                                        <Link href={`/citizen-portal/visits/request?citizenId=${registration.citizen.id}`}>
                                            Request a Visit
                                        </Link>
                                    </Button>
                                    <Button size="sm" variant="outline" asChild>
                                        <Link href={`/citizens/${registration.citizen.id}`}>
                                            View Citizen Profile (Admin)
                                        </Link>
                                    </Button>
                                </div>
                            )}
                            {registration.visitRequests?.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium">Visit requests</p>
                                    <div className="mt-2 space-y-2">
                                        {registration.visitRequests.map((request) => (
                                            <div key={request.id} className="rounded-md border p-3 text-sm">
                                                <div className="flex justify-between gap-3">
                                                    <span>{request.visitType || 'Welfare visit'}</span>
                                                    <Badge variant="secondary">{request.status}</Badge>
                                                </div>
                                                <p className="text-muted-foreground">
                                                    Preferred: {request.preferredTimeSlot || 'Any'} ·{' '}
                                                    {request.preferredDate
                                                        ? new Date(request.preferredDate).toLocaleDateString()
                                                        : 'Date TBD'}
                                                </p>
                                                {request.notes && <p className="text-muted-foreground">{request.notes}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>How it works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>1. Start a registration with your mobile number and verify with the OTP.</p>
                        <p>2. Fill in personal, health, and emergency contact details.</p>
                        <p>3. Track your request. You will be contacted by the senior citizen cell for verification.</p>
                        <p>4. Once approved, your digital ID card and visit scheduling will be available.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Need assistance?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>• Dial 112 for emergencies</p>
                        <p>• Senior Citizen Cell helpline: +91-11-1234-5678</p>
                        <p>• Email: seniorsupport@delhipolice.gov.in</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
