"use client"

import { useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import apiClient from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Search, MoreHorizontal, Shield, ShieldAlert } from "lucide-react"
import { CreateUserDialog } from "./create-user-dialog"
import { UserDetailPanel } from "./user-detail-panel"

interface RoleDefinition {
  id: string
  code: string
  name: string
  description?: string | null
  permissions: string[]
  isActive: boolean
  userCount?: number
}

interface UserRecord {
  id: string
  displayName: string
  email: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
  lastLogin?: string | null
  citizenProfile?: {
    id: string
    fullName: string
    mobileNumber: string
    permanentAddress: string
    vulnerabilityLevel: string
    policeStationName: string | null
  } | null
  roleDetails?: RoleDefinition | null
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

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface MatrixUser {
  id: string
  displayName: string
  email: string
  phone: string
  isActive: boolean
  roleCode?: string | null
}

export function UserManagement() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [matrixUsers, setMatrixUsers] = useState<MatrixUser[]>([])
  const [matrixLoading, setMatrixLoading] = useState<boolean>(true)
  const [matrixError, setMatrixError] = useState("")
  const [matrixBusyKey, setMatrixBusyKey] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [detailUser, setDetailUser] = useState<UserRecord | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [userForAssignment, setUserForAssignment] = useState<UserRecord | null>(null)
  const [selectedRoleCode, setSelectedRoleCode] = useState("")
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [filters, pagination.page])

  useEffect(() => {
    loadRoleMatrix()
  }, [])

  const loadRoleMatrix = async () => {
    try {
      setMatrixLoading(true)
      setMatrixError("")
      const response = await apiClient.getRoleMatrix()
      if (response.success) {
        setRoles(response.data.roles || [])
        setMatrixUsers(
          (response.data.users || []).map((user: any) => ({
            id: user.id,
            displayName: user.displayName,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive,
            roleCode: user.roleCode,
          })),
        )
      }
    } catch (err: any) {
      console.error("Failed to load role matrix", err)
      setMatrixError(err?.response?.data?.message || "Unable to load role matrix")
    } finally {
      setMatrixLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError("")
      const params: Record<string, any> = {
        page: pagination.page,
        limit: pagination.limit,
      }
      if (filters.search) params.search = filters.search
      if (filters.role !== "all") params.role = filters.role
      if (filters.status !== "all") params.status = filters.status

      const response = await apiClient.getUsers(params)
      if (response.success) {
        setUsers(response.data.users)
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        }))
      }
    } catch (err: any) {
      console.error("Failed to fetch users", err)
      setError(err.response?.data?.message || "Unable to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (user: UserRecord, nextValue: boolean) => {
    try {
      await apiClient.updateUserStatus(user.id, nextValue)
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: nextValue } : u)))
    } catch (err) {
      console.error("Failed to update status", err)
      alert("Failed to update user status")
    }
  }

  const openAssignDialog = (user: UserRecord) => {
    setUserForAssignment(user)
    setSelectedRoleCode(user.role)
    setAssignDialogOpen(true)
  }

  const handleAssignRole = async () => {
    if (!userForAssignment || !selectedRoleCode) return
    try {
      setAssigning(true)
      await apiClient.updateUserRole(userForAssignment.id, selectedRoleCode)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userForAssignment.id
            ? {
              ...u,
              role: selectedRoleCode,
              roleDetails: roles.find((role) => role.code === selectedRoleCode) || null,
            }
            : u,
        ),
      )
      setAssignDialogOpen(false)
      setUserForAssignment(null)
    } catch (err) {
      console.error("Failed to assign role", err)
      alert("Failed to assign role")
    } finally {
      setAssigning(false)
    }
  }

  const handleQuickRoleAssign = async (userId: string, roleCode: string) => {
    const targetUser = matrixUsers.find((user) => user.id === userId)
    if (!targetUser || targetUser.roleCode === roleCode) return
    try {
      setMatrixBusyKey(`${userId}:${roleCode}`)
      await apiClient.updateUserRole(userId, roleCode)
      await Promise.all([loadRoleMatrix(), fetchUsers()])
    } catch (err: any) {
      console.error("Failed to assign role from matrix", err)
      setMatrixError(err?.response?.data?.message || "Unable to update user role")
    } finally {
      setMatrixBusyKey(null)
    }
  }

  const filteredRoleOptions = useMemo(() => roles.filter((role) => role.isActive), [roles])

  const roleFilterLabel = useMemo(() => {
    if (filters.role === "all") return "All roles"
    const role = roles.find((r) => r.code === filters.role)
    return role ? role.name : "Custom role"
  }, [filters.role, roles])

  const statusFilterLabel = filters.status === "all" ? "All statuses" : filters.status === "active" ? "Active" : "Inactive"

  const roleAssignmentCounts = useMemo(
    () =>
      matrixUsers.reduce<Record<string, number>>((acc, user) => {
        if (user.roleCode) {
          acc[user.roleCode] = (acc[user.roleCode] ?? 0) + 1
        }
        return acc
      }, {}),
    [matrixUsers],
  )

  const renderStatus = (user: UserRecord) => (
    <div className="flex items-center gap-2">
      <Switch checked={user.isActive} onCheckedChange={(checked) => handleStatusToggle(user, checked)} />
      <span className="text-sm text-muted-foreground">{user.isActive ? "Active" : "Inactive"}</span>
    </div>
  )

  const renderRoleBadge = (user: UserRecord) => {
    const roleName = user.roleDetails?.name || user.role
    return <Badge>{roleName}</Badge>
  }

  const openDetailPanel = (user: UserRecord) => {
    setDetailUser(user)
    setDetailOpen(true)
  }

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null
    return (
      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))
            }
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone"
            value={filters.search}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }))
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select
          value={filters.role}
          onValueChange={(value) => {
            setPagination((prev) => ({ ...prev, page: 1 }))
            setFilters((prev) => ({ ...prev, role: value }))
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" defaultValue="all">
              {roleFilterLabel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.code}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => {
            setPagination((prev) => ({ ...prev, page: 1 }))
            setFilters((prev) => ({ ...prev, status: value }))
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status">{statusFilterLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Role & Permission Matrix</CardTitle>
              <CardDescription>Live mapping of every user to their assigned role and permissions.</CardDescription>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {roles.length === 0 && !matrixLoading ? (
              <p className="text-sm text-muted-foreground">No roles available. Create roles to begin assigning permissions.</p>
            ) : (
              roles.map((role) => (
                <div key={role.id} className="min-w-[220px] rounded-lg border p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.description || "No description set"}</p>
                    </div>
                    <Badge variant="outline">{roleAssignmentCounts[role.code] ?? 0}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(role.permissions || []).length === 0 && (
                      <span className="text-xs text-muted-foreground">No permissions linked</span>
                    )}
                    {(role.permissions || []).slice(0, 4).map((perm) => (
                      <Badge key={`${role.id}-${perm}`} variant="secondary" className="text-[11px]">
                        {perm}
                      </Badge>
                    ))}
                    {role.permissions && role.permissions.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{role.permissions.length - 4} more</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardHeader>
        <CardContent>
          {matrixError && (
            <Alert variant="destructive" className="mb-3">
              <AlertDescription>{matrixError}</AlertDescription>
            </Alert>
          )}
          {matrixLoading ? (
            <p className="text-sm text-muted-foreground">Loading role matrix…</p>
          ) : matrixUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users available for the matrix.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">User</TableHead>
                    {roles.map((role) => (
                      <TableHead key={`matrix-head-${role.id}`} className="text-center">
                        {role.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrixUsers.map((matrixUser) => (
                    <TableRow key={`matrix-row-${matrixUser.id}`}>
                      <TableCell className="align-top">
                        <div className="font-medium">{matrixUser.displayName}</div>
                        <p className="text-xs text-muted-foreground">{matrixUser.email}</p>
                        <p className="text-xs text-muted-foreground">{matrixUser.phone}</p>
                      </TableCell>
                      {roles.map((role) => {
                        const isAssigned = matrixUser.roleCode === role.code
                        const cellKey = `${matrixUser.id}:${role.code}`
                        const isBusy = matrixBusyKey === cellKey
                        const disableRow = matrixBusyKey?.startsWith(`${matrixUser.id}:`) && !isBusy
                        return (
                          <TableCell key={`matrix-cell-${matrixUser.id}-${role.id}`} className="text-center">
                            <Button
                              size="sm"
                              variant={isAssigned ? "default" : "outline"}
                              disabled={isAssigned || isBusy || disableRow}
                              onClick={() => handleQuickRoleAssign(matrixUser.id, role.code)}
                            >
                              {isBusy ? "Saving…" : isAssigned ? "Current" : "Assign"}
                            </Button>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>Manage user accounts, roles, and access permissions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No users match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-semibold text-primary">
                              {user.displayName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.displayName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">{user.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{renderRoleBadge(user)}</TableCell>
                      <TableCell>{renderStatus(user)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin
                          ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                          : "No activity"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDetailPanel(user)}>
                              <Shield className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAssignDialog(user)}>
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Assign Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {renderPagination()}
        </CardContent>
      </Card>

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        roles={filteredRoleOptions}
        onCreated={fetchUsers}
      />

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>Update the role and permissions for this user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="font-medium">{userForAssignment?.displayName}</p>
            <Select value={selectedRoleCode} onValueChange={setSelectedRoleCode}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {filteredRoleOptions.map((role) => (
                  <SelectItem key={role.id} value={role.code}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignRole} disabled={assigning || !selectedRoleCode}>
              {assigning ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) setDetailUser(null)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>Detailed view of the selected user.</DialogDescription>
          </DialogHeader>
          <UserDetailPanel user={detailUser} onClose={() => setDetailOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
