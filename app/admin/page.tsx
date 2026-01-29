'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [demographics, setDemographics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!isMounted) return;

            try {
                setLoading(true);
                const [statsRes, demoRes] = await Promise.all([
                    apiClient.getDashboardStats(),
                    apiClient.getCitizenDemographics(),
                ]);

                if (!isMounted) return;

                if (statsRes.success) setStats(statsRes.data);
                if (demoRes.success) setDemographics(demoRes.data);
            } catch (error) {
                console.error('Failed to fetch admin data:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <ProtectedRoute permissionCode="dashboard.admin.view">
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute permissionCode="notifications.manage">
            <div className="container mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">System Overview & Analytics</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardHeader className="pb-2">
                            <CardDescription>Total Citizens</CardDescription>
                            <CardTitle className="text-3xl text-blue-900">{stats?.citizens.total || 0}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs">
                                <div className="flex justify-between mb-1">
                                    <span>Verified</span>
                                    <span className="font-semibold">{stats?.citizens.verified || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-red-600">High Risk</span>
                                    <span className="font-semibold text-red-600">{stats?.citizens.highVulnerability || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardHeader className="pb-2">
                            <CardDescription>Active Officers</CardDescription>
                            <CardTitle className="text-3xl text-green-900">{stats?.officers.active || 0}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs">
                                <div className="flex justify-between">
                                    <span>Total Officers</span>
                                    <span className="font-semibold">{stats?.officers.total || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardHeader className="pb-2">
                            <CardDescription>Visits Completed</CardDescription>
                            <CardTitle className="text-3xl text-purple-900">{stats?.visits.completed || 0}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs">
                                <div className="flex justify-between mb-1">
                                    <span>Total</span>
                                    <span className="font-semibold">{stats?.visits.total || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Completion Rate</span>
                                    <span className="font-semibold">{stats?.visits.completionRate || 0}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-red-100">
                        <CardHeader className="pb-2">
                            <CardDescription>SOS Alerts</CardDescription>
                            <CardTitle className="text-3xl text-red-900">{stats?.sos.total || 0}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs">
                                <div className="flex justify-between mb-1">
                                    <span className="text-red-600">Active</span>
                                    <span className="font-semibold text-red-600">{stats?.sos.active || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Resolution Rate</span>
                                    <span className="font-semibold">{stats?.sos.resolutionRate || 0}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Demographics Charts */}
                {demographics && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Age Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(demographics.ageDistribution || {}).map(([range, count]: [string, any]) => (
                                        <div key={range}>
                                            <div className="flex justify-between mb-1 text-sm">
                                                <span>{range} years</span>
                                                <span className="font-semibold">{count}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${(count / demographics.total) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Vulnerability Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(demographics.vulnerabilityDistribution || {}).map(([level, count]: [string, any]) => (
                                        <div key={level}>
                                            <div className="flex justify-between mb-1 text-sm">
                                                <span>{level}</span>
                                                <span className="font-semibold">{count}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${level === 'High' ? 'bg-red-600' :
                                                        level === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'
                                                        }`}
                                                    style={{ width: `${(count / demographics.total) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Admin Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/users')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                User Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">Manage system users, roles, and permissions</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/beats')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Beat Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">Manage beats, zones, and jurisdictions</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/reports')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Reports & Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">View detailed reports and analytics</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/settings')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                System Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">Configure system settings and preferences</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/notifications')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">Send bulk notifications and announcements</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/audit-logs')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Audit Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">View system audit trail and activity logs</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
