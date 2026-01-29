'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Calendar } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ListSkeleton } from '../components/ListSkeleton';
import { useToast } from '@/components/ui/use-toast';

export default function CitizenVisitsPage() {
    const [loading, setLoading] = useState(true);
    const [visits, setVisits] = useState<any[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        let isMounted = true;

        const fetchVisits = async () => {
            if (!isMounted) return;

            try {
                const response = await apiClient.getMyVisits();

                if (!isMounted) return;

                if (response.success) {
                    // API returns paginated query result with 'items'
                    setVisits(response.data.items || response.data.visits || []);
                }
            } catch (err) {
                console.error('Failed to load visits', err);
                if (!isMounted) return;

                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load visits. Please try again later.",
                });
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchVisits();

        return () => {
            isMounted = false;
        };
    }, [toast]);

    if (loading) {
        return <ListSkeleton />;
    }

    return (
        <ProtectedRoute permissionCode="visits.read.own">
            <div className="space-y-6 min-h-[80vh]">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Visits</h1>
                        <p className="text-muted-foreground">History of police visits and your requests.</p>
                    </div>
                    <Button asChild>
                        <Link href="/citizen-portal/visits/request">
                            <Plus className="mr-2 h-4 w-4" />
                            Request Visit
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4">
                    {visits.length > 0 ? (
                        visits.map((visit) => (
                            <Card key={visit.id}>
                                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{visit.visitType}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(visit.scheduledDate || visit.createdAt).toLocaleDateString(undefined, {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            {visit.officer && (
                                                <p className="mt-1 text-sm text-slate-600">
                                                    Officer: {visit.officer.name} ({visit.officer.rank})
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={
                                            visit.status === 'Completed' ? 'default' :
                                                visit.status === 'Scheduled' ? 'secondary' :
                                                    'outline'
                                        }>
                                            {visit.status}
                                        </Badge>
                                        {visit.status === 'Completed' && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/citizen-portal/feedback?visitId=${visit.id}`}>
                                                    Give Feedback
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <Calendar className="mb-4 h-12 w-12 text-slate-300" />
                                <h3 className="text-lg font-medium text-slate-900">No visits found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    You haven't had any visits yet. You can request one above.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
