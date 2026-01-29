export interface Visit {
  id: string
  citizenId: string
  citizenName: string
  citizenPhoto?: string
  citizenAddress: string
  citizenLat?: number
  citizenLng?: number
  vulnerabilityScore: number
  stationId: string
  stationName: string
  postId?: string
  postName?: string
  beatId?: string
  beatName: string
  assignedOfficerId: string
  assignedOfficerName: string
  status: "scheduled" | "in_progress" | "completed" | "approved" | "overdue"
  priority: "high" | "medium" | "low"
  scheduledAt: string
  checkinAt?: string
  completedAt?: string
  approvedAt?: string
  approvedBy?: string
  approvalNotes?: string
  evidence?: Evidence[]
  timeline: TimelineEvent[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Evidence {
  id: string
  visitId: string
  type: "photo" | "document" | "audio" | "video"
  url: string
  filename: string
  description?: string
  lat?: number
  lng?: number
  takenAt: string
  uploadedBy: string
  uploadedByName: string
}

export interface TimelineEvent {
  id: string
  visitId: string
  type: "assigned" | "checkin" | "evidence_added" | "completed" | "approved" | "reopened"
  description: string
  performedBy: string
  performedByName: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface VisitStats {
  total: number
  scheduled: number
  inProgress: number
  completed: number
  approved: number
  overdue: number
  highPriority: number
}

export type VisitStatus = "scheduled" | "in_progress" | "completed" | "approved" | "overdue"
