'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, MapPin, Calendar, Clock, LogOut, Navigation, CheckCircle2, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { format } from 'date-fns';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function OfficerDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [officer, setOfficer] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if we have token
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    router.push('/officer-app/login');
                    return;
                }

                const [metricsRes, assignmentsRes] = await Promise.all([
                    apiClient.getOfficerDashboardMetrics(),
                    apiClient.getOfficerAssignments()
                ]);

                if (metricsRes.success) {
                    setMetrics(metricsRes.data.metrics);
                }

                if (assignmentsRes.success) {
                    setOfficer(assignmentsRes.data.officer);
                    setAssignments(assignmentsRes.data.visits);
                }
            } catch (error) {
                console.error('Failed to load dashboard:', error);
                // If 401, redirect
                // router.push('/officer-app/login');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleLogout = () => {
        apiClient.clearTokens();
        router.push('/officer-app/login');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const scheduledVisits = assignments.filter((v) => v.status === 'SCHEDULED' || v.status === 'IN_PROGRESS');
    const completedVisits = assignments.filter((v) => v.status === 'COMPLETED');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <ProtectedRoute permissionCode="dashboard.officer.view">
            <div className="min-h-screen bg-slate-50 pb-20">
                {/* Header */}
                <header className="bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 rounded-full p-1.5">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h1 className="font-semibold text-sm">{officer?.name || 'Officer'}</h1>
                            <p className="text-xs text-muted-foreground">{officer?.rank || 'Beat Officer'}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                        <LogOut className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </header>

                <main className="p-4 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-bold text-blue-600">{metrics?.assigned || 0}</span>
                                <span className="text-xs text-muted-foreground mt-1">Pending Visits</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-bold text-green-600">{metrics?.completed || 0}</span>
                                <span className="text-xs text-muted-foreground mt-1">Completed</span>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Visits List */}
                    <Tabs defaultValue="scheduled" className="w-full">
                        <TabsList className="w-full grid grid-cols-2 mb-4">
                            <TabsTrigger value="scheduled">Scheduled ({scheduledVisits.length})</TabsTrigger>
                            <TabsTrigger value="completed">History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="scheduled" className="space-y-4">
                            {scheduledVisits.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>No scheduled visits</p>
                                </div>
                            ) : (
                                scheduledVisits.map((visit) => (
                                    <Card key={visit.id} className="overflow-hidden" onClick={() => router.push(`/officer-app/visits/${visit.id}`)}>
                                        <div className={`h-1 w-full ${visit.visitType === 'Emergency' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className={getStatusColor(visit.status)}>
                                                    {visit.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {format(new Date(visit.scheduledDate), 'HH:mm')}
                                                </span>
                                            </div>

                                            <h3 className="font-semibold text-lg mb-1">{visit.SeniorCitizen?.fullName}</h3>

                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                                    <span>{visit.SeniorCitizen?.permanentAddress}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 shrink-0" />
                                                    <span>{format(new Date(visit.scheduledDate), 'dd MMM yyyy')}</span>
                                                </div>
                                                {visit.visitType === 'Emergency' && (
                                                    <div className="flex items-center gap-2 text-red-600 font-medium">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <span>Emergency Visit</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Button className="w-full mt-4" variant="secondary">
                                                View Details
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="completed" className="space-y-4">
                            {completedVisits.map((visit) => (
                                <Card key={visit.id} className="opacity-75">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="bg-green-100 text-green-800">
                                                Completed
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {visit.completedDate ? format(new Date(visit.completedDate), 'dd MMM') : '-'}
                                            </span>
                                        </div>
                                        <h3 className="font-medium">{visit.SeniorCitizen?.fullName}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{visit.SeniorCitizen?.permanentAddress}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </ProtectedRoute>
    );
}
