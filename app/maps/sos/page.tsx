'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import MapComponent from '@/components/MapComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { DELHI_POLICE_RANGES, DELHI_POLICE_STATIONS, DELHI_BOUNDARY, getRangeColorByDistrict } from '@/lib/delhi-police-geofence';

export default function SOSMapPage() {


    const [selectedRange, setSelectedRange] = useState<string>('ALL');
    const [selectedAlert, setSelectedAlert] = useState<any>(null);
    const fetchAlerts = useCallback(async () => {
        const response = await apiClient.getActiveAlerts();
        if (response.success) {
            return { data: response.data.alerts };
        }
        return { data: [] };
    }, []);

    const { data: alertsData, loading, refetch: refetchAlerts } = useApiQuery<{ data: any[] }>(fetchAlerts, {
        refetchOnMount: true,
        refetchInterval: 15000
    });

    const alerts = alertsData?.data || [];

    const filteredAlerts = selectedRange === 'ALL'
        ? alerts
        : alerts.filter(alert => {
            const ps = DELHI_POLICE_STATIONS.find(ps =>
                ps.id === alert.seniorCitizen?.policeStationId
            );
            return ps?.range === selectedRange;
        });

    // Create markers for SOS alerts
    const sosMarkers = filteredAlerts.map(alert => ({
        position: {
            lat: alert.latitude,
            lng: alert.longitude
        },
        title: `SOS: ${alert.seniorCitizen?.fullName}`,
        label: '🚨',
        icon: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#DC2626" stroke="#FFF" stroke-width="3"/>
          <text x="20" y="28" font-size="20" text-anchor="middle" fill="#FFF">!</text>
        </svg>
      `),
        onClick: () => setSelectedAlert(alert)
    }));

    // Add police station markers
    const policeStationMarkers = DELHI_POLICE_STATIONS
        .filter(ps => selectedRange === 'ALL' || ps.range === selectedRange)
        .map(ps => ({
            position: ps.coordinates,
            title: ps.name,
            label: '🚔',
            icon: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="#1E40AF" stroke="#FFF" stroke-width="2"/>
            <text x="15" y="20" font-size="16" text-anchor="middle" fill="#FFF">P</text>
          </svg>
        `),
        }));

    const allMarkers = [...sosMarkers, ...policeStationMarkers];

    // Delhi boundary polygon
    const delhiBoundaryPolygon = {
        paths: DELHI_BOUNDARY,
        strokeColor: '#1E40AF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.05,
    };

    return (
        <ProtectedRoute permissionCode="sos.read">
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-red-600">🗺️ SOS Alert Map</h1>
                        <p className="text-gray-600">Real-time emergency alert tracking</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-red-600">{alerts.length} Active Alerts</Badge>
                        <Select value={selectedRange} onValueChange={setSelectedRange}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Ranges</SelectItem>
                                {Object.entries(DELHI_POLICE_RANGES).map(([key, range]) => (
                                    <SelectItem key={key} value={key}>{range.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={refetchAlerts}>
                            🔄 Refresh
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-0">
                                <MapComponent
                                    center={{ lat: 28.6139, lng: 77.2090 }}
                                    zoom={11}
                                    markers={allMarkers}
                                    polygons={[delhiBoundaryPolygon]}
                                    height="600px"
                                />
                            </CardContent>
                        </Card>

                        {/* Legend */}
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-base">Map Legend</CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🚨</span>
                                    <span>SOS Alert</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🚔</span>
                                    <span>Police Station</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-500 bg-opacity-20 border border-blue-700"></div>
                                    <span>Delhi Boundary</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Alert Details Sidebar */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Alert Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedAlert ? (
                                    <div className="space-y-4">
                                        <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                                            <h3 className="font-semibold text-red-900 mb-2">EMERGENCY ALERT</h3>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Citizen</p>
                                                    <p className="font-semibold">{selectedAlert.seniorCitizen?.fullName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Phone</p>
                                                    <p className="font-semibold">{selectedAlert.seniorCitizen?.mobileNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Age & Risk</p>
                                                    <p className="font-semibold">
                                                        {selectedAlert.seniorCitizen?.age} years •
                                                        <Badge className="ml-2" variant="outline">
                                                            {selectedAlert.seniorCitizen?.vulnerabilityLevel}
                                                        </Badge>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Location</p>
                                                    <p className="font-mono text-xs">{selectedAlert.address}</p>
                                                    <p className="font-mono text-xs text-gray-500">
                                                        {selectedAlert.latitude.toFixed(6)}, {selectedAlert.longitude.toFixed(6)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Time</p>
                                                    <p className="font-semibold">
                                                        {new Date(selectedAlert.createdAt).toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-red-600">
                                                        {Math.floor((Date.now() - new Date(selectedAlert.createdAt).getTime()) / 60000)} minutes ago
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 space-y-2">
                                                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                                                    Respond to Alert
                                                </Button>
                                                <Button variant="outline" className="w-full" onClick={() => window.open(`https://maps.google.com/?q=${selectedAlert.latitude},${selectedAlert.longitude}`, '_blank')}>
                                                    📍 Open in Google Maps
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        Click on a map marker to view alert details
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Active Alerts List */}
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-base">All Active Alerts</CardTitle>
                            </CardHeader>
                            <CardContent className="max-h-96 overflow-y-auto space-y-2">
                                {filteredAlerts.map(alert => (
                                    <div
                                        key={alert.id}
                                        className="p-3 bg-red-50 rounded cursor-pointer hover:bg-red-100 transition-colors"
                                        onClick={() => setSelectedAlert(alert)}
                                    >
                                        <p className="font-semibold text-sm">{alert.seniorCitizen?.fullName}</p>
                                        <p className="text-xs text-gray-600">{alert.address}</p>
                                        <p className="text-xs text-red-600">
                                            {Math.floor((Date.now() - new Date(alert.createdAt).getTime()) / 60000)}m ago
                                        </p>
                                    </div>
                                ))}
                                {filteredAlerts.length === 0 && (
                                    <p className="text-center text-gray-500 py-4 text-sm">
                                        No active alerts
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
