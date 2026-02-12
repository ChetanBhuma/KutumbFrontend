'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapComponentProps {
    center?: { lat: number; lng: number };
    zoom?: number;
    markers?: Array<{
        position: { lat: number; lng: number };
        title: string;
        label?: string;
        icon?: string;
        onClick?: () => void;
    }>;
    polygons?: Array<{
        paths: Array<{ lat: number; lng: number }>;
        strokeColor?: string;
        strokeOpacity?: number;
        strokeWeight?: number;
        fillColor?: string;
        fillOpacity?: number;
    }>;
    onMapClick?: (lat: number, lng: number) => void;
    height?: string;
    layers?: {
        showDistricts?: boolean;
        showRanges?: boolean;
        showSubDivisions?: boolean;
        showPsBoundaries?: boolean;
        showPsPoints?: boolean;
    };
}

export default function MapComponent({
    center = { lat: 28.6139, lng: 77.2090 }, // Delhi center
    zoom = 11,
    markers = [],
    polygons = [],
    onMapClick,
    height = '500px',
    layers = {
        showDistricts: true,
        showRanges: false,
        showSubDivisions: false,
        showPsBoundaries: true,
        showPsPoints: true,
    },
}: MapComponentProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    // Use refs instead of state for markers/polygons to prevent re-renders loops
    const markersRef = useRef<google.maps.Marker[]>([]);
    const polygonsRef = useRef<google.maps.Polygon[]>([]);
    const loadedLayersRef = useRef<Set<string>>(new Set());

    // Initialize Google Maps
    useEffect(() => {
        const initMap = async () => {
            const loader = new Loader({
                apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
                version: 'weekly',
                libraries: ['places', 'geometry']
            });

            try {
                await loader.load();

                if (mapRef.current) {
                    const newMap = new google.maps.Map(mapRef.current, {
                        center,
                        zoom,
                        mapTypeControl: true,
                        streetViewControl: true,
                        fullscreenControl: true,
                        zoomControl: true,
                    });

                    setMap(newMap);

                    // Add click listener
                    if (onMapClick) {
                        newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
                            if (e.latLng) {
                                onMapClick(e.latLng.lat(), e.latLng.lng());
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading Google Maps:', error);
            }
        };

        initMap();
    }, []);

    // Update markers
    useEffect(() => {
        if (!map) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));

        // Add new markers
        const newMarkers = markers.map(markerData => {
            const marker = new google.maps.Marker({
                position: markerData.position,
                map,
                title: markerData.title,
                label: markerData.label,
                icon: markerData.icon,
            });

            if (markerData.onClick) {
                marker.addListener('click', markerData.onClick);
            }

            return marker;
        });

        markersRef.current = newMarkers;

        return () => {
            // Optional: clean up markers on unmount if needed,
            // but we rely on next render to clear them normally.
            // newMarkers.forEach(marker => marker.setMap(null));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, markers]);

    // Update polygons
    useEffect(() => {
        if (!map) return;

        // Clear existing polygons
        polygonsRef.current.forEach(polygon => polygon.setMap(null));

        // Add new polygons
        const newPolygons = polygons.map(polygonData => {
            return new google.maps.Polygon({
                paths: polygonData.paths,
                strokeColor: polygonData.strokeColor || '#FF0000',
                strokeOpacity: polygonData.strokeOpacity || 0.8,
                strokeWeight: polygonData.strokeWeight || 2,
                fillColor: polygonData.fillColor || '#FF0000',
                fillOpacity: polygonData.fillOpacity || 0.2,
                map,
            });
        });

        polygonsRef.current = newPolygons;

        return () => {
            // Optional cleanup
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, polygons]);

    // Update center and zoom without causing re-renders
    const isFirstRun = useRef(true);
    useEffect(() => {
        if (map) {
            // Only update if changed significantly to avoid jitter loops
            // or just trust the props if we are controlled
            map.setCenter(center);
            map.setZoom(zoom);
        }
    }, [map, center, zoom]);

    // Load and Manage GeoJSON layers
    useEffect(() => {
        if (!map) return;

        const loadLayer = async (apiMethod: () => Promise<any>, type: string, forceReload = false) => {
            // Check if already loaded (skip if not forcing reload)
            if (!forceReload && loadedLayersRef.current.has(type)) {

                return;
            }



            try {
                // Import apiClient dynamically to avoid circular deps if any
                const { default: apiClient } = await import('@/lib/api-client');
                const data = await apiMethod();



                if (data) {
                    const features = map.data.addGeoJson(data);


                    features.forEach((feature, index) => {
                        // Check if LAYER_TYPE is already set in properties
                        const existingType = feature.getProperty('LAYER_TYPE');
                        if (!existingType) {
                            feature.setProperty('LAYER_TYPE', type);
                        }

                        if (index < 3 || type === 'PS_POINT') { // Log first 3 or all PS_POINT
                            // Debug logging removed
                        }
                    });

                    loadedLayersRef.current.add(type);

                } else {
                    console.warn(`⚠️ No data received for ${type}`);
                }
            } catch (e) {
                console.error(`❌ Failed to load ${type}:`, e);
            }
        };

        // Load layers only if they are requested and not yet loaded
        if (layers.showDistricts) loadLayer(async () => (await import('@/lib/api-client')).default.getGeoDistricts(), 'DISTRICT');
        if (layers.showRanges) loadLayer(async () => (await import('@/lib/api-client')).default.getGeoRanges(), 'RANGE');
        if (layers.showSubDivisions) loadLayer(async () => (await import('@/lib/api-client')).default.getGeoSubDivisions(), 'SUB_DIVISION');
        if (layers.showPsBoundaries) loadLayer(async () => (await import('@/lib/api-client')).default.getGeoBoundaries(), 'PS_BOUNDARY');
        if (layers.showPsPoints) {
            loadLayer(async () => (await import('@/lib/api-client')).default.getGeoPoliceStations(), 'PS_POINT');
        }

    }, [map, layers]);

    // Update styles and visibility
    useEffect(() => {
        if (!map) return;

        map.data.setStyle((feature) => {
            const type = feature.getProperty('LAYER_TYPE');
            let isVisible = false;

            if (type === 'DISTRICT') isVisible = !!layers.showDistricts;
            else if (type === 'RANGE') isVisible = !!layers.showRanges;
            else if (type === 'SUB_DIVISION') isVisible = !!layers.showSubDivisions;
            else if (type === 'PS_BOUNDARY') isVisible = !!layers.showPsBoundaries;
            else if (type === 'PS_POINT') isVisible = !!layers.showPsPoints;

            if (!isVisible) return { visible: false };

            // Styling based on type
            switch (type) {
                case 'DISTRICT':
                    return {
                        fillColor: 'transparent',
                        strokeColor: '#000000',
                        strokeWeight: 3,
                        clickable: false,
                        zIndex: 10
                    };
                case 'RANGE':
                    return {
                        fillColor: 'transparent',
                        strokeColor: '#800080', // Purple
                        strokeWeight: 2,
                        clickable: false,
                        zIndex: 20
                    };
                case 'SUB_DIVISION':
                    return {
                        fillColor: 'transparent',
                        strokeColor: '#FFA500', // Orange
                        strokeWeight: 1.5,
                        clickable: false,
                        zIndex: 30
                    };
                case 'PS_BOUNDARY':
                    return {
                        fillColor: 'rgba(0, 0, 255, 0.05)',
                        strokeColor: '#4a90e2',
                        strokeWeight: 1,
                        clickable: true,
                        zIndex: 40
                    };
                case 'PS_POINT':
                    return {
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: '#FF0000',
                            fillOpacity: 1,
                            strokeColor: '#FFFFFF',
                            strokeWeight: 2,
                        },
                        clickable: true,
                        zIndex: 100,
                        visible: true
                    };
                default:
                    return { visible: false };
            }
        });

    }, [map, layers]);

    // Click listener (only needs to be added once)
    useEffect(() => {
        if (!map) return;

        const listener = map.data.addListener('click', (event: google.maps.Data.MouseEvent) => {
            const type = event.feature.getProperty('LAYER_TYPE');

            // Only show info for clickable layers
            if (type !== 'PS_POINT' && type !== 'PS_BOUNDARY') return;

            const name = event.feature.getProperty('NAME') || event.feature.getProperty('POL_STN_NM');
            const district = event.feature.getProperty('DISTRICT') || event.feature.getProperty('DIST_NM');

            if (name) {
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px; color: black;">
                            <h3 style="font-weight: bold; margin-bottom: 4px;">${name}</h3>
                            ${district ? `<p style="font-size: 12px; color: #666;">District: ${district}</p>` : ''}
                            <p style="font-size: 10px; color: #999; margin-top: 4px;">${type === 'PS_POINT' ? 'Police Station' : 'Jurisdiction'}</p>
                        </div>
                    `,
                    position: event.latLng
                });
                infoWindow.open(map);
            }
        });

        return () => {
            google.maps.event.removeListener(listener);
        };
    }, [map]);

    return (
        <div
            ref={mapRef}
            style={{ width: '100%', height }}
            className="rounded-lg border border-gray-300"
        />
    );
}
