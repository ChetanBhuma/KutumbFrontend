'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Phone, Mail, MapPin, Users, Calendar, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';

interface Officer {
    id: string;
    name: string;
    rank: string;
    badgeNumber: string;
    mobileNumber: string;
    email?: string;
    isActive: boolean;
    createdAt: string;
    PoliceStation?: {
        id: string;
        name: string;
        code: string;
    };
    District?: {
        id: string;
        name: string;
    };
    Beat?: {
        id: string;
        name: string;
        code: string;
        SeniorCitizen?: any[];
    };
    Visit?: any[];
}

export default function OfficerDetailPage() {
    const router = useRouter();
    const params = useParams();
    const officerId = params?.id as string;

    const [officer, setOfficer] = useState<Officer | null>(null);
    const [loading, setLoading] = useState(true);
    const [workload, setWorkload] = useState<any>(null);

    useEffect(() => {
        const fetchOfficer = async () => {
            try {
                setLoading(true);
                const response = await apiClient.getOfficerById(officerId);

                if (response.success) {
                    setOfficer(response.data.officer);
                    setWorkload(response.data.workload);
                }
            } catch (error) {
                console.error('Failed to fetch officer:', error);
            } finally {
                setLoading(false);
            }
        };

        if (officerId) {
            fetchOfficer();
        }
    }, [officerId]);

    if (loading) {
        return (
            <ProtectedRoute permissionCode="officers.read">
                <DashboardLayout title="Officer Details" description="Loading..." currentPath="/officers">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading officer details...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!officer) {
        return (
            <ProtectedRoute permissionCode="officers.read">
                <DashboardLayout title="Officer Not Found" description="Officer details" currentPath="/officers">
                    <Card>
                        <CardContent className="text-center py-12">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-gray-600">Officer not found</p>
                            <Button className="mt-4" onClick={() => router.push('/officers')}>
                                Back to Officers
                            </Button>
                        </CardContent>
                    </Card>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const getRankColor = (rank: string) => {
        switch (rank.toLowerCase()) {
            case 'inspector':
            case 'sub-inspector':
                return 'bg-blue-100 text-blue-800';
            case 'head constable':
                return 'bg-purple-100 text-purple-800';
            case 'constable':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getVisitStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800';
            case 'SCHEDULED':
                return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <ProtectedRoute permissionCode="officers.read">
            <DashboardLayout title={officer.name} description="Officer details and performance" currentPath="/officers">
                <div className="mb-6">
                    <Button variant="outline" onClick={() => router.push('/officers')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Officers
                    </Button>
                </div>

                {/* Basic Details Card */}
                <Card className="mb-6">
                    <CardHeader className="border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-6 w-6 text-blue-600" />
                                Officer Details
                            </CardTitle>
                            <Badge className={officer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {officer.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Name</p>
                                <p className="font-semibold text-lg">{officer.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Rank</p>
                                <Badge className={getRankColor(officer.rank)}>{officer.rank}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">PIS Number</p>
                                <p className="font-semibold font-mono">{officer.badgeNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> Mobile Number
                                </p>
                                <p className="font-semibold">{officer.mobileNumber}</p>
                            </div>
                            {officer.email && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                        <Mail className="h-3 w-3" /> Email
                                    </p>
                                    <p className="font-semibold text-sm">{officer.email}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Police Station
                                </p>
                                <p className="font-semibold">{officer.PoliceStation?.name || 'Not Assigned'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">District</p>
                                <p className="font-semibold">{officer.District?.name || 'Not Assigned'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                    <Users className="h-3 w-3" /> Beat Assignment
                                </p>
                                <p className="font-semibold">{officer.Beat?.name || 'Not Assigned'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Joined Date
                                </p>
                                <p className="font-semibold">{new Date(officer.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Report */}
                <Card className="mb-6">
                    <CardHeader className="border-b bg-muted/30">
                        <CardTitle>Performance Report</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold">{workload?.assignedCitizens || 0}</p>
                                        <p className="text-sm text-muted-foreground">Assigned Citizens</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold">{workload?.completedVisits || 0}</p>
                                        <p className="text-sm text-muted-foreground">Completed Visits</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold">{workload?.pendingVisits || 0}</p>
                                        <p className="text-sm text-muted-foreground">Pending Visits</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold">{officer.Visit?.length || 0}</p>
                                        <p className="text-sm text-muted-foreground">Total Visits</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Visits */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Recent Visits</h3>
                            {officer.Visit && officer.Visit.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Citizen</TableHead>
                                            <TableHead>Visit Type</TableHead>
                                            <TableHead>Scheduled Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {officer.Visit.slice(0, 10).map((visit: any) => (
                                            <TableRow key={visit.id}>
                                                <TableCell className="font-medium">
                                                    {visit.SeniorCitizen?.fullName || 'N/A'}
                                                </TableCell>
                                                <TableCell>{visit.visitType}</TableCell>
                                                <TableCell>
                                                    {new Date(visit.scheduledDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getVisitStatusColor(visit.status)}>
                                                        {visit.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {visit.notes || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                    <p>No visits recorded yet</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
