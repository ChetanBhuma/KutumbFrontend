export interface Coordinates {
  lat: number
  lng: number
}

export interface PoliceStation {
  id: string
  name: string
  type: "STATION" | "POST" | "OUTPOST"
  coordinates: Coordinates
  address: {
    street: string
    city: string
    district: string
    state: string
    pincode: string
  }
  contact: {
    phone: string
    email?: string
    inCharge: string
    inChargeRank: string
  }
  jurisdiction: {
    area: string
    population: number
    beats: string[]
  }
  facilities: string[]
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE"
  establishedYear: number
  metadata: {
    createdAt: string
    updatedAt: string
  }
}

export interface PoliceBeat {
  id: string
  name: string
  stationId: string
  coordinates: Coordinates[]
  area: number // in sq km
  population: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  assignedOfficers: {
    id: string
    name: string
    rank: string
    contact: string
  }[]
  landmarks: {
    name: string
    type: "SCHOOL" | "HOSPITAL" | "MARKET" | "TEMPLE" | "MOSQUE" | "CHURCH" | "GOVERNMENT" | "OTHER"
    coordinates: Coordinates
  }[]
  crimeStats: {
    totalCases: number
    solvedCases: number
    pendingCases: number
    lastUpdated: string
  }
}

export interface MapIncident {
  id: string
  type: "THEFT" | "ASSAULT" | "ACCIDENT" | "DISTURBANCE" | "EMERGENCY" | "OTHER"
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  coordinates: Coordinates
  description: string
  reportedAt: string
  status: "REPORTED" | "INVESTIGATING" | "RESOLVED" | "CLOSED"
  assignedOfficer?: string
  stationId: string
  beatId: string
}

export interface MapFilters {
  showStations: boolean
  showPosts: boolean
  showBeats: boolean
  showIncidents: boolean
  stationStatus?: "ACTIVE" | "INACTIVE" | "MAINTENANCE"
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  incidentType?: string
  timeRange?: {
    start: string
    end: string
  }
}

export interface MapViewport {
  center: Coordinates
  zoom: number
  bounds?: {
    north: number
    south: number
    east: number
    west: number
  }
}
