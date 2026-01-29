
const fs = require('fs');
const path = require('path');

const isPointInPolygon = (lat, lng, polygon) => {
    const ring = polygon[0];
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1];
        const xj = ring[j][0], yj = ring[j][1];
        const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

const findFeatureContainingPoint = (lat, lng, featureCollection) => {
    if (!featureCollection || !featureCollection.features) return null;
    for (const feature of featureCollection.features) {
        if (feature.geometry.type === 'Polygon') {
            if (isPointInPolygon(lat, lng, feature.geometry.coordinates)) return feature;
        } else if (feature.geometry.type === 'MultiPolygon') {
            for (const polygon of feature.geometry.coordinates) {
                if (isPointInPolygon(lat, lng, polygon)) return feature;
            }
        }
    }
    return null;
};

const geojsonPath = path.resolve('backend/jsongeo/Police Station Boundary.geojson');
console.log('--- START DEBUG ---');
try {
    const data = fs.readFileSync(geojsonPath, 'utf8');
    const geoJSON = JSON.parse(data);
    console.log(`Loaded ${geoJSON.features.length} features.`);

    const testPoints = [
        { lat: 28.600, lng: 76.965, label: 'Jaffarpur' },
        { lat: 28.632, lng: 77.220, label: 'Central Delhi' },
        { lat: 28.535, lng: 76.840, label: 'Other' }
    ];

    testPoints.forEach(pt => {
        const feature = findFeatureContainingPoint(pt.lat, pt.lng, geoJSON);
        if (feature) {
            console.log(`[SUCCESS] Point ${pt.label} (${pt.lat}, ${pt.lng}) -> found: ${JSON.stringify(feature.properties)}`);
        } else {
            console.log(`[FAILURE] Point ${pt.label} (${pt.lat}, ${pt.lng}) -> No feature.`);
        }
    });

} catch (err) { console.error('Error:', err.message); }
console.log('--- END DEBUG ---');
