'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Navigation, Compass } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Haversine formula to calculate distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

function NearbyCitizensContent() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [citizens, setCitizens] = useState<any[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [permStatus, setPermStatus] = useState<string>('prompt');

    useEffect(() => {
        // Mock default location for testing if geolocation fails or is blocked (New Delhi center)
        const defaultLocation = { lat: 28.6139, lng: 77.2090 };

        // Get location immediately
        if (navigator.geolocation) {
            navigator.permissions?.query({ name: 'geolocation' }).then(result => {
                setPermStatus(result.state);
            });

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    toast({
                        title: "Location Access Required for Accuracy",
                        description: "Using default New Delhi location. Enable GPS for accurate results.",
                    });
                    // Fallback for testing/demo
                    setUserLocation(defaultLocation);
                }
            );
        } else {
            setUserLocation(defaultLocation);
        }

        const fetchData = async () => {
            try {
                const res = await apiClient.getNearbyCitizens();
                if (res.success) {
                    setCitizens(res.data.citizens);
                }
            } catch (error) {
                console.error(error);
                toast({ title: "Error fetching data", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    // Calculate distances and sort when we have both citizens and userLocation
    const sortedCitizens = userLocation ? citizens.map(c => ({
        ...c,
        distance: (c.gpsLatitude && c.gpsLongitude)
            ? getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, c.gpsLatitude, c.gpsLongitude)
            : 99999
    })).sort((a, b) => a.distance - b.distance) : citizens;

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-4 bg-slate-50 min-h-screen pb-20">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="h-6 w-6 text-blue-600" />
                    Nearby Citizens
                </h1>
                <p className="text-sm text-muted-foreground">
                    Sorted by distance from your current location
                </p>
            </div>

            <div className="space-y-4">
                {sortedCitizens.map((citizen) => (
                    <Card key={citizen.id} className="overflow-hidden">
                        <CardContent className="p-0">
                            {/* Map Preview Header - Placeholder or simple color bar */}
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 w-full" />

                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{citizen.fullName}</h3>
                                        {userLocation && citizen.distance < 9999 && (
                                            <Badge variant="secondary" className="mt-1">
                                                {citizen.distance.toFixed(1)} km away
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${citizen.gpsLatitude},${citizen.gpsLongitude}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Button size="icon" className="rounded-full h-10 w-10 bg-blue-600 hover:bg-blue-700 shadow-sm">
                                                <Navigation className="h-5 w-5 text-white" />
                                            </Button>
                                        </a>
                                        <span className="text-[10px] text-muted-foreground">Navigate</span>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{citizen.permanentAddress}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {citizens.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>No citizens with GPS location found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function NearbyCitizensPage() {
    return (
        <ProtectedRoute permissionCode="citizens.read">
            <NearbyCitizensContent />
        </ProtectedRoute>
    );
}
