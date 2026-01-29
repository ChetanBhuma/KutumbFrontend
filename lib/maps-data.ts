import type { PoliceStation, PoliceBeat, MapIncident } from "@/types/maps"

export const mockStations: PoliceStation[] = [
  {
    id: "station-1",
    name: "Connaught Place Police Station",
    type: "STATION",
    coordinates: { lat: 28.6315, lng: 77.2167 },
    address: {
      street: "Connaught Place",
      city: "New Delhi",
      district: "Central Delhi",
      state: "Delhi",
      pincode: "110001",
    },
    contact: {
      phone: "+91-11-2334-1234",
      email: "cp.station@delhipolice.gov.in",
      inCharge: "Inspector Rajesh Sharma",
      inChargeRank: "Inspector",
    },
    jurisdiction: {
      area: "Central Delhi",
      population: 125000,
      beats: ["beat-1", "beat-2", "beat-3"],
    },
    facilities: ["Detention Cells", "Forensic Lab", "Traffic Control", "Senior Citizen Help Desk"],
    status: "ACTIVE",
    establishedYear: 1985,
    metadata: {
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
  },
  {
    id: "station-2",
    name: "Karol Bagh Police Station",
    type: "STATION",
    coordinates: { lat: 28.6519, lng: 77.1909 },
    address: {
      street: "Karol Bagh",
      city: "New Delhi",
      district: "Central Delhi",
      state: "Delhi",
      pincode: "110005",
    },
    contact: {
      phone: "+91-11-2575-5678",
      email: "karolbagh.station@delhipolice.gov.in",
      inCharge: "Inspector Priya Patel",
      inChargeRank: "Inspector",
    },
    jurisdiction: {
      area: "Karol Bagh Area",
      population: 98000,
      beats: ["beat-4", "beat-5"],
    },
    facilities: ["Detention Cells", "Women Help Desk", "Traffic Control", "Senior Citizen Welfare"],
    status: "ACTIVE",
    establishedYear: 1992,
    metadata: {
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-20T14:15:00Z",
    },
  },
  {
    id: "post-1",
    name: "Red Fort Police Post",
    type: "POST",
    coordinates: { lat: 28.6562, lng: 77.241 },
    address: {
      street: "Red Fort Area",
      city: "New Delhi",
      district: "North Delhi",
      state: "Delhi",
      pincode: "110006",
    },
    contact: {
      phone: "+91-11-2327-9012",
      inCharge: "Sub-Inspector Kumar",
      inChargeRank: "Sub-Inspector",
    },
    jurisdiction: {
      area: "Tourist Area",
      population: 15000,
      beats: ["beat-6"],
    },
    facilities: ["Tourist Assistance", "Emergency Response", "Heritage Site Security"],
    status: "ACTIVE",
    establishedYear: 2005,
    metadata: {
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-10T09:45:00Z",
    },
  },
]

export const mockBeats: PoliceBeat[] = [
  {
    id: "beat-1",
    name: "Connaught Place Beat",
    stationId: "station-1",
    coordinates: [
      { lat: 28.6315, lng: 77.2167 },
      { lat: 28.6335, lng: 77.2187 },
      { lat: 28.6355, lng: 77.2147 },
      { lat: 28.6335, lng: 77.2127 },
    ],
    area: 2.5,
    population: 45000,
    riskLevel: "MEDIUM",
    assignedOfficers: [
      {
        id: "officer-1",
        name: "Constable Amit Singh",
        rank: "Constable",
        contact: "+91-9876543210",
      },
      {
        id: "officer-2",
        name: "Head Constable Sunita Devi",
        rank: "Head Constable",
        contact: "+91-9876543211",
      },
    ],
    landmarks: [
      {
        name: "Central Park",
        type: "PARK",
        coordinates: { lat: 28.6325, lng: 77.2177 },
      },
      {
        name: "AIIMS Delhi",
        type: "HOSPITAL",
        coordinates: { lat: 28.6345, lng: 77.2165 },
      },
      {
        name: "Government Senior Secondary School",
        type: "SCHOOL",
        coordinates: { lat: 28.6355, lng: 77.2155 },
      },
    ],
    crimeStats: {
      totalCases: 45,
      solvedCases: 38,
      pendingCases: 7,
      lastUpdated: "2024-01-25T16:00:00Z",
    },
  },
  {
    id: "beat-2",
    name: "Karol Bagh Residential Beat",
    stationId: "station-1",
    coordinates: [
      { lat: 28.6519, lng: 77.1909 },
      { lat: 28.6539, lng: 77.1929 },
      { lat: 28.6559, lng: 77.1889 },
      { lat: 28.6539, lng: 77.1869 },
    ],
    area: 1.8,
    population: 32000,
    riskLevel: "LOW",
    assignedOfficers: [
      {
        id: "officer-3",
        name: "Constable Ravi Kumar",
        rank: "Constable",
        contact: "+91-9876543212",
      },
    ],
    landmarks: [
      {
        name: "Karol Bagh Metro Station",
        type: "TRANSPORT",
        coordinates: { lat: 28.6529, lng: 77.1919 },
      },
      {
        name: "Hanuman Temple",
        type: "TEMPLE",
        coordinates: { lat: 28.6549, lng: 77.1899 },
      },
    ],
    crimeStats: {
      totalCases: 12,
      solvedCases: 11,
      pendingCases: 1,
      lastUpdated: "2024-01-25T16:00:00Z",
    },
  },
  {
    id: "beat-4",
    name: "Chandni Chowk Heritage Beat",
    stationId: "station-2",
    coordinates: [
      { lat: 28.6562, lng: 77.241 },
      { lat: 28.6582, lng: 77.243 },
      { lat: 28.6602, lng: 77.239 },
      { lat: 28.6582, lng: 77.237 },
    ],
    area: 3.2,
    population: 28000,
    riskLevel: "LOW",
    assignedOfficers: [
      {
        id: "officer-4",
        name: "Constable Meera Joshi",
        rank: "Constable",
        contact: "+91-9876543213",
      },
    ],
    landmarks: [
      {
        name: "Red Fort",
        type: "HERITAGE",
        coordinates: { lat: 28.6572, lng: 77.242 },
      },
      {
        name: "Jama Masjid",
        type: "MOSQUE",
        coordinates: { lat: 28.6507, lng: 77.2334 },
      },
    ],
    crimeStats: {
      totalCases: 8,
      solvedCases: 7,
      pendingCases: 1,
      lastUpdated: "2024-01-25T16:00:00Z",
    },
  },
]

export const mockIncidents: MapIncident[] = [
  {
    id: "incident-1",
    type: "THEFT",
    severity: "MEDIUM",
    coordinates: { lat: 28.6325, lng: 77.2177 },
    description: "Mobile phone theft reported at Central Park",
    reportedAt: "2024-01-25T14:30:00Z",
    status: "INVESTIGATING",
    assignedOfficer: "Constable Amit Singh",
    stationId: "station-1",
    beatId: "beat-1",
  },
  {
    id: "incident-2",
    type: "ACCIDENT",
    severity: "HIGH",
    coordinates: { lat: 28.6529, lng: 77.1919 },
    description: "Traffic accident involving auto-rickshaw near Metro Station",
    reportedAt: "2024-01-25T16:15:00Z",
    status: "RESOLVED",
    assignedOfficer: "Constable Ravi Kumar",
    stationId: "station-1",
    beatId: "beat-2",
  },
  {
    id: "incident-3",
    type: "DISTURBANCE",
    severity: "LOW",
    coordinates: { lat: 28.6572, lng: 77.242 },
    description: "Noise complaint from heritage area",
    reportedAt: "2024-01-25T20:00:00Z",
    status: "CLOSED",
    assignedOfficer: "Constable Meera Joshi",
    stationId: "station-2",
    beatId: "beat-4",
  },
]

export function getStationById(id: string): PoliceStation | undefined {
  return mockStations.find((station) => station.id === id)
}

export function getBeatById(id: string): PoliceBeat | undefined {
  return mockBeats.find((beat) => beat.id === id)
}

export function getStationsByDistrict(district: string): PoliceStation[] {
  return mockStations.filter((station) => station.address.district === district)
}

export function getBeatsByStation(stationId: string): PoliceBeat[] {
  return mockBeats.filter((beat) => beat.stationId === stationId)
}

export function getIncidentsByBeat(beatId: string): MapIncident[] {
  return mockIncidents.filter((incident) => incident.beatId === beatId)
}

export function getIncidentsByTimeRange(start: string, end: string): MapIncident[] {
  return mockIncidents.filter((incident) => {
    const incidentTime = new Date(incident.reportedAt)
    return incidentTime >= new Date(start) && incidentTime <= new Date(end)
  })
}
