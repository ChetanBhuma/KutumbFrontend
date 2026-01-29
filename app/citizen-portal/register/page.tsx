'use client';

import { useEffect, useMemo, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { normalizeMobileNumber } from "@/lib/utils";
import { MapPin, Upload, X, Eye } from 'lucide-react';
import { findFeatureContainingPoint, findNearestPoliceStation } from '@/lib/delhi-police-geofence';

type Step = 'start' | 'otp' | 'details';

interface RegistrationRecord {
    id: string;
    mobileNumber: string;
    fullName?: string;
    otpVerified: boolean;
    status: string;
    registrationStep?: string;
    draftData?: Record<string, any>;
    citizen?: { id: string };
}

function RegistrationContent() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [step, setStep] = useState<Step>('start');
    const [registration, setRegistration] = useState<RegistrationRecord | null>(null);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    const [startForm, setStartForm] = useState({
        mobileNumber: '',
        fullName: '',
        dateOfBirth: ''
    });
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    // Step 3: Details State
    const [detailsForm, setDetailsForm] = useState({
        residingWith: 'Alone',
        addressLine1: '',
        addressLine2: '',
        pincode: '',
        district: '',
        policeStation: '',
        city: 'Delhi',
        aadhaarNumber: '',
        gender: '',
        religion: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        emergencyContactRelation: '',
        addressProofUrl: ''
    });

    const [locationState, setLocationState] = useState<{
        lat: number | null;
        lng: number | null;
        accuracy: number | null;
        fetching: boolean;
        error: string | null;
    }>({ lat: null, lng: null, accuracy: null, fetching: false, error: null });

    const [addressProof, setAddressProof] = useState<{ file: File | null; url: string | null; uploading: boolean }>({
        file: null,
        url: null,
        uploading: false
    });

    const [districts, setDistricts] = useState<any[]>([]);
    const [policeStations, setPoliceStations] = useState<any[]>([]);
    const addressProofInputRef = useRef<HTMLInputElement>(null);

    // Fetch masters when reaching details step or mounting
    useEffect(() => {
        if (step === 'details') {
            loadMasters();
        }
    }, [step]);

    const loadMasters = async () => {
        try {
            const [distRes, psRes] = await Promise.all([
                apiClient.getDistricts(),
                apiClient.getPoliceStations()
            ]);
            if (distRes.success) setDistricts(distRes.data);
            if (psRes.success) setPoliceStations(psRes.data);
        } catch (err) {
            console.error("Failed to load masters", err);
        }
    };



    // Auto-fill mobile number from URL parameter
    useEffect(() => {
        const mobileFromUrl = searchParams.get('mobile');
        if (mobileFromUrl) {
            // Clean and validate the mobile number
            const cleanedMobile = mobileFromUrl.replace(/\D/g, '').slice(0, 10);
            if (cleanedMobile.length === 10) {
                setStartForm(prev => ({
                    ...prev,
                    mobileNumber: cleanedMobile
                }));
            }
        }
    }, [searchParams]);

    // Cleaned up unused effects and fetchRegistration logic
    useEffect(() => {
        // Clear any stale registration ID on mount to ensure fresh start
        localStorage.removeItem('citizenPortalRegistrationId');
    }, []);

    const handleStart = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setLoading(true);
            setError('');
            const formattedMobile = normalizeMobileNumber(startForm.mobileNumber);
            if (!/^\+?91?[6-9]\d{9}$/.test(formattedMobile)) {
                setError('Enter a valid 10-digit Indian mobile number.');
                return;
            }
            if (!startForm.dateOfBirth) {
                setError('Please enter your Date of Birth.');
                return;
            }

            // Show disclaimer before proceeding
            setShowDisclaimer(true);
        } catch (err: any) {
            console.error(err);
            setError(err?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDisclaimerAccept = async () => {
        try {
            setLoading(true);
            setError('');
            setShowDisclaimer(false);

            const formattedMobile = normalizeMobileNumber(startForm.mobileNumber);
            const response = await apiClient.startCitizenRegistration({
                mobileNumber: formattedMobile,
                fullName: startForm.fullName,
                // @ts-ignore - backend supports it now
                dateOfBirth: startForm.dateOfBirth
            });

            if (response.success) {
                setRegistration(response.data.registration);
                localStorage.setItem('citizenPortalRegistrationId', response.data.registration.id);
                setStep('otp');

                // Log OTP for debugging
                if (response.data.otp) {

                }

                toast({ title: 'OTP sent', description: 'Please check your mobile for the OTP.' });
            }
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || 'Unable to start registration');
            setShowDisclaimer(false); // Re-show form on error
        } finally {
            setLoading(false);
        }
    };



    const handleGPSLocation = () => {
        if (!navigator.geolocation) {
            setLocationState(prev => ({ ...prev, error: "Geolocation is not supported by your browser." }));
            toast({ title: "Geolocation not supported", description: "Your browser does not support GPS location.", variant: "destructive" });
            return;
        }

        setLocationState(prev => ({ ...prev, fetching: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                console.log("GPS Position Acquired:", latitude, longitude, "Accuracy:", accuracy);

                setLocationState({
                    lat: latitude,
                    lng: longitude,
                    accuracy: accuracy,
                    fetching: false,
                    error: null
                });

                // 2. Auto-detect Police Station via Geofence (Robust Logic from Profile Completion)
                try {
                    console.log("Fetching boundaries...");
                    const boundaries = await apiClient.get('/geo/boundaries');

                    if (boundaries && (boundaries as any).features) { // GeoJSON object
                        const feature = findFeatureContainingPoint(latitude, longitude, boundaries as any);

                        if (feature && feature.properties) {
                            console.log('Found PS Feature Properties:', feature.properties);
                            // Property keys from backend/jsongeo/Police Station Boundary.geojson
                            const psName = feature.properties.POL_STN_NM || feature.properties.NAME || feature.properties.Name || feature.properties.name;
                            console.log('Extracted PS Name:', psName);

                            if (psName && policeStations.length > 0) {
                                // Clean PS Name (remove 'PS ' prefix if present for better matching)
                                const cleanPsName = psName.replace(/^PS\s+/i, '').trim();

                                // Find matching PS in master data
                                const matchedPS = policeStations.find((ps: any) => {
                                    const masterName = ps.name.toLowerCase().replace(/^PS\s+/i, '').trim();
                                    const targetName = cleanPsName.toLowerCase();
                                    return masterName === targetName || masterName.includes(targetName) || targetName.includes(masterName);
                                });

                                if (matchedPS) {
                                    console.log('Matched PS Object:', matchedPS);
                                    setDetailsForm(prev => ({
                                        ...prev,
                                        policeStation: matchedPS.id,
                                        district: matchedPS.districtId || prev.district
                                    }));

                                    // Robust District Mapping
                                    if (!matchedPS.districtId) {
                                        // Fallback: If districtId missing in PS, try matching by Name from GeoJSON
                                        const distName = feature.properties.DIST_NM || feature.properties.DISTRICT || feature.properties.District;
                                        if (distName && districts.length > 0) {
                                            const matchedDist = districts.find((d: any) =>
                                                d.name.toLowerCase().includes(distName.toLowerCase()) ||
                                                distName.toLowerCase().includes(d.name.toLowerCase())
                                            );
                                            if (matchedDist) {
                                                setDetailsForm(prev => ({ ...prev, district: matchedDist.id }));
                                            }
                                        }
                                    }
                                    toast({ title: "Location Detected", description: `Jurisdiction: ${matchedPS.name}` });
                                } else {
                                    console.log('PS Name found but not in Masters:', psName);
                                    // Fallback: If District property exists
                                    const distName = feature.properties.DIST_NM || feature.properties.DISTRICT || feature.properties.District;
                                    if (distName && districts.length > 0) {
                                        const matchedDist = districts.find((d: any) =>
                                            d.name.toLowerCase().includes(distName.toLowerCase()) ||
                                            distName.toLowerCase().includes(d.name.toLowerCase())
                                        );
                                        if (matchedDist) {
                                            setDetailsForm(prev => ({ ...prev, district: matchedDist.id }));
                                            toast({ title: "District Detected", description: `District set to ${matchedDist.name}. Please select Police Station.` });
                                        }
                                    }
                                }
                            }
                        } else {
                            // If pure Geofence fails, try Nearest Station Fallback (method B logic)
                            // We can keep the nearest station logic here as a secondary backup or rely on manual selection.
                            // For now, let's include the nearest station calculation from previous iteration as a fallback.
                            try {
                                const { policeStation: nearest, distance } = findNearestPoliceStation(latitude, longitude);
                                if (distance < 15) {
                                    const matched = policeStations.find(ps => ps.name.toLowerCase().includes(nearest.name.toLowerCase()) || nearest.name.toLowerCase().includes(ps.name.toLowerCase()));
                                    if (matched) {
                                        setDetailsForm(prev => ({
                                            ...prev,
                                            policeStation: matched.id,
                                            district: matched.districtId || prev.district
                                        }));
                                        toast({ title: "Nearest Station Found", description: `${matched.name} (~${distance.toFixed(1)}km away)` });
                                    }
                                }
                            } catch (err) { console.error(err); }
                        }
                    }
                } catch (e) {
                    console.error("Geofence lookup failed", e);
                }

                // 1. Reverse Geocoding (Nominatim - OpenStreetMap) - Kept as is
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const data = await response.json();

                    if (data && data.address) {
                        console.log("Reverse Geocoding Result:", data);
                        setDetailsForm(prev => ({
                            ...prev,
                            addressLine1: [data.address.house_number, data.address.building, data.address.floor].filter(Boolean).join(', ') || prev.addressLine1,
                            addressLine2: [data.address.road, data.address.suburb, data.address.neighbourhood].filter(Boolean).join(', ') || prev.addressLine2,
                            pincode: data.address.postcode || prev.pincode,
                            city: data.address.city || data.address.state_district || 'Delhi'
                        }));
                    }
                } catch (error) {
                    console.error("Reverse geocoding failed:", error);
                }
            },
            (error) => {
                console.error("Geolocation Error:", error);
                setLocationState(prev => ({ ...prev, fetching: false, error: error.message }));
                toast({ title: "GPS Error", description: error.message, variant: "destructive" });
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const handleAddressProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // basic validation
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File too large", description: "Max 5MB allowed", variant: "destructive" });
            return;
        }

        // Create local preview immediately
        const objectUrl = URL.createObjectURL(file);
        setAddressProof({ file, url: objectUrl, uploading: true });

        try {
            const res = await apiClient.uploadDocument(file, 'AddressProof');
            if (res.success) {
                // Keep the local URL for preview so user can view it without auth issues
                setAddressProof({
                    file,
                    url: objectUrl,
                    uploading: false
                });

                // Update the main form data with the server URL for submission
                setDetailsForm(prev => ({ ...prev, addressProofUrl: res.data.document.fileUrl }));

                toast({ title: "Success", description: "Address Proof uploaded successfully" });
            }
        } catch (error) {
            console.error(error);
            // On error, we still show the file but maybe warn?
            // Or keep the local preview so user knows what they tried to upload.
            setAddressProof(prev => ({ ...prev, uploading: false }));
            toast({ title: "Upload Failed", description: "Could not upload document, but file is selected.", variant: "destructive" });
        }
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!registration) return;

        setLoading(true);
        setError('');

        try {
            // Construct payload matching CitizenPortalController expectations
            // Note: apiClient.submitCitizenRegistration automatically wraps this in { citizenData: ... }
            const payload = {
                id: registration.id, // Some controllers might look for ID in body too
                mobileNumber: registration.mobileNumber,
                fullName: startForm.fullName,
                dateOfBirth: new Date(startForm.dateOfBirth).toISOString(),

                // Mapped Address
                address: [
                    detailsForm.addressLine1,
                    detailsForm.addressLine2,
                    detailsForm.city,
                    detailsForm.pincode
                ].filter(Boolean).join(', '),

                addressLine1: detailsForm.addressLine1,
                addressLine2: detailsForm.addressLine2,

                districtId: detailsForm.district,
                policeStationId: detailsForm.policeStation,

                residingWith: detailsForm.residingWith,
                gender: detailsForm.gender || 'Other',

                // Emergency Contact Mapping (Controller expects flat fields for single entry)
                relativeName: detailsForm.emergencyContactName,
                contactNo: detailsForm.emergencyContactNumber,
                relation: detailsForm.emergencyContactRelation || 'Relative',

                // GPS & Documents (Controller doesn't explicitly map these to citizen profile yet,
                // but we send them in case extended logic picks them up or for debugging)
                gpsLatitude: locationState.lat,
                gpsLongitude: locationState.lng,
                pincode: detailsForm.pincode,
                addressProofUrl: detailsForm.addressProofUrl
            };

            // Log payload for debugging
            console.log('Submitting payload:', payload);

            const response = await apiClient.submitCitizenRegistration(registration.id, payload);

            if (response.success) {
                toast({ title: "Registration Complete", description: "Your details have been submitted for verification." });
                window.location.href = '/citizen-portal/dashboard';
            }

        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    // Override the OTP success to NOT redirect immediately but go to next step
    const handleOtpVerification = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!registration) return;
        try {
            setLoading(true);
            setError('');
            const res = await apiClient.verifyCitizenRegistrationOTP(registration.id, otp);
            if (res.success) { // Assuming client method returns response object
                toast({ title: 'Verified', description: 'Mobile verified. Please complete your details.' });
                setStep('details');
            }
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };



    const steps: Array<{ id: Step; label: string; description: string }> = [
        { id: 'start', label: 'Mobile & DOB', description: 'Basic info' },
        { id: 'otp', label: 'OTP', description: 'Verify number' },
        { id: 'details', label: 'Details', description: 'Complete Profile' }
    ];
    const activeIndex = Math.max(0, steps.findIndex((s) => s.id === step));
    const progressPercent = Math.min(100, (activeIndex / (steps.length - 1)) * 100);

    const renderStep = () => {
        switch (step) {
            case 'start':
                return (
                    <>
                        <form onSubmit={handleStart} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="rounded-xl border-2 border-blue-100 bg-blue-50 p-6 text-lg text-blue-900 leading-relaxed">
                                <p className="font-medium">Welcome to the Delhi Police Senior Citizen Cell.</p>
                                <p className="mt-2">
                                    Enter your mobile number and date of birth to get started.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-xl font-bold text-slate-900">Mobile Number</Label>
                                <Input
                                    value={startForm.mobileNumber}
                                    onChange={(e) => setStartForm((prev) => ({ ...prev, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                    placeholder="e.g., 98765 43210"
                                    className="h-16 text-2xl tracking-wide border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-lg"
                                    required
                                    type="tel"
                                    maxLength={10}
                                    autoComplete="tel"
                                />
                                <p className="text-base text-slate-600">Enter your 10-digit mobile number.</p>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-xl font-bold text-slate-900">Date of Birth</Label>
                                <Input
                                    type="date"
                                    value={startForm.dateOfBirth}
                                    onChange={(e) => setStartForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                                    className="h-16 text-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-lg"
                                    required
                                />
                                <p className="text-base text-slate-600">You must be 60 years or older.</p>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-xl font-bold text-slate-900">Full Name (Optional)</Label>
                                <Input
                                    value={startForm.fullName}
                                    onChange={(e) => setStartForm((prev) => ({ ...prev, fullName: e.target.value }))}
                                    placeholder="Your Name"
                                    className="h-16 text-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-lg"
                                    autoComplete="name"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 text-xl font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-md transition-all hover:scale-[1.01]"
                            >
                                {loading ? 'Processing...' : 'Next'}
                            </Button>
                        </form>

                        {/* Disclaimer Modal */}
                        {showDisclaimer && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Relevant Information</h3>
                                    <div className="space-y-4 text-lg text-slate-700 mb-8">
                                        <p className="font-medium text-slate-900">Please read and check both conditions before proceeding:</p>
                                        <ul className="list-disc pl-6 space-y-2">
                                            <li>Person aged 60 years or above and residing alone or only with spouse.</li>
                                            <li>Person aged 60 years or above though living with family but remain alone for a long time during daytime.</li>
                                        </ul>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => setShowDisclaimer(false)}
                                            variant="outline"
                                            className="flex-1 h-14 text-lg font-semibold border-2"
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            onClick={handleDisclaimerAccept}
                                            className="flex-1 h-14 text-lg font-bold bg-blue-700 hover:bg-blue-800 text-white"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                );
            case 'otp':
                return (
                    <form onSubmit={handleOtpVerification} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-lg text-slate-700">
                            We have sent a 6-digit code to <span className="font-bold text-slate-900">{startForm.mobileNumber || registration?.mobileNumber}</span>.
                        </div>

                        <div className="space-y-4">
                            <Label className="text-xl font-bold text-slate-900">Enter Verification Code (OTP)</Label>
                            <Input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code"
                                className="h-16 text-2xl tracking-[0.5em] font-mono text-center border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-lg"
                                required
                                maxLength={6}
                                autoComplete="one-time-code"
                            />
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-16 text-xl font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-md"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep('start')}
                                disabled={loading}
                                className="flex-1 h-16 text-xl font-semibold border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                            >
                                Change Mobile Number
                            </Button>
                        </div>
                    </form>
                );
            case 'details':
                return (
                    <form onSubmit={handleDetailsSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900 mb-6">
                            <h3 className="font-semibold text-lg mb-1">Additional Details</h3>
                            <p className="text-sm text-blue-800">Please provide your address and living arrangement details to help us serve you better.</p>
                        </div>

                        {/* Living Arrangement */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Who are you residing with? <span className="text-red-500">*</span></Label>
                            <RadioGroup
                                value={detailsForm.residingWith}
                                onValueChange={(val) => setDetailsForm(prev => ({ ...prev, residingWith: val }))}
                                className="grid grid-cols-2 gap-4"
                            >
                                {['Alone', 'Spouse', 'Children', 'Relatives'].map((opt) => (
                                    <div key={opt}>
                                        <RadioGroupItem value={opt} id={`rw-${opt}`} className="peer sr-only" />
                                        <Label
                                            htmlFor={`rw-${opt}`}
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 [&:has([data-state=checked])]:border-blue-600 cursor-pointer text-center h-full"
                                        >
                                            <span className="font-semibold">{opt}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Location / Address */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Address Details <span className="text-red-500">*</span></Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGPSLocation}
                                    disabled={locationState.fetching}
                                    className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                                >
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {locationState.fetching ? 'Locating...' : 'Use Current Location'}
                                </Button>
                            </div>
                            {locationState.lat && locationState.lng && (
                                <div className="text-xs text-green-600 mt-1 flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    GPS Captured: {locationState.lat.toFixed(6)}, {locationState.lng.toFixed(6)}
                                    <span className="text-slate-400 ml-2">(Accuracy: {locationState.accuracy?.toFixed(0)}m)</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>House No / Floor / Building <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={detailsForm.addressLine1}
                                        onChange={(e) => setDetailsForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                                        placeholder="E.g. Flat 101, A-Block"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Street / Area / Locality <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={detailsForm.addressLine2}
                                        onChange={(e) => setDetailsForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                                        placeholder="E.g. Vasant Kunj"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Pincode <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={detailsForm.pincode}
                                        onChange={(e) => setDetailsForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                        placeholder="1100XX"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input value={detailsForm.city} disabled />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>District <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={detailsForm.district}
                                        onValueChange={(val) => setDetailsForm(prev => ({ ...prev, district: val }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select District" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {districts.map((d: any) => (
                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Police Station <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={detailsForm.policeStation}
                                        onValueChange={(val) => setDetailsForm(prev => ({ ...prev, policeStation: val }))}
                                        disabled={!detailsForm.district && policeStations.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Station" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {policeStations
                                                .filter((ps: any) => !detailsForm.district || ps.districtId === detailsForm.district)
                                                .map((ps: any) => (
                                                    <SelectItem key={ps.id} value={ps.id}>{ps.name}</SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Address Proof */}
                        <div className="space-y-3 pt-2">
                            <Label className="text-base font-semibold">Address Proof (Optional)</Label>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 relative">
                                {/* Hidden Input - Triggered by Ref */}
                                <input
                                    type="file"
                                    ref={addressProofInputRef}
                                    className="hidden"
                                    onChange={handleAddressProofUpload}
                                    accept="image/*,.pdf"
                                />

                                {addressProof.uploading ? (
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
                                        <span className="text-sm text-slate-500">Uploading...</span>
                                    </div>
                                ) : addressProof.file ? (
                                    <div className="flex flex-col items-center text-green-600 w-full animate-in fade-in zoom-in duration-300">
                                        <div className="flex items-center gap-2 mb-2 p-2 bg-green-50 rounded-full">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <span className="font-medium truncate max-w-[250px] text-slate-700 mb-4">{addressProof.file.name}</span>

                                        <div className="flex gap-3">
                                            {/* Preview Button */}
                                            {addressProof.url && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                    onClick={() => window.open(addressProof.url!, '_blank')}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                            )}

                                            {/* Change Button */}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="border-slate-200 text-slate-600 hover:bg-slate-50"
                                                onClick={() => addressProofInputRef.current?.click()}
                                            >
                                                Change
                                            </Button>

                                            {/* Remove Button */}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => {
                                                    setAddressProof({ file: null, url: null, uploading: false });
                                                    if (addressProofInputRef.current) addressProofInputRef.current.value = '';
                                                }}
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="flex flex-col items-center text-slate-500 cursor-pointer w-full h-full"
                                        onClick={() => addressProofInputRef.current?.click()}
                                    >
                                        <Upload className="w-10 h-10 mb-2 text-slate-400" />
                                        <span className="font-medium text-lg">Click to upload document</span>
                                        <span className="text-xs mt-1 text-slate-400">PDF, JPG, PNG (Max 5MB)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="space-y-4 pt-2 border-t">
                            <h4 className="font-semibold text-slate-900">Emergency Contact (Optional)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Contact Name</Label>
                                    <Input
                                        value={detailsForm.emergencyContactName}
                                        onChange={(e) => setDetailsForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                                        placeholder="Name of relative/friend"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mobile Number</Label>
                                    <Input
                                        value={detailsForm.emergencyContactNumber}
                                        onChange={(e) => setDetailsForm(prev => ({ ...prev, emergencyContactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                        placeholder="10-digit mobile"
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !detailsForm.addressLine1 || !detailsForm.pincode || !detailsForm.policeStation}
                            className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md mt-6"
                        >
                            {loading ? 'Submitting...' : 'Submit Registration'}
                        </Button>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Senior Citizen Registration</h1>
                    <p className="text-lg text-slate-600">Delhi Police - Shanti Sewa Nyaya</p>
                </div>

                <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                    <div className="bg-blue-700 p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">
                                {step === 'start' && 'Step 1: Contact Info'}
                                {step === 'otp' && 'Step 2: Verification'}
                                {step === 'details' && 'Step 3: Personal Details'}
                            </h2>

                        </div>

                        {/* Accessible Progress Bar */}
                        <div className="w-full bg-blue-900/30 rounded-full h-3 mb-2" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Registration progress: ${Math.round(progressPercent)}%`}>
                            <div
                                className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <CardContent className="p-6 sm:p-10 bg-white">
                        {error && (
                            <Alert variant="destructive" className="mb-8 border-2 border-red-200 bg-red-50">
                                <AlertDescription className="text-lg font-medium text-red-800 flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                        {renderStep()}
                    </CardContent>
                </Card>

                <p className="text-center text-slate-500 mt-8 text-sm">
                    Need help? Call Senior Citizen Helpline: <a href="tel:1291" className="font-bold text-blue-700 hover:underline text-lg">1291</a>
                </p>
            </div>
        </div>
    );
}

export default function CitizenRegistrationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        }>
            <RegistrationContent />
        </Suspense>
    );
}
