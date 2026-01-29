export interface RosterItem {
  id: string
  citizenId: string
  citizenName: string
  citizenPhoto?: string
  citizenAddress: string
  beatId?: string
  postId?: string
  stationId: string
  priority: "high" | "medium" | "low"
  vulnerabilityScore: number
  lastVisitAt?: string
  scheduledAt?: string
  assignedOfficerId?: string
  assignedOfficerName?: string
  distance?: number // in km
  status: "unassigned" | "assigned" | "in_progress" | "completed"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  id: string
  rosterItemId: string
  beatId: string
  postId: string
  stationId: string
  officerId?: string
  officerName?: string
  scheduledDate: string
  shift: "morning" | "afternoon" | "evening" | "night"
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
}

export interface BeatCapacity {
  beatId: string
  beatName: string
  postId: string
  postName: string
  maxCapacity: number
  currentAssigned: number
  availableOfficers: number
}

export interface AutoAssignRule {
  id: string
  name: string
  priority: number
  conditions: {
    vulnerabilityScore?: { min?: number; max?: number }
    lastVisitDays?: number
    priority?: ("high" | "medium" | "low")[]
    distance?: { max?: number }
  }
  actions: {
    assignToBeat?: string
    setPriority?: "high" | "medium" | "low"
    setShift?: "morning" | "afternoon" | "evening" | "night"
  }
}

export interface BeatOfficer {
  id: string
  name: string
  rank: string
  badgeNumber: string
  mobileNumber: string
  email?: string
  policeStationId?: string
  beatId?: string | null
  isActive: boolean
  workloadScore?: number
  assignedCitizens?: number
  totalVisits?: number
  avatarUrl?: string
}

export interface OfficerTransferResult {
  officer: BeatOfficer;
  citizensReassigned: number;
  citizensPendingManual: number;
  visitsReassigned: number;
  visitsCancelled: number;
}
