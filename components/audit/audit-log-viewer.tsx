"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Download, Eye, Calendar, User, Shield, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getAuditLogStats } from "@/lib/audit-data"
import type { AuditLogEntry, AuditLogFilters } from "@/types/audit"
import apiClient from "@/lib/api-client"

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "authentication":
      return <User className="h-4 w-4" />
    case "security":
      return <Shield className="h-4 w-4" />
    case "data_change":
      return <Eye className="h-4 w-4" />
    case "system_event":
      return <Calendar className="h-4 w-4" />
    case "compliance":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <Eye className="h-4 w-4" />
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-500"
    case "high":
      return "bg-orange-500"
    case "medium":
      return "bg-yellow-500"
    case "low":
      return "bg-green-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800"
    case "failure":
      return "bg-red-100 text-red-800"
    case "warning":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatTimestamp = (date: Date) => {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date)
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<AuditLogFilters>({ category: "", severity: "", status: "", userId: "" })
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getAuditLogs({ limit: 100 })
      const mappings = response.data?.items || response.items || []
      const mappedLogs = mappings.map((log: any) => {
        const details = typeof log.details === 'string' ? JSON.parse(log.details) : (log.details || {});
        return {
          id: log.id,
          timestamp: new Date(log.timestamp || log.createdAt),
          userId: log.userId,
          userName: log.User?.email || log.user?.fullName || 'Unknown',
          userRole: log.User?.role || log.user?.role || 'Unknown',
          action: log.action,
          category: details.category || 'system_event',
          resource: log.resource,
          details: details.message || JSON.stringify(details),
          status: details.status || 'success',
          severity: details.severity || 'low',
          ipAddress: log.ipAddress || 'N/A',
          metadata: details.metadata,
          changes: details.changes
        };
      })
      setLogs(mappedLogs)
    } catch (error) {
      console.error("Failed to fetch logs", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const stats = getAuditLogStats(logs)

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (
        filters.searchTerm &&
        !log.details.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !log.userName.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !log.action.toLowerCase().includes(filters.searchTerm.toLowerCase())
      ) {
        return false
      }

      if (filters.category && log.category !== filters.category) return false
      if (filters.severity && log.severity !== filters.severity) return false
      if (filters.status && log.status !== filters.status) return false
      if (filters.userId && log.userId !== filters.userId) return false

      return true
    })
  }, [logs, filters])

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "User", "Action", "Category", "Resource", "Details", "Status", "Severity", "IP Address"].join(","),
      ...filteredLogs.map((log) =>
        [
          formatTimestamp(log.timestamp),
          log.userName,
          log.action,
          log.category,
          log.resource,
          `"${log.details}"`,
          log.status,
          log.severity,
          log.ipAddress,
        ].join(","),
      ),
    ].join("\n")

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Clean up the blob URL after a short delay to ensure download completes
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      console.error("Failed to export audit logs:", error)
      // Fallback: try to download as text file
      const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
      const a = document.createElement("a")
      a.href = dataStr
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.byCategory.security || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.byStatus.failure || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit Log Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-10"
                  value={filters.searchTerm || ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
                />
              </div>
            </div>

            <Select
              value={filters.category}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value === "all" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="authentication">Authentication</SelectItem>
                <SelectItem value="data_change">Data Change</SelectItem>
                <SelectItem value="system_event">System Event</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severity}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, severity: value === "all" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value === "all" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportLogs} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit Entries ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{formatTimestamp(log.timestamp)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.userName}</div>
                      <div className="text-sm text-muted-foreground">{log.userRole}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(log.category)}
                      <span className="capitalize">{log.category.replace("_", " ")}</span>
                    </div>
                  </TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(log.severity)}`} />
                      <span className="capitalize">{log.severity}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Audit Log Details</DialogTitle>
                        </DialogHeader>
                        {selectedLog && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Timestamp</label>
                                <p className="font-mono text-sm">{formatTimestamp(selectedLog.timestamp)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Session ID</label>
                                <p className="font-mono text-sm">{selectedLog.sessionId}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">User</label>
                                <p>
                                  {selectedLog.userName} ({selectedLog.userRole})
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">IP Address</label>
                                <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Action Details</label>
                              <p className="mt-1">{selectedLog.details}</p>
                            </div>

                            {selectedLog.changes && selectedLog.changes.length > 0 && (
                              <div>
                                <label className="text-sm font-medium">Changes Made</label>
                                <div className="mt-2 space-y-2">
                                  {selectedLog.changes.map((change, index) => (
                                    <div key={index} className="bg-muted p-3 rounded">
                                      <div className="font-medium">{change.field}</div>
                                      <div className="text-sm">
                                        <span className="text-red-600">- {JSON.stringify(change.oldValue)}</span>
                                        <br />
                                        <span className="text-green-600">+ {JSON.stringify(change.newValue)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedLog.metadata && (
                              <div>
                                <label className="text-sm font-medium">Metadata</label>
                                <pre className="mt-1 bg-muted p-3 rounded text-sm overflow-auto">
                                  {JSON.stringify(selectedLog.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
