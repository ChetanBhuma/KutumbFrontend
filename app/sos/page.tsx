'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from "@/components/dashboard/header";

export default function SOSMonitoringPage() {
    const router = useRouter();

    const fetchAlerts = useCallback(() => apiClient.getActiveAlerts(), []);
    const { data: alertsData, loading, refetch } = useApiQuery(fetchAlerts, { refetchOnMount: true });

    const alerts = alertsData?.alerts || [];

    useEffect(() => {
        // Auto-refresh every 10 seconds
        const interval = setInterval(refetch, 10000);
        return () => clearInterval(interval);
    }, [refetch]);

    const handleRespond = async (id: string) => {
        try {
            await apiClient.updateSOSStatus(id, 'Responded', 'Officer responding');
            refetch();
            alert('Alert marked as responded');
        } catch (error) {
            alert('Failed to update alert status');
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await apiClient.updateSOSStatus(id, 'Resolved', 'Alert resolved');
            refetch();
            alert('Alert resolved');
        } catch (error) {
            alert('Failed to resolve alert');
        }
    };

    return (
        <ProtectedRoute permissionCode="operations.roster">
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-background">
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <Header title="SOS Emergency Monitoring" description="Real-time active alerts" />
                    </div>
                    <div className="p-6">
                        <div className="flex justify-end items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
                                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                                    <span className="font-semibold">{alerts.length} Active Alerts</span>
                                </div>
                                <Button variant="outline" onClick={() => refetch()}>
                                    🔄 Refresh
                                </Button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading alerts...</p>
                            </div>
                        ) : alerts.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-lg font-semibold text-gray-900">All Clear!</p>
                                    <p className="text-gray-600">No active SOS alerts at the moment</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {alerts.map((alert: any) => (
                                    <Card key={alert.id} className="border-red-200 border-2">
                                        <CardHeader className="bg-red-50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-red-900 flex items-center gap-2">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        EMERGENCY ALERT
                                                    </CardTitle>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Alert ID: {alert.id.substring(0, 8)}
                                                    </p>
                                                </div>
                                                <Badge className={alert.status === 'Active' ? 'bg-red-600' : 'bg-yellow-600'}>
                                                    {alert.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h3 className="font-semibold mb-2">Citizen Details</h3>
                                                    <div className="space-y-1 text-sm">
                                                        <p><strong>Name:</strong> {alert.seniorCitizen?.fullName}</p>
                                                        <p><strong>Phone:</strong> {alert.seniorCitizen?.mobileNumber}</p>
                                                        <p><strong>Age:</strong> {alert.seniorCitizen?.age} years</p>
                                                        <p><strong>Risk Level:</strong>
                                                            <Badge className="ml-2" variant="outline">
                                                                {alert.seniorCitizen?.vulnerabilityLevel}
                                                            </Badge>
                                                        </p>
                                                        {alert.seniorCitizen?.healthConditions?.length > 0 && (
                                                            <p><strong>Health:</strong> {alert.seniorCitizen.healthConditions.join(', ')}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold mb-2">Location Details</h3>
                                                    <div className="space-y-1 text-sm">
                                                        <p><strong>Address:</strong> {alert.address || 'Not provided'}</p>
                                                        <p><strong>Coordinates:</strong></p>
                                                        <p className="font-mono text-xs">
                                                            Lat: {alert.latitude ? alert.latitude.toFixed(6) : '—'}<br />
                                                            Long: {alert.longitude ? alert.longitude.toFixed(6) : '—'}
                                                        </p>
                                                        {typeof alert.batteryLevel === 'number' && (
                                                            <p><strong>Battery:</strong> {alert.batteryLevel}%</p>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => alert.latitude && alert.longitude && window.open(`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`, '_blank')}
                                                            disabled={!alert.latitude || !alert.longitude}
                                                        >
                                                            📍 Open in Maps
                                                        </Button>
                                                    </div>
                                                </div>

                                                {alert.seniorCitizen?.emergencyContacts?.length > 0 && (
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Emergency Contact</h3>
                                                        {alert.seniorCitizen.emergencyContacts.slice(0, 1).map((contact: any) => (
                                                            <div key={contact.id} className="text-sm space-y-1">
                                                                <p><strong>{contact.name}</strong> ({contact.relation})</p>
                                                                <p className="font-mono">{contact.mobileNumber}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <h3 className="font-semibold mb-2">Alert Timing</h3>
                                                    <div className="space-y-1 text-sm">
                                                        <p><strong>Triggered:</strong> {new Date(alert.createdAt).toLocaleString()}</p>
                                                        <p><strong>Elapsed:</strong> {Math.floor((Date.now() - new Date(alert.createdAt).getTime()) / 60000)} minutes ago</p>
                                                    </div>
                                                    {alert.locationUpdates?.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="text-sm font-semibold">Live Updates</p>
                                                            <div className="max-h-32 overflow-y-auto text-xs text-muted-foreground border rounded-md mt-1 p-2 space-y-1">
                                                                {alert.locationUpdates.map((update: any) => (
                                                                    <div key={update.id}>
                                                                        {new Date(update.createdAt).toLocaleTimeString()} · {update.latitude?.toFixed(4)}, {update.longitude?.toFixed(4)} {typeof update.batteryLevel === 'number' ? `· ${update.batteryLevel}%` : ''}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                {alert.status === 'Active' && (
                                                    <Button onClick={() => handleRespond(alert.id)} className="bg-yellow-600 hover:bg-yellow-700">
                                                        Mark as Responding
                                                    </Button>
                                                )}
                                                <Button onClick={() => handleResolve(alert.id)} variant="outline">
                                                    Resolve Alert
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.push(`/citizens/${alert.seniorCitizen.id}`)}
                                                >
                                                    View Citizen Profile
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
