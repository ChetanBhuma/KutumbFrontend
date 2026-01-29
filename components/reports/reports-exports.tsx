"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Calendar, Clock, Users, MapPin, Activity, Plus, Play, Pause, Settings } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExportDialog } from "./export-dialog"
import { ScheduleReportDialog } from "./schedule-report-dialog"

const mockReports = [
  {
    id: "1",
    name: "Weekly Citizen Report",
    type: "Citizens",
    schedule: "Weekly - Monday 9:00 AM",
    status: "active",
    lastRun: "2024-01-15 09:00",
    nextRun: "2024-01-22 09:00",
    recipients: ["admin@delhipolice.gov.in", "range@delhipolice.gov.in"],
  },
  {
    id: "2",
    name: "Monthly Visit Analytics",
    type: "Visits",
    schedule: "Monthly - 1st day 10:00 AM",
    status: "active",
    lastRun: "2024-01-01 10:00",
    nextRun: "2024-02-01 10:00",
    recipients: ["analytics@delhipolice.gov.in"],
  },
  {
    id: "3",
    name: "Daily Audit Log",
    type: "Audit",
    schedule: "Daily - 11:59 PM",
    status: "paused",
    lastRun: "2024-01-14 23:59",
    nextRun: "Paused",
    recipients: ["security@delhipolice.gov.in"],
  },
]

export function ReportsExports() {
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("exports")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Citizens":
        return <Users className="h-4 w-4" />
      case "Visits":
        return <MapPin className="h-4 w-4" />
      case "Audit":
        return <Activity className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exports" className="tab-inactive data-[state=active]:tab-active">
            <Download className="h-4 w-4 mr-2" />
            Ad-hoc Exports
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="tab-inactive data-[state=active]:tab-active">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exports" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Quick Exports</h3>
              <p className="text-sm text-muted-foreground">Generate and download reports instantly</p>
            </div>
            <Button onClick={() => setShowExportDialog(true)} className="hover-lift">
              <Download className="h-4 w-4 mr-2" />
              New Export
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover-lift cursor-pointer hover-navy">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Citizens Data</h4>
                    <p className="text-sm text-muted-foreground">Export citizen records</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift cursor-pointer hover-navy">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <MapPin className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Visit Reports</h4>
                    <p className="text-sm text-muted-foreground">Export visit logs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift cursor-pointer hover-navy">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Activity className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium">Audit Logs</h4>
                    <p className="text-sm text-muted-foreground">Export system logs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Exports
              </CardTitle>
              <CardDescription>Your recently generated export files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Citizens_Report_2024-01-15.csv", size: "2.4 MB", date: "15 Jan 2024, 10:30 AM" },
                  { name: "Visit_Analytics_2024-01-14.pdf", size: "1.8 MB", date: "14 Jan 2024, 3:45 PM" },
                  { name: "Audit_Log_2024-01-13.csv", size: "5.2 MB", date: "13 Jan 2024, 11:59 PM" },
                ].map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.size} • {file.date}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="hover-wine bg-transparent">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Scheduled Reports</h3>
              <p className="text-sm text-muted-foreground">Automated report generation and distribution</p>
            </div>
            <Button onClick={() => setShowScheduleDialog(true)} className="hover-lift">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>

          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Active Schedules
              </CardTitle>
              <CardDescription>Manage your automated report schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getTypeIcon(report.type)}
                          <div>
                            <p className="font-medium">{report.name}</p>
                            <p className="text-sm text-muted-foreground">{report.type} Report</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{report.schedule}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{report.nextRun}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="sm" variant="outline" className="hover-navy bg-transparent">
                            {report.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          </Button>
                          <Button size="sm" variant="outline" className="hover-wine bg-transparent">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ExportDialog open={showExportDialog} onOpenChange={setShowExportDialog} />

      <ScheduleReportDialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog} />
    </div>
  )
}
