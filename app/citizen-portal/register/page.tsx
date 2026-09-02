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
import { MapPin, Upload, X, Eye, Home, UserPlus } from 'lucide-react';
import { findFeatureContainingPoint, findNearestPoliceStation } from '@/lib/delhi-police-geofence';
import { normalizeMobileNumber } from '@/lib/utils';

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
        dateOfBirth: '1960-01-01'
    });
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    // Step 3: Details State
    const [detailsForm, setDetailsForm] = useState({
        residingWith: 'Alone',
        addressType: 'HOME',
        customAddressType: '',
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


                setLocationState({
                    lat: latitude,
                    lng: longitude,
                    accuracy: accuracy,
                    fetching: false,
                    error: null
                });

                // 2. Auto-detect Police Station via Geofence (Robust Logic from Profile Completion)
                try {

                    const boundaries = await apiClient.get('/geo/boundaries');

                    if (boundaries && (boundaries as any).features) { // GeoJSON object
                        const feature = findFeatureContainingPoint(latitude, longitude, boundaries as any);

                        if (feature && feature.properties) {

                            // Property keys from backend/jsongeo/Police Station Boundary.geojson
                            const psName = feature.properties.POL_STN_NM || feature.properties.NAME || feature.properties.Name || feature.properties.name;


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
                addressType: detailsForm.addressType === 'Other' ? (detailsForm.customAddressType.trim() || 'Other') : detailsForm.addressType,
                city: detailsForm.city || 'Delhi',
                state: 'Delhi',

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
                        <form onSubmit={handleStart} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="rounded-xl border border-blue-900/60 bg-blue-950/40 p-5 text-sm sm:text-base text-blue-200 leading-relaxed">
                                <p className="font-semibold text-white">Welcome to the Delhi Police Senior Citizen Cell.</p>
                                <p className="mt-1 text-slate-300">
                                    Enter your mobile number and date of birth to start your safety registration.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-200">Mobile Number <span className="text-rose-400">*</span></Label>
                                <Input
                                    value={startForm.mobileNumber}
                                    onChange={(e) => setStartForm((prev) => ({ ...prev, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                    placeholder="Enter 10-digit mobile number"
                                    className="h-12 text-lg font-mono bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 rounded-xl"
                                    required
                                    type="tel"
                                    maxLength={10}
                                    autoComplete="tel"
                                    autoFocus
                                />
                                <p className="text-xs text-slate-400">We will send an OTP to verify this number.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-200">Date of Birth <span className="text-rose-400">*</span></Label>
                                <Input
                                    type="date"
                                    value={startForm.dateOfBirth}
                                    onChange={(e) => setStartForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                                    className="h-12 text-base bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 rounded-xl"
                                    required
                                />
                                <p className="text-xs text-slate-400">Senior citizen safety initiative is for residents aged 60 years or older.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-200">Full Name (Optional)</Label>
                                <Input
                                    value={startForm.fullName}
                                    onChange={(e) => setStartForm((prev) => ({ ...prev, fullName: e.target.value }))}
                                    placeholder="Enter your full name"
                                    className="h-12 text-base bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 rounded-xl"
                                    autoComplete="name"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 text-base font-bold bg-gradient-to-r from-[#0F52BA] to-[#720924] hover:from-[#0F52BA]/90 hover:to-[#720924]/90 text-white rounded-xl shadow-[0_0_20px_rgba(15,82,186,0.4)] transition-all duration-300"
                            >
                                {loading ? 'Processing...' : 'Proceed to Verification'}
                            </Button>
                        </form>

                        {/* Disclaimer Modal */}
                        {showDisclaimer && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                                <div className="bg-[#0c182b] border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
                                    <h3 className="text-xl font-bold text-white mb-3">Important Eligibility Information</h3>
                                    <div className="space-y-3 text-sm text-slate-300 mb-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                                        <p className="font-semibold text-blue-200">Please review both criteria before proceeding:</p>
                                        <ul className="list-disc pl-5 space-y-2 text-slate-300 text-xs sm:text-sm">
                                            <li>Person aged 60 years or above and residing alone or only with spouse.</li>
                                            <li>Person aged 60 years or above though living with family but remaining alone during daytime.</li>
                                        </ul>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => setShowDisclaimer(false)}
                                            variant="outline"
                                            className="flex-1 h-11 border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white"
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            onClick={handleDisclaimerAccept}
                                            className="flex-1 h-11 font-bold bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white"
                                        >
                                            Accept & Continue
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                );
            case 'otp':
                return (
                    <form onSubmit={handleOtpVerification} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-sm text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                            We have sent a 6-digit verification code to <span className="font-bold text-white font-mono">{startForm.mobileNumber || registration?.mobileNumber}</span>.
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-200">Enter Verification Code (OTP) <span className="text-rose-400">*</span></Label>
                            <Input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="------"
                                className="h-14 text-2xl tracking-[0.4em] font-mono text-center bg-slate-900/90 border-slate-700 text-white focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 rounded-xl"
                                required
                                maxLength={6}
                                autoComplete="one-time-code"
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-[#0F52BA] to-[#720924] hover:from-[#0F52BA]/90 hover:to-[#720924]/90 text-white rounded-xl shadow-[0_0_20px_rgba(15,82,186,0.4)]"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep('start')}
                                disabled={loading}
                                className="flex-1 h-12 border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl"
                            >
                                Change Mobile Number
                            </Button>
                        </div>
                    </form>
                );
            case 'details':
                return (
                    <form onSubmit={handleDetailsSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="bg-blue-950/40 p-4 rounded-xl border border-blue-900/60 text-blue-200">
                            <h3 className="font-bold text-white text-base mb-0.5">Residence & Personal Information</h3>
                            <p className="text-xs text-slate-300">Please provide your address to enable dedicated Beat Officer safety visits.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-200">Who are you residing with? <span className="text-rose-400">*</span></Label>
                            <RadioGroup
                                value={detailsForm.residingWith}
                                onValueChange={(val) => setDetailsForm(prev => ({ ...prev, residingWith: val }))}
                                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                            >
                                {['Alone', 'Spouse', 'Children', 'Relatives'].map((opt) => (
                                    <div key={opt}>
                                        <RadioGroupItem value={opt} id={`rw-${opt}`} className="peer sr-only" />
                                        <Label
                                            htmlFor={`rw-${opt}`}
                                            className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 p-3 hover:bg-slate-900 hover:border-slate-600 peer-data-[state=checked]:border-[#0F52BA] peer-data-[state=checked]:bg-blue-950/80 peer-data-[state=checked]:text-white cursor-pointer text-center h-full transition-all text-sm font-medium text-slate-300"
                                        >
                                            <span>{opt}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold text-slate-200">Address Details <span className="text-rose-400">*</span></Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGPSLocation}
                                    disabled={locationState.fetching}
                                    className="text-xs border-blue-500/40 bg-blue-950/40 text-blue-200 hover:bg-[#0F52BA] hover:text-white"
                                >
                                    <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                    {locationState.fetching ? 'Locating...' : 'Use Current Location'}
                                </Button>
                            </div>
                            {locationState.lat && locationState.lng && (
                                <div className="text-xs text-emerald-400 mt-1 flex items-center bg-emerald-950/30 border border-emerald-800/60 p-2 rounded-lg">
                                    <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                    <span>GPS Captured: {locationState.lat.toFixed(6)}, {locationState.lng.toFixed(6)} (Accuracy: {locationState.accuracy?.toFixed(0)}m)</span>
                                </div>
                            )}

                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                        <Home className="w-3.5 h-3.5 text-blue-400" /> Save Address As <span className="text-rose-400">*</span>
                                    </Label>
                                    <Select
                                        value={detailsForm.addressType}
                                        onValueChange={(val) => setDetailsForm(prev => ({ ...prev, addressType: val }))}
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                            <SelectValue placeholder="Select Address Type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                            <SelectItem value="HOME">🏠 HOME</SelectItem>
                                            <SelectItem value="WORK">💼 WORK</SelectItem>
                                            <SelectItem value="HOTEL">🏨 HOTEL</SelectItem>
                                            <SelectItem value="Other">📍 Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {detailsForm.addressType === 'Other' && (
                                    <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <Label className="text-xs font-semibold text-slate-300">Specify Address Type / Name <span className="text-rose-400">*</span></Label>
                                        <Input
                                            value={detailsForm.customAddressType}
                                            onChange={(e) => setDetailsForm(prev => ({ ...prev, customAddressType: e.target.value }))}
                                            placeholder="E.g. Farmhouse, Son's Residence, Vacation Home"
                                            className="bg-slate-900 border-slate-700 text-white"
                                            required={detailsForm.addressType === 'Other'}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-300">House No / Floor / Building <span className="text-rose-400">*</span></Label>
                                    <Input
                                        value={detailsForm.addressLine1}
                                        onChange={(e) => setDetailsForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                                        placeholder="E.g. Flat 101, A-Block"
                                        required
                                        className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-300">Street / Area / Locality <span className="text-rose-400">*</span></Label>
                                    <Input
                                        value={detailsForm.addressLine2}
                                        onChange={(e) => setDetailsForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                                        placeholder="E.g. Vasant Kunj"
                                        required
                                        className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-300">Pincode <span className="text-rose-400">*</span></Label>
                                    <Input
                                        value={detailsForm.pincode}
                                        onChange={(e) => setDetailsForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                        placeholder="1100XX"
                                        maxLength={6}
                                        required
                                        className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-300">City</Label>
                                    <Input value={detailsForm.city} disabled className="bg-slate-900/50 border-slate-800 text-slate-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-300">District <span className="text-rose-400">*</span></Label>
                                    <Select
                                        value={detailsForm.district}
                                        onValueChange={(val) => setDetailsForm(prev => ({ ...prev, district: val }))}
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                            <SelectValue placeholder="Select District" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                            {districts.map((d: any) => (
                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-300">Police Station <span className="text-rose-400">*</span></Label>
                                    <Select
                                        value={detailsForm.policeStation}
                                        onValueChange={(val) => setDetailsForm(prev => ({ ...prev, policeStation: val }))}
                                        disabled={!detailsForm.district && policeStations.length === 0}
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                            <SelectValue placeholder="Select Station" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-slate-300">Aadhaar (Last 4 digits - Optional)</Label>
                                <Input
                                    value={detailsForm.aadhaarNumber}
                                    onChange={(e) => setDetailsForm(prev => ({ ...prev, aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                    placeholder="XXXX"
                                    maxLength={4}
                                    className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-slate-300">Gender</Label>
                                <Select
                                    value={detailsForm.gender}
                                    onValueChange={(val) => setDetailsForm(prev => ({ ...prev, gender: val }))}
                                >
                                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-slate-300">Religion</Label>
                                <Input
                                    value={detailsForm.religion}
                                    onChange={(e) => setDetailsForm(prev => ({ ...prev, religion: e.target.value }))}
                                    placeholder="Optional"
                                    className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <Label className="text-xs font-semibold text-slate-300">Address Proof Document (Optional)</Label>
                            <input
                                ref={addressProofInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={handleAddressProofUpload}
                            />
                            <div className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-slate-900/70 hover:border-blue-500 transition-all text-center">
                                {addressProof.uploading ? (
                                    <div className="flex flex-col items-center text-blue-400">
                                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                                        <span className="text-sm font-medium">Uploading Document...</span>
                                    </div>
                                ) : addressProof.url || addressProof.file ? (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full bg-slate-800/80 p-3 rounded-lg">
                                        <span className="text-sm text-slate-200 truncate max-w-xs">{addressProof.file?.name || 'Document Uploaded'}</span>
                                        <div className="flex gap-2">
                                            {addressProof.url && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-slate-700 bg-slate-900 text-blue-300 hover:bg-slate-800"
                                                    onClick={() => window.open(addressProof.url!, '_blank')}
                                                >
                                                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="border-rose-900/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60"
                                                onClick={() => {
                                                    setAddressProof({ file: null, url: null, uploading: false });
                                                    if (addressProofInputRef.current) addressProofInputRef.current.value = '';
                                                }}
                                            >
                                                <X className="w-3.5 h-3.5 mr-1" /> Remove
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="flex flex-col items-center cursor-pointer w-full text-slate-400 hover:text-slate-200"
                                        onClick={() => addressProofInputRef.current?.click()}
                                    >
                                        <Upload className="w-8 h-8 mb-2 text-blue-400" />
                                        <span className="font-semibold text-sm">Click to upload address proof</span>
                                        <span className="text-[11px] mt-1 text-slate-500">PDF, JPG, PNG (Max 5MB)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-slate-800">
                            <h4 className="font-semibold text-white text-sm">Emergency Contact (Optional)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-300">Contact Name</Label>
                                    <Input
                                        value={detailsForm.emergencyContactName}
                                        onChange={(e) => setDetailsForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                                        placeholder="Name of relative/friend"
                                        className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-300">Mobile Number</Label>
                                    <Input
                                        value={detailsForm.emergencyContactNumber}
                                        onChange={(e) => setDetailsForm(prev => ({ ...prev, emergencyContactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                        placeholder="10-digit mobile"
                                        maxLength={10}
                                        className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-xs text-slate-300">Relation</Label>
                                    <Input
                                        value={detailsForm.emergencyContactRelation}
                                        onChange={(e) => setDetailsForm(prev => ({ ...prev, emergencyContactRelation: e.target.value }))}
                                        placeholder="e.g. Son, Daughter, Neighbor"
                                        className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !detailsForm.addressLine1 || !detailsForm.pincode || !detailsForm.policeStation}
                            className="w-full h-12 text-base font-bold bg-gradient-to-r from-[#0F52BA] to-[#720924] hover:from-[#0F52BA]/90 hover:to-[#720924]/90 text-white rounded-xl shadow-[0_0_20px_rgba(15,82,186,0.4)] mt-4"
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
        <div className="w-full relative py-4 sm:py-6 animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#0F52BA]/15 blur-[120px] animate-pulse-soft" />
                <div className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#720924]/15 blur-[130px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-3xl mx-auto relative z-10 space-y-6">
                <div className="flex flex-col items-center text-center space-y-3.5">
                    <div className="bg-gradient-to-b from-slate-900 to-[#061224] p-3.5 sm:p-4 rounded-full shadow-[0_0_25px_rgba(15,82,186,0.35)] border border-slate-700/80 animate-float text-blue-400">
                        <UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-[#0F52BA]" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                            <span className="bg-gradient-to-r from-blue-200 via-white to-rose-200 bg-clip-text text-transparent">
                                Senior Citizen Registration
                            </span>
                        </h1>
                        <p className="text-slate-400 mt-1.5 text-sm sm:text-base font-medium">Delhi Police - Shanti Sewa Nyaya</p>
                    </div>
                </div>

                <Card className="shadow-2xl border-slate-700/80 bg-[#0c182b]/90 backdrop-blur-2xl text-slate-100 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-[#0F52BA] via-[#061224] to-[#720924] p-4 sm:p-6 text-white border-b border-slate-700/80">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h2 className="text-lg sm:text-2xl font-bold">
                                {step === 'start' && 'Step 1: Contact Info'}
                                {step === 'otp' && 'Step 2: Verification'}
                                {step === 'details' && 'Step 3: Personal Details'}
                            </h2>
                            <span className="text-[11px] sm:text-xs md:text-sm font-semibold bg-white/10 px-2.5 sm:px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                                {step === 'start' ? '1 of 3' : step === 'otp' ? '2 of 3' : '3 of 3'}
                            </span>
                        </div>

                        <div className="w-full bg-slate-900/80 border border-slate-700/60 rounded-full h-2.5" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Registration progress: ${Math.round(progressPercent)}%`}>
                            <div
                                className="bg-gradient-to-r from-blue-400 to-[#D4AF37] h-2.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(15,82,186,0.6)]"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <CardContent className="p-4 sm:p-8 md:p-10">
                        {error && (
                            <Alert variant="destructive" className="mb-6 bg-rose-950/60 border-rose-800 text-rose-200 animate-slide-up">
                                <AlertDescription className="text-sm font-medium flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>{error}</span>
                                </AlertDescription>
                            </Alert>
                        )}
                        {renderStep()}
                    </CardContent>
                </Card>

                <p className="text-center text-slate-400 text-xs sm:text-sm">
                    Need help with registration? Call Senior Citizen Helpline: <a href="tel:1291" className="font-bold text-[#D4AF37] hover:underline">1291</a>
                </p>
            </div>
        </div>
    );
}

export default function CitizenRegistrationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin h-8 w-8 border-4 border-[#0F52BA] border-t-transparent rounded-full"></div>
            </div>
        }>
            <RegistrationContent />
        </Suspense>
    );
}
