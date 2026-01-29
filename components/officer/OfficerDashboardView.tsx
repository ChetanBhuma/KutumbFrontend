'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, CheckCircle, Clock, Users, MapPin, Phone, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

interface DashboardMetrics {
    assigned: number;
    completed: number;
    pending: number;
    totalCitizens: number;
}

interface Suggestion {
    id: string;
    fullName: string;
    vulnerabilityLevel: string;
    lastVisitDate: string | null;
    permanentAddress: string;
    mobileNumber: string;
}

export default function OfficerDashboardView({ onNavigate }: { onNavigate: (view: 'visits') => void }) {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsRes, suggestionsRes] = await Promise.all([
                    apiClient.getOfficerDashboardMetrics(),
                    apiClient.getOfficerSuggestions()
                ]);

                if (metricsRes.success) {
                    setMetrics(metricsRes.data.metrics);
                }

                if (suggestionsRes.success) {
                    setSuggestions(suggestionsRes.data.suggestions);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <div className="text-sm text-slate-500">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                        <div className="text-2xl font-bold text-blue-900">{metrics?.assigned || 0}</div>
                        <div className="text-xs text-blue-700">Assigned</div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                        <div className="text-2xl font-bold text-green-900">{metrics?.completed || 0}</div>
                        <div className="text-xs text-green-700">Completed</div>
                    </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-100">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Clock className="w-6 h-6 text-orange-600 mb-2" />
                        <div className="text-2xl font-bold text-orange-900">{metrics?.pending || 0}</div>
                        <div className="text-xs text-orange-700">Pending</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-100">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Users className="w-6 h-6 text-slate-600 mb-2" />
                        <div className="text-2xl font-bold text-slate-900">{metrics?.totalCitizens || 0}</div>
                        <div className="text-xs text-slate-700">Total Citizens</div>
                    </CardContent>
                </Card>
            </div>

            {/* Visit Suggestions */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-slate-900">Visit Suggestions</h2>
                    <Button variant="link" onClick={() => onNavigate('visits')} className="text-sm text-primary font-medium">View All</Button>
                </div>

                {suggestions.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            No urgent visits suggested.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {suggestions.map((citizen) => (
                            <Card key={citizen.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex">
                                        <div className={`w-1.5 ${citizen.vulnerabilityLevel === 'High' ? 'bg-red-500' :
                                                citizen.vulnerabilityLevel === 'Medium' ? 'bg-orange-500' :
                                                    'bg-green-500'
                                            }`} />
                                        <div className="p-4 flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{citizen.fullName}</h3>
                                                    <div className="flex items-center text-xs text-slate-500 mt-1">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        <span className="line-clamp-1">{citizen.permanentAddress}</span>
                                                    </div>
                                                </div>
                                                <Badge variant={
                                                    citizen.vulnerabilityLevel === 'High' ? 'destructive' :
                                                        citizen.vulnerabilityLevel === 'Medium' ? 'secondary' :
                                                            'outline'
                                                }>
                                                    {citizen.vulnerabilityLevel} Risk
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                <div className="text-xs text-slate-500">
                                                    Last Visit: {citizen.lastVisitDate ? new Date(citizen.lastVisitDate).toLocaleDateString() : 'Never'}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full" asChild>
                                                        <a href={`tel:${citizen.mobileNumber}`}>
                                                            <Phone className="w-4 h-4" />
                                                        </a>
                                                    </Button>
                                                    <Button size="sm" className="h-8 px-3 rounded-full" onClick={() => onNavigate('visits')}>
                                                        Visit <ArrowRight className="w-3 h-3 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
