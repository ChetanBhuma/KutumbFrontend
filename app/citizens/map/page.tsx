'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import MapComponent from '@/components/MapComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Filter, Layers, List, AlertCircle, RefreshCw, Download } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { CitizenDetailSheet } from '@/components/citizens/citizen-detail-sheet';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useMasterData } from '@/hooks/use-master-data';
import { useToast } from '@/components/ui/use-toast';
import { storage, useDebounce, performanceMonitor } from '@/lib/performance';

// Type Definitions
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

interface Citizen {
    id: string;
    fullName: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
    [key: string]: any;
}

interface LayerSettings {
    showDistricts: boolean;
    showRanges: boolean;
    showSubDivisions: boolean;
    showPsBoundaries: boolean;
    showPsPoints: boolean;
}

interface CitizenMarker {
    position: { lat: number; lng: number };
    title: string;
    onClick: () => void;
}

interface CachedCitizenData {
    filterKey: string;
    citizens: Citizen[];
    timestamp: number;
}

// Constants
const CACHE_DURATION_MINUTES = 5; // Cache citizens for 5 minutes
const CACHE_KEY_PREFIX = 'citizen_map_';
const FILTER_CACHE_KEY = 'citizen_map_filters';

// Utility functions for caching
const generateFilterKey = (range: string, district: string, ps: string, beat: string): string => {
    return `${range}_${district}_${ps}_${beat}`;
};

const getCachedCitizenData = (filterKey: string): Citizen[] | null => {
    const cached = storage.get<CachedCitizenData>(`${CACHE_KEY_PREFIX}${filterKey}`);
    return cached?.citizens || null;
};

const setCachedCitizenData = (filterKey: string, citizens: Citizen[]): void => {
    const cacheData: CachedCitizenData = {
        filterKey,
        citizens,
        timestamp: Date.now(),
    };
    storage.set(`${CACHE_KEY_PREFIX}${filterKey}`, cacheData, CACHE_DURATION_MINUTES);
};

const DEFAULT_FILTERS = { range: 'all', district: 'all', ps: 'all', beat: 'all' };
const DEFAULT_LAYERS: LayerSettings = {
    showDistricts: true,
    showRanges: false,
    showSubDivisions: false,
    showPsBoundaries: true,
    showPsPoints: true,
};

const saveFilters = (range: string, district: string, ps: string, beat: string) => {
    storage.set(FILTER_CACHE_KEY, { range, district, ps, beat }, 60); // Save for 1 hour
};

export default function CitizenMapPage() {
    const router = useRouter();
    const { toast } = useToast();
    const isMountedRef = useRef(false);

    // Layer States (initialized with default, loaded in useEffect)
    const [layers, setLayers] = useState<LayerSettings>(DEFAULT_LAYERS);

    // Filter States
    const [selectedRange, setSelectedRange] = useState<string>(DEFAULT_FILTERS.range);
    const [selectedDistrict, setSelectedDistrict] = useState<string>(DEFAULT_FILTERS.district);
    const [selectedPS, setSelectedPS] = useState<string>(DEFAULT_FILTERS.ps);
    const [selectedBeat, setSelectedBeat] = useState<string>(DEFAULT_FILTERS.beat);

    // Load saved settings on mount
    useEffect(() => {
        const savedLayers = storage.get<LayerSettings>('citizen_map_layers');
        if (savedLayers) {
            setLayers(savedLayers);
        }

        const savedFilters = storage.get<{
            range: string;
            district: string;
            ps: string;
            beat: string;
        }>(FILTER_CACHE_KEY);

        if (savedFilters) {
            setSelectedRange(savedFilters.range);
            setSelectedDistrict(savedFilters.district);
            setSelectedPS(savedFilters.ps);
            setSelectedBeat(savedFilters.beat);
        }
    }, []);

    // Debounce filters to reduce API calls
    const debouncedRange = useDebounce(selectedRange, 300);
    const debouncedDistrict = useDebounce(selectedDistrict, 300);
    const debouncedPS = useDebounce(selectedPS, 300);
    const debouncedBeat = useDebounce(selectedBeat, 300);

    // Data States
    const {
        districts,
        getPoliceStationsByDistrict,
        getBeatsByPoliceStation,
        loading: masterDataLoading,
        error: masterDataError
    } = useMasterData();

    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const [loadingCitizens, setLoadingCitizens] = useState(false);
    const [citizensError, setCitizensError] = useState<string | null>(null);

    // Sheet State
    const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Cache statistics
    const [cacheHitCount, setCacheHitCount] = useState(0);
    const [cacheEnabled, setCacheEnabled] = useState(true);

    // Save layer settings whenever they change
    useEffect(() => {
        if (isMountedRef.current) {
            storage.set('citizen_map_layers', layers, 60);
        }
    }, [layers]);

    // Set mounted ref
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Safe array access with null checks
    const safeDistricts = useMemo(() => {
        return Array.isArray(districts) ? districts : [];
    }, [districts]);

    // Derive unique ranges with proper null handling - MEMOIZED
    const ranges = useMemo(() => {
        try {
            if (!Array.isArray(safeDistricts) || safeDistricts.length === 0) {
                return [];
            }

            const rangeSet = new Set<string>();
            safeDistricts.forEach((district) => {
                if (district?.range && typeof district.range === 'string') {
                    rangeSet.add(district.range);
                }
            });

            return Array.from(rangeSet).sort();
        } catch (error) {
            console.error('Error deriving ranges:', error);
            return [];
        }
    }, [safeDistricts]);

    // Filter districts based on selected range - MEMOIZED
    const filteredDistricts = useMemo(() => {
        try {
            if (!Array.isArray(safeDistricts)) {
                return [];
            }

            if (debouncedRange === 'all') {
                return safeDistricts;
            }

            return safeDistricts.filter(
                (d) => d?.range === debouncedRange
            );
        } catch (error) {
            console.error('Error filtering districts:', error);
            return safeDistricts;
        }
    }, [safeDistricts, debouncedRange]);

    // Get police stations for selected district - MEMOIZED
    const currentPoliceStations = useMemo(() => {
        try {
            if (debouncedDistrict === 'all') {
                return [];
            }

            const stations = getPoliceStationsByDistrict(debouncedDistrict);
            return Array.isArray(stations) ? stations : [];
        } catch (error) {
            console.error('Error getting police stations:', error);
            return [];
        }
    }, [debouncedDistrict, getPoliceStationsByDistrict]);

    // Get beats for selected police station - MEMOIZED
    const currentBeats = useMemo(() => {
        try {
            if (debouncedPS === 'all') {
                return [];
            }

            const beatList = getBeatsByPoliceStation(debouncedPS);
            return Array.isArray(beatList) ? beatList : [];
        } catch (error) {
            console.error('Error getting beats:', error);
            return [];
        }
    }, [debouncedPS, getBeatsByPoliceStation]);

    // Reset dependent filters when parent filter changes
    useEffect(() => {
        setSelectedPS('all');
        setSelectedBeat('all');
    }, [debouncedDistrict]);

    useEffect(() => {
        setSelectedBeat('all');
    }, [debouncedPS]);

    // Fetch Citizens with caching
    const fetchCitizens = useCallback(async () => {
        try {
            setLoadingCitizens(true);
            setCitizensError(null);

            // Generate cache key based on current filters
            const filterKey = generateFilterKey(
                debouncedRange,
                debouncedDistrict,
                debouncedPS,
                debouncedBeat
            );

            // Save current filters
            saveFilters(debouncedRange, debouncedDistrict, debouncedPS, debouncedBeat);

            // Try to get from cache first if enabled
            if (cacheEnabled) {
                const cachedData = getCachedCitizenData(filterKey);
                if (cachedData && cachedData.length > 0) {

                    setCitizens(cachedData);
                    setCacheHitCount(prev => prev + 1);
                    setLoadingCitizens(false);
                    return;
                }
                console.log('❌ Cache MISS:', filterKey);
            }

            // Measure API call performance
            performanceMonitor.start('fetchCitizens');

            const params: Record<string, any> = { limit: 100 };

            if (debouncedRange !== 'all') params.rangeId = debouncedRange;
            if (debouncedDistrict !== 'all') params.districtId = debouncedDistrict;
            if (debouncedPS !== 'all') params.policeStationId = debouncedPS;
            if (debouncedBeat !== 'all') params.beatId = debouncedBeat;

            console.log('🔄 Fetching citizens with params:', params);

            const res = await apiClient.getCitizens(params);

            performanceMonitor.end('fetchCitizens');

            if (res?.success && res?.data?.citizens) {
                // Validate citizens data
                const validCitizens = Array.isArray(res.data.citizens)
                    ? res.data.citizens.filter(
                        (c) => c && typeof c === 'object' && c.id
                    )
                    : [];

                setCitizens(validCitizens);
                setCitizensError(null);

                // Cache the results if enabled
                if (cacheEnabled && validCitizens.length > 0) {
                    setCachedCitizenData(filterKey, validCitizens);
                    console.log('💾 Cached citizens:', filterKey, `(${validCitizens.length} items)`);
                }
            } else {
                throw new Error('Invalid response structure from API');
            }
        } catch (error: any) {
            console.error('Failed to fetch citizens:', error);

            const errorMessage =
                error?.response?.data?.error?.message ||
                error?.message ||
                'Failed to fetch citizens';

            setCitizensError(errorMessage);

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });

            setCitizens([]);
        } finally {
            setLoadingCitizens(false);
        }
    }, [debouncedRange, debouncedDistrict, debouncedPS, debouncedBeat, toast, cacheEnabled]);

    // Effect for fetching
    useEffect(() => {
        fetchCitizens();
    }, [fetchCitizens]);

    // Transform citizens to map markers with validation - HEAVILY MEMOIZED
    const citizenMarkers = useMemo<CitizenMarker[]>(() => {
        try {
            if (!Array.isArray(citizens) || citizens.length === 0) {
                return [];
            }

            return citizens
                .filter((c) => {
                    return (
                        c &&
                        typeof c.gpsLatitude === 'number' &&
                        typeof c.gpsLongitude === 'number' &&
                        !isNaN(c.gpsLatitude) &&
                        !isNaN(c.gpsLongitude) &&
                        c.gpsLatitude >= -90 &&
                        c.gpsLatitude <= 90 &&
                        c.gpsLongitude >= -180 &&
                        c.gpsLongitude <= 180
                    );
                })
                .map((c) => ({
                    position: {
                        lat: c.gpsLatitude!,
                        lng: c.gpsLongitude!,
                    },
                    title: c.fullName || 'Unknown Citizen',
                    onClick: () => {
                        setSelectedCitizen(c);
                        setIsSheetOpen(true);
                    },
                }));
        } catch (error) {
            console.error('Error creating citizen markers:', error);
            return [];
        }
    }, [citizens]);

    // Clear all cache
    const clearCache = useCallback(() => {
        if (typeof window !== 'undefined') {
            // Clear all citizen cache entries
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(CACHE_KEY_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        }
        setCacheHitCount(0);
        toast({
            title: 'Cache Cleared',
            description: 'All cached data has been removed. Fetching fresh data...',
        });
        fetchCitizens();
    }, [fetchCitizens, toast]);

    // Export current view data
    const exportData = useCallback(() => {
        const data = {
            filters: {
                range: selectedRange,
                district: selectedDistrict,
                policeStation: selectedPS,
                beat: selectedBeat,
            },
            citizenCount: citizens.length,
            markersCount: citizenMarkers.length,
            citizens: citizens.map(c => ({
                id: c.id,
                name: c.fullName,
                latitude: c.gpsLatitude,
                longitude: c.gpsLongitude,
            })),
            timestamp: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `citizen_map_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
            title: 'Data Exported',
            description: `Exported ${citizens.length} citizens`,
        });
    }, [selectedRange, selectedDistrict, selectedPS, selectedBeat, citizens, citizenMarkers, toast]);

    // Loading state for initial master data
    if (masterDataLoading) {
        return (
            <ProtectedRoute permissionCode="citizens.map.all">
                <DashboardLayout
                    title="Citizen Map"
                    description="Geospatial view of senior citizens and police jurisdictions"
                    currentPath="/citizens"
                >
                    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                            <p className="text-muted-foreground">
                                Loading map data...
                            </p>
                        </div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    // Error state for master data
    if (masterDataError) {
        return (
            <ProtectedRoute permissionCode="citizens.read">
                <DashboardLayout
                    title="Citizen Map"
                    description="Geospatial view of senior citizens and police jurisdictions"
                    currentPath="/citizens"
                >
                    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                        <Alert variant="destructive" className="max-w-md">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Failed to load map data. Please try again later.
                            </AlertDescription>
                        </Alert>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute permissionCode="citizens.map.all">
            <DashboardLayout
                title="Citizen Map"
                description="Geospatial view of senior citizens and police jurisdictions"
                currentPath="/citizens"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Citizen Map</h1>
                        <p className="text-muted-foreground">
                            Geospatial view of all registered citizens
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.push('/citizens/map/pending')
                            }
                        >
                            Pending Verification
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/citizens')}
                        >
                            <List className="h-4 w-4 mr-2" /> List View
                        </Button>
                        <Button
                            onClick={() => router.push('/citizens/register')}
                        >
                            + Register Citizen
                        </Button>
                    </div>
                </div>

                {/* Error Alert for Citizens API */}
                {citizensError && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>{citizensError}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchCitizens}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-14rem)]">
                    {/* Sidebar Controls */}
                    <Card className="w-full lg:w-80 flex-shrink-0 overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" /> Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Filters */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Range</Label>
                                    <Select
                                        value={selectedRange}
                                        onValueChange={setSelectedRange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Ranges
                                            </SelectItem>
                                            {ranges.map((range) => (
                                                <SelectItem
                                                    key={`range-${range}`}
                                                    value={range}
                                                >
                                                    {range}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>District</Label>
                                    <Select
                                        value={selectedDistrict}
                                        onValueChange={setSelectedDistrict}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select District" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Districts
                                            </SelectItem>
                                            {filteredDistricts.map((d) => (
                                                <SelectItem
                                                    key={d.id}
                                                    value={d.id}
                                                >
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Police Station</Label>
                                    <Select
                                        value={selectedPS}
                                        onValueChange={setSelectedPS}
                                        disabled={selectedDistrict === 'all'}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Police Station" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Stations
                                            </SelectItem>
                                            {currentPoliceStations.map(
                                                (ps: any) => (
                                                    <SelectItem
                                                        key={ps.id}
                                                        value={ps.id}
                                                    >
                                                        {ps.name}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Beat</Label>
                                    <Select
                                        value={selectedBeat}
                                        onValueChange={setSelectedBeat}
                                        disabled={selectedPS === 'all'}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Beat" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Beats
                                            </SelectItem>
                                            {currentBeats.map((beat: any) => (
                                                <SelectItem
                                                    key={beat.id}
                                                    value={beat.id}
                                                >
                                                    {beat.name}
                                                </SelectItem>
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
                                        <Label
                                            htmlFor="districts"
                                            className="text-sm font-normal"
                                        >
                                            Districts
                                        </Label>
                                        <Switch
                                            id="districts"
                                            checked={layers.showDistricts}
                                            onCheckedChange={(checked) =>
                                                setLayers((prev) => ({
                                                    ...prev,
                                                    showDistricts: checked,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="ranges"
                                            className="text-sm font-normal"
                                        >
                                            Ranges
                                        </Label>
                                        <Switch
                                            id="ranges"
                                            checked={layers.showRanges}
                                            onCheckedChange={(checked) =>
                                                setLayers((prev) => ({
                                                    ...prev,
                                                    showRanges: checked,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="ps-boundaries"
                                            className="text-sm font-normal"
                                        >
                                            PS Boundaries
                                        </Label>
                                        <Switch
                                            id="ps-boundaries"
                                            checked={layers.showPsBoundaries}
                                            onCheckedChange={(checked) =>
                                                setLayers((prev) => ({
                                                    ...prev,
                                                    showPsBoundaries: checked,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="ps-points"
                                            className="text-sm font-normal"
                                        >
                                            PS Locations
                                        </Label>
                                        <Switch
                                            id="ps-points"
                                            checked={layers.showPsPoints}
                                            onCheckedChange={(checked) =>
                                                setLayers((prev) => ({
                                                    ...prev,
                                                    showPsPoints: checked,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stats Summary */}
                            <div className="border-t pt-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Citizens on Map:
                                        </span>
                                        <span className="font-medium">
                                            {citizenMarkers.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Total Fetched:
                                        </span>
                                        <span className="font-medium">
                                            {citizens.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Cache Hits:
                                        </span>
                                        <span className="font-medium text-green-600">
                                            {cacheHitCount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Cache Controls */}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="cache-enabled"
                                        className="text-sm font-normal"
                                    >
                                        Enable Cache
                                    </Label>
                                    <Switch
                                        id="cache-enabled"
                                        checked={cacheEnabled}
                                        onCheckedChange={setCacheEnabled}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={clearCache}
                                    >
                                        Clear Cache
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={exportData}
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Map Area */}
                    <div className="flex-1 rounded-xl overflow-hidden border shadow-sm relative">
                        {loadingCitizens && (
                            <div className="absolute top-4 right-4 z-10 bg-white/90 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 text-sm font-medium">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading citizens...
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
