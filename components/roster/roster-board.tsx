"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MapPin, User, AlertTriangle } from "lucide-react"
import type { RosterItem, BeatCapacity } from "@/types/roster"

interface RosterBoardProps {
  items: RosterItem[]
  capacities: BeatCapacity[]
  onItemClick: (item: RosterItem) => void
  onItemMove: (itemId: string, toBeatId: string | null) => void
}

interface BoardColumn {
  id: string
  title: string
  beatId?: string
  postId?: string
  postName?: string
  items: RosterItem[]
  capacity?: BeatCapacity
}

function RosterCard({ item, onClick }: { item: RosterItem; onClick: () => void }) {
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
    if (score >= 80) return "bg-red-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  const daysSinceLastVisit = item.lastVisitAt
    ? Math.floor((Date.now() - new Date(item.lastVisitAt).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary/20" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={item.citizenPhoto || "/placeholder.svg"} alt={item.citizenName} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-sm truncate">{item.citizenName}</h4>
              <div className={`w-3 h-3 rounded-full ${getScoreColor(item.vulnerabilityScore)}`} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{item.citizenAddress}</span>
              </div>

              {item.distance && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{item.distance.toFixed(1)} km away</span>
                </div>
              )}

              {daysSinceLastVisit !== null && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{daysSinceLastVisit === 0 ? "Visited today" : `${daysSinceLastVisit} days ago`}</span>
                  {daysSinceLastVisit > 7 && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                {item.priority}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {item.vulnerabilityScore}
              </Badge>
            </div>

            {item.assignedOfficerName && (
              <div className="mt-2 text-xs text-muted-foreground">Assigned to: {item.assignedOfficerName}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BoardColumn({
  column,
  onItemClick,
  onItemMove,
}: {
  column: BoardColumn
  onItemClick: (item: RosterItem) => void
  onItemMove: (itemId: string, toBeatId: string | null) => void
}) {
  const isOverCapacity = column.capacity && column.items.length > column.capacity.maxCapacity

  return (
    <div className="flex flex-col h-full">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
            <Badge variant={isOverCapacity ? "destructive" : "secondary"}>
              {column.items.length}
              {column.capacity && ` / ${column.capacity.maxCapacity}`}
            </Badge>
          </div>
          {column.postName && <p className="text-xs text-muted-foreground">{column.postName}</p>}
          {column.capacity && (
            <div className="text-xs text-muted-foreground">Officers: {column.capacity.availableOfficers} available</div>
          )}
        </CardHeader>
      </Card>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {column.items.map((item) => (
          <RosterCard key={item.id} item={item} onClick={() => onItemClick(item)} />
        ))}

        {column.items.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">No assignments</div>
        )}
      </div>
    </div>
  )
}

export function RosterBoard({ items, capacities, onItemClick, onItemMove }: RosterBoardProps) {
  // Group items by beat/post
  const unassignedItems = items.filter((item) => item.status === "unassigned")

  // Group assigned items by post
  const postGroups = new Map<string, { postName: string; beats: Map<string, RosterItem[]> }>()

  items
    .filter((item) => item.status === "assigned" && item.beatId && item.postId)
    .forEach((item) => {
      const capacity = capacities.find((c) => c.beatId === item.beatId)
      if (!capacity) return

      if (!postGroups.has(item.postId!)) {
        postGroups.set(item.postId!, {
          postName: capacity.postName,
          beats: new Map(),
        })
      }

      const postGroup = postGroups.get(item.postId!)!
      if (!postGroup.beats.has(item.beatId!)) {
        postGroup.beats.set(item.beatId!, [])
      }
      postGroup.beats.get(item.beatId!)!.push(item)
    })

  // Create columns
  const columns: BoardColumn[] = [
    {
      id: "unassigned",
      title: "Unassigned",
      items: unassignedItems,
    },
  ]

  // Add beat columns grouped by post
  postGroups.forEach((postGroup, postId) => {
    postGroup.beats.forEach((beatItems, beatId) => {
      const capacity = capacities.find((c) => c.beatId === beatId)
      if (capacity) {
        columns.push({
          id: beatId,
          title: capacity.beatName,
          beatId,
          postId,
          postName: capacity.postName,
          items: beatItems,
          capacity,
        })
      }
    })
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
      {columns.map((column) => (
        <BoardColumn key={column.id} column={column} onItemClick={onItemClick} onItemMove={onItemMove} />
      ))}
    </div>
  )
}
