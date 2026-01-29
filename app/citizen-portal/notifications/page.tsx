'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function CitizenNotificationsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [preferences, setPreferences] = useState({
        consentNotifications: true,
        consentScheduledVisitReminder: true,
        consentServiceRequest: true,
        consentShareHealth: false,
        consentToNotifyFamily: true
    });

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            if (!isMounted) return;

            try {
                const response = await apiClient.getMyProfile();

                if (!isMounted) return;

                if (response.success) {
                    const citizen = response.data.citizen;
                    setPreferences({
                        consentNotifications: citizen.consentNotifications ?? true,
                        consentScheduledVisitReminder: citizen.consentScheduledVisitReminder ?? true,
                        consentServiceRequest: citizen.consentServiceRequest ?? true,
                        consentShareHealth: citizen.consentShareHealth ?? false,
                        consentToNotifyFamily: citizen.consentToNotifyFamily ?? true
                    });
                }
            } catch (err) {
                console.error('Failed to load profile', err);
                if (!isMounted) return;

                setError('Failed to load preferences');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            const response = await apiClient.updateMyNotifications(preferences);
            if (response.success) {
                toast({ title: 'Preferences Updated', description: 'Your notification settings have been saved.' });
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    const toggle = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <ProtectedRoute permissionCode="profile.read.own">
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notification Preferences</h1>
                    <p className="text-muted-foreground">Manage how we communicate with you and your emergency contacts.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Communication Settings</CardTitle>
                        <CardDescription>Control what alerts and messages you receive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label className="text-base">General Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive updates about your account and general announcements.</p>
                            </div>
                            <Switch
                                checked={preferences.consentNotifications}
                                onCheckedChange={() => toggle('consentNotifications')}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label className="text-base">Visit Reminders</Label>
                                <p className="text-sm text-muted-foreground">Get reminded before a scheduled police visit.</p>
                            </div>
                            <Switch
                                checked={preferences.consentScheduledVisitReminder}
                                onCheckedChange={() => toggle('consentScheduledVisitReminder')}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label className="text-base">Service Request Updates</Label>
                                <p className="text-sm text-muted-foreground">Notifications when your requests are updated.</p>
                            </div>
                            <Switch
                                checked={preferences.consentServiceRequest}
                                onCheckedChange={() => toggle('consentServiceRequest')}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label className="text-base">Notify Family</Label>
                                <p className="text-sm text-muted-foreground">Alert your emergency contacts during SOS or critical events.</p>
                            </div>
                            <Switch
                                checked={preferences.consentToNotifyFamily}
                                onCheckedChange={() => toggle('consentToNotifyFamily')}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label className="text-base">Share Health Data</Label>
                                <p className="text-sm text-muted-foreground">Allow sharing health info with emergency responders.</p>
                            </div>
                            <Switch
                                checked={preferences.consentShareHealth}
                                onCheckedChange={() => toggle('consentShareHealth')}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Preferences
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
