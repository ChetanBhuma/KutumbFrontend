'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import MapComponent from '@/components/MapComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Filter, AlertTriangle, Layers, List } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { CitizenDetailSheet } from '@/components/citizens/citizen-detail-sheet';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Badge } from '@/components/ui/badge';
import { useMasterData } from '@/hooks/use-master-data';

interface District {
    id: string;
    name: string;
    range: string;
}

interface PoliceStation {
    id: string;
    name: string;
    districtId: string;
}

interface Beat {
    id: string;
    name: string;
    policeStationId: string;
}

export default function PendingVerificationMapPage() {
    const router = useRouter();
    // Layer States
    const [layers, setLayers] = useState({
        showDistricts: true,
        showRanges: false,
        showSubDivisions: false,
        showPsBoundaries: true,
        showPsPoints: true,
    });

    // Filter States
    const [selectedRange, setSelectedRange] = useState<string>('all');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
    const [selectedPS, setSelectedPS] = useState<string>('all');
    const [selectedBeat, setSelectedBeat] = useState<string>('all');

    // Data States
    // Data States
    const {
        districts,
        getPoliceStationsByDistrict,
        getBeatsByPoliceStation,
        loading: masterDataLoading
    } = useMasterData();

    const [citizens, setCitizens] = useState<any[]>([]);
    const [loadingCitizens, setLoadingCitizens] = useState(false);

    // Sheet State
    const [selectedCitizen, setSelectedCitizen] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Derived Data
    const ranges = useMemo(() => {
        const uniqueRanges = Array.from(new Set(districts.map(d => d.range).filter(Boolean)));
        return uniqueRanges.sort();
    }, [districts]);

    const filteredDistricts = useMemo(() => {
        if (selectedRange === 'all') return districts;
        return districts.filter(d => d.range === selectedRange);
    }, [districts, selectedRange]);

    const currentPoliceStations = useMemo(() => {
        if (selectedDistrict === 'all') return [];
        return getPoliceStationsByDistrict(selectedDistrict);
    }, [selectedDistrict, getPoliceStationsByDistrict]);

    const currentBeats = useMemo(() => {
        if (selectedPS === 'all') return [];
        return getBeatsByPoliceStation(selectedPS);
    }, [selectedPS, getBeatsByPoliceStation]);

    // Statistics
    const stats = useMemo(() => {
        return {
            total: citizens.length,
            pending: citizens.filter(c => c.idVerificationStatus === 'Pending').length,
        };
    }, [citizens]);

    // Reset dependent filters when parent filter changes
    useEffect(() => {
        setSelectedPS('all');
        setSelectedBeat('all');
    }, [selectedDistrict]);

    useEffect(() => {
        setSelectedBeat('all');
    }, [selectedPS]);

    // Fetch Citizens based on filters - ONLY PENDING VERIFICATION
    useEffect(() => {
        const fetchCitizens = async () => {
            try {
                setLoadingCitizens(true);
                const params: any = {
                    limit: 100, // Backend max limit is 100
                    verificationStatus: 'Pending' // Only fetch pending verification citizens
                };

                if (selectedRange !== 'all') params.rangeId = selectedRange;
                if (selectedDistrict !== 'all') params.districtId = selectedDistrict;
                if (selectedPS !== 'all') params.policeStationId = selectedPS;
                if (selectedBeat !== 'all') params.beatId = selectedBeat;

                const res = await apiClient.getCitizens(params);
                if (res.success) {
                    setCitizens(res.data.citizens);
                }
            } catch (error) {
                console.error('Failed to fetch citizens:', error);
            } finally {
                setLoadingCitizens(false);
            }
        };

        const timer = setTimeout(fetchCitizens, 500);
        return () => clearTimeout(timer);
    }, [selectedRange, selectedDistrict, selectedPS, selectedBeat]);

    const citizenMarkers = useMemo(() => {
        return citizens
            .filter(c => c.gpsLatitude && c.gpsLongitude)
            .map(c => ({
                position: { lat: c.gpsLatitude, lng: c.gpsLongitude },
                title: c.fullName,
                onClick: () => {
                    setSelectedCitizen(c);
                    setIsSheetOpen(true);
                }
            }));
    }, [citizens]);

    return (
        <ProtectedRoute permissionCode="citizens.map.pending">
            <DashboardLayout
                title="Pending Verification Map"
                description="Citizens awaiting verification review"
                currentPath="/citizens/map/pending"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <AlertTriangle className="h-8 w-8 text-yellow-600" />
                            Pending Verification Map
                        </h1>
                        <p className="text-muted-foreground">Citizens awaiting verification review</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push('/citizens/map')}>
                            All Citizens
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/citizens')}>
                            <List className="h-4 w-4 mr-2" /> List View
                        </Button>
                        <Button onClick={() => router.push('/citizens/register')}>+ Register Citizen</Button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground mt-1">Citizens awaiting verification</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">On Map</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{citizenMarkers.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">With GPS coordinates</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-20rem)]">
                    {/* Sidebar Controls */}
                    <Card className="w-full lg:w-80 flex-shrink-0 overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" /> Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Status Badge */}
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <Badge className="bg-yellow-100 text-yellow-800 mb-2">
                                    Pending Verification Only
                                </Badge>
                                <p className="text-xs text-yellow-700">
                                    Showing only citizens with pending verification status
                                </p>
                            </div>

                            {/* Filters */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Range</Label>
                                    <Select value={selectedRange} onValueChange={setSelectedRange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Ranges</SelectItem>
                                            {ranges.map(range => (
                                                <SelectItem key={`range-${range}`} value={range}>{range}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>District</Label>
                                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select District" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Districts</SelectItem>
                                            {filteredDistricts.map(d => (
                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Police Station</Label>
                                    <Select value={selectedPS} onValueChange={setSelectedPS} disabled={selectedDistrict === 'all'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Police Station" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Stations</SelectItem>
                                            {currentPoliceStations.map((ps: any) => (
                                                <SelectItem key={ps.id} value={ps.id}>{ps.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Beat</Label>
                                    <Select value={selectedBeat} onValueChange={setSelectedBeat} disabled={selectedPS === 'all'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Beat" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Beats</SelectItem>
                                            {currentBeats.map((beat: any) => (
                                                <SelectItem key={beat.id} value={beat.id}>{beat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-medium mb-3 flex items-center gap-2">
                                    <Layers className="h-4 w-4" /> Map Layers
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="districts" className="text-sm font-normal">Districts</Label>
                                        <Switch
                                            id="districts"
                                            checked={layers.showDistricts}
                                            onCheckedChange={(checked) => setLayers(prev => ({ ...prev, showDistricts: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="ranges" className="text-sm font-normal">Ranges</Label>
                                        <Switch
                                            id="ranges"
                                            checked={layers.showRanges}
                                            onCheckedChange={(checked) => setLayers(prev => ({ ...prev, showRanges: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="ps-boundaries" className="text-sm font-normal">PS Boundaries</Label>
                                        <Switch
                                            id="ps-boundaries"
                                            checked={layers.showPsBoundaries}
                                            onCheckedChange={(checked) => setLayers(prev => ({ ...prev, showPsBoundaries: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="ps-points" className="text-sm font-normal">PS Locations</Label>
                                        <Switch
                                            id="ps-points"
                                            checked={layers.showPsPoints}
                                            onCheckedChange={(checked) => setLayers(prev => ({ ...prev, showPsPoints: checked }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Map Area */}
                    <div className="flex-1 rounded-xl overflow-hidden border shadow-sm relative">
                        {loadingCitizens && (
                            <div className="absolute top-4 right-4 z-10 bg-white/90 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 text-sm font-medium">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading pending citizens...
                            </div>
                        )}
                        <MapComponent
                            height="100%"
                            layers={layers}
                            markers={citizenMarkers}
                        />
                    </div>
                </div>

                <CitizenDetailSheet
                    citizen={selectedCitizen}
                    open={isSheetOpen}
                    onOpenChange={setIsSheetOpen}
                />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
