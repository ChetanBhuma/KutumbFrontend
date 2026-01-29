'use client';

import { useState } from 'react';
import apiClient from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NotificationsPage() {
    const [type, setType] = useState('SMS');
    const [recipients, setRecipients] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSend = async () => {
        try {
            setSending(true);
            setResult(null);

            const recipientArray = recipients.split(',').map(r => r.trim()).filter(r => r);

            const response = await apiClient.post('/notifications/bulk', {
                recipients: recipientArray,
                subject,
                message,
                type,
            }) as any;

            if (response.success) {
                setResult({
                    success: true,
                    data: response.data,
                });
                setRecipients('');
                setSubject('');
                setMessage('');
            }
        } catch (error: any) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Failed to send notifications',
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <ProtectedRoute permissionCode="notifications.manage">
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Notification Management</h1>
                    <p className="text-gray-600">Send bulk notifications to citizens and officers</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Send Bulk Notification</CardTitle>
                        <CardDescription>Send SMS, Email, or Push notifications to multiple recipients</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {result && (
                            <Alert variant={result.success ? 'default' : 'destructive'}>
                                <AlertDescription>
                                    {result.success ? (
                                        <>
                                            ✅ Notification sent successfully!
                                            <br />
                                            <span className="text-sm">
                                                Sent: {result.data.sent} | Failed: {result.data.failed} | Total: {result.data.total}
                                            </span>
                                        </>
                                    ) : (
                                        `❌ ${result.message}`
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div>
                            <Label htmlFor="type">Notification Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SMS">SMS</SelectItem>
                                    <SelectItem value="EMAIL">Email</SelectItem>
                                    <SelectItem value="PUSH">Push Notification</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                                {type === 'SMS' && 'Requires phone numbers (+91XXXXXXXXXX)'}
                                {type === 'EMAIL' && 'Requires email addresses'}
                                {type === 'PUSH' && 'Requires device tokens'}
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="recipients">Recipients (comma-separated)</Label>
                            <Textarea
                                id="recipients"
                                placeholder={
                                    type === 'SMS' ? '+919876543210, +919876543211, ...' :
                                        type === 'EMAIL' ? 'user1@example.com, user2@example.com, ...' :
                                            'device-token-1, device-token-2, ...'
                                }
                                value={recipients}
                                onChange={(e) => setRecipients(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {type === 'EMAIL' && (
                            <div>
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="Email subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Enter your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={6}
                                maxLength={type === 'SMS' ? 160 : 1000}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {message.length} / {type === 'SMS' ? 160 : 1000} characters
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleSend}
                                disabled={sending || !recipients || !message}
                                className="flex-1"
                            >
                                {sending ? 'Sending...' : `Send ${type}`}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setRecipients('');
                                    setSubject('');
                                    setMessage('');
                                    setResult(null);
                                }}
                            >
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Templates */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Quick Templates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setMessage('Reminder: Police verification visit scheduled tomorrow. Please ensure someone is available at home. Stay safe!')}
                        >
                            📅 Visit Reminder Template
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setMessage('Safety Alert: Please be cautious and keep emergency contacts handy. Delhi Police is here for your safety. Dial 100 for emergencies.')}
                        >
                            🚨 Safety Alert Template
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setMessage('Festival Greetings from Delhi Police! Stay safe and enjoy the festivities. We are always here to serve you.')}
                        >
                            🎉 Festival Greeting Template
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
