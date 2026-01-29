"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, MapPin, Clock, User, Camera, CheckCircle, XCircle, Calendar, FileText, Map } from "lucide-react"
import type { Visit } from "@/types/visits"

interface VisitDetailsProps {
  visit: Visit | null
  onClose: () => void
  onApprove: (visitId: string, notes: string) => void
  onReopen: (visitId: string, reason: string) => void
}

export function VisitDetails({ visit, onClose, onApprove, onReopen }: VisitDetailsProps) {
  const [approvalNotes, setApprovalNotes] = useState("")
  const [reopenReason, setReopenReason] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  if (!visit) return null

  const handleApprove = () => {
    onApprove(visit.id, approvalNotes)
    setApprovalNotes("")
  }

  const handleReopen = () => {
    onReopen(visit.id, reopenReason)
    setReopenReason("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const canApprove = visit.status === "completed"
  const canReopen = visit.status === "approved"

  return (
    <Card className="w-96 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
        <CardTitle className="text-lg">Visit Details</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="overview" className="text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="map" className="text-xs">
              Map
            </TabsTrigger>
            <TabsTrigger value="evidence" className="text-xs">
              Evidence
              {visit.evidence && visit.evidence.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {visit.evidence.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              Timeline
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Citizen Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={visit.citizenPhoto || "/placeholder.svg?height=100&width=100&query=citizen profile"}
                    alt={visit.citizenName}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/citizen-profile.png"
                    }}
                  />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{visit.citizenName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getStatusColor(visit.status)}>
                      {visit.status.replace("_", " ")}
                    </Badge>
                    <span className={`font-semibold ${getPriorityColor(visit.priority)}`}>
                      {visit.priority} priority
                    </span>
                  </div>
                </div>
              </div>

              {/* Vulnerability Summary */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Vulnerability Score</span>
                  <Badge
                    variant={
                      visit.vulnerabilityScore >= 80
                        ? "destructive"
                        : visit.vulnerabilityScore >= 60
                          ? "default"
                          : "secondary"
                    }
                  >
                    {visit.vulnerabilityScore}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      visit.vulnerabilityScore >= 80
                        ? "bg-red-500"
                        : visit.vulnerabilityScore >= 60
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${visit.vulnerabilityScore}%` }}
                  />
                </div>
              </div>

              {/* Visit Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <span className="text-sm">{visit.citizenAddress}</span>
                    <p className="text-xs text-muted-foreground">{visit.beatName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{visit.assignedOfficerName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Scheduled: {formatDateTime(visit.scheduledAt)}</span>
                </div>

                {visit.checkinAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Checked in: {formatDateTime(visit.checkinAt)}</span>
                  </div>
                )}

                {visit.completedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Completed: {formatDateTime(visit.completedAt)}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {visit.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium text-sm">Visit Notes</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{visit.notes}</p>
                </div>
              )}

              {/* Approval Section */}
              {canApprove && (
                <div className="space-y-3 pt-4 border-t">
                  <Label htmlFor="approval-notes">SHO Approval Notes</Label>
                  <Textarea
                    id="approval-notes"
                    placeholder="Add approval notes..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleApprove} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Visit
                  </Button>
                </div>
              )}

              {/* Reopen Section */}
              {canReopen && (
                <div className="space-y-3 pt-4 border-t">
                  <Label htmlFor="reopen-reason">Reason for Reopening</Label>
                  <Textarea
                    id="reopen-reason"
                    placeholder="Explain why this visit needs to be reopened..."
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleReopen} variant="outline" className="w-full bg-transparent">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reopen Visit
                  </Button>
                </div>
              )}

              {/* Approval Info */}
              {visit.status === "approved" && visit.approvedAt && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm text-green-800">Approved</span>
                  </div>
                  <p className="text-sm text-green-700">Approved on {formatDateTime(visit.approvedAt)}</p>
                  {visit.approvalNotes && <p className="text-sm text-green-600 mt-1">"{visit.approvalNotes}"</p>}
                </div>
              )}
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <div className="bg-muted rounded-lg p-8 text-center h-64 flex items-center justify-center">
                <div>
                  <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Interactive map will be displayed here</p>
                  {visit.citizenLat && visit.citizenLng && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Citizen Location: {visit.citizenLat.toFixed(4)}, {visit.citizenLng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-3 mt-0">
              {visit.evidence && visit.evidence.length > 0 ? (
                visit.evidence.map((evidence) => (
                  <Card key={evidence.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Camera className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{evidence.filename}</h4>
                          {evidence.description && (
                            <p className="text-xs text-muted-foreground mt-1">{evidence.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{formatDateTime(evidence.takenAt)}</span>
                            <span>by {evidence.uploadedByName}</span>
                          </div>
                          {evidence.lat && evidence.lng && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {evidence.lat.toFixed(4)}, {evidence.lng.toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No evidence uploaded yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-3 mt-0">
              {visit.timeline.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        event.type === "approved"
                          ? "bg-green-100 text-green-600"
                          : event.type === "completed"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {event.type === "approved" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : event.type === "completed" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : event.type === "checkin" ? (
                        <MapPin className="h-4 w-4" />
                      ) : event.type === "evidence_added" ? (
                        <Camera className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    {index < visit.timeline.length - 1 && <div className="w-px h-8 bg-border mt-2" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">{event.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{event.performedByName}</span>
                      <span>•</span>
                      <span>{formatDateTime(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
