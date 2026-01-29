'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Loader2, ArrowLeft, MapPin, Phone,
    Navigation, CheckCircle2, Shield, Stethoscope, AlertTriangle, Home,
    ChevronDown, ChevronUp, UserX, AlertOctagon, HeartPulse, Wallet, Users
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import ProfileUpdateDialog from '@/components/officer-app/profile-update-dialog';
import GeofenceValidationModal from '@/components/officer-app/geofence-validation-modal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const AssessmentSection = ({ title, icon: Icon, children, isOpen, onToggle }: any) => (
    <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
            <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Icon className="h-5 w-5 text-primary" />
                {title}
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </button>
        {isOpen && (
            <div className="p-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {children}
            </div>
        )}
    </div>
);

export default function VisitDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [visit, setVisit] = useState<any>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'found' | 'error'>('idle');
    const [showGeofenceModal, setShowGeofenceModal] = useState(false);

    // UI State
    const [openSection, setOpenSection] = useState<string>('safety');

    // Assessment Form State
    const [notes, setNotes] = useState('');
    const [riskScore, setRiskScore] = useState([50]);

    // Section 1: Physical Safety
    const [emergencyAwareness, setEmergencyAwareness] = useState('Yes');
    const [aloneTime, setAloneTime] = useState('Rarely');
    const [maidVerification, setMaidVerification] = useState('Not Verified');
    const [cctvPresence, setCctvPresence] = useState('No');
    const [lightingConditions, setLightingConditions] = useState('Good');
    const [mobility, setMobility] = useState('Fully Mobile');

    // Section 2: Health & Mental Well-Being
    const [currentIllness, setCurrentIllness] = useState('');
    const [illnessType, setIllnessType] = useState('None');
    const [physicalStatus, setPhysicalStatus] = useState('Good');
    const [mentalStatus, setMentalStatus] = useState('Good');

    // Section 3: Cyber Vulnerability
    const [usesSmartphone, setUsesSmartphone] = useState('No');
    const [cyberAttempt, setCyberAttempt] = useState('No');
    const [cyberVictim, setCyberVictim] = useState('No');
    const [onlineActivity, setOnlineActivity] = useState('Low');
    const [deliveryFrequency, setDeliveryFrequency] = useState('Rare');

    // Section 4: Sense of Safety
    const [safeAtHome, setSafeAtHome] = useState('Yes');
    const [safetyConcerns, setSafetyConcerns] = useState('');

    useEffect(() => {
        const fetchVisit = async () => {
            try {
                const result = await apiClient.getVisitById(id);
                if (result.visit || result.data?.visit) {
                    setVisit(result.visit || result.data.visit);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchVisit();

        // Initialize geolocation
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => {
                    console.warn("Geolocation access denied or unavailable:", err.message);
                    // Keep default location
                },
                { enableHighAccuracy: false, timeout: 5000 }
            );
        }
    }, [id]);

    const refreshLocation = () => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            setLocationStatus('detecting');
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setLocationStatus('found');
                    toast({ title: "Location Updated", description: `Accuracy: ${pos.coords.accuracy}m` });
                },
                (err) => {
                    console.warn("Geolocation error:", err.message);
                    setLocationStatus('error');
                    toast({ title: "Location Error", description: "Enable GPS and try again.", variant: "destructive" });
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setLocationStatus('error');
            toast({ title: "Not Supported", description: "Geolocation not supported.", variant: "destructive" });
        }
    };

    useEffect(() => {
        refreshLocation();
    }, []);

    // Automatic Risk Calculation
    useEffect(() => {
        let score = 0;

        // Section 1: Physical Safety (Max: 35 points)
        if (emergencyAwareness === 'No') score += 10;
        if (aloneTime === 'Often') score += 10;
        else if (aloneTime === 'Sometimes') score += 5;
        if (maidVerification === 'Not Verified') score += 5;
        if (cctvPresence === 'No') score += 5;
        if (lightingConditions === 'Poor') score += 5;
        if (mobility === 'Limited Mobility') score += 15;
        else if (mobility === 'Needs Support') score += 8;

        // Section 2: Health & Mental Well-Being (Max: 30 points)
        if (illnessType === 'Chronic') score += 10;
        else if (illnessType === 'Acute') score += 5;
        if (physicalStatus === 'Poor') score += 10;
        else if (physicalStatus === 'Moderate') score += 5;
        if (mentalStatus === 'Poor') score += 10;
        else if (mentalStatus === 'Needs Support') score += 5;

        // Section 3: Cyber Vulnerability (Max: 25 points)
        if (usesSmartphone === 'Yes') {
            if (cyberVictim === 'Yes') score += 15;
            else if (cyberAttempt === 'Yes') score += 10;
            if (onlineActivity === 'High') score += 5;
            else if (onlineActivity === 'Medium') score += 3;
            if (deliveryFrequency === 'Frequent') score += 5;
        }

        // Section 4: Sense of Safety (Max: 10 points)
        if (safeAtHome === 'No') score += 10;

        // Cap at 100
        if (score > 100) score = 100;

        setRiskScore([score]);
    }, [
        emergencyAwareness, aloneTime, maidVerification, cctvPresence,
        lightingConditions, mobility, illnessType, physicalStatus,
        mentalStatus, usesSmartphone, cyberAttempt, cyberVictim,
        onlineActivity, deliveryFrequency, safeAtHome
    ]);


    const handleStartVisit = async () => {
        // Disabled mandatory location check for testing
        /*
        if (!location) {
            toast({ title: "Location Required", description: "Please enable GPS and click refresh.", variant: "destructive" });
            refreshLocation(); // Try again
            return;
        }
        */

        // Use detected location OR mock location for testing
        const visitLocation = location || { lat: 0, lng: 0 };

        try {
            setActionLoading(true);
            await apiClient.startVisit(id, { latitude: visitLocation.lat, longitude: visitLocation.lng });
            toast({ title: "Visit Started", description: "Status updated to In Progress" });
            const result = await apiClient.getVisitById(id);
            if (result.data?.visit) setVisit(result.data.visit);
        } catch (error: any) {
            toast({ title: "Failed to Start", variant: "destructive" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteVisit = async (statusOverride?: string, exceptionNote?: string) => {
        try {
            setActionLoading(true);

            // Build the Assessment Data JSON
            const assessmentData = {
                sections: {
                    physicalSafety: {
                        emergencyAwareness,
                        aloneTime,
                        maidVerification,
                        cctvPresence,
                        lightingConditions,
                        mobility
                    },
                    healthMentalWellbeing: {
                        currentIllness,
                        illnessType,
                        physicalStatus,
                        mentalStatus
                    },
                    cyberVulnerability: {
                        usesSmartphone,
                        cyberAttempt,
                        cyberVictim,
                        onlineActivity,
                        deliveryFrequency
                    },
                    senseOfSafety: {
                        safeAtHome,
                        safetyConcerns
                    }
                },
                assessedAt: new Date(),
                citizenStatus: statusOverride === 'DECEASED' ? 'Deceased' : 'Active'
            };

            // If Deceased or Not Available, we might map to specific Backend Status if it supported it,
            // but for now we use 'COMPLETED' (with notes) or 'CANCELLED' for Not Available.
            // Requirement said "Visit closed with exception" -> Cancelled? Or Completed with 'Not Available'?
            // Usually Not Available = Reschedule (Cancelled).

            if (statusOverride === 'NOT_AVAILABLE') {
                await apiClient.cancelVisit(id, "Citizen Not Available. " + exceptionNote);
            } else {
                await apiClient.officerCompleteVisit(id, {
                    notes: exceptionNote || notes,
                    riskScore: riskScore[0],
                    // Use captured location or existing visit location or 0,0, but prefer real location
                    gpsLatitude: location?.lat || visit.SeniorCitizen?.gpsLatitude || 0,
                    gpsLongitude: location?.lng || visit.SeniorCitizen?.gpsLongitude || 0,
                    duration: 30,
                    assessmentData
                });
            }

            toast({ title: "Visit Updated", description: "Submission successful" });
            router.push('/officer-app/dashboard');
        } catch (error: any) {
            toast({ title: "Submission Failed", variant: "destructive" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelVisit = async (reason: string, notes: string, rescheduleDate?: string) => {
        try {
            setActionLoading(true);

            if (reason === 'Reschedule' && rescheduleDate) {
                // Reschedule the visit instead of canceling
                await apiClient.updateVisit(id, {
                    scheduledDate: new Date(rescheduleDate).toISOString(),
                    notes: `Rescheduled: ${notes}`
                });
                toast({ title: "Visit Rescheduled", description: "Visit has been rescheduled successfully" });
            } else {
                // Cancel the visit with reason
                const cancellationNote = `${reason}: ${notes}`;
                await apiClient.cancelVisit(id, cancellationNote);

                // Special handling for "Passed Away"
                if (reason === 'Passed Away' && visit.SeniorCitizen?.id) {
                    await apiClient.updateCitizen(visit.SeniorCitizen.id, {
                        status: 'Deceased',
                        isActive: false
                    });
                }

                toast({ title: "Visit Cancelled", description: `Reason: ${reason}` });
            }

            router.push('/officer-app/dashboard');
        } catch (error: any) {
            toast({ title: "Action Failed", variant: "destructive" });
        } finally {
            setActionLoading(false);
        }
    };



    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!visit) return <div>Visit not found</div>;

    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${visit.SeniorCitizen?.gpsLatitude},${visit.SeniorCitizen?.gpsLongitude}`;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
            <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2" onClick={() => router.push('/officer-app/dashboard')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="font-semibold text-lg">Visit Details</h1>
            </header>

            <main className="flex-1 p-4 space-y-4">
                <Card className="border-0 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${visit.visitType === 'Emergency' ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <CardHeader className="pb-2 pl-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <CardTitle className="text-lg">{visit.SeniorCitizen?.fullName}</CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant="secondary" className="rounded-sm">{visit.visitType}</Badge>
                                    <Badge variant="outline" className="rounded-sm border-slate-300">{visit.status}</Badge>
                                </div>
                            </div>
                            <ProfileUpdateDialog citizen={visit.SeniorCitizen} onUpdate={() => { }} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0 pl-6">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-slate-50 p-2 rounded-md">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                            <span>{visit.SeniorCitizen?.permanentAddress}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => window.location.href = `tel:${visit.SeniorCitizen?.mobileNumber}`}>
                                <Phone className="h-3.5 w-3.5 mr-2" /> Call
                            </Button>

                            <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => window.open(mapUrl, '_blank')} disabled={!visit.SeniorCitizen?.gpsLatitude}>
                                <Navigation className="h-3.5 w-3.5 mr-2" /> Map
                            </Button>

                            {visit.status === 'IN_PROGRESS' && (
                                <Button
                                    variant="outline"
                                    className="flex-1 h-9 text-xs bg-blue-50 border-blue-200 hover:bg-blue-100"
                                    onClick={() => setShowGeofenceModal(true)}
                                >
                                    <MapPin className="h-3.5 w-3.5 mr-1" /> View Location
                                </Button>
                            )}

                            {visit.status !== 'IN_PROGRESS' && (
                                <Button variant="outline" className={`flex-1 h-9 text-xs ${locationStatus === 'error' ? 'text-red-500 border-red-200' : ''}`} onClick={refreshLocation} disabled={locationStatus === 'detecting'}>
                                    {locationStatus === 'detecting' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5 mr-1" />}
                                    {locationStatus === 'found' ? 'GPS OK' : 'Refresh GPS'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {visit.status === 'SCHEDULED' && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-20">
                        <Button
                            className="w-full h-12 text-lg shadow-lg"
                            onClick={() => setShowGeofenceModal(true)}
                            disabled={actionLoading}
                        >
                            {actionLoading ? <Loader2 className="animate-spin mr-2" /> : <Shield className="mr-2" />} Start Visit
                        </Button>
                        <div className="mt-2 text-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="link" className="text-xs text-red-500">Report Exception (Not Available / Deceased)</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleCompleteVisit('NOT_AVAILABLE', 'Citizen Not Available')}>
                                        <UserX className="mr-2 h-4 w-4" /> Citizen Not Available
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCompleteVisit('DECEASED', 'Citizen Deceased')}>
                                        <AlertOctagon className="mr-2 h-4 w-4" /> Reported Deceased
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                )}

                {visit.status === 'IN_PROGRESS' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Assessment Form</h2>
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">In Progress</span>
                        </div>

                        {/* Section 1: Physical Safety */}
                        <AssessmentSection
                            title="Physical Safety"
                            icon={Shield}
                            isOpen={openSection === 'physical'}
                            onToggle={() => setOpenSection(openSection === 'physical' ? '' : 'physical')}
                        >
                            <div className="space-y-4">
                                <div>
                                    <Label className="mb-2 block">Awareness of emergency numbers</Label>
                                    <RadioGroup value={emergencyAwareness} onValueChange={setEmergencyAwareness} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Yes" id="ea-yes" />
                                            <Label htmlFor="ea-yes">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="No" id="ea-no" />
                                            <Label htmlFor="ea-no">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Time spent alone at home</Label>
                                    <RadioGroup value={aloneTime} onValueChange={setAloneTime} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Rarely" id="at-rarely" />
                                            <Label htmlFor="at-rarely">Rarely</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Sometimes" id="at-sometimes" />
                                            <Label htmlFor="at-sometimes">Sometimes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Often" id="at-often" />
                                            <Label htmlFor="at-often">Often</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Help / Maid verification</Label>
                                    <RadioGroup value={maidVerification} onValueChange={setMaidVerification} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Permanent" id="mv-perm" />
                                            <Label htmlFor="mv-perm">Permanent</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Temporary" id="mv-temp" />
                                            <Label htmlFor="mv-temp">Temporary</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Not Verified" id="mv-not" />
                                            <Label htmlFor="mv-not">Not Verified</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label className="mb-2 block">CCTV presence in vicinity</Label>
                                    <RadioGroup value={cctvPresence} onValueChange={setCctvPresence} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Yes" id="cctv-yes" />
                                            <Label htmlFor="cctv-yes">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="No" id="cctv-no" />
                                            <Label htmlFor="cctv-no">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Lighting conditions in locality</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Good', 'Average', 'Poor'].map(l => (
                                            <Button
                                                key={l}
                                                variant={lightingConditions === l ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setLightingConditions(l)}
                                            >
                                                {l}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Mobility</Label>
                                    <RadioGroup value={mobility} onValueChange={setMobility} className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Fully Mobile" id="mob-full" />
                                            <Label htmlFor="mob-full">Fully Mobile</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Needs Support" id="mob-support" />
                                            <Label htmlFor="mob-support">Needs Support</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Limited Mobility" id="mob-limited" />
                                            <Label htmlFor="mob-limited">Limited Mobility</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </AssessmentSection>

                        {/* Section 2: Health & Mental Well-Being */}
                        <AssessmentSection
                            title="Health & Mental Well-Being"
                            icon={Stethoscope}
                            isOpen={openSection === 'health'}
                            onToggle={() => setOpenSection(openSection === 'health' ? '' : 'health')}
                        >
                            <div className="space-y-4">
                                <div>
                                    <Label>Current illness</Label>
                                    <Input
                                        className="mt-1"
                                        value={currentIllness}
                                        onChange={e => setCurrentIllness(e.target.value)}
                                        placeholder="Enter current illness if any"
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">Type of illness</Label>
                                    <RadioGroup value={illnessType} onValueChange={setIllnessType} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="None" id="it-none" />
                                            <Label htmlFor="it-none">None</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Acute" id="it-acute" />
                                            <Label htmlFor="it-acute">Acute</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Chronic" id="it-chronic" />
                                            <Label htmlFor="it-chronic">Chronic</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Physical mobility status</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Good', 'Moderate', 'Poor'].map(s => (
                                            <Button
                                                key={s}
                                                variant={physicalStatus === s ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setPhysicalStatus(s)}
                                            >
                                                {s}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Mental health status</Label>
                                    <RadioGroup value={mentalStatus} onValueChange={setMentalStatus} className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Good" id="ms-good" />
                                            <Label htmlFor="ms-good">Good</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Needs Support" id="ms-support" />
                                            <Label htmlFor="ms-support">Needs Support</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Poor" id="ms-poor" />
                                            <Label htmlFor="ms-poor">Poor</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </AssessmentSection>

                        {/* Section 3: Cyber Vulnerability */}
                        <AssessmentSection
                            title="Cyber Vulnerability"
                            icon={AlertTriangle}
                            isOpen={openSection === 'cyber'}
                            onToggle={() => setOpenSection(openSection === 'cyber' ? '' : 'cyber')}
                        >
                            <div className="space-y-4">
                                <div>
                                    <Label className="mb-2 block">Uses a smartphone</Label>
                                    <RadioGroup value={usesSmartphone} onValueChange={setUsesSmartphone} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Yes" id="sp-yes" />
                                            <Label htmlFor="sp-yes">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="No" id="sp-no" />
                                            <Label htmlFor="sp-no">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Experienced cybercrime attempts</Label>
                                    <RadioGroup value={cyberAttempt} onValueChange={setCyberAttempt} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Yes" id="ca-yes" />
                                            <Label htmlFor="ca-yes">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="No" id="ca-no" />
                                            <Label htmlFor="ca-no">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Victim of cybercrime</Label>
                                    <RadioGroup value={cyberVictim} onValueChange={setCyberVictim} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Yes" id="cv-yes" />
                                            <Label htmlFor="cv-yes">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="No" id="cv-no" />
                                            <Label htmlFor="cv-no">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Online activity level</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Low', 'Medium', 'High'].map(l => (
                                            <Button
                                                key={l}
                                                variant={onlineActivity === l ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setOnlineActivity(l)}
                                            >
                                                {l}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Online delivery frequency</Label>
                                    <RadioGroup value={deliveryFrequency} onValueChange={setDeliveryFrequency} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Rare" id="df-rare" />
                                            <Label htmlFor="df-rare">Rare</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Occasional" id="df-occ" />
                                            <Label htmlFor="df-occ">Occasional</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Frequent" id="df-freq" />
                                            <Label htmlFor="df-freq">Frequent</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </AssessmentSection>

                        {/* Section 4: Sense of Safety */}
                        <AssessmentSection
                            title="Sense of Safety"
                            icon={Home}
                            isOpen={openSection === 'safety'}
                            onToggle={() => setOpenSection(openSection === 'safety' ? '' : 'safety')}
                        >
                            <div className="space-y-4">
                                <div>
                                    <Label className="mb-2 block">Feels safe at home</Label>
                                    <RadioGroup value={safeAtHome} onValueChange={setSafeAtHome} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Yes" id="sh-yes" />
                                            <Label htmlFor="sh-yes">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="No" id="sh-no" />
                                            <Label htmlFor="sh-no">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label>Main safety concerns (if any)</Label>
                                    <Textarea
                                        className="mt-1"
                                        rows={3}
                                        value={safetyConcerns}
                                        onChange={e => setSafetyConcerns(e.target.value)}
                                        placeholder="Describe any safety concerns..."
                                    />
                                </div>
                            </div>
                        </AssessmentSection>

                        {/* Risk & Submit */}
                        <Card className="border-t-4 border-t-primary shadow-md">
                            <CardHeader>
                                <CardTitle className="text-base flex justify-between items-center">
                                    <span>Risk Score (Auto-Calculated)</span>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className={`text-lg px-3 py-1 text-white font-bold ${riskScore[0] >= 71 ? 'bg-red-500 hover:bg-red-600' :
                                                riskScore[0] >= 51 ? 'bg-orange-500 hover:bg-orange-600' :
                                                    riskScore[0] >= 31 ? 'bg-yellow-500 hover:bg-yellow-600' :
                                                        'bg-green-500 hover:bg-green-600'
                                                }`}
                                        >
                                            {riskScore[0]}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {riskScore[0] >= 71 ? 'Critical' :
                                                riskScore[0] >= 51 ? 'High' :
                                                    riskScore[0] >= 31 ? 'Medium' : 'Low'}
                                        </Badge>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Read-only visual representation */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Low (0-30)</span>
                                        <span>Medium (31-50)</span>
                                        <span>High (51-70)</span>
                                        <span>Critical (71-100)</span>
                                    </div>
                                    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${riskScore[0] >= 71 ? 'bg-red-500' :
                                                riskScore[0] >= 51 ? 'bg-orange-500' :
                                                    riskScore[0] >= 31 ? 'bg-yellow-500' :
                                                        'bg-green-500'
                                                }`}
                                            style={{ width: `${riskScore[0]}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground italic">
                                        Score is automatically calculated based on assessment responses
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Final Remarks</Label>
                                    <Textarea placeholder="Overall observations..." value={notes} onChange={e => setNotes(e.target.value)} />
                                </div>
                                <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg" onClick={() => handleCompleteVisit()}>
                                    <CheckCircle2 className="mr-2" /> Complete Visit
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {visit.status === 'COMPLETED' && (
                    <Card className="bg-green-50 border-green-200 shadow-sm text-center p-8">
                        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="h-8 w-8 text-green-600" /></div>
                        <h3 className="font-bold text-xl text-green-800">Visit Completed</h3>
                        <p className="text-sm text-green-700 mt-2">Submitted on {format(new Date(visit.completedDate), 'dd MMM yyyy')}</p>
                        <Button variant="outline" className="mt-6" onClick={() => router.push('/officer-app/dashboard')}>Back to Dashboard</Button>
                    </Card>
                )}
            </main>

            {/* Geofence Validation Modal */}
            <GeofenceValidationModal
                open={showGeofenceModal}
                onClose={() => setShowGeofenceModal(false)}
                citizenLocation={
                    visit?.SeniorCitizen?.gpsLatitude && visit?.SeniorCitizen?.gpsLongitude
                        ? { lat: visit.SeniorCitizen.gpsLatitude, lng: visit.SeniorCitizen.gpsLongitude }
                        : null
                }
                citizenName={visit?.SeniorCitizen?.fullName || 'Citizen'}
                onStartVisit={handleStartVisit}
                onCancel={handleCancelVisit}
            />
        </div>
    );
}

import { Input } from '@/components/ui/input';
