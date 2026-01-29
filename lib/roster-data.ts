import type { RosterItem, BeatCapacity, AutoAssignRule } from "@/types/roster"

// Mock roster items for Delhi senior citizens
export const mockRosterItems: RosterItem[] = [
  {
    id: "roster-001",
    citizenId: "citizen-001",
    citizenName: "Shri Ram Kumar Sharma",
    citizenPhoto: "/indian-man-profile-photo.png",
    citizenAddress: "A-123, Connaught Place, New Delhi - 110001",
    stationId: "station-001",
    priority: "high",
    vulnerabilityScore: 85,
    lastVisitAt: "2024-01-10T10:30:00Z",
    distance: 0.8,
    status: "unassigned",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "roster-002",
    citizenId: "citizen-002",
    citizenName: "Smt. Kamala Devi",
    citizenPhoto: "/indian-woman-profile-photo.png",
    citizenAddress: "B-456, Janpath, New Delhi - 110001",
    beatId: "beat-001",
    postId: "post-001",
    stationId: "station-001",
    assignedOfficerId: "officer-001",
    assignedOfficerName: "Constable Raj Singh",
    priority: "medium",
    vulnerabilityScore: 72,
    lastVisitAt: "2024-01-12T14:15:00Z",
    scheduledAt: "2024-01-20T09:00:00Z",
    distance: 1.2,
    status: "assigned",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "roster-003",
    citizenId: "citizen-003",
    citizenName: "Shri Mohan Lal Gupta",
    citizenPhoto: "/indian-man-profile-photo.png",
    citizenAddress: "C-789, Rajiv Chowk, New Delhi - 110001",
    beatId: "beat-003",
    postId: "post-002",
    stationId: "station-001",
    assignedOfficerId: "officer-002",
    assignedOfficerName: "Constable Priya Sharma",
    priority: "high",
    vulnerabilityScore: 91,
    lastVisitAt: "2024-01-08T16:45:00Z",
    scheduledAt: "2024-01-19T11:00:00Z",
    distance: 2.1,
    status: "assigned",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "roster-004",
    citizenId: "citizen-004",
    citizenName: "Smt. Sunita Agarwal",
    citizenPhoto: "/indian-woman-profile-photo.png",
    citizenAddress: "D-321, Karol Bagh, New Delhi - 110005",
    stationId: "station-003",
    priority: "medium",
    vulnerabilityScore: 68,
    lastVisitAt: "2024-01-14T12:30:00Z",
    distance: 1.5,
    status: "unassigned",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "roster-005",
    citizenId: "citizen-005",
    citizenName: "Shri Rajesh Kumar",
    citizenPhoto: "/indian-man-profile-photo.png",
    citizenAddress: "E-654, Green Park, New Delhi - 110016",
    beatId: "beat-004",
    postId: "post-004",
    stationId: "station-004",
    assignedOfficerId: "officer-003",
    assignedOfficerName: "Constable Amit Verma",
    priority: "low",
    vulnerabilityScore: 45,
    lastVisitAt: "2024-01-13T15:20:00Z",
    scheduledAt: "2024-01-22T10:30:00Z",
    distance: 0.9,
    status: "assigned",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "roster-006",
    citizenId: "citizen-006",
    citizenName: "Smt. Meera Sharma",
    citizenPhoto: "/indian-woman-profile-photo.png",
    citizenAddress: "F-987, Hauz Khas, New Delhi - 110016",
    stationId: "station-004",
    priority: "high",
    vulnerabilityScore: 88,
    lastVisitAt: "2024-01-05T09:15:00Z",
    distance: 2.3,
    status: "unassigned",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
]

// Mock beat capacities
export const mockBeatCapacities: BeatCapacity[] = [
  {
    beatId: "beat-001",
    beatName: "Janpath Beat 1",
    postId: "post-001",
    postName: "Janpath Chowki",
    maxCapacity: 8,
    currentAssigned: 3,
    availableOfficers: 2,
  },
  {
    beatId: "beat-002",
    beatName: "Janpath Beat 2",
    postId: "post-001",
    postName: "Janpath Chowki",
    maxCapacity: 6,
    currentAssigned: 2,
    availableOfficers: 2,
  },
  {
    beatId: "beat-003",
    beatName: "Rajiv Chowk Beat 1",
    postId: "post-002",
    postName: "Rajiv Chowk Chowki",
    maxCapacity: 10,
    currentAssigned: 4,
    availableOfficers: 3,
  },
  {
    beatId: "beat-004",
    beatName: "Karol Bagh Beat 1",
    postId: "post-003",
    postName: "Ajmal Khan Road Chowki",
    maxCapacity: 7,
    currentAssigned: 2,
    availableOfficers: 2,
  },
]

// Mock auto-assign rules
export const mockAutoAssignRules: AutoAssignRule[] = [
  {
    id: "rule-001",
    name: "High Priority Seniors",
    priority: 1,
    conditions: {
      vulnerabilityScore: { min: 80 },
      priority: ["high"],
      lastVisitDays: 7,
    },
    actions: {
      setPriority: "high",
      setShift: "morning",
    },
  },
  {
    id: "rule-002",
    name: "Distance Based Assignment",
    priority: 2,
    conditions: {
      distance: { max: 1.5 },
    },
    actions: {
      setShift: "morning",
    },
  },
  {
    id: "rule-003",
    name: "Overdue Visits",
    priority: 3,
    conditions: {
      lastVisitDays: 14,
    },
    actions: {
      setPriority: "high",
      setShift: "morning",
    },
  },
]

// Auto-assign logic
export function autoAssignRosterItems(
  items: RosterItem[],
  capacities: BeatCapacity[],
  rules: AutoAssignRule[],
): RosterItem[] {
  const unassignedItems = items.filter((item) => item.status === "unassigned")
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority)
  const availableBeats = capacities.filter((cap) => cap.currentAssigned < cap.maxCapacity)

  const assignedItems = [...items]

  for (const item of unassignedItems) {
    // Find matching rules
    const matchingRules = sortedRules.filter((rule) => {
      const { conditions } = rule

      // Check vulnerability score
      if (conditions.vulnerabilityScore) {
        const { min, max } = conditions.vulnerabilityScore
        if (min && item.vulnerabilityScore < min) return false
        if (max && item.vulnerabilityScore > max) return false
      }

      // Check priority
      if (conditions.priority && !conditions.priority.includes(item.priority)) return false

      // Check distance
      if (conditions.distance?.max && item.distance && item.distance > conditions.distance.max) return false

      // Check last visit days
      if (conditions.lastVisitDays && item.lastVisitAt) {
        const daysSinceLastVisit = Math.floor(
          (Date.now() - new Date(item.lastVisitAt).getTime()) / (1000 * 60 * 60 * 24),
        )
        if (daysSinceLastVisit < conditions.lastVisitDays) return false
      }

      return true
    })

    if (matchingRules.length > 0) {
      // Find available beat with capacity
      const availableBeat = availableBeats.find((beat) => beat.currentAssigned < beat.maxCapacity)

      if (availableBeat) {
        const rule = matchingRules[0] // Use highest priority rule
        const itemIndex = assignedItems.findIndex((i) => i.id === item.id)

        if (itemIndex !== -1) {
          assignedItems[itemIndex] = {
            ...assignedItems[itemIndex],
            beatId: availableBeat.beatId,
            postId: availableBeat.postId,
            status: "assigned",
            priority: rule.actions.setPriority || item.priority,
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            updatedAt: new Date().toISOString(),
          }

          // Update capacity
          availableBeat.currentAssigned++
        }
      }
    }
  }

  return assignedItems
}
