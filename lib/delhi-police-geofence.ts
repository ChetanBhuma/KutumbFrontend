// Delhi Police Jurisdiction boundaries and geofencing data
export const DELHI_POLICE_RANGES = {
    CENTRAL: {
        name: 'Central Range',
        color: '#FF6B6B',
        districts: ['Central', 'New Delhi']
    },
    NORTH: {
        name: 'North Range',
        color: '#4ECDC4',
        districts: ['North', 'Rohini', 'Outer North']
    },
    SOUTH: {
        name: 'South Range',
        color: '#45B7D1',
        districts: ['South', 'South West', 'South East']
    },
    EAST: {
        name: 'East Range',
        color: '#96CEB4',
        districts: ['East', 'North East', 'Shahdara']
    },
    WEST: {
        name: 'West Range',
        color: '#FFEAA7',
        districts: ['West', 'Outer', 'Dwarka']
    },
};

// Delhi Police Station coordinates (sample data - expand as needed)
export const DELHI_POLICE_STATIONS = [
    {
        id: 'ps_connaught_place',
        name: 'Connaught Place Police Station',
        district: 'New Delhi',
        range: 'CENTRAL',
        coordinates: { lat: 28.6315, lng: 77.2167 },
        beats: [
            { code: 'CP-01', name: 'Connaught Place Inner Circle', boundaries: [] },
            { code: 'CP-02', name: 'Janpath Area', boundaries: [] },
            { code: 'CP-03', name: 'Barakhamba Road', boundaries: [] },
        ]
    },
    {
        id: 'ps_karol_bagh',
        name: 'Karol Bagh Police Station',
        district: 'Central',
        range: 'CENTRAL',
        coordinates: { lat: 28.6519, lng: 77.1909 },
        beats: [
            { code: 'KB-01', name: 'Karol Bagh Market', boundaries: [] },
            { code: 'KB-02', name: 'Pusa Road', boundaries: [] },
        ]
    },
    {
        id: 'ps_rohini',
        name: 'Rohini Police Station',
        district: 'Rohini',
        range: 'NORTH',
        coordinates: { lat: 28.7495, lng: 77.0736 },
        beats: [
            { code: 'RH-01', name: 'Sector 7 Rohini', boundaries: [] },
            { code: 'RH-02', name: 'Sector 10 Rohini', boundaries: [] },
        ]
    },
    {
        id: 'ps_hauz_khas',
        name: 'Hauz Khas Police Station',
        district: 'South',
        range: 'SOUTH',
        coordinates: { lat: 28.5494, lng: 77.2001 },
        beats: [
            { code: 'HK-01', name: 'Hauz Khas Village', boundaries: [] },
            { code: 'HK-02', name: 'Green Park', boundaries: [] },
        ]
    },
    {
        id: 'ps_dwarka',
        name: 'Dwarka Police Station',
        district: 'Dwarka',
        range: 'WEST',
        coordinates: { lat: 28.5921, lng: 77.0460 },
        beats: [
            { code: 'DW-01', name: 'Sector 10 Dwarka', boundaries: [] },
            { code: 'DW-02', name: 'Sector 12 Dwarka', boundaries: [] },
        ]
    },
];

// Delhi boundary (simplified polygon)
export const DELHI_BOUNDARY = [
    { lat: 28.8836, lng: 76.8380 }, // North West
    { lat: 28.8836, lng: 77.3465 }, // North East
    { lat: 28.4041, lng: 77.3465 }, // South East
    { lat: 28.4041, lng: 76.8380 }, // South West
];

// Helper functions
export const getPoliceStationByBeat = (beatCode: string) => {
    return DELHI_POLICE_STATIONS.find(ps =>
        ps.beats.some(beat => beat.code === beatCode)
    );
};

export const getPoliceStationsByDistrict = (district: string) => {
    return DELHI_POLICE_STATIONS.filter(ps => ps.district === district);
};

export const getPoliceStationsByRange = (range: keyof typeof DELHI_POLICE_RANGES) => {
    return DELHI_POLICE_STATIONS.filter(ps => ps.range === range);
};

export const isLocationInDelhi = (lat: number, lng: number): boolean => {
    // Simple bounding box check
    return lat >= 28.4041 && lat <= 28.8836 && lng >= 76.8380 && lng <= 77.3465;
};

export const findNearestPoliceStation = (lat: number, lng: number) => {
    let nearest = DELHI_POLICE_STATIONS[0];
    let minDistance = Infinity;

    DELHI_POLICE_STATIONS.forEach(ps => {
        const distance = getDistance(
            lat, lng,
            ps.coordinates.lat, ps.coordinates.lng
        );
        if (distance < minDistance) {
            minDistance = distance;
            nearest = ps;
        }
    });

    return { policeStation: nearest, distance: minDistance };
};

// Haversine formula for distance calculation
export const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

// Point in Polygon (Ray Casting algorithm)
export const isPointInPolygon = (lat: number, lng: number, polygon: any[]): boolean => {
    // GeoJSON polygon is array of rings. First ring is outer boundary.
    // Coordinates are [lng, lat]
    const ring = polygon[0];
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1];
        const xj = ring[j][0], yj = ring[j][1];

        const intersect = ((yi > lat) !== (yj > lat))
            && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

// Generic finder
export const findFeatureContainingPoint = (lat: number, lng: number, featureCollection: any) => {
    if (!featureCollection || !featureCollection.features) return null;

    for (const feature of featureCollection.features) {
        if (feature.geometry.type === 'Polygon') {
            if (isPointInPolygon(lat, lng, feature.geometry.coordinates)) {
                return feature;
            }
        } else if (feature.geometry.type === 'MultiPolygon') {
            // Array of Polygons
            for (const polygon of feature.geometry.coordinates) {
                if (isPointInPolygon(lat, lng, polygon)) {
                    return feature;
                }
            }
        }
    }
    return null;
};
