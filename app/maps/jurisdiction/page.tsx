'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import MapComponent from '@/components/MapComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DELHI_POLICE_RANGES, DELHI_POLICE_STATIONS } from '@/lib/delhi-police-geofence';

export default function JurisdictionMapPage() {
    const [selectedRange, setSelectedRange] = useState<string | null>(null);
    const [selectedStation, setSelectedStation] = useState<any>(null);

    const getRangeColorByDistrict = (district: string): string => {
        const range = Object.values(DELHI_POLICE_RANGES).find(r =>
            r.districts.includes(district)
        );
        return range?.color || '#808080';
    };

    // Create range polygons (simplified rectangles for demo)
    const rangePolygons = Object.entries(DELHI_POLICE_RANGES).map(([key, range]) => {
        // Generate simplified boundaries based on range position
        const baseCoords = {
            CENTRAL: { lat: 28.6139, lng: 77.2090 },
            NORTH: { lat: 28.7495, lng: 77.0736 },
            SOUTH: { lat: 28.5494, lng: 77.2001 },
            EAST: { lat: 28.6500, lng: 77.3000 },
            WEST: { lat: 28.5921, lng: 77.0460 },
        }[key] || { lat: 28.6139, lng: 77.2090 };

        return {
            paths: [
                { lat: baseCoords.lat + 0.05, lng: baseCoords.lng - 0.05 },
                { lat: baseCoords.lat + 0.05, lng: baseCoords.lng + 0.05 },
                { lat: baseCoords.lat - 0.05, lng: baseCoords.lng + 0.05 },
                { lat: baseCoords.lat - 0.05, lng: baseCoords.lng - 0.05 },
            ],
            strokeColor: range.color,
            strokeOpacity: selectedRange === key ? 1 : 0.6,
            strokeWeight: selectedRange === key ? 3 : 2,
            fillColor: range.color,
            fillOpacity: selectedRange === key ? 0.3 : 0.15,
        };
    });

    // Police station markers with beat count
    const stationMarkers = DELHI_POLICE_STATIONS
        .filter(ps => !selectedRange || ps.range === selectedRange)
        .map(ps => ({
            position: ps.coordinates,
            title: ps.name,
            label: ps.beats.length.toString(),
            icon: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="${getRangeColorByDistrict(ps.district)}" stroke="#FFF" stroke-width="3"/>
            <text x="20" y="26" font-size="16" text-anchor="middle" fill="#FFF" font-weight="bold">${ps.beats.length}</text>
          </svg>
        `),
            onClick: () => setSelectedStation(ps)
        }));



    // Create range polygons (simplified rectangles for demo)

    return (
        <ProtectedRoute permissionCode="operations.jurisdiction">
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">🗺️ Jurisdiction & Beat Boundaries</h1>
                    <p className="text-gray-600">Delhi Police administrative boundaries</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-0">
                                <MapComponent
                                    center={{ lat: 28.6139, lng: 77.2090 }}
                                    zoom={11}
                                    markers={stationMarkers}
                                    polygons={rangePolygons}
                                    height="700px"
                                />
                            </CardContent>
                        </Card>

                        {/* Legend */}
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-base">Police Ranges</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(DELHI_POLICE_RANGES).map(([key, range]) => (
                                        <div
                                            key={key}
                                            className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50"
                                            onClick={() => setSelectedRange(selectedRange === key ? null : key)}
                                        >
                                            <div className="w-6 h-6 rounded" style={{ backgroundColor: range.color }}></div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{range.name}</p>
                                                <p className="text-xs text-gray-600">{range.districts.length} districts</p>
                                            </div>
                                            {selectedRange === key && <Badge variant="outline">Selected</Badge>}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Details Sidebar */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {selectedStation ? 'Police Station Details' : 'Range Overview'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedStation ? (
                                    <div className="space-y-4">
                                        <div className="text-center pb-4 border-b">
                                            <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-2xl font-bold"
                                                style={{ backgroundColor: getRangeColorByDistrict(selectedStation.district) }}>
                                                🚔
                                            </div>
                                            <h3 className="font-semibold text-lg">{selectedStation.name}</h3>
                                            <p className="text-sm text-gray-600">{selectedStation.district} District</p>
                                            <Badge className="mt-2" style={{ backgroundColor: getRangeColorByDistrict(selectedStation.district) }}>
                                                {DELHI_POLICE_RANGES[selectedStation.range as keyof typeof DELHI_POLICE_RANGES].name}
                                            </Badge>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2">Beats ({selectedStation.beats.length})</h4>
                                            <div className="space-y-2">
                                                {selectedStation.beats.map((beat: any) => (
                                                    <div key={beat.code} className="p-2 bg-gray-50 rounded">
                                                        <p className="font-semibold text-sm">{beat.code}</p>
                                                        <p className="text-xs text-gray-600">{beat.name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2">Location</h4>
                                            <p className="text-xs font-mono text-gray-600">
                                                {selectedStation.coordinates.lat.toFixed(6)}, {selectedStation.coordinates.lng.toFixed(6)}
                                            </p>
                                        </div>

                                        <button
                                            className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                            onClick={() => setSelectedStation(null)}
                                        >
                                            Close Details
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600">
                                            Delhi Police is organized into 5 ranges covering {Object.values(DELHI_POLICE_RANGES).reduce((sum, r) => sum + r.districts.length, 0)} districts.
                                        </p>

                                        <div className="space-y-3">
                                            {Object.entries(DELHI_POLICE_RANGES).map(([key, range]) => (
                                                <div key={key} className="p-3 rounded" style={{ backgroundColor: range.color + '20' }}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: range.color }}></div>
                                                        <p className="font-semibold text-sm">{range.name}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-600">
                                                        {range.districts.join(', ')}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {DELHI_POLICE_STATIONS.filter(ps => ps.range === key).length} police stations
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t">
                                            <p className="text-xs text-gray-500 text-center">
                                                Click on a police station marker to view details
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-base">Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Ranges:</span>
                                    <span className="font-semibold">5</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Districts:</span>
                                    <span className="font-semibold">
                                        {Object.values(DELHI_POLICE_RANGES).reduce((sum, r) => sum + r.districts.length, 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Police Stations:</span>
                                    <span className="font-semibold">{DELHI_POLICE_STATIONS.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Beats:</span>
                                    <span className="font-semibold">
                                        {DELHI_POLICE_STATIONS.reduce((sum, ps) => sum + ps.beats.length, 0)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
