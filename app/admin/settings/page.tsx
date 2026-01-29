'use client';

import { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiQuery } from '@/hooks/use-api-query';

export default function SystemSettingsPage() {

    const [settings, setSettings] = useState({
        siteName: 'Senior Citizen Portal',
        siteDescription: 'Kutumb Portal - Delhi Police',
        maxLoginAttempts: 5,
        sessionTimeout: 30,
        otpExpiryMinutes: 10,
        passwordMinLength: 8,
        enableSMSNotifications: true,
        enableEmailNotifications: true,
        enablePushNotifications: false,
    });

    const fetchSettings = useCallback(() => Promise.resolve({
        data: {
            siteName: 'Senior Citizen Portal',
            siteDescription: 'Kutumb Portal - Delhi Police',
            maxLoginAttempts: 5,
            sessionTimeout: 30,
            otpExpiryMinutes: 10,
            passwordMinLength: 8,
            enableSMSNotifications: true,
            enableEmailNotifications: true,
            enablePushNotifications: false,
        }
    }), []);

    const { data: settingsData, loading, refetch } = useApiQuery<{ data: typeof settings }>(fetchSettings, { refetchOnMount: true });

    useEffect(() => {
        if (settingsData?.data) {
            setSettings(settingsData.data);
        }
    }, [settingsData]);

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        try {
            setSaving(true);
            await apiClient.updateSystemConfig(settings);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute permissionCode="system.settings">
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">System Settings</h1>
                    <p className="text-gray-600">Configure system-wide settings and preferences</p>
                </div>

                <Tabs defaultValue="general">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="siteName">Site Name</Label>
                                    <Input
                                        id="siteName"
                                        value={settings.siteName}
                                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="siteDescription">Site Description</Label>
                                    <Input
                                        id="siteDescription"
                                        value={settings.siteDescription}
                                        onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                                    <Input
                                        id="maxLoginAttempts"
                                        type="number"
                                        min="3"
                                        max="10"
                                        value={settings.maxLoginAttempts}
                                        onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Account locks after this many failed attempts</p>
                                </div>
                                <div>
                                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                    <Input
                                        id="sessionTimeout"
                                        type="number"
                                        min="15"
                                        max="120"
                                        value={settings.sessionTimeout}
                                        onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="otpExpiry">OTP Expiry (minutes)</Label>
                                    <Input
                                        id="otpExpiry"
                                        type="number"
                                        min="5"
                                        max="30"
                                        value={settings.otpExpiryMinutes}
                                        onChange={(e) => setSettings({ ...settings, otpExpiryMinutes: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                                    <Input
                                        id="passwordMinLength"
                                        type="number"
                                        min="6"
                                        max="20"
                                        value={settings.passwordMinLength}
                                        onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Channels</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>SMS Notifications</Label>
                                        <p className="text-xs text-gray-500">Send notifications via SMS</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.enableSMSNotifications}
                                        onChange={(e) => setSettings({ ...settings, enableSMSNotifications: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Email Notifications</Label>
                                        <p className="text-xs text-gray-500">Send notifications via Email</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.enableEmailNotifications}
                                        onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Push Notifications</Label>
                                        <p className="text-xs text-gray-500">Send push notifications to mobile apps</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.enablePushNotifications}
                                        onChange={(e) => setSettings({ ...settings, enablePushNotifications: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="system">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Backend Version:</span>
                                    <span className="font-semibold">v1.0.0</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Frontend Version:</span>
                                    <span className="font-semibold">v1.0.0</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Database:</span>
                                    <span className="font-semibold">PostgreSQL</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Environment:</span>
                                    <span className="font-semibold">Development</span>
                                </div>
                                <div className="pt-4 space-y-2">
                                    <Button variant="outline" className="w-full">
                                        🔄 Clear Cache
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        📋 View System Logs
                                    </Button>
                                    <Button variant="outline" className="w-full text-red-600">
                                        🗑️ Clear Session Data
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline">Reset to Defaults</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>
        </ProtectedRoute>
    );
}
