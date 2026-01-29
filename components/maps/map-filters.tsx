"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { MapFilters } from "@/types/maps"
import { Filter, RotateCcw } from "lucide-react"

interface MapFiltersProps {
  filters: MapFilters
  onFiltersChange: (filters: MapFilters) => void
}

export function MapFiltersPanel({ filters, onFiltersChange }: MapFiltersProps) {
  const handleToggle = (key: keyof MapFilters, value: boolean) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleSelectChange = (key: keyof MapFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value === "all" ? undefined : value })
  }

  const resetFilters = () => {
    onFiltersChange({
      showStations: true,
      showPosts: true,
      showBeats: true,
      showIncidents: true,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Map Filters
          </CardTitle>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Layer Toggles */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Map Layers</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-stations" className="text-sm">
                Police Stations
              </Label>
              <Switch
                id="show-stations"
                checked={filters.showStations}
                onCheckedChange={(checked) => handleToggle("showStations", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-posts" className="text-sm">
                Police Posts
              </Label>
              <Switch
                id="show-posts"
                checked={filters.showPosts}
                onCheckedChange={(checked) => handleToggle("showPosts", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-beats" className="text-sm">
                Police Beats
              </Label>
              <Switch
                id="show-beats"
                checked={filters.showBeats}
                onCheckedChange={(checked) => handleToggle("showBeats", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-incidents" className="text-sm">
                Incidents
              </Label>
              <Switch
                id="show-incidents"
                checked={filters.showIncidents}
                onCheckedChange={(checked) => handleToggle("showIncidents", checked)}
              />
            </div>
          </div>
        </div>

        {/* Station Filters */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Station Filters</h4>
          <div>
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={filters.stationStatus || "all"}
              onValueChange={(value) => handleSelectChange("stationStatus", value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Beat Filters */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Beat Filters</h4>
          <div>
            <Label className="text-xs text-muted-foreground">Risk Level</Label>
            <Select
              value={filters.riskLevel || "all"}
              onValueChange={(value) => handleSelectChange("riskLevel", value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="LOW">Low Risk</SelectItem>
                <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                <SelectItem value="HIGH">High Risk</SelectItem>
                <SelectItem value="CRITICAL">Critical Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Incident Filters */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Incident Filters</h4>
          <div>
            <Label className="text-xs text-muted-foreground">Incident Type</Label>
            <Select
              value={filters.incidentType || "all"}
              onValueChange={(value) => handleSelectChange("incidentType", value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="THEFT">Theft</SelectItem>
                <SelectItem value="ASSAULT">Assault</SelectItem>
                <SelectItem value="ACCIDENT">Accident</SelectItem>
                <SelectItem value="DISTURBANCE">Disturbance</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
