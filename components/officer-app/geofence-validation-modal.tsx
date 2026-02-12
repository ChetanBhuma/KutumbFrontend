'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, MapPin, CheckCircle2, XCircle, AlertCircle, Navigation } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import MapComponent from '@/components/MapComponent';

interface GeofenceModalProps {
    open: boolean;
    onClose: () => void;
    citizenLocation: { lat: number; lng: number } | null;
    citizenName: string;
    onStartVisit: () => void;
    onCancel: (reason: string, notes: string, rescheduleDate?: string) => void;
}

type GeofenceState = 'checking' | 'in-range' | 'out-of-range' | 'error';
type CancellationReason = 'Shifted' | 'Passed Away' | 'Not Present' | 'Reschedule' | null;

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function GeofenceValidationModal({
    open,
    onClose,
    citizenLocation,
    citizenName,
    onStartVisit,
    onCancel
}: GeofenceModalProps) {
    const { toast } = useToast();
    const [geofenceState, setGeofenceState] = useState<GeofenceState>('checking');
    const [distance, setDistance] = useState<number | null>(null);
    const [officerLocation, setOfficerLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [showCancellation, setShowCancellation] = useState(false);
    const [cancellationReason, setCancellationReason] = useState<CancellationReason>(null);
    const [notes, setNotes] = useState('');
    const [rescheduleDate, setRescheduleDate] = useState('');

    const GEOFENCE_THRESHOLD = 40; // meters

    useEffect(() => {
        if (open) {
            checkGeofence();
        }
    }, [open]);

    const checkGeofence = () => {
        setGeofenceState('checking');
        setDistance(null);

        if (!navigator.geolocation) {
            setGeofenceState('error');
            toast({
                title: "GPS Not Supported",
                description: "Your device doesn't support GPS location.",
                variant: "destructive"
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const officerPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setOfficerLocation(officerPos);

                if (citizenLocation) {
                    const dist = calculateDistance(
                        officerPos.lat,
                        officerPos.lng,
                        citizenLocation.lat,
                        citizenLocation.lng
                    );
                    setDistance(Math.round(dist));

                    if (dist <= GEOFENCE_THRESHOLD) {
                        setGeofenceState('in-range');
                    } else {
                        setGeofenceState('out-of-range');
                    }
                } else {
                    // No citizen location available, allow anyway
                    setGeofenceState('in-range');
                    setDistance(0);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setGeofenceState('error');
                toast({
                    title: "Location Error",
                    description: "Please enable GPS and try again.",
                    variant: "destructive"
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleReset = () => {
        setShowCancellation(false);
        setCancellationReason(null);
        setNotes('');
        setRescheduleDate('');
        checkGeofence();
    };

    const handleCancelSubmit = () => {
        if (!cancellationReason) {
            toast({
                title: "Select Reason",
                description: "Please select a cancellation reason.",
                variant: "destructive"
            });
            return;
        }

        if (!notes.trim()) {
            toast({
                title: "Add Notes",
                description: "Please provide additional details.",
                variant: "destructive"
            });
            return;
        }

        if (cancellationReason === 'Reschedule' && !rescheduleDate) {
            toast({
                title: "Select Date",
                description: "Please select a reschedule date and time.",
                variant: "destructive"
            });
            return;
        }

        onCancel(cancellationReason, notes, rescheduleDate || undefined);
        onClose();
    };

    const renderGeofenceCheck = () => {
        if (showCancellation) return null;

        return (
            <div className="flex flex-col space-y-4">
                {/* Map View - Show when we have citizen location (officer location will load) */}
                {citizenLocation && (
                    <div className="w-full">
                        <div className="relative h-64 w-full rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                            {!officerLocation ? (
                                // Loading state while getting officer location
                                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                    <div className="text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                                        <p className="text-sm text-muted-foreground">Loading map...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <MapComponent
                                        center={{
                                            lat: (officerLocation.lat + citizenLocation.lat) / 2,
                                            lng: (officerLocation.lng + citizenLocation.lng) / 2
                                        }}
                                        zoom={16}
                                        markers={[
                                            {
                                                position: { lat: citizenLocation.lat, lng: citizenLocation.lng },
                                                title: 'Citizen Location',
                                                icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                                            },
                                            {
                                                position: { lat: officerLocation.lat, lng: officerLocation.lng },
                                                title: 'Your Location',
                                                icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                                            }
                                        ]}
                                        height="100%"
                                    />
                                    {/* Distance Overlay */}
                                    {distance !== null && (
                                        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <Navigation className="h-4 w-4 text-primary" />
                                                <span className="font-semibold text-sm">{distance}m away</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Location Labels */}
                                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                                        <div className="bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-red-600">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-white" />
                                                <span className="font-semibold text-xs text-white">Citizen Location</span>
                                            </div>
                                        </div>
                                        <div className="bg-blue-500/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-blue-600">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-white" />
                                                <span className="font-semibold text-xs text-white">Officer Location (You)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200">
                                        <div className="flex flex-col gap-1 text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                <span>Citizen</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                <span>You</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Animated Geofence Check */}
                <div className="flex flex-col items-center justify-center py-6">
                    {/* Animated Pulsing Circle */}
                    <div className="relative w-32 h-32 mb-6">
                        <div className={`absolute inset-0 rounded-full ${geofenceState === 'checking' ? 'bg-blue-500' :
                            geofenceState === 'in-range' ? 'bg-green-500' :
                                geofenceState === 'out-of-range' ? 'bg-red-500' :
                                    'bg-gray-500'
                            } opacity-20 animate-ping`} />
                        <div className={`absolute inset-2 rounded-full ${geofenceState === 'checking' ? 'bg-blue-500' :
                            geofenceState === 'in-range' ? 'bg-green-500' :
                                geofenceState === 'out-of-range' ? 'bg-red-500' :
                                    'bg-gray-500'
                            } opacity-40 animate-pulse`} />
                        <div className={`absolute inset-4 rounded-full ${geofenceState === 'checking' ? 'bg-blue-500' :
                            geofenceState === 'in-range' ? 'bg-green-500' :
                                geofenceState === 'out-of-range' ? 'bg-red-500' :
                                    'bg-gray-500'
                            } flex items-center justify-center`}>
                            {geofenceState === 'checking' && <Loader2 className="h-8 w-8 text-white animate-spin" />}
                            {geofenceState === 'in-range' && <CheckCircle2 className="h-8 w-8 text-white" />}
                            {geofenceState === 'out-of-range' && <XCircle className="h-8 w-8 text-white" />}
                            {geofenceState === 'error' && <AlertCircle className="h-8 w-8 text-white" />}
                        </div>
                    </div>

                    {/* Status Text */}
                    <div className="text-center mb-4">
                        {geofenceState === 'checking' && (
                            <p className="text-lg font-semibold text-blue-600">Checking your location...</p>
                        )}
                        {geofenceState === 'in-range' && (
                            <>
                                <p className="text-lg font-semibold text-green-600 flex items-center gap-2 justify-center">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Within Range
                                </p>
                                {distance !== null && (
                                    <p className="text-sm text-muted-foreground mt-1">{distance}m from citizen location</p>
                                )}
                            </>
                        )}
                        {geofenceState === 'out-of-range' && (
                            <>
                                <p className="text-lg font-semibold text-red-600 flex items-center gap-2 justify-center">
                                    <XCircle className="h-5 w-5" />
                                    Out of Range
                                </p>
                                {distance !== null && (
                                    <p className="text-sm text-muted-foreground mt-1">{distance}m away (must be within {GEOFENCE_THRESHOLD}m)</p>
                                )}
                            </>
                        )}
                        {geofenceState === 'error' && (
                            <p className="text-lg font-semibold text-gray-600 flex items-center gap-2 justify-center">
                                <AlertCircle className="h-5 w-5" />
                                Location Error
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full mt-4">
                        {geofenceState === 'in-range' && (
                            <>
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                        onStartVisit();
                                        onClose();
                                    }}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Start Visit
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowCancellation(true)}
                                >
                                    Cancel Visit
                                </Button>
                            </>
                        )}
                        {(geofenceState === 'out-of-range' || geofenceState === 'error') && (
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleReset}
                            >
                                <MapPin className="mr-2 h-4 w-4" />
                                Retry
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderCancellationForm = () => {
        if (!showCancellation) return null;

        return (
            <div className="space-y-4">
                <div>
                    <Label className="mb-3 block font-semibold">Select Cancellation Reason</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {(['Shifted', 'Passed Away', 'Not Present', 'Reschedule'] as CancellationReason[]).map((reason) => (
                            <button
                                key={reason}
                                onClick={() => setCancellationReason(reason)}
                                className={`p-4 border-2 rounded-lg text-center transition-all ${cancellationReason === reason
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-semibold text-sm">{reason}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {cancellationReason && (
                    <>
                        <div>
                            <Label htmlFor="notes">
                                {cancellationReason === 'Shifted' && 'New Address Details'}
                                {cancellationReason === 'Passed Away' && 'Remarks'}
                                {cancellationReason === 'Not Present' && 'Notes'}
                                {cancellationReason === 'Reschedule' && 'Reschedule Reason'}
                            </Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={`Enter ${cancellationReason.toLowerCase()} details...`}
                                className="mt-2"
                                rows={3}
                            />
                        </div>

                        {cancellationReason === 'Reschedule' && (
                            <div>
                                <Label htmlFor="reschedule-date">New Visit Date & Time</Label>
                                <Input
                                    id="reschedule-date"
                                    type="datetime-local"
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowCancellation(false)}
                            >
                                Back
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                onClick={handleCancelSubmit}
                            >
                                Confirm Cancellation
                            </Button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {showCancellation ? 'Cancel Visit' : 'Geofence Validation'}
                    </DialogTitle>
                    <DialogDescription>
                        {showCancellation
                            ? 'Select a reason for canceling this visit'
                            : `Verifying proximity to ${citizenName}'s location`
                        }
                    </DialogDescription>
                </DialogHeader>

                {renderGeofenceCheck()}
                {renderCancellationForm()}
            </DialogContent>
        </Dialog>
    );
}
