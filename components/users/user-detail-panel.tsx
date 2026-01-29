"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

interface UserRecord {
  id: string
  displayName: string
  email: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
  lastLogin?: string | null
  roleDetails?: {
    id: string
    code: string
    name: string
    description?: string | null
    permissions: string[]
  } | null
  citizenProfile?: {
    id: string
    fullName: string
    mobileNumber: string
    permanentAddress: string
    vulnerabilityLevel: string
    policeStationName: string | null
  } | null
  officerProfile?: {
    id: string
    rank: string | null
    name: string | null
    badgeNumber: string | null
    Range?: { id: string; name: string } | null
    District?: { id: string; name: string } | null
    SubDivision?: { id: string; name: string } | null
    PoliceStation?: { id: string; name: string } | null
    Beat?: { id: string; name: string } | null
  } | null
}

interface UserDetailPanelProps {
  user: UserRecord | null
  onClose: () => void
}

export function UserDetailPanel({ user, onClose }: UserDetailPanelProps) {
  if (!user) return null

  const roleLabel = user.roleDetails?.name || user.role
  const lastSeen = user.lastLogin
    ? `${formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}`
    : "No login activity"

  return (
    <Card className="max-w-lg shadow-none border-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-0">
        <div className="px-4">
          <CardTitle>{user.displayName}</CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">{user.phone}</p>
        </div>
        <Badge className="mx-4" variant={user.isActive ? "secondary" : "outline"}>{user.isActive ? "Active" : "Inactive"}</Badge>
      </CardHeader>
      <CardContent className="space-y-6 px-0 max-h-[60vh] overflow-y-auto pr-2">

        {/* Officer Profile Section */}
        {user.officerProfile && (
          <section className="space-y-3 rounded-lg border bg-slate-50 p-4 mx-4 my-2 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Officer Profile</h4>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {user.officerProfile.rank || "Officer"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Officer Name</p>
                <p className="font-medium">{user.officerProfile.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">PIS No.</p>
                <p className="font-medium">{user.officerProfile.badgeNumber || "-"}</p>
              </div>
            </div>

            <div className="border-t pt-3 mt-2">
              <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Assigned Jurisdiction</p>
              <div className="space-y-2 text-sm">
                {user.officerProfile.Range && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Range:</span> <span>{user.officerProfile.Range.name}</span></div>
                )}
                {user.officerProfile.District && (
                  <div className="flex justify-between"><span className="text-muted-foreground">District:</span> <span>{user.officerProfile.District.name}</span></div>
                )}
                {user.officerProfile.SubDivision && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Sub-Division:</span> <span>{user.officerProfile.SubDivision.name}</span></div>
                )}
                {user.officerProfile.PoliceStation && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Police Station:</span> <span>{user.officerProfile.PoliceStation.name}</span></div>
                )}
                {user.officerProfile.Beat && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Beat:</span> <span>{user.officerProfile.Beat.name}</span></div>
                )}
                {!user.officerProfile.Range && !user.officerProfile.District && !user.officerProfile.SubDivision && !user.officerProfile.PoliceStation && !user.officerProfile.Beat && (
                  <p className="text-xs text-muted-foreground italic">No specific jurisdiction assigned.</p>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="space-y-2 mx-4 my-2">
          <p className="text-sm font-medium">System Role & Permissions</p>
          <div className="flex flex-col gap-1 rounded-md border p-3">
            <div className="mb-2 flex items-center justify-between">
              <Badge className="w-fit">{roleLabel}</Badge>
              <span className="text-xs text-muted-foreground">{user.roleDetails?.permissions?.length || 0} perms</span>
            </div>
            {user.roleDetails?.description && (
              <p className="text-xs text-muted-foreground">{user.roleDetails.description}</p>
            )}
          </div>
        </section>

        <section className="space-y-2 mx-4 my-2">
          <p className="text-sm font-medium">Account Activity</p>
          <div className="grid grid-cols-2 gap-4 rounded-md border p-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Last Login</p>
              <p>{lastSeen}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Joined On</p>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </section>

        {user.citizenProfile && (
          <section className="space-y-2">
            <p className="text-sm font-medium">Linked Citizen Profile</p>
            <div className="rounded-lg border bg-muted p-3 text-sm">
              <p className="font-medium">{user.citizenProfile.fullName}</p>
              <p className="text-muted-foreground">{user.citizenProfile.mobileNumber}</p>
              <p className="mt-1 text-xs text-muted-foreground">{user.citizenProfile.permanentAddress}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline">{user.citizenProfile.vulnerabilityLevel}</Badge>
                {user.citizenProfile.policeStationName && (
                  <span className="text-muted-foreground">{user.citizenProfile.policeStationName}</span>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
