"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSecurityMetrics, mockSecurityAlerts, mockSecurityEvents } from "@/lib/security"
import { Shield, AlertTriangle, Eye, Lock, Activity, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react"

export function SecurityDashboard() {
  const metrics = getSecurityMetrics()
  const recentAlerts = mockSecurityAlerts.slice(0, 5)
  const recentEvents = mockSecurityEvents.slice(0, 10)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200"
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-800"
      case "INVESTIGATING":
        return "bg-yellow-100 text-yellow-800"
      case "RESOLVED":
        return "bg-green-100 text-green-800"
      case "FALSE_POSITIVE":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.activeThreats}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">High priority incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
            <Lock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.blockedAttempts}</div>
            <p className="text-xs text-muted-foreground">Unauthorized access attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance and Security Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Compliance Score
            </CardTitle>
            <CardDescription>Overall security compliance rating</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CERT-In Guidelines</span>
              <span className="text-sm text-muted-foreground">{metrics.complianceScore}%</span>
            </div>
            <Progress value={metrics.complianceScore} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-600">Compliant Controls</p>
                <p className="text-2xl font-bold text-green-600">14/15</p>
              </div>
              <div>
                <p className="font-medium text-orange-600">Needs Attention</p>
                <p className="text-2xl font-bold text-orange-600">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Security Trends
            </CardTitle>
            <CardDescription>Security metrics over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Successful Logins</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  +12% ↗
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Failed Login Attempts</span>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  +25% ↗
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Security Violations</span>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  -8% ↘
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">System Vulnerabilities</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  -15% ↘
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Security Alerts
              </CardTitle>
              <CardDescription>Latest security incidents and threats</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All Alerts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <Alert key={alert.id} className="border-l-4 border-l-orange-500">
                <AlertTriangle className="h-4 w-4" />
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="secondary" className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </div>
                    <AlertDescription className="text-sm">{alert.description}</AlertDescription>
                    <p className="text-xs text-muted-foreground mt-1">
                      Detected: {new Date(alert.detectedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Investigate
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Security Event Log
              </CardTitle>
              <CardDescription>Real-time security events and activities</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Export Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {event.type === "LOGIN_SUCCESS" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {event.type === "LOGIN_FAILURE" && <XCircle className="h-4 w-4 text-red-500" />}
                    {event.type === "ACCESS_DENIED" && <Lock className="h-4 w-4 text-orange-500" />}
                    {event.type === "SECURITY_VIOLATION" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{event.type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.userEmail || "Unknown"} • {event.ipAddress}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getSeverityColor(event.severity)}>
                    {event.severity}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Controls Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Controls Status
          </CardTitle>
          <CardDescription>CERT-In and OWASP compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Input Validation", status: "ACTIVE", compliance: 100 },
              { name: "Authentication", status: "ACTIVE", compliance: 100 },
              { name: "Authorization", status: "ACTIVE", compliance: 100 },
              { name: "Data Encryption", status: "ACTIVE", compliance: 95 },
              { name: "Audit Logging", status: "ACTIVE", compliance: 100 },
              { name: "Error Handling", status: "ACTIVE", compliance: 90 },
              { name: "Security Headers", status: "ACTIVE", compliance: 100 },
              { name: "Rate Limiting", status: "ACTIVE", compliance: 85 },
              { name: "Data Backup", status: "ACTIVE", compliance: 100 },
              { name: "Monitoring", status: "ACTIVE", compliance: 95 },
              { name: "Configuration", status: "ACTIVE", compliance: 90 },
              { name: "Vulnerability Mgmt", status: "ACTIVE", compliance: 80 },
              { name: "Incident Response", status: "ACTIVE", compliance: 100 },
              { name: "Security Training", status: "ACTIVE", compliance: 85 },
              { name: "Compliance", status: "ACTIVE", compliance: 94 },
            ].map((control, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{control.name}</span>
                  <Badge variant={control.status === "ACTIVE" ? "default" : "secondary"}>{control.status}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Compliance</span>
                    <span>{control.compliance}%</span>
                  </div>
                  <Progress value={control.compliance} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
