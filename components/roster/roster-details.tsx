"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, MapPin, Clock, User, Calendar } from "lucide-react"
import type { RosterItem, BeatCapacity } from "@/types/roster"

interface RosterDetailsProps {
  item: RosterItem | null
  capacities: BeatCapacity[]
  onClose: () => void
  onAssign: (itemId: string, beatId: string, notes?: string) => void
}

export function RosterDetails({ item, capacities, onClose, onAssign }: RosterDetailsProps) {
  const [selectedBeatId, setSelectedBeatId] = useState<string>("")
  const [notes, setNotes] = useState("")

  if (!item) return null

  const handleAssign = () => {
    if (selectedBeatId) {
      onAssign(item.id, selectedBeatId, notes)
      onClose()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600"
    if (score >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  const daysSinceLastVisit = item.lastVisitAt
    ? Math.floor((Date.now() - new Date(item.lastVisitAt).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const availableBeats = capacities.filter((cap) => cap.currentAssigned < cap.maxCapacity)

  return (
    <Card className="w-96 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Assignment Details</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Citizen Info */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={item.citizenPhoto || "/placeholder.svg"} alt={item.citizenName} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="font-semibold text-lg">{item.citizenName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                {item.priority} priority
              </Badge>
              <span className={`font-semibold ${getScoreColor(item.vulnerabilityScore)}`}>
                Score: {item.vulnerabilityScore}
              </span>
            </div>
          </div>
        </div>

        {/* Address & Distance */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <span className="text-sm">{item.citizenAddress}</span>
          </div>
          {item.distance && (
            <div className="text-sm text-muted-foreground ml-6">{item.distance.toFixed(1)} km from station</div>
          )}
        </div>

        {/* Last Visit */}
        {daysSinceLastVisit !== null && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Last visit: {daysSinceLastVisit === 0 ? "Today" : `${daysSinceLastVisit} days ago`}
            </span>
            {daysSinceLastVisit > 7 && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
        )}

        {/* Current Assignment */}
        {item.status === "assigned" && item.assignedOfficerName && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4" />
              <span className="font-medium text-sm">Current Assignment</span>
            </div>
            <div className="text-sm text-muted-foreground">Officer: {item.assignedOfficerName}</div>
            {item.scheduledAt && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                Scheduled: {new Date(item.scheduledAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Assignment Form */}
        {item.status === "unassigned" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="beat-select">Assign to Beat</Label>
              <Select value={selectedBeatId} onValueChange={setSelectedBeatId}>
                <SelectTrigger id="beat-select">
                  <SelectValue placeholder="Select a beat" />
                </SelectTrigger>
                <SelectContent>
                  {availableBeats.map((beat) => (
                    <SelectItem key={beat.beatId} value={beat.beatId}>
                      <div className="flex items-center justify-between w-full">
                        <span>{beat.beatName}</span>
                        <Badge variant="secondary" className="ml-2">
                          {beat.currentAssigned}/{beat.maxCapacity}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableBeats.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">No beats available with capacity</p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Assignment Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleAssign} disabled={!selectedBeatId} className="w-full">
              Assign to Beat
            </Button>
          </div>
        )}

        {/* Reassignment */}
        {item.status === "assigned" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="reassign-beat">Reassign to Different Beat</Label>
              <Select value={selectedBeatId} onValueChange={setSelectedBeatId}>
                <SelectTrigger id="reassign-beat">
                  <SelectValue placeholder="Select new beat" />
                </SelectTrigger>
                <SelectContent>
                  {availableBeats
                    .filter((beat) => beat.beatId !== item.beatId)
                    .map((beat) => (
                      <SelectItem key={beat.beatId} value={beat.beatId}>
                        <div className="flex items-center justify-between w-full">
                          <span>{beat.beatName}</span>
                          <Badge variant="secondary" className="ml-2">
                            {beat.currentAssigned}/{beat.maxCapacity}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reassign-notes">Reassignment Reason</Label>
              <Textarea
                id="reassign-notes"
                placeholder="Reason for reassignment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <Button
              onClick={handleAssign}
              disabled={!selectedBeatId}
              variant="outline"
              className="w-full bg-transparent"
            >
              Reassign
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
