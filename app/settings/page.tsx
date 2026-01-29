"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Shield, Bell, Database, Users, Globe, Loader2 } from "lucide-react"
import apiClient from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Record<string, any>>({})

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      if (!isMounted) return;

      try {
        setLoading(true)
        const response = await apiClient.getSettings()

        if (!isMounted) return;

        const settingsMap = response.settings.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value
          return acc
        }, {})
        setSettings(settingsMap)
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        toast({ variant: "destructive", title: "Error", description: "Failed to load settings" })
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSettings()

    return () => {
      isMounted = false;
    }
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const promises = Object.entries(settings).map(([key, value]) =>
        apiClient.updateSetting(key, value)
      )
      await Promise.all(promises)
      toast({ title: "Success", description: "Settings saved successfully" })
    } catch (error) {
      console.error("Failed to save settings", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings" })
    } finally {
      setSaving(false)
    }
  }

  const updateState = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ProtectedRoute requiredPermission={{ resource: "system", action: "settings" }}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground">Configure system preferences and security settings</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="users">User Defaults</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Application Settings
                </CardTitle>
                <CardDescription>Configure general application preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-name">Application Name</Label>
                    <Input
                      id="app-name"
                      value={settings['app.name'] || "Kutumb App"}
                      onChange={(e) => updateState('app.name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input id="version" defaultValue="2.0.0" disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={settings['app.description'] || "Delhi Police - Senior Citizens Welfare Portal"}
                    onChange={(e) => updateState('app.description', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable maintenance mode for system updates</p>
                  </div>
                  <Switch
                    checked={settings['app.maintenanceMode'] || false}
                    onCheckedChange={(checked) => updateState('app.maintenanceMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Configuration
                </CardTitle>
                <CardDescription>Manage security settings and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={settings['security.sessionTimeout'] || 30}
                      onChange={(e) => updateState('security.sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">Max Login Attempts</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      value={settings['security.maxLoginAttempts'] || 3}
                      onChange={(e) => updateState('security.maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-otp">Default OTP (Development)</Label>
                  <Input id="default-otp" defaultValue="000000" disabled />
                  <p className="text-sm text-muted-foreground">Used for demo accounts starting with 999</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
                  </div>
                  <Switch
                    checked={settings['security.2fa'] !== false} // Default true
                    onCheckedChange={(checked) => updateState('security.2fa', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Password Complexity</Label>
                    <p className="text-sm text-muted-foreground">Enforce strong password requirements</p>
                  </div>
                  <Switch
                    checked={settings['security.passwordComplexity'] !== false}
                    onCheckedChange={(checked) => updateState('security.passwordComplexity', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email alerts for critical events</p>
                  </div>
                  <Switch
                    checked={settings['notifications.email'] !== false}
                    onCheckedChange={(checked) => updateState('notifications.email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS alerts for urgent matters</p>
                  </div>
                  <Switch
                    checked={settings['notifications.sms'] !== false}
                    onCheckedChange={(checked) => updateState('notifications.sms', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={settings['notifications.adminEmail'] || "admin@delhipolice.gov.in"}
                    onChange={(e) => updateState('notifications.adminEmail', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Configuration
                </CardTitle>
                <CardDescription>Database connection and backup settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Database Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                      <span className="text-sm text-muted-foreground">PostgreSQL 14.2</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Last Backup</Label>
                    <p className="text-sm text-muted-foreground">2024-01-15 02:00:00</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">Daily automatic database backups</p>
                  </div>
                  <Switch
                    checked={settings['database.autoBackup'] !== false}
                    onCheckedChange={(checked) => updateState('database.autoBackup', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                  <Input
                    id="backup-retention"
                    type="number"
                    value={settings['database.retentionDays'] || 30}
                    onChange={(e) => updateState('database.retentionDays', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Default Settings
                </CardTitle>
                <CardDescription>Default settings for new user accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-role">Default Role</Label>
                  <Input
                    id="default-role"
                    value={settings['users.defaultRole'] || "Beat Officer"}
                    onChange={(e) => updateState('users.defaultRole', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                    <Input
                      id="password-expiry"
                      type="number"
                      value={settings['users.passwordExpiry'] || 90}
                      onChange={(e) => updateState('users.passwordExpiry', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-lockout">Account Lockout (hours)</Label>
                    <Input
                      id="account-lockout"
                      type="number"
                      value={settings['users.accountLockout'] || 24}
                      onChange={(e) => updateState('users.accountLockout', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Force Password Change</Label>
                    <p className="text-sm text-muted-foreground">Require password change on first login</p>
                  </div>
                  <Switch
                    checked={settings['users.forcePasswordChange'] !== false}
                    onCheckedChange={(checked) => updateState('users.forcePasswordChange', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>Reset to Defaults</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  )
}
