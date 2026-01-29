"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { PoliceStation, PoliceBeat, MapIncident, MapFilters, MapViewport } from "@/types/maps"
import { mockStations, mockBeats, mockIncidents } from "@/lib/maps-data"
import { MapPin, Shield, AlertTriangle, Users, Phone, Calendar, Navigation } from "lucide-react"

interface MapContainerProps {
  filters: MapFilters
  onFiltersChange: (filters: MapFilters) => void
}

export function MapContainer({ filters, onFiltersChange }: MapContainerProps) {
  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null)
  const [selectedBeat, setSelectedBeat] = useState<PoliceBeat | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<MapIncident | null>(null)
  const [viewport, setViewport] = useState<MapViewport>({
    center: { lat: 19.076, lng: 72.8777 },
    zoom: 12,
  })

  const getMarkerColor = (type: string, status?: string, riskLevel?: string) => {
    if (type === "STATION") return status === "ACTIVE" ? "#22c55e" : "#6b7280"
    if (type === "POST") return "#3b82f6"
    if (type === "BEAT") {
      switch (riskLevel) {
        case "LOW":
          return "#22c55e"
        case "MEDIUM":
          return "#f59e0b"
        case "HIGH":
          return "#ef4444"
        case "CRITICAL":
          return "#dc2626"
        default:
          return "#6b7280"
      }
    }
    if (type === "INCIDENT") {
      switch (riskLevel) {
        case "LOW":
          return "#22c55e"
        case "MEDIUM":
          return "#f59e0b"
        case "HIGH":
          return "#ef4444"
        case "CRITICAL":
          return "#dc2626"
        default:
          return "#6b7280"
      }
    }
    return "#6b7280"
  }

  const filteredStations = mockStations.filter((station) => {
    if (!filters.showStations && station.type === "STATION") return false
    if (!filters.showPosts && station.type === "POST") return false
    if (filters.stationStatus && station.status !== filters.stationStatus) return false
    return true
  })

  const filteredBeats = mockBeats.filter((beat) => {
    if (!filters.showBeats) return false
    if (filters.riskLevel && beat.riskLevel !== filters.riskLevel) return false
    return true
  })

  const filteredIncidents = mockIncidents.filter((incident) => {
    if (!filters.showIncidents) return false
    if (filters.incidentType && incident.type !== filters.incidentType) return false
    return true
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Map Display */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Interactive Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mock Map Display */}
            <div className="relative h-[600px] bg-gradient-to-br from-blue-50 to-green-50 border rounded-lg overflow-hidden">
              {/* Map Background */}
              <div className="absolute inset-0 bg-[url('/placeholder-egulx.png')] bg-cover bg-center opacity-20" />

              {/* Station Markers */}
              {filteredStations.map((station) => (
                <div
                  key={station.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    left: `${((station.coordinates.lng - 72.8) / 0.2) * 100}%`,
                    top: `${((19.1 - station.coordinates.lat) / 0.2) * 100}%`,
                  }}
                  onClick={() => setSelectedStation(station)}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: getMarkerColor(station.type, station.status) }}
                  >
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                  {selectedStation?.id === station.id && (
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-lg border z-10 min-w-48">
                      <p className="font-semibold text-sm">{station.name}</p>
                      <p className="text-xs text-muted-foreground">{station.type}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Beat Polygons */}
              {filteredBeats.map((beat) => (
                <div key={beat.id} className="absolute cursor-pointer" onClick={() => setSelectedBeat(beat)}>
                  {/* Simplified polygon representation */}
                  <div
                    className="absolute border-2 border-dashed opacity-60 rounded-lg"
                    style={{
                      left: `${((beat.coordinates[0].lng - 72.8) / 0.2) * 100}%`,
                      top: `${((19.1 - beat.coordinates[0].lat) / 0.2) * 100}%`,
                      width: "80px",
                      height: "60px",
                      borderColor: getMarkerColor("BEAT", undefined, beat.riskLevel),
                      backgroundColor: `${getMarkerColor("BEAT", undefined, beat.riskLevel)}20`,
                    }}
                  />
                  <div
                    className="absolute text-xs font-medium"
                    style={{
                      left: `${((beat.coordinates[0].lng - 72.8) / 0.2) * 100 + 5}%`,
                      top: `${((19.1 - beat.coordinates[0].lat) / 0.2) * 100 + 3}%`,
                    }}
                  >
                    {beat.name}
                  </div>
                </div>
              ))}

              {/* Incident Markers */}
              {filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    left: `${((incident.coordinates.lng - 72.8) / 0.2) * 100}%`,
                    top: `${((19.1 - incident.coordinates.lat) / 0.2) * 100}%`,
                  }}
                  onClick={() => setSelectedIncident(incident)}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-md flex items-center justify-center"
                    style={{ backgroundColor: getMarkerColor("INCIDENT", undefined, incident.severity) }}
                  >
                    <AlertTriangle className="h-2 w-2 text-white" />
                  </div>
                </div>
              ))}

              {/* Map Controls */}
              <div className="absolute top-4 right-4 space-y-2">
                <Button size="sm" variant="outline" className="bg-white">
                  +
                </Button>
                <Button size="sm" variant="outline" className="bg-white">
                  -
                </Button>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border">
                <h4 className="font-semibold text-sm mb-2">Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Active Station</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Police Post</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>High Risk Incident</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-yellow-500 border-dashed" />
                    <span>Police Beat</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Panel */}
      <div className="space-y-4">
        {/* Selected Station Details */}
        {selectedStation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Station Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedStation.name}</h3>
                <Badge variant="outline" className="mt-1">
                  {selectedStation.type}
                </Badge>
                <Badge variant={selectedStation.status === "ACTIVE" ? "default" : "secondary"} className="ml-2">
                  {selectedStation.status}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Address</p>
                  <p>
                    {selectedStation.address.street}, {selectedStation.address.city}
                  </p>
                  <p>
                    {selectedStation.address.district}, {selectedStation.address.state} -{" "}
                    {selectedStation.address.pincode}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Contact</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{selectedStation.contact.phone}</span>
                  </div>
                  {selectedStation.contact.email && (
                    <p className="text-xs text-muted-foreground mt-1">{selectedStation.contact.email}</p>
                  )}
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Officer in Charge</p>
                  <p>
                    {selectedStation.contact.inCharge} ({selectedStation.contact.inChargeRank})
                  </p>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Jurisdiction</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{selectedStation.jurisdiction.population.toLocaleString()} people</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedStation.jurisdiction.beats.length} beats assigned
                  </p>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Facilities</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedStation.facilities.map((facility, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Beat Details */}
        {selectedBeat && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Beat Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedBeat.name}</h3>
                <Badge
                  variant="outline"
                  className={
                    selectedBeat.riskLevel === "HIGH" || selectedBeat.riskLevel === "CRITICAL"
                      ? "border-red-200 text-red-800"
                      : selectedBeat.riskLevel === "MEDIUM"
                        ? "border-yellow-200 text-yellow-800"
                        : "border-green-200 text-green-800"
                  }
                >
                  {selectedBeat.riskLevel} Risk
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-muted-foreground">Area</p>
                    <p>{selectedBeat.area} sq km</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Population</p>
                    <p>{selectedBeat.population.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Assigned Officers</p>
                  {selectedBeat.assignedOfficers.map((officer, index) => (
                    <div key={index} className="mt-1">
                      <p className="text-sm">
                        {officer.name} ({officer.rank})
                      </p>
                      <p className="text-xs text-muted-foreground">{officer.contact}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Crime Statistics</p>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-lg font-semibold">{selectedBeat.crimeStats.totalCases}</p>
                      <p className="text-xs">Total</p>
                    </div>
                    <div className="text-center p-2 bg-green-100 rounded">
                      <p className="text-lg font-semibold text-green-700">{selectedBeat.crimeStats.solvedCases}</p>
                      <p className="text-xs text-green-700">Solved</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-100 rounded">
                      <p className="text-lg font-semibold text-yellow-700">{selectedBeat.crimeStats.pendingCases}</p>
                      <p className="text-xs text-yellow-700">Pending</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Key Landmarks</p>
                  <div className="space-y-1 mt-1">
                    {selectedBeat.landmarks.slice(0, 3).map((landmark, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {landmark.type}
                        </Badge>
                        <span className="text-xs">{landmark.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Incident Details */}
        {selectedIncident && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Incident Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{selectedIncident.type}</Badge>
                  <Badge
                    variant={
                      selectedIncident.severity === "HIGH" || selectedIncident.severity === "CRITICAL"
                        ? "destructive"
                        : selectedIncident.severity === "MEDIUM"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {selectedIncident.severity}
                  </Badge>
                  <Badge variant="outline">{selectedIncident.status}</Badge>
                </div>
                <p className="text-sm">{selectedIncident.description}</p>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Reported: {new Date(selectedIncident.reportedAt).toLocaleString()}</span>
                </div>
                {selectedIncident.assignedOfficer && (
                  <div>
                    <p className="font-medium text-muted-foreground">Assigned Officer</p>
                    <p>{selectedIncident.assignedOfficer}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{filteredStations.length}</p>
                <p className="text-xs text-muted-foreground">Active Stations</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{filteredBeats.length}</p>
                <p className="text-xs text-muted-foreground">Police Beats</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{filteredIncidents.length}</p>
                <p className="text-xs text-muted-foreground">Active Incidents</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {mockBeats.reduce((sum, beat) => sum + beat.population, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Population</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
