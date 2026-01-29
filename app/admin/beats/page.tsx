'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function BeatsManagementPage() {
    const router = useRouter();


    const fetchBeats = useCallback(() => apiClient.get('/beats') as Promise<{ data: { beats: any[] } }>, []);
    const { data: beatsData, loading, refetch } = useApiQuery<{ data: { beats: any[] } }>(
        fetchBeats,
        { refetchOnMount: true }
    );

    const beats = beatsData?.data?.beats || [];

    return (
        <ProtectedRoute permissionCode="admin.masters">
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Beat Management</h1>
                        <p className="text-gray-600">Manage beats, zones, and jurisdictions</p>
                    </div>
                    <Button onClick={() => router.push('/admin/beats/add')}>
                        + Add Beat
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {beats.map((beat) => (
                            <Card key={beat.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{beat.name}</CardTitle>
                                            <p className="text-sm text-gray-600">{beat.code}</p>
                                        </div>
                                        <Badge>{beat._count?.officers || 0} Officers</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-600">Police Station:</span>
                                            <span className="ml-2 font-medium">{beat.policeStation?.name || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Citizens:</span>
                                            <span className="ml-2 font-medium">{beat._count?.citizens || 0}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Boundaries:</span>
                                            <p className="mt-1 text-xs text-gray-500">{beat.boundaries || 'Not defined'}</p>
                                        </div>
                                        <div className="pt-2 flex gap-2">
                                            <Button size="sm" variant="outline" className="flex-1">
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1">
                                                Assign Officers
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
