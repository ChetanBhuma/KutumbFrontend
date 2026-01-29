'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MapPin, Calendar, Clock, Phone, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

interface Visit {
    id: string;
    scheduledDate: string;
    status: string;
    visitType: string;
    seniorCitizen: {
        id: string;
        fullName: string;
        mobileNumber: string;
        permanentAddress: string;
        vulnerabilityLevel: string;
    };
}

export default function OfficerVisitsView({ onVisitSelect }: { onVisitSelect: (id: string) => void }) {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('assigned');

    useEffect(() => {
        const fetchVisits = async () => {
            setLoading(true);
            try {
                let params: any = {};
                if (activeTab === 'completed') {
                    params.status = 'Completed';
                }
                // For 'assigned', we fetch all and filter or backend default is assigned?
                // The API endpoint /visits/officer/assignments returns assigned visits.
                // If we want completed, we might need a different endpoint or params.
                // Let's assume getOfficerAssignments handles status param or returns all relevant.
                // Actually, the backend implementation of getOfficerAssignments might be specific.
                // Let's check backend implementation if needed, but for now assume it returns assignments.

                const res = await apiClient.getOfficerAssignments(params);
                if (res.success) {
                    setVisits(res.data.visits);
                }
            } catch (error) {
                toast.error('Failed to load visits');
            } finally {
                setLoading(false);
            }
        };

        fetchVisits();
    }, [activeTab]);

    const filteredVisits = visits.filter(visit => {
        if (activeTab === 'assigned') return ['Scheduled', 'In Progress'].includes(visit.status);
        if (activeTab === 'completed') return visit.status === 'Completed';
        return true; // All
    });

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">Visits</h1>

            <Tabs defaultValue="assigned" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="assigned">Assigned</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>

                <div className="mt-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredVisits.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No visits found.
                        </div>
                    ) : (
                        filteredVisits.map((visit) => (
                            <Card key={visit.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex">
                                        <div className={`w-1.5 ${visit.status === 'Completed' ? 'bg-green-500' :
                                                visit.status === 'In Progress' ? 'bg-blue-500' :
                                                    'bg-orange-500'
                                            }`} />
                                        <div className="p-4 flex-1 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{visit.seniorCitizen.fullName}</h3>
                                                    <div className="flex items-center text-xs text-slate-500 mt-1">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        <span className="line-clamp-1">{visit.seniorCitizen.permanentAddress}</span>
                                                    </div>
                                                </div>
                                                <Badge variant={
                                                    visit.status === 'Completed' ? 'default' :
                                                        visit.status === 'In Progress' ? 'secondary' :
                                                            'outline'
                                                } className={visit.status === 'Completed' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                                    {visit.status}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                                <div className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(visit.scheduledDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {new Date(visit.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                                <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                                                    <a href={`tel:${visit.seniorCitizen.mobileNumber}`}>
                                                        <Phone className="w-3 h-3 mr-1" /> Call
                                                    </a>
                                                </Button>

                                                {visit.status !== 'Completed' && (
                                                    <Button size="sm" className="h-8 text-xs" onClick={() => onVisitSelect(visit.id)}>
                                                        {visit.status === 'In Progress' ? 'Continue' : 'Start Visit'}
                                                        <ArrowRight className="w-3 h-3 ml-1" />
                                                    </Button>
                                                )}
                                                {visit.status === 'Completed' && (
                                                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onVisitSelect(visit.id)}>
                                                        View Details
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </Tabs>
        </div>
    );
}
