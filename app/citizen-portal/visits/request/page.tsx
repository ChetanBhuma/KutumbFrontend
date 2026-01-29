'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Stethoscope, Calendar, MapPin, Info, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProtectedRoute } from '@/components/auth/protected-route';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function VisitRequestPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        preferredDate: '',
        preferredTimeSlot: '',
        visitType: 'Routine',
        notes: ''
    });

    // Location Confirmation State
    const [showLocationDialog, setShowLocationDialog] = useState(false);
    const [detectedLocation, setDetectedLocation] = useState<{
        lat: number;
        lng: number;
        pincode: string;
        address: string;
    }>({ lat: 0, lng: 0, pincode: '', address: '' });

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast({ title: "Error", description: "Geolocation not supported.", variant: "destructive" });
            return;
        }

        toast({ title: "Detecting...", description: "Fetching your location details." });
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                // Reverse Geocode
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                const addr = data.address || {};

                setDetectedLocation({
                    lat: latitude,
                    lng: longitude,
                    pincode: addr.postcode || '',
                    address: [addr.road, addr.suburb, addr.city].filter(Boolean).join(', ')
                });
                setShowLocationDialog(true);

            } catch (e) {
                console.error(e);
                // Fallback if geocoding fails
                setDetectedLocation({
                    lat: latitude,
                    lng: longitude,
                    pincode: '',
                    address: ''
                });
                setShowLocationDialog(true);
            }
        }, (err) => {
            toast({ title: "Location Error", description: err.message, variant: "destructive" });
        }, { enableHighAccuracy: true });
    };

    const confirmLocation = () => {
        const locString = `\n[Location Check-in]\nCoordinates: ${detectedLocation.lat.toFixed(6)}, ${detectedLocation.lng.toFixed(6)}\nPincode: ${detectedLocation.pincode}\nAddress: ${detectedLocation.address}`;
        setForm(prev => ({
            ...prev,
            notes: prev.notes ? prev.notes + locString : locString.trim()
        }));
        setShowLocationDialog(false);
        toast({ title: "Location Attached", description: "Location details added to notes." });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiClient.requestMyVisit({
                preferredDate: form.preferredDate || undefined,
                preferredTimeSlot: form.preferredTimeSlot || undefined,
                visitType: form.visitType,
                notes: form.notes
            });

            if (response.success) {
                toast({ title: 'Request Sent', description: 'Your visit request has been submitted.' });
                router.push('/citizen-portal/visits');
            }
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to submit visit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute permissionCode="visits.request">
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Request a Visit</h1>
                    <p className="text-muted-foreground">Schedule a visit with your assigned beat officer.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Visit Details</CardTitle>
                        <CardDescription>
                            Please let us know when and why you would like a visit.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Preferred Date</Label>
                                    <Input
                                        type="date"
                                        value={form.preferredDate}
                                        onChange={(e) => setForm((prev) => ({ ...prev, preferredDate: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Preferred Time Slot</Label>
                                    <Select
                                        value={form.preferredTimeSlot}
                                        onValueChange={(value) => setForm((prev) => ({ ...prev, preferredTimeSlot: value }))}
                                    >
                                        <SelectTrigger className="h-14 text-lg p-4 bg-white">
                                            <SelectValue placeholder="Select Time Slot" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Any" className="text-lg py-3">Any Time (Flexible)</SelectItem>
                                            <SelectItem value="Morning" className="text-lg py-3">Morning (9 AM - 12 PM)</SelectItem>
                                            <SelectItem value="Afternoon" className="text-lg py-3">Afternoon (12 PM - 4 PM)</SelectItem>
                                            <SelectItem value="Evening" className="text-lg py-3">Evening (4 PM - 8 PM)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-slate-500">Choose a time that suits you best.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-lg font-semibold text-slate-800">
                                    Type of Visit <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={form.visitType}
                                    onValueChange={(value) => setForm((prev) => ({ ...prev, visitType: value }))}
                                >
                                    <SelectTrigger className="h-14 text-lg p-4 bg-white">
                                        <SelectValue placeholder="Select Visit Reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Routine" className="text-lg py-3">Routine Check-up</SelectItem>
                                        <SelectItem value="Follow-up" className="text-lg py-3">Follow-up Visit</SelectItem>
                                        <SelectItem value="Complaint" className="text-lg py-3">File a Complaint / Issue</SelectItem>
                                        <SelectItem value="Assistance" className="text-lg py-3">Need Assistance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <Label className="text-lg font-semibold text-slate-800">
                                        Additional Notes (Optional)
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        onClick={detectLocation}
                                        className="h-12 text-base border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 shadow-sm transition-all"
                                    >
                                        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                                        Auto-Detect My Location (GPS)
                                    </Button>
                                </div>
                                <Textarea
                                    value={form.notes}
                                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Please describe why you need this visit (e.g., 'I am not feeling safe' or 'I need help with documents')..."
                                    className="min-h-[150px] text-lg p-4 leading-relaxed"
                                />
                                <div className="bg-blue-50 p-3 rounded-md flex items-start gap-3 border border-blue-100">
                                    <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                                    <p className="text-base text-blue-800">
                                        Tip: Tapping "Auto-Detect My Location" helps the officer find your exact spot quickly.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-6 md:pt-8 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="h-14 text-lg px-8 border-slate-300 text-slate-700"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-14 text-lg px-10 bg-blue-700 hover:bg-blue-800 shadow-md transition-all sm:w-auto w-full"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <span className="flex items-center">Submit Request <ArrowRight className="ml-2 h-5 w-5" /></span>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Location Confirmation Dialog */}
                <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <MapPin className="h-6 w-6 text-green-600" />
                                Confirm Location
                            </DialogTitle>
                            <DialogDescription className="text-lg text-slate-600">
                                We found this location. Is the Pincode correct?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-3">
                                <Label className="text-lg font-medium text-slate-900">Detected Address</Label>
                                <div className="bg-slate-50 p-4 rounded-lg border text-lg text-slate-700 break-words">
                                    {detectedLocation.address || "Fetching address..."}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-lg font-medium text-slate-900">Pincode (Edit if needed)</Label>
                                <Input
                                    value={detectedLocation.pincode}
                                    onChange={(e) => setDetectedLocation(prev => ({ ...prev, pincode: e.target.value }))}
                                    maxLength={6}
                                    className="h-14 text-xl tracking-widest font-mono"
                                />
                            </div>

                        </div>
                        <DialogFooter className="gap-3 sm:gap-0">
                            <Button variant="outline" onClick={() => setShowLocationDialog(false)} className="h-12 text-lg">Cancel</Button>
                            <Button onClick={confirmLocation} className="h-12 text-lg bg-green-600 hover:bg-green-700">Confirm & Attach Location</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}
