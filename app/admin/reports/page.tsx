'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ExportButton } from '@/components/ui/export-button';

export default function ReportsAnalyticsPage() {

    const [timeRange, setTimeRange] = useState('30');

    const fetchVisitAnalytics = useCallback(() => {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return apiClient.getVisitAnalytics({ startDate, endDate, groupBy: 'day' });
    }, [timeRange]);

    const fetchOfficerPerformance = useCallback(() => {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return apiClient.getOfficerPerformance({ startDate, endDate });
    }, [timeRange]);

    const fetchDemographics = useCallback(() => apiClient.getCitizenDemographics(), []);

    const { data: visitData, loading: visitLoading } = useApiQuery(fetchVisitAnalytics, { refetchOnMount: true });
    const { data: officerData, loading: officerLoading } = useApiQuery(fetchOfficerPerformance, { refetchOnMount: true });
    const { data: demoData, loading: demoLoading } = useApiQuery(fetchDemographics, { refetchOnMount: true });

    const visitAnalytics = visitData || null;
    const officerPerformance = officerData || null;
    const demographics = demoData || null;
    const loading = visitLoading || officerLoading || demoLoading;

    if (loading) {
        return (
            <ProtectedRoute permissionCode="reports.read">
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                        <p className="text-gray-600">Comprehensive system analytics and data export</p>
                    </div>
                    <div className="flex gap-2">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                                <SelectItem value="90">Last 90 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Visit Analytics */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Visit Analytics</CardTitle>
                                <CardDescription>Visit trends and completion metrics</CardDescription>
                            </div>
                            <ExportButton type="visits" label="Export Visits" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{visitAnalytics?.total || 0}</p>
                                <p className="text-sm text-gray-600">Total Visits</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{visitAnalytics?.byStatus?.Completed || 0}</p>
                                <p className="text-sm text-gray-600">Completed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{visitAnalytics?.byStatus?.Scheduled || 0}</p>
                                <p className="text-sm text-gray-600">Scheduled</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">{visitAnalytics?.avgDurationMinutes || 0} min</p>
                                <p className="text-sm text-gray-600">Avg Duration</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm">By Type</h4>
                            {visitAnalytics?.byType && Object.entries(visitAnalytics.byType).map(([type, count]: [string, any]) => (
                                <div key={type}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{type}</span>
                                        <span className="font-semibold">{count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${(count / visitAnalytics.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Officer Performance */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Officer Performance</CardTitle>
                                <CardDescription>Top performing officers</CardDescription>
                            </div>
                            <div className="text-sm text-gray-600">
                                Avg Completion: <span className="font-semibold">{officerPerformance?.summary?.avgCompletionRate || 0}%</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {officerPerformance?.officers?.slice(0, 10).map((officer: any, index: number) => (
                                <div key={officer.officerId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <p className="font-semibold">{officer.officerName}</p>
                                                <p className="text-xs text-gray-600">Beat: {officer.beatName}</p>
                                            </div>
                                            <Badge variant="outline">{officer.completionRate}%</Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div>
                                                <span className="text-gray-600">Visits:</span> <span className="font-semibold">{officer.totalVisits}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Completed:</span> <span className="font-semibold text-green-600">{officer.completedVisits}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Citizens:</span> <span className="font-semibold">{officer.assignedCitizens}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Demographics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Living Arrangements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {demographics?.livingArrangement && Object.entries(demographics.livingArrangement).map(([type, count]: [string, any]) => (
                                    <div key={type} className="flex justify-between text-sm">
                                        <span>{type}</span>
                                        <span className="font-semibold">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Gender Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {demographics?.genderDistribution && Object.entries(demographics.genderDistribution).map(([gender, count]: [string, any]) => (
                                    <div key={gender} className="flex justify-between text-sm">
                                        <span>{gender}</span>
                                        <span className="font-semibold">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Data Export</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <ExportButton type="citizens" label="Export Citizens" className="w-full" />
                            <ExportButton type="visits" label="Export Visits" className="w-full" />
                            <ExportButton type="reports" label="Download Monthly Report (PDF)" className="w-full" filters={{ type: 'monthly_summary' }} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
