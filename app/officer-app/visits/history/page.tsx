'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, CheckCircle2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { format } from 'date-fns';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function VisitHistoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [visits, setVisits] = useState<any[]>([]);

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                // Using assignments logic but filtered for completed locally or backend
                // ideally backend should genericize 'getAssignments' or 'getVisits'
                const res = await apiClient.getOfficerAssignments();
                if (res.success) {
                    const completed = res.data.visits.filter((v: any) => v.status === 'COMPLETED');
                    setVisits(completed);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchVisits();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <ProtectedRoute permissionCode="visits.read">
            <div className="p-4 bg-slate-50 min-h-screen pb-20">
                <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    Visit History
                </h1>

                {visits.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>No completed visits found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {visits.map((visit) => (
                            <Card key={visit.id} onClick={() => router.push(`/officer-app/visits/${visit.id}`)}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                            Completed
                                        </Badge>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {visit.completedDate ? format(new Date(visit.completedDate), 'dd MMM yyyy') : '-'}
                                        </span>
                                    </div>

                                    <h3 className="font-semibold text-lg">{visit.SeniorCitizen?.fullName}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                        {visit.SeniorCitizen?.permanentAddress}
                                    </p>

                                    {visit.notes && (
                                        <div className="bg-slate-100 p-2 rounded text-xs text-slate-600 mt-2 italic">
                                            "{visit.notes}"
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
