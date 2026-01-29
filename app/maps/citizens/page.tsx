'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import MapComponent from '@/components/MapComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { DELHI_POLICE_STATIONS, getRangeColorByDistrict, findNearestPoliceStation } from '@/lib/delhi-police-geofence';

export default function CitizensMapPage() {


    const [filteredCitizens, setFilteredCitizens] = useState<any[]>([]);
    const [selectedCitizen, setSelectedCitizen] = useState<any>(null);
    const [vulnerabilityFilter, setVulnerabilityFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const fetchCitizens = useCallback(async () => {
        const response = await apiClient.getCitizens({ limit: 500 });
        if (response.success) {
            // Add mock GPS coordinates (in production, these would come from addresses)
            const citizensWithCoords = response.data.citizens.map((c: any) => ({
                ...c,
                latitude: 28.6139 + (Math.random() - 0.5) * 0.3,
                longitude: 77.2090 + (Math.random() - 0.5) * 0.3,
            }));
            return { data: { citizens: citizensWithCoords } };
        }
        return { data: { citizens: [] } };
    }, []);

    const { data: citizensData, loading } = useApiQuery<{ data: { citizens: any[] } }>(fetchCitizens, { refetchOnMount: true });
    const citizens = citizensData?.data?.citizens || [];

    useEffect(() => {
        let filtered = citizens;

        if (vulnerabilityFilter !== 'ALL') {
            filtered = filtered.filter(c => c.vulnerabilityLevel === vulnerabilityFilter);
        }

        if (search) {
            filtered = filtered.filter(c =>
                c.fullName.toLowerCase().includes(search.toLowerCase()) ||
                c.mobileNumber.includes(search)
            );
        }

        setFilteredCitizens(filtered);
    }, [citizens, vulnerabilityFilter, search]);

    const getMarkerColor = (vulnerabilityLevel: string) => {
        switch (vulnerabilityLevel) {
            case 'High': return '#DC2626';
            case 'Medium': return '#F59E0B';
            case 'Low': return '#10B981';
            default: return '#6B7280';
        }
    };

    // Create markers for citizens
    const citizenMarkers = filteredCitizens.map(citizen => ({
        position: {
            lat: citizen.latitude,
            lng: citizen.longitude
        },
        title: citizen.fullName,
        icon: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${getMarkerColor(citizen.vulnerabilityLevel)}" stroke="#FFF" stroke-width="2"/>
          <text x="16" y="21" font-size="14" text-anchor="middle" fill="#FFF" font-weight="bold">👤</text>
        </svg>
      `),
        onClick: () => setSelectedCitizen(citizen)
    }));

    // Add police station markers
    const psMarkers = DELHI_POLICE_STATIONS.map(ps => ({
        position: ps.coordinates,
        title: ps.name,
        icon: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#1E40AF" stroke="#FFF" stroke-width="2" opacity="0.7"/>
        </svg>
      `),
    }));

    const allMarkers = [...citizenMarkers, ...psMarkers];

    // Statistics
    const stats = {
        total: filteredCitizens.length,
        high: filteredCitizens.filter(c => c.vulnerabilityLevel === 'High').length,
        medium: filteredCitizens.filter(c => c.vulnerabilityLevel === 'Medium').length,
        low: filteredCitizens.filter(c => c.vulnerabilityLevel === 'Low').length,
    };

    return (
        <ProtectedRoute permissionCode="operations.jurisdiction">
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">👥 Citizens Location Map</h1>
                    <p className="text-gray-600">Geographic distribution of senior citizens</p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                            <p className="text-sm text-gray-600">Total Citizens</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-red-600">{stats.high}</p>
                            <p className="text-sm text-gray-600">High Risk</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-yellow-600">{stats.medium}</p>
                            <p className="text-sm text-gray-600">Medium Risk</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-green-600">{stats.low}</p>
                            <p className="text-sm text-gray-600">Low Risk</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map */}
                    <div className="lg:col-span-2">
                        <Card className="mb-4">
                            <CardContent className="pt-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search by name or phone..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Select value={vulnerabilityFilter} onValueChange={setVulnerabilityFilter}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Levels</SelectItem>
                                            <SelectItem value="High">High Risk</SelectItem>
                                            <SelectItem value="Medium">Medium Risk</SelectItem>
                                            <SelectItem value="Low">Low Risk</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-0">
                                <MapComponent
                                    center={{ lat: 28.6139, lng: 77.2090 }}
                                    zoom={12}
                                    markers={allMarkers}
                                    height="600px"
                                />
                            </CardContent>
                        </Card>

                        {/* Legend */}
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-base">Map Legend</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs">👤</div>
                                    <span>High Risk Citizen</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-white text-xs">👤</div>
                                    <span>Medium Risk</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs">👤</div>
                                    <span>Low Risk</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-900 opacity-70"></div>
                                    <span>Police Station</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Citizen Details Sidebar */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Citizen Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedCitizen ? (
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-4xl mx-auto mb-2">
                                                {selectedCitizen.photoUrl ? (
                                                    <img src={selectedCitizen.photoUrl} alt="" className="rounded-full" />
                                                ) : (
                                                    selectedCitizen.fullName.charAt(0)
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-lg">{selectedCitizen.fullName}</h3>
                                            <Badge className={
                                                selectedCitizen.vulnerabilityLevel === 'High' ? 'bg-red-600' :
                                                    selectedCitizen.vulnerabilityLevel === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'
                                            }>
                                                {selectedCitizen.vulnerabilityLevel} Risk
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <p className="text-gray-600">Age & Gender</p>
                                                <p className="font-semibold">{selectedCitizen.age} years, {selectedCitizen.gender}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Phone</p>
                                                <p className="font-semibold">{selectedCitizen.mobileNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Address</p>
                                                <p className="font-semibold text-xs">{selectedCitizen.permanentAddress}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">GPS Coordinates</p>
                                                <p className="font-mono text-xs">
                                                    {selectedCitizen.latitude?.toFixed(6)}, {selectedCitizen.longitude?.toFixed(6)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Nearest Police Station</p>
                                                <p className="font-semibold text-xs">
                                                    {findNearestPoliceStation(selectedCitizen.latitude, selectedCitizen.longitude).policeStation.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    ~{findNearestPoliceStation(selectedCitizen.latitude, selectedCitizen.longitude).distance.toFixed(2)} km away
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                                                View Full Profile
                                            </button>
                                            <button className="w-full px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                                                Schedule Visit
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        Click on a citizen marker to view details
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
