"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, User, AlertTriangle, CheckCircle, Calendar } from "lucide-react"
import type { Visit, VisitStatus } from "@/types/visits"

interface VisitsListProps {
  visits: Visit[]
  onVisitSelect: (visit: Visit) => void
  selectedVisitId?: string
}

function VisitCard({ visit, isSelected, onClick }: { visit: Visit; isSelected: boolean; onClick: () => void }) {
  const getStatusColor = (status: VisitStatus) => {
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
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: VisitStatus) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const scheduledDateTime = formatDateTime(visit.scheduledAt)

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${
        isSelected ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={visit.citizenPhoto || "/placeholder.svg?height=100&width=100&query=citizen profile"}
                alt={visit.citizenName}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/citizen-profile.png"
                }}
              />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getPriorityColor(visit.priority)}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm truncate">{visit.citizenName}</h4>
              <Badge variant="outline" className={`text-xs ${getStatusColor(visit.status)}`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(visit.status)}
                  {visit.status.replace("_", " ")}
                </div>
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{visit.citizenAddress}</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{visit.assignedOfficerName}</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {scheduledDateTime.date} at {scheduledDateTime.time}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Score: {visit.vulnerabilityScore}
                </Badge>
                {visit.evidence && visit.evidence.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {visit.evidence.length} evidence
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{visit.beatName}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function VisitsList({ visits, onVisitSelect, selectedVisitId }: VisitsListProps) {
  const [activeTab, setActiveTab] = useState<VisitStatus>("scheduled")

  const filterVisitsByStatus = (status: VisitStatus) => {
    if (status === "overdue") {
      const now = new Date()
      return visits.filter((visit) => {
        if (visit.status === "overdue") return true
        if (visit.status === "scheduled" && new Date(visit.scheduledAt) < now) return true
        return false
      })
    }
    return visits.filter((visit) => visit.status === status)
  }

  const tabCounts = {
    scheduled: filterVisitsByStatus("scheduled").length,
    in_progress: filterVisitsByStatus("in_progress").length,
    completed: filterVisitsByStatus("completed").length,
    approved: filterVisitsByStatus("approved").length,
    overdue: filterVisitsByStatus("overdue").length,
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as VisitStatus)} className="flex-1">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="scheduled" className="text-xs">
            Scheduled
            {tabCounts.scheduled > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {tabCounts.scheduled}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="text-xs">
            In Progress
            {tabCounts.in_progress > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {tabCounts.in_progress}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Completed
            {tabCounts.completed > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {tabCounts.completed}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs">
            Approved
            {tabCounts.approved > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {tabCounts.approved}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs">
            Overdue
            {tabCounts.overdue > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {tabCounts.overdue}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {(["scheduled", "in_progress", "completed", "approved", "overdue"] as VisitStatus[]).map((status) => (
          <TabsContent key={status} value={status} className="flex-1 mt-4">
            <div className="space-y-3 h-full overflow-y-auto">
              {filterVisitsByStatus(status).map((visit) => (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                  isSelected={selectedVisitId === visit.id}
                  onClick={() => onVisitSelect(visit)}
                />
              ))}

              {filterVisitsByStatus(status).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No {status.replace("_", " ")} visits</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
