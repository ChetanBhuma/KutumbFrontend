'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';

interface LocationCoords {
    latitude?: number;
    longitude?: number;
}

import { ProtectedRoute } from '@/components/auth/protected-route';

export default function CitizenSOSPage() {
    const { toast } = useToast();
    const [activeAlert, setActiveAlert] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            setSuccess('');
            setError('');
        };
    }, []);

    const getCurrentLocation = (): Promise<LocationCoords> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({});
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }),
                () => resolve({}),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    };

    const triggerSOS = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const coords = await getCurrentLocation();
            if (coords.latitude === undefined || coords.longitude === undefined) {
                const msg = 'Unable to access location. Please enable location permissions and try again.';
                setError(msg);
                toast({ variant: "destructive", title: "Location Error", description: msg });
                return;
            }

            const response = await apiClient.createMySOS({
                latitude: coords.latitude,
                longitude: coords.longitude,
                address: 'Live location from citizen portal'
            });

            if (response.success) {
                setActiveAlert(response.data.alert);
                setSuccess('Emergency alert sent. Police have been notified.');
                setLastUpdate(new Date().toLocaleString());
                toast({
                    title: "SOS Alert Sent",
                    description: "Police have been notified of your location.",
                    variant: "destructive" // Red toast for emergency
                });
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Unable to trigger SOS alert.';
            setError(msg);
            toast({ variant: "destructive", title: "Error", description: msg });
        } finally {
            setLoading(false);
        }
    };

    const sendLocationUpdate = async () => {
        if (!activeAlert) return;
        try {
            setLoading(true);
            setError('');
            const coords = await getCurrentLocation();
            if (coords.latitude === undefined || coords.longitude === undefined) {
                setError('Unable to access location.');
                return;
            }

            await apiClient.updateSOSLocation(activeAlert.id, {
                latitude: coords.latitude,
                longitude: coords.longitude,
                deviceInfo: navigator.userAgent
            });
            setSuccess('Location update sent.');
            setLastUpdate(new Date().toLocaleString());
            toast({ title: "Location Updated", description: "Latest coordinates sent to police." });
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to update location.';
            setError(msg);
            toast({ variant: "destructive", title: "Error", description: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute permissionCode="sos.create">
            <div className="space-y-6">
                <Card className="border-red-200 border-2 shadow-lg">
                    <CardHeader className="bg-red-50">
                        <CardTitle className="text-red-700 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            Emergency Assistance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <p className="text-muted-foreground">
                            Use this feature only if you are in immediate danger. Your live location will be shared with the Delhi Police Senior Citizen Cell.
                        </p>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert className="border-green-200 bg-green-50 text-green-800">
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="lg"
                                    variant="destructive"
                                    className="w-full text-lg h-16 animate-pulse hover:animate-none"
                                    disabled={loading}
                                >
                                    {loading ? 'Sending alert…' : '🚨 Trigger SOS Alert'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Emergency Alert</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will immediately notify the police and your emergency contacts with your current location. Are you sure you want to proceed?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={triggerSOS} className="bg-red-600 hover:bg-red-700">
                                        Yes, Trigger SOS
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                    </CardContent>
                </Card>

                {activeAlert && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Alert Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-muted-foreground">Alert ID:</div>
                                <div className="font-mono">{activeAlert.id}</div>

                                <div className="text-muted-foreground">Status:</div>
                                <div><span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">{activeAlert.status}</span></div>

                                <div className="text-muted-foreground">Location:</div>
                                <div>{activeAlert.latitude?.toFixed(4)}, {activeAlert.longitude?.toFixed(4)}</div>

                                <div className="text-muted-foreground">Last update:</div>
                                <div>{lastUpdate || 'Just now'}</div>
                            </div>

                            <div className="pt-4">
                                <Button variant="outline" onClick={sendLocationUpdate} disabled={loading} className="w-full">
                                    {loading ? 'Updating…' : 'Send Location Update'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedRoute>
    );
}
