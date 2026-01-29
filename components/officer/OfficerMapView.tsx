'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Map as MapIcon, List, Search, Phone, Navigation, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import MapComponent from '@/components/MapComponent';

interface Citizen {
    id: string;
    fullName: string;
    vulnerabilityLevel: string;
    gpsLatitude: number | null;
    gpsLongitude: number | null;
    permanentAddress: string;
    mobileNumber: string;
    photoUrl: string | null;
}

export default function OfficerMapView() {
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCitizens = async () => {
            try {
                const res = await apiClient.getNearbyCitizens();
                if (res.success) {
                    setCitizens(res.data.citizens);
                }
            } catch (error) {
                toast.error('Failed to load nearby citizens');
            } finally {
                setLoading(false);
            }
        };

        fetchCitizens();
    }, []);

    const filteredCitizens = citizens.filter(c =>
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.permanentAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Nearby Citizens</h1>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="w-4 h-4 mr-1" /> List
                    </Button>
                    <Button
                        variant={viewMode === 'map' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => setViewMode('map')}
                    >
                        <MapIcon className="w-4 h-4 mr-1" /> Map
                    </Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search by name or address..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : viewMode === 'list' ? (
                <div className="space-y-3 overflow-y-auto pb-20">
                    {filteredCitizens.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No citizens found.
                        </div>
                    ) : (
                        filteredCitizens.map((citizen) => (
                            <Card key={citizen.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-slate-900">{citizen.fullName}</h3>
                                        <Badge variant={
                                            citizen.vulnerabilityLevel === 'High' ? 'destructive' :
                                                citizen.vulnerabilityLevel === 'Medium' ? 'secondary' :
                                                    'outline'
                                        }>
                                            {citizen.vulnerabilityLevel}
                                        </Badge>
                                    </div>
                                    <div className="flex items-start text-sm text-slate-500 mb-4">
                                        <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                                        <span>{citizen.permanentAddress}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1" asChild>
                                            <a href={`tel:${citizen.mobileNumber}`}>
                                                <Phone className="w-4 h-4 mr-2" /> Call
                                            </a>
                                        </Button>
                                        <Button size="sm" className="flex-1" asChild>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${citizen.gpsLatitude},${citizen.gpsLongitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Navigation className="w-4 h-4 mr-2" /> Directions
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            ) : (
                <div className="flex-1 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 min-h-[400px]">
                    <MapComponent
                        height="100%"
                        markers={filteredCitizens.map(c => ({
                            position: { lat: c.gpsLatitude || 28.6139, lng: c.gpsLongitude || 77.2090 },
                            title: c.fullName,
                            onClick: () => {
                                // Handle marker click if needed
                            }
                        }))}
                        layers={{
                            showDistricts: true,
                            showRanges: true,
                            showSubDivisions: true,
                            showPsBoundaries: true,
                            showPsPoints: true
                        }}
                    />
                </div>
            )}
        </div>
    );
}
