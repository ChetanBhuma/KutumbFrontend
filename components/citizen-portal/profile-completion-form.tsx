'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Webcam from 'react-webcam';
import { AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Upload, MapPin, Camera, X, User, Plus, Trash2, Eye, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { calculateProfileCompleteness } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import apiClient from '@/lib/api-client';
import { findFeatureContainingPoint } from '@/lib/delhi-police-geofence';

const STEPS = [
    { id: 1, title: 'Personal Info', description: 'Basic details & Identity' },
    { id: 2, title: 'Contact & Address', description: 'Where can we find you?' },
    { id: 3, title: 'Family Details', description: 'Spouse & Family Members' },
    { id: 4, title: 'Household Staff', description: 'Domestic help, Driver, etc.' },
    { id: 5, title: 'Health', description: 'Medical information' },
    { id: 6, title: 'Review', description: 'Confirm your details' },
    { id: 7, title: 'Declaration', description: 'Consent & Final Submit' }
];

export default function ProfileCompletionForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);

    // Comprehensive Form State
    const [formData, setFormData] = useState<any>({
        consentDataUse: false,
        // Personal
        fullName: '',
        dob: '',
        gender: '',
        occupation: '',
        yearOfRetirement: '',
        retiredFrom: '',
        specialization: '',
        religion: '',
        maritalStatus: '',

        // Contact
        mobileNumber: '',
        telephoneNumber: '',
        whatsappNumber: '',
        email: '',

        // Address
        addressLine1: '',
        addressLine2: '',
        city: 'New Delhi',
        district: '',
        pincode: '',
        policeStation: '',
        state: 'Delhi',

        // GPS Coordinates
        gpsLatitude: null,
        gpsLongitude: null,
        gpsAccuracy: null,
        gpsCapturedAt: null,

        // Present Address
        sameAsPermanent: true,
        presentAddress: '',

        // Living & Family
        residingWith: 'Alone', // Alone, Spouse, Children, Relatives
        spouseName: '',
        spouseMobile: '',
        weddingDate: '',
        isLivingTogether: true,
        addressIfNotTogether: '',
        numberOfChildren: '',

        // Dynamic Lists
        familyMembers: [] as any[], // { name, relation, age, mobileNumber }
        emergencyContacts: [] as any[], // { name, relation, mobileNumber } (Friends/Relatives)

        // Staff
        staffDetails: [] as any[], // { staffType, name, mobileNumber, idProofType, idProofUrl, address }

        // Health
        bloodGroup: '',

        medicalHistory: [] as any[],
        regularDoctor: '',
        doctorContact: '',
        mobilityConstraints: '',
        mobilityStatus: 'Mobile',
        physicalDisability: false,



        photoUrl: '',
        addressProofUrl: '',
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [masters, setMasters] = useState<any>({
        districts: [],
        policeStations: [],
        systemMasters: {}
    });

    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const res = await apiClient.getPublicMasters();
                if (res.success) {
                    setMasters(res.data);
                }
            } catch (err) {
                console.error('Failed to load masters', err);
            }
        };
        fetchMasters();
    }, []);

    const [showLocationDialog, setShowLocationDialog] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const staffFileInputRef = useRef<HTMLInputElement>(null);
    const addressProofInputRef = useRef<HTMLInputElement>(null);
    const [activeStaffIndex, setActiveStaffIndex] = useState<number | null>(null);

    const [detectedAddress, setDetectedAddress] = useState<{
        pincode: string;
        city: string;
        district: string;
        state: string;
        addressLine1: string;
        addressLine2: string;
    }>({ pincode: '', city: '', district: '', state: '', addressLine1: '', addressLine2: '' });

    // File Upload Handlers
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Immediate local preview
        const objectUrl = URL.createObjectURL(file);
        setPhotoPreview(objectUrl);

        try {
            const res = await apiClient.uploadDocument(file, 'ProfilePhoto');
            if (res.success) {
                setFormData((prev: any) => ({ ...prev, photoUrl: res.data.document.fileUrl }));
                toast({ title: "Success", description: "Photo uploaded successfully" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to upload photo", variant: "destructive" });
        }
    };

    const handleStaffDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || activeStaffIndex === null) return;
        try {
            const res = await apiClient.uploadDocument(file, 'IdentityProof');
            if (res.success) {
                const url = res.data.document.fileUrl;
                setFormData((prev: any) => {
                    const staff = [...prev.staffDetails];
                    staff[activeStaffIndex] = { ...staff[activeStaffIndex], idProofUrl: url };
                    return { ...prev, staffDetails: staff };
                });
                toast({ title: "Success", description: "Document uploaded successfully" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to upload document", variant: "destructive" });
        }
        setActiveStaffIndex(null);
    };

    const handleAddressProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const res = await apiClient.uploadDocument(file, 'AddressProof');
            if (res.success) {
                setFormData((prev: any) => ({ ...prev, addressProofUrl: res.data.document.fileUrl }));
                toast({ title: "Success", description: "Address Proof uploaded successfully" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to upload Address Proof", variant: "destructive" });
        }
    };

    const capturePhoto = async () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                const res = await fetch(imageSrc);
                const blob = await res.blob();
                const file = new File([blob], "profile_capture.jpg", { type: "image/jpeg" });
                // Optimistic update
                setFormData((prev: any) => ({ ...prev, photoUrl: imageSrc }));
                setPhotoPreview(imageSrc);
                setShowCamera(false);

                try {
                    const uploadRes = await apiClient.uploadDocument(file, 'ProfilePhoto');
                    if (uploadRes.success) {
                        setFormData((prev: any) => ({ ...prev, photoUrl: uploadRes.data.document.fileUrl }));
                    }
                } catch (error) {
                    console.error('Photo upload failed', error);
                    toast({ title: "Warning", description: "Photo captured but upload failed. Please try again.", variant: "destructive" });
                }
            }
        }
    };

    // Load Profile
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await apiClient.getMyProfile();
                if (res.success && res.data.citizen) {
                    const c = res.data.citizen;

                    // Simple logic to fill form from backend response
                    // ... (Using existing mapping logic but expanded)
                    const clean = (val: string, placeholder: string) => (val === placeholder ? '' : val);

                    setFormData((prev: any) => ({
                        ...prev,
                        fullName: clean(c.fullName || '', 'Unknown'),
                        photoUrl: c.photoUrl || '',
                        addressProofUrl: c.addressProofUrl || '', // Map address proof URL
                        dob: c.dateOfBirth ? new Date(c.dateOfBirth).toISOString().split('T')[0] : '',
                        gender: clean(c.gender || '', 'Other'),
                        mobileNumber: c.mobileNumber || '',
                        maritalStatus: c.maritalStatus || '',
                        occupation: c.occupation || '',
                        yearOfRetirement: c.yearOfRetirement || '',
                        retiredFrom: c.retiredFrom || '',
                        specialization: c.specialization || '',
                        religion: c.religion || '',




                        telephoneNumber: c.telephoneNumber || '',
                        alternateMobile: c.alternateMobile || '',
                        whatsappNumber: c.whatsappNumber || '',
                        email: c.email || '',

                        addressLine1: c.addressLine1 || (c.permanentAddress && c.permanentAddress !== 'Pending Update' ? c.permanentAddress.split(',')[0].trim() : '') || '',
                        addressLine2: c.addressLine2 || (c.permanentAddress && c.permanentAddress !== 'Pending Update' ? (c.permanentAddress.split(',')[1] || '').trim() : '') || '',
                        pincode: clean(c.pinCode || '', '000000'),
                        district: c.districtId || '',
                        policeStation: c.policeStationId || '',
                        state: c.state || 'Delhi',

                        spouseName: c.SpouseDetails?.fullName || c.spouseName || '',
                        spouseMobile: c.SpouseDetails?.mobileNumber || '',
                        weddingDate: c.SpouseDetails?.weddingDate ? new Date(c.SpouseDetails.weddingDate).toISOString().split('T')[0] : '',
                        isLivingTogether: c.SpouseDetails?.isLivingTogether ?? true,
                        addressIfNotTogether: c.SpouseDetails?.addressIfNotTogether || '',
                        residingWith: c.residingWith || 'Alone',

                        numberOfChildren: c.numberOfChildren?.toString() || '',

                        familyMembers: c.FamilyMember?.map((m: any) => ({
                            name: m.name, relation: m.relation, mobileNumber: m.mobileNumber
                        })) || [],

                        emergencyContacts: c.EmergencyContact?.map((m: any) => ({
                            name: m.name, relation: m.relation, mobileNumber: m.mobileNumber
                        })) || [],

                        staffDetails: c.HouseholdHelp?.map((h: any) => ({
                            staffType: h.staffType || h.category || 'Domestic Help',
                            name: h.name,
                            mobileNumber: h.mobileNumber,
                            idProofType: h.idProofType,
                            idProofUrl: h.idProofUrl,
                        })) || [],

                        bloodGroup: c.bloodGroup || '',
                        medicalHistory: c.MedicalHistory || [],
                        regularDoctor: c.regularDoctor || '',
                        doctorContact: c.doctorContact || '',
                        mobilityConstraints: c.mobilityConstraints || 'None',

                        sameAsPermanent: !c.presentAddress || c.presentAddress === c.permanentAddress,
                        presentAddress: c.presentAddress === 'Pending Update' ? '' : (c.presentAddress || '')
                    }));

                    // Secure Photo Load
                    if (c.photoUrl) {
                        try {
                            const token = localStorage.getItem('accessToken');
                            // Handle both absolute and relative URLs
                            const url = c.photoUrl;
                            const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;

                            const imgRes = await fetch(fullUrl, {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            if (imgRes.ok) {
                                const blob = await imgRes.blob();
                                setPhotoPreview(URL.createObjectURL(blob));
                            }
                        } catch (err) {
                            console.error('Failed to load secure photo', err);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load profile', error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleGPSLocation = () => {
        if (!navigator.geolocation) {
            toast({ title: "Geolocation not supported", description: "Your browser does not support GPS location.", variant: "destructive" });
            return;
        }

        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                console.log('GPS:', latitude, longitude, 'Accuracy:', accuracy);

                // Store GPS coordinates in formData
                handleInputChange('gpsLatitude', latitude);
                handleInputChange('gpsLongitude', longitude);
                handleInputChange('gpsAccuracy', accuracy);
                handleInputChange('gpsCapturedAt', new Date().toISOString());

                try {

                    // 1. Fetch Boundaries & Find PS
                    const boundaries = await apiClient.get<any>('/geo/boundaries');

                    if (boundaries && boundaries.features) { // It is the GeoJSON object directly
                        const feature = findFeatureContainingPoint(latitude, longitude, boundaries);

                        if (feature && feature.properties) {
                            console.log('Found PS Feature Properties:', feature.properties);
                            // Property keys from backend/jsongeo/Police Station Boundary.geojson
                            const psName = feature.properties.POL_STN_NM || feature.properties.NAME || feature.properties.Name || feature.properties.name;
                            console.log('Extracted PS Name:', psName);
                            console.log('Available Police Stations Master:', masters.policeStations);
                            console.log('Available Districts Master:', masters.districts);

                            if (psName && masters.policeStations) {
                                // Clean PS Name (remove 'PS ' prefix if present for better matching)
                                const cleanPsName = psName.replace(/^PS\s+/i, '').trim();

                                // Find matching PS in master data
                                const matchedPS = masters.policeStations.find((ps: any) => {
                                    const masterName = ps.name.toLowerCase().replace(/^PS\s+/i, '').trim();
                                    const targetName = cleanPsName.toLowerCase();
                                    return masterName === targetName || masterName.includes(targetName) || targetName.includes(masterName);
                                });

                                console.log('Matched PS Object:', matchedPS);

                                if (matchedPS) {
                                    console.log('Setting Police Station ID:', matchedPS.id);
                                    handleInputChange('policeStation', matchedPS.id);

                                    // Robust District Mapping: Use the districtId from the matched PS directly
                                    if (matchedPS.districtId) {
                                        console.log('District ID from PS found:', matchedPS.districtId);
                                        handleInputChange('district', matchedPS.districtId);
                                    } else {
                                        // Fallback: If districtId missing in PS, try matching by Name from GeoJSON
                                        console.log('PS has no districtId. Trying fallback by Name from GeoJSON properties...');
                                        const distName = feature.properties.DIST_NM || feature.properties.DISTRICT || feature.properties.District;

                                        if (distName && masters.districts) {
                                            const matchedDist = masters.districts.find((d: any) =>
                                                d.name.toLowerCase().includes(distName.toLowerCase()) ||
                                                distName.toLowerCase().includes(d.name.toLowerCase())
                                            );

                                            if (matchedDist) {
                                                console.log('Fallback District Found by Name:', matchedDist);
                                                handleInputChange('district', matchedDist.id);
                                            } else {
                                                console.log('Fallback District Name NOT matched in Level-2:', distName);
                                            }
                                        } else {
                                            console.log('No District Name in GeoJSON or Masters missing.');
                                        }
                                    }

                                    toast({ title: "Location Detected", description: `Jurisdiction: ${matchedPS.name}` });
                                } else {
                                    console.log('PS Name found but not in Masters:', psName);
                                    // Fallback: If District property exists
                                    const distName = feature.properties.DIST_NM || feature.properties.DISTRICT || feature.properties.District;
                                    if (distName && masters.districts) {
                                        const matchedDist = masters.districts.find((d: any) =>
                                            d.name.toLowerCase().includes(distName.toLowerCase()) ||
                                            distName.toLowerCase().includes(d.name.toLowerCase())
                                        );
                                        if (matchedDist) handleInputChange('district', matchedDist.id);
                                    }
                                }
                            }
                        } else {
                            toast({ title: "Outside Jurisdiction", description: "Your location doesn't fall under any mapped Police Station boundary." });
                        }
                    }

                    // 2. Reverse Geocoding for Address
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        if (data && data.address) {
                            const addr = data.address;
                            // Construct address line 2 (Area)
                            const areaParts = [addr.suburb, addr.neighbourhood, addr.road, addr.city_district].filter(Boolean);
                            const area = areaParts.join(', ');
                            if (area) handleInputChange('addressLine2', area);

                            // Construct address line 1 if house number exists
                            if (addr.house_number) {
                                handleInputChange('addressLine1', `${addr.house_number}, ${addr.road || ''}`);
                            }

                            // Auto-set Pincode if available and valid (6 digits)
                            if (addr.postcode) {
                                const pCode = addr.postcode.replace(/\D/g, '');
                                if (pCode.length === 6) {
                                    handleInputChange('pincode', pCode);
                                }
                            }
                        }
                    } catch (geoErr) {
                        console.error('Reverse Geocode Failed', geoErr);
                    }

                } catch (error) {
                    console.error('GPS Logic Error:', error);
                    toast({ title: "Error", description: "Failed to process location data.", variant: "destructive" });
                } finally {
                    setGpsLoading(false);
                }
            },
            (error) => {
                console.error('GPS Error:', error.code, error.message);
                setGpsLoading(false);
                let msg = error.message;
                if (error.code === 1) msg = "Permission Denied. Please allow location access.";
                else if (error.code === 2) msg = "Position Unavailable. Check your signal.";
                else if (error.code === 3) msg = "Location Timeout. Try again.";

                toast({ title: "Location Failed", description: msg, variant: "destructive" });
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 }
        );
    };

    // Helper: Dynamic List Management
    const addItem = (listKey: string, initialItem: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [listKey]: [...(prev[listKey] || []), initialItem]
        }));
    };

    const removeItem = (listKey: string, index: number) => {
        setFormData((prev: any) => {
            const list = [...prev[listKey]];
            list.splice(index, 1);
            return { ...prev, [listKey]: list };
        });
    };

    const updateItem = (listKey: string, index: number, field: string, value: any) => {
        setFormData((prev: any) => {
            const list = [...prev[listKey]];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [listKey]: list };
        });
    };

    const submitProfile = async () => {
        console.log('DEBUG: submitProfile called');
        setSubmitting(true);
        try {
            // Build clean payload with ONLY backend-expected fields (no spread to avoid duplicates)
            const payload = {
                // Personal Details
                fullName: formData.fullName,
                dateOfBirth: formData.dob,
                gender: formData.gender,
                maritalStatus: formData.maritalStatus || null,
                religion: formData.religion || null,
                occupation: formData.occupation || null,
                specialization: formData.specialization || null,

                // Contact
                mobileNumber: formData.mobileNumber,
                email: formData.email || null,
                whatsappNumber: formData.whatsappNumber || null,
                telephoneNumber: formData.telephoneNumber || null,
                alternateMobile: formData.alternateMobile || null,

                // Address
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                pinCode: formData.pincode,
                city: formData.city || 'New Delhi',
                state: formData.state || 'Delhi',
                permanentAddress: `${formData.addressLine1}, ${formData.addressLine2}, ${formData.city || 'New Delhi'}`,
                presentAddress: formData.sameAsPermanent
                    ? `${formData.addressLine1}, ${formData.addressLine2}, ${formData.city || 'New Delhi'}`
                    : formData.presentAddress,
                districtId: formData.district || null,
                policeStationId: formData.policeStation || null,
                landmark: formData.landmark || null,
                locality: formData.locality || null,

                // GPS Coordinates
                gpsLatitude: formData.gpsLatitude,
                gpsLongitude: formData.gpsLongitude,
                gpsAccuracy: formData.gpsAccuracy,
                gpsCapturedAt: formData.gpsCapturedAt,

                // Retirement
                yearOfRetirement: formData.yearOfRetirement ? parseInt(formData.yearOfRetirement) : null,
                retiredFrom: formData.retiredFrom || null,

                // Living
                residingWith: formData.residingWith,
                familyType: formData.familyType || null,
                numberOfChildren: formData.numberOfChildren ? parseInt(formData.numberOfChildren) : 0,

                // Health
                bloodGroup: formData.bloodGroup || null,
                mobilityStatus: formData.mobilityStatus,
                mobilityConstraints: formData.mobilityConstraints || null,
                physicalDisability: formData.physicalDisability || false,
                regularDoctor: formData.regularDoctor || null,
                doctorContact: formData.doctorContact || null,


                // Consents
                consentNotifications: true,
                consentServiceRequest: true,
                consentShareHealth: formData.consentShareHealth || false,
                consentToNotifyFamily: formData.consentToNotifyFamily || false,

                // Documents
                photoUrl: formData.photoUrl || null,
                addressProofUrl: formData.addressProofUrl || null,

                // Relations (arrays)
                emergencyContacts: formData.emergencyContacts || [],
                familyMembers: formData.familyMembers || [],
                householdHelp: formData.staffDetails || [],
                medicalHistory: formData.medicalHistory || [],

                // Spouse Details (only if spouse name is provided)
                spouseDetails: formData.spouseName ? {
                    fullName: formData.spouseName,
                    mobileNumber: formData.spouseMobile || null,
                    weddingDate: formData.weddingDate || null,
                    isLivingTogether: formData.isLivingTogether !== undefined ? formData.isLivingTogether : true,
                    addressIfNotTogether: formData.addressIfNotTogether || null
                } : undefined,

                // Other fields
                nearbyFamilyDetails: formData.nearbyFamilyDetails || null,
                socialChatIds: formData.socialChatIds || null,
                lastVisitDate: formData.lastVisitDate || null
            };

            // Remove undefined values to avoid sending them to backend
            Object.keys(payload).forEach(key => {
                if (payload[key as keyof typeof payload] === undefined) {
                    delete payload[key as keyof typeof payload];
                }
            });

            console.log('DEBUG: Clean Payload being sent:', JSON.stringify(payload, null, 2));

            const res = await apiClient.updateMyProfile(payload);

            toast({
                title: 'Profile Submitted',
                description: 'Verification request sent to beat officer. Redirecting to dashboard...',
                duration: 3000
            });

            // Wait a bit before redirecting for toast to be seen
            setTimeout(() => {
                router.push('/citizen-portal/dashboard');
            }, 1000);

        } catch (error: any) {
            console.error('DEBUG: Submission Error:', error);
            console.error('DEBUG: Error Response:', error.response?.data);
            console.error('DEBUG: Error Status:', error.response?.status);
            console.error('DEBUG: Error Headers:', error.response?.headers);

            // Log validation errors if present
            if (error.response?.data?.errors) {
                console.error('DEBUG: Validation Errors:', error.response.data.errors);
            }

            const msg = error.response?.data?.message || error.message || 'Failed to update profile.';

            // Show detailed error in development
            const detailedMsg = process.env.NODE_ENV === 'development'
                ? `${msg}\n${error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : ''}`
                : msg;

            toast({
                title: 'Submission Failed',
                description: detailedMsg,
                variant: 'destructive'
            });

            setSubmitting(false);
        }
    };

    const validateStep = (step: number) => {
        if (step === 1) {
            if (!formData.fullName) return "Full Name is required.";
            if (!formData.dob) return "Date of Birth is required.";
        }
        if (step === 2) {
            if (!formData.addressLine1) return "Address Line 1 is required.";
            if (!formData.pincode || formData.pincode.length !== 6) return "Valid Pincode is required.";
            if (!formData.district) return "District is required.";
            if (!formData.policeStation) return "Police Station is required.";
            if (!formData.mobileNumber) return "Mobile Number is required.";
        }
        if (step === 3) {
            if (!formData.emergencyContacts || formData.emergencyContacts.length === 0) {
                return "At least one Friend/Relative (Emergency) contact is required.";
            }
            // Check if added contacts have valid data
            const invalidContact = formData.emergencyContacts.some((c: any) => !c.name || !c.mobileNumber);
            if (invalidContact) return "Please complete details for all Emergency Contacts.";
        }
        return null;
    };

    const nextStep = () => {
        if (currentStep < STEPS.length) {
            const error = validateStep(currentStep);
            if (error) {
                toast({ title: "Required Field Missing", description: error, variant: "destructive" });
                return;
            }
            setCurrentStep(p => p + 1);
            window.scrollTo(0, 0);
        }
    };
    const prevStep = () => { if (currentStep > 1) { setCurrentStep(p => p - 1); window.scrollTo(0, 0); } };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

    // Use Data Completeness instead of Wizard Step Progress
    // const progress = (currentStep / STEPS.length) * 100;
    const progress = calculateProfileCompleteness(formData);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Progress Header */}
            <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                    <span>Step {currentStep} of {STEPS.length}</span>
                    <span className="text-blue-600 font-bold">{progress}% Profile Strength</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between mt-4 overflow-x-auto pb-2 gap-2 hide-scrollbar">
                    {STEPS.map((step) => (
                        <div key={step.id} className={`flex-shrink-0 flex flex-col items-center w-24 ${step.id === currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 border-2 font-bold text-sm
                                ${step.id === currentStep ? 'border-blue-600 bg-blue-50' : step.id < currentStep ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-200'}`}>
                                {step.id < currentStep ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                            </div>
                            <span className="text-[10px] uppercase font-bold text-center tracking-wider truncate w-full">{step.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="border-t-4 border-t-blue-600 shadow-lg">
                <CardHeader>
                    <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
                    <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* STEP 1: PERSONAL INFO */}
                    {currentStep === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center mb-6">
                                {/* Photo Upload Logic */}
                                {/* Photo Upload Logic */}
                                <div className="relative group w-32 h-32">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-slate-50 flex items-center justify-center">
                                        {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <User className="h-16 w-16 text-slate-300" />}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                                        <button type="button" onClick={() => setShowCamera(true)} className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 border-2 border-white" title="Take with Camera">
                                            <Camera className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-slate-50 border-2 border-white" title="Upload Photo">
                                            <Upload className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            handleFileUpload(e);
                                            e.target.value = ''; // Reset to allow re-selection of same file
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Full Name <span className="text-red-500">*</span></Label>
                                <Input value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Date of Birth <span className="text-red-500">*</span></Label>
                                <Input type="date" value={formData.dob} onChange={e => handleInputChange('dob', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select value={formData.gender} onValueChange={v => handleInputChange('gender', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {(masters.systemMasters?.GENDER && masters.systemMasters.GENDER.length > 0) ? (
                                            masters.systemMasters.GENDER.map((m: any) => <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>)
                                        ) : (
                                            ['Male', 'Female', 'Other'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Marital Status</Label>
                                <Select value={formData.maritalStatus} onValueChange={v => handleInputChange('maritalStatus', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {(masters.systemMasters?.MARITAL_STATUS && masters.systemMasters.MARITAL_STATUS.length > 0) ? (
                                            masters.systemMasters.MARITAL_STATUS.map((m: any) => <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>)
                                        ) : (
                                            ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Religion</Label>
                                <Select value={formData.religion} onValueChange={v => handleInputChange('religion', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {(masters.systemMasters?.RELIGION && masters.systemMasters.RELIGION.length > 0) ? (
                                            masters.systemMasters.RELIGION.map((m: any) => <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>)
                                        ) : (
                                            ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Specialization / Skills</Label>
                                <Input value={formData.specialization} onChange={e => handleInputChange('specialization', e.target.value)} placeholder="e.g. Teaching, Carpentry" />
                            </div>
                            <div className="space-y-2">
                                <Label>Occupation (Past/Present)</Label>
                                <Select value={formData.occupation} onValueChange={v => handleInputChange('occupation', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {(masters.systemMasters?.OCCUPATION && masters.systemMasters.OCCUPATION.length > 0) ? (
                                            masters.systemMasters.OCCUPATION.map((m: any) => <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>)
                                        ) : (
                                            ['Retired', 'Homemaker', 'Business', 'Service', 'Other'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.occupation === 'Retired' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Retired From (Organization)</Label>
                                        <Input value={formData.retiredFrom} onChange={e => handleInputChange('retiredFrom', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Year of Retirement</Label>
                                        <Input type="number" value={formData.yearOfRetirement} onChange={e => handleInputChange('yearOfRetirement', e.target.value)} />
                                    </div>
                                </>
                            )}


                        </div>
                    )}

                    {/* STEP 2: CONTACT & ADDRESS */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Mobile Number</Label>
                                    <Input value={formData.mobileNumber} disabled className="bg-slate-100" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Landline / Telephone</Label>
                                    <Input value={formData.telephoneNumber} onChange={e => handleInputChange('telephoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Whatsapp Number</Label>
                                    <Input value={formData.whatsappNumber} onChange={e => handleInputChange('whatsappNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email (Optional)</Label>
                                    <Input value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                                </div>
                            </div>

                            <hr />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Residing With</Label>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        {['Alone', 'Spouse', 'Children', 'Relatives'].map(opt => (
                                            <div key={opt} className="flex items-center space-x-2">
                                                <input type="radio" id={`res-${opt}`} name="residingWith"
                                                    checked={formData.residingWith === opt}
                                                    onChange={() => handleInputChange('residingWith', opt)}
                                                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor={`res-${opt}`} className="text-sm font-medium">{opt}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label>Address Line 1 (House No, Building) <span className="text-red-500">*</span></Label>
                                    <div className="flex justify-end mb-1">
                                        <Button type="button" variant="outline" size="sm" onClick={handleGPSLocation} disabled={gpsLoading} className="h-7 text-xs">
                                            {gpsLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                                            Use Current Location
                                        </Button>
                                    </div>
                                    <Input value={formData.addressLine1} onChange={e => handleInputChange('addressLine1', e.target.value)} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Address Line 2 (Area, Street)</Label>
                                    <Input value={formData.addressLine2} onChange={e => handleInputChange('addressLine2', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pincode <span className="text-red-500">*</span></Label>
                                    <Input value={formData.pincode} onChange={e => handleInputChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} placeholder="e.g. 110001" />
                                </div>
                                <div className="space-y-2">
                                    <Label>District <span className="text-red-500">*</span></Label>
                                    <Select value={formData.district} onValueChange={v => handleInputChange('district', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {masters.districts?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Police Station <span className="text-red-500">*</span></Label>
                                    <Select value={formData.policeStation} onValueChange={v => handleInputChange('policeStation', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {masters.policeStations?.filter((ps: any) =>
                                                !formData.district ||
                                                ps.districtId === formData.district ||
                                                ps.id === formData.policeStation
                                            ).map((ps: any) => <SelectItem key={ps.id} value={ps.id}>{ps.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Address Proof Upload */}
                                <div className="space-y-2 col-span-1 md:col-span-2 pt-4">
                                    <Label>Address Proof Document (Any Govt. Issued Id)</Label>
                                    <div className="flex items-center gap-4 mt-2">
                                        {formData.addressProofUrl ? (
                                            <div className="flex items-center gap-2 p-2 px-4 bg-green-50 border border-green-200 rounded-md text-green-700 w-full md:w-auto">
                                                <CheckCircle2 className="h-5 w-5" />
                                                <span className="text-sm font-medium">Document Uploaded</span>
                                                <Button type="button" variant="ghost" size="sm" className="ml-2 h-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => apiClient.viewDocument(formData.addressProofUrl)}>
                                                    <Eye className="h-4 w-4 mr-1" /> Preview
                                                </Button>
                                                <Button variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0 text-red-500" onClick={() => setFormData((prev: any) => ({ ...prev, addressProofUrl: '' }))}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="w-full md:w-auto">
                                                <Button type="button" variant="outline" onClick={() => addressProofInputRef.current?.click()} className="w-full md:w-auto border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                    <Upload className="h-4 w-4 mr-2" /> Upload Address Proof
                                                </Button>
                                                <p className="text-xs text-gray-500 mt-1 ml-1">Supports: PDF, JPG, PNG (Max 5MB)</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={addressProofInputRef}
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                                            onChange={(e) => {
                                                handleAddressProofUpload(e);
                                                e.target.value = ''; // Reset
                                            }}
                                        />
                                    </div>
                                </div>

                            </div>

                        </div>
                    )}

                    {/* STEP 3: FAMILY DETAILS */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            {/* Spouse Section */}
                            {/* Spouse Section - Only if Married */}
                            {formData.maritalStatus === 'Married' && (
                                <div className="p-4 bg-slate-50 rounded-lg border">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="h-4 w-4" /> Spouse Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Spouse Name</Label>
                                            <Input value={formData.spouseName} onChange={e => handleInputChange('spouseName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Wedding Date</Label>
                                            <Input type="date" value={formData.weddingDate} onChange={e => handleInputChange('weddingDate', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mobile Number</Label>
                                            <Input value={formData.spouseMobile} onChange={e => handleInputChange('spouseMobile', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                                        </div>
                                        <div className="space-y-2 flex items-center h-full pt-6 gap-2">
                                            <Checkbox
                                                id="livingTogether"
                                                checked={formData.isLivingTogether}
                                                onCheckedChange={checked => handleInputChange('isLivingTogether', checked)}
                                                className="h-4 w-4"
                                            />
                                            <Label htmlFor="livingTogether" className="mb-0">Living Together?</Label>
                                        </div>
                                        {!formData.isLivingTogether && (
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Address if not living together</Label>
                                                <Input value={formData.addressIfNotTogether} onChange={e => handleInputChange('addressIfNotTogether', e.target.value)} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Number of Children */}
                            <div className="p-4 bg-slate-50 rounded-lg border">
                                <div className="space-y-2">
                                    <Label>Number of Children</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.numberOfChildren}
                                        onChange={e => handleInputChange('numberOfChildren', e.target.value)}
                                        placeholder="Enter number of children"
                                    />
                                    <p className="text-xs text-muted-foreground">Total number of children (sons and daughters)</p>
                                </div>
                            </div>

                            {/* Family Members */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base">Family Members</Label>
                                    <Button variant="outline" size="sm" onClick={() => addItem('familyMembers', { name: '', relation: '', age: '', mobileNumber: '' })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Member
                                    </Button>
                                </div>
                                {formData.familyMembers.map((member: any, idx: number) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border p-3 rounded-md bg-white">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Name</Label>
                                            <Input value={member.name} onChange={e => updateItem('familyMembers', idx, 'name', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Relation</Label>
                                            <Select value={member.relation} onValueChange={v => updateItem('familyMembers', idx, 'relation', v)}>
                                                <SelectTrigger><SelectValue placeholder="Relation" /></SelectTrigger>
                                                <SelectContent>
                                                    {(masters.systemMasters?.RELATION && masters.systemMasters.RELATION.length > 0) ? (
                                                        masters.systemMasters.RELATION.map((m: any) => <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>)
                                                    ) : (
                                                        ['Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Grandson', 'Granddaughter', 'Other'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Mobile</Label>
                                            <Input value={member.mobileNumber} onChange={e => updateItem('familyMembers', idx, 'mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem('familyMembers', idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Friends / Relatives (Emergency Contacts) */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base">Friends / Relatives (Emergency) <span className="text-red-500">*</span></Label>
                                    <Button variant="outline" size="sm" onClick={() => addItem('emergencyContacts', { name: '', relation: '', mobileNumber: '' })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Friend/Relative
                                    </Button>
                                </div>
                                {formData.emergencyContacts.map((contact: any, idx: number) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border p-3 rounded-md bg-white">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Name</Label>
                                            <Input value={contact.name} onChange={e => updateItem('emergencyContacts', idx, 'name', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Relation</Label>
                                            <Input value={contact.relation} onChange={e => updateItem('emergencyContacts', idx, 'relation', e.target.value)} placeholder="e.g. Friend" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Mobile</Label>
                                            <Input value={contact.mobileNumber} onChange={e => updateItem('emergencyContacts', idx, 'mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem('emergencyContacts', idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: HOUSEHOLD STAFF */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <Label className="text-base">Household Service Providers</Label>
                                <Button variant="outline" size="sm" onClick={() => addItem('staffDetails', { staffType: 'Domestic Help', name: '', mobileNumber: '', idProofType: 'VoterID', idProofUrl: '' })}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Staff
                                </Button>
                            </div>

                            {formData.staffDetails.length === 0 && <div className="text-center text-gray-400 py-8 border-2 border-dashed rounded-lg">No staff details added. Click "Add Staff" if applicable.</div>}

                            {formData.staffDetails.map((staff: any, idx: number) => (
                                <div key={idx} className="border p-4 rounded-lg bg-slate-50 relative space-y-3">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => removeItem('staffDetails', idx)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Staff Type</Label>
                                            <Select value={staff.staffType} onValueChange={v => updateItem('staffDetails', idx, 'staffType', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {['Domestic Help', 'Driver', 'Watchman', 'Tenant'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input value={staff.name} onChange={e => updateItem('staffDetails', idx, 'name', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mobile</Label>
                                            <Input value={staff.mobileNumber} onChange={e => updateItem('staffDetails', idx, 'mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                                        </div>
                                    </div>

                                    {/* ID Proof Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white rounded border">
                                        <div className="space-y-2">
                                            <Label>ID Proof Type</Label>
                                            <Select value={staff.idProofType} onValueChange={v => updateItem('staffDetails', idx, 'idProofType', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {['VoterID', 'Driving License', 'Other'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            {staff.idProofUrl ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <div className="flex items-center gap-2 text-green-600 text-sm border p-2 rounded flex-1">
                                                        <CheckCircle2 className="h-4 w-4" /> Uploaded
                                                    </div>
                                                    <Button variant="outline" size="sm" onClick={() => apiClient.viewDocument(staff.idProofUrl)} title="View Document">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => updateItem('staffDetails', idx, 'idProofUrl', '')} title="Delete / Replace" className="text-red-500 hover:text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="secondary" className="w-full" onClick={() => { setActiveStaffIndex(idx); staffFileInputRef.current?.click(); }}>
                                                    <Upload className="h-4 w-4 mr-2" /> Upload ID Proof
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Hidden Input for Staff Docs - Explicitly allowing images and PDF */}
                            <input
                                type="file"
                                ref={staffFileInputRef}
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg,application/pdf"
                                onChange={(e) => {
                                    handleStaffDocUpload(e);
                                    e.target.value = ''; // Reset
                                }}
                            />
                        </div>
                    )}


                    {/* STEP 5: HEALTH */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Blood Group</Label>
                                    <Select value={formData.bloodGroup} onValueChange={v => handleInputChange('bloodGroup', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {(masters.systemMasters?.BLOOD_GROUP && masters.systemMasters.BLOOD_GROUP.length > 0) ? (
                                                masters.systemMasters.BLOOD_GROUP.map((m: any) => <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>)
                                            ) : (
                                                ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Mobility Status</Label>
                                    <Select value={formData.mobilityStatus} onValueChange={v => handleInputChange('mobilityStatus', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {['Mobile', 'Restricted Mobility', 'Bedridden'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Regular Doctor</Label>
                                    <Input value={formData.regularDoctor} onChange={e => handleInputChange('regularDoctor', e.target.value)} placeholder="Doctor's name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Doctor's Contact Number</Label>
                                    <Input
                                        value={formData.doctorContact}
                                        onChange={e => handleInputChange('doctorContact', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        maxLength={10}
                                        placeholder="10-digit mobile number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mt-8">
                                        <input
                                            type="checkbox"
                                            id="pd_check"
                                            className="w-4 h-4"
                                            checked={formData.physicalDisability}
                                            onChange={e => handleInputChange('physicalDisability', e.target.checked)}
                                        />
                                        <Label htmlFor="pd_check">Physical Disability?</Label>
                                    </div>
                                </div>
                                {formData.mobilityStatus !== 'Mobile' && (
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label>Mobility Constraints (Description)</Label>
                                        <Input value={formData.mobilityConstraints} onChange={e => handleInputChange('mobilityConstraints', e.target.value)} placeholder="e.g. Uses Walker, Needs Assistance" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>Medical History (Existing Illnesses)</Label>
                                    <Button variant="outline" size="sm" onClick={() => addItem('medicalHistory', { conditionName: '', sinceWhen: '', remarks: '' })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Condition
                                    </Button>
                                </div>
                                {formData.medicalHistory.map((hist: any, idx: number) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end border p-3 rounded-md bg-white">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Condition</Label>
                                            <Input value={hist.conditionName} onChange={e => updateItem('medicalHistory', idx, 'conditionName', e.target.value)} placeholder="e.g. Diabetes" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Since (Year)</Label>
                                            <Input value={hist.sinceWhen} onChange={e => updateItem('medicalHistory', idx, 'sinceWhen', e.target.value)} placeholder="e.g. 2010" />
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem('medicalHistory', idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 6: REVIEW */}
                    {currentStep === 6 && (
                        <div className="space-y-8">
                            <div className="bg-slate-50 p-6 rounded-lg space-y-6">
                                <h3 className="font-bold text-xl border-b pb-4 text-gray-800">Final Review</h3>

                                {/* 1. Personal Info */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-blue-700 bg-blue-50 p-2 rounded">Personal Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                                        <div><span className="block text-gray-500 text-xs">Full Name</span><span className="font-medium">{formData.fullName}</span></div>
                                        <div><span className="block text-gray-500 text-xs">Date of Birth</span><span className="font-medium">{formData.dob}</span></div>
                                        <div><span className="block text-gray-500 text-xs">Gender</span><span className="font-medium">{formData.gender}</span></div>
                                        <div><span className="block text-gray-500 text-xs">Occupation</span><span className="font-medium">{formData.occupation || '-'}</span></div>
                                        <div><span className="block text-gray-500 text-xs">Religion</span><span className="font-medium">{formData.religion || '-'}</span></div>
                                        <div><span className="block text-gray-500 text-xs">Specialization</span><span className="font-medium">{formData.specialization || '-'}</span></div>
                                    </div>
                                </div>

                                {/* 2. Address & Contact */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-blue-700 bg-blue-50 p-2 rounded">Contact & Address</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                        <div><span className="block text-gray-500 text-xs">Mobile Number</span><span className="font-medium">{formData.mobileNumber}</span></div>
                                        <div><span className="block text-gray-500 text-xs">Email</span><span className="font-medium">{formData.email || '-'}</span></div>
                                        <div className="col-span-1 md:col-span-2">
                                            <span className="block text-gray-500 text-xs">Permanent Address</span>
                                            <span className="font-medium block">{formData.addressLine1}, {formData.addressLine2}</span>
                                            <span className="font-medium block">{formData.city}, {formData.state} - {formData.pincode}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs">Police Station</span>
                                            <span className="font-medium">{masters.policeStations.find((ps: any) => ps.id === formData.policeStation)?.name || formData.policeStation || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs">District</span>
                                            <span className="font-medium">{masters.districts.find((d: any) => d.id === formData.district)?.name || formData.district || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Family */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-blue-700 bg-blue-50 p-2 rounded">Family Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                                        <div><span className="block text-gray-500 text-xs">Spouse Name</span><span className="font-medium">{formData.spouseName || 'N/A'}</span></div>
                                        <div><span className="block text-gray-500 text-xs">Spouse Mobile</span><span className="font-medium">{formData.spouseMobile || 'N/A'}</span></div>
                                        <div><span className="block text-gray-500 text-xs">Residing With</span><span className="font-medium">{formData.residingWith}</span></div>
                                    </div>
                                    {formData.familyMembers.length > 0 && (
                                        <div className="mt-2 text-sm border rounded p-2 bg-white">
                                            <p className="font-semibold mb-2">Other Members:</p>
                                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                                {formData.familyMembers.map((mem: any, idx: number) => (
                                                    <li key={idx}>{mem.name} ({mem.relation}) - {mem.mobileNumber || 'No Mobile'}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Staff */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-blue-700 bg-blue-50 p-2 rounded">Household Staff</h4>
                                    {formData.staffDetails.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {formData.staffDetails.map((staff: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 border-gray-200">
                                                    <div>
                                                        <span className="font-semibold">{staff.staffType}</span>: {staff.name}
                                                    </div>
                                                    <div className="text-gray-600">{staff.mobileNumber}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-sm italic">No household staff entries.</div>
                                    )}
                                </div>

                                {/* 5. Health */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-blue-700 bg-blue-50 p-2 rounded">Health & Medical</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                        <div><span className="block text-gray-500 text-xs">Blood Group</span><span className="font-medium">{formData.bloodGroup || '-'}</span></div>
                                        <div><span className="block text-gray-500 text-xs">Regular Doctor</span><span className="font-medium">{formData.regularDoctor || '-'}</span></div>
                                        <div><span className="block text-gray-500 text-xs">Mobility Status</span><span className="font-medium">{formData.mobilityStatus}</span></div>
                                        <div><span className="block text-gray-500 text-xs">Physical Disability</span><span className="font-medium">{formData.physicalDisability ? 'Yes' : 'No'}</span></div>
                                        {formData.mobilityStatus !== 'Mobile' && (
                                            <div className="col-span-1 md:col-span-2"><span className="block text-gray-500 text-xs">Mobility Constraints</span><span className="font-medium">{formData.mobilityConstraints || '-'}</span></div>
                                        )}
                                    </div>
                                    {formData.medicalHistory.length > 0 && (
                                        <div className="mt-2 text-sm border rounded p-2 bg-white">
                                            <p className="font-semibold mb-2">Medical History:</p>
                                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                                {formData.medicalHistory.map((h: any, idx: number) => (
                                                    <li key={idx}>{h.conditionName} (Since {h.sinceWhen})</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-yellow-50 p-4 rounded text-yellow-800 text-sm border border-yellow-200 text-center font-medium">
                                    Please review all details carefully before submitting.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 7: DECLARATION */}
                    {currentStep === 7 && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-lg space-y-4">
                                <h3 className="font-bold text-xl border-b pb-4 text-gray-800">Declaration</h3>
                                <div className="flex items-start space-x-3 p-4 bg-white border rounded-md">
                                    <Checkbox
                                        id="consentDataUse"
                                        checked={formData.consentDataUse}
                                        onCheckedChange={(checked) => handleInputChange('consentDataUse', checked)}
                                    />
                                    <div className="space-y-1">
                                        <Label htmlFor="consentDataUse" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            I hereby declare that the information provided above is true and correct.
                                        </Label>
                                        <p className="text-sm text-gray-500">
                                            I consent to the use of my data for the purpose of the Senior Citizen Safety program by Delhi Police.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </CardContent>
                <CardFooter className="flex justify-between bg-slate-50 p-4 rounded-b-lg">
                    <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>

                    {currentStep < STEPS.length ? (
                        <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button type="button" onClick={submitProfile} disabled={submitting || (currentStep === 7 && !formData.consentDataUse)} className="bg-green-600 hover:bg-green-700 w-32">
                            {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Submit'}
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Webcam Dialog */}
            <Dialog open={showCamera} onOpenChange={setShowCamera}>
                <DialogContent className="sm:max-w-md">
                    <DialogTitle>Take Profile Photo</DialogTitle>
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative rounded-lg overflow-hidden bg-black w-full aspect-video flex items-center justify-center">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover"
                                mirrored={true}
                                videoConstraints={{ facingMode: "user" }}
                                onUserMedia={() => console.log('Webcam access granted')}
                                onUserMediaError={(err) => {
                                    console.error('Webcam error:', err);
                                    toast({ title: "Camera Error", description: "Could not access camera. Please check permissions.", variant: "destructive" });
                                }}
                            />
                        </div>
                        <div className="flex gap-2 w-full justify-center">
                            <Button variant="outline" onClick={() => setShowCamera(false)}>Cancel</Button>
                            <Button onClick={capturePhoto}><Camera className="mr-2 h-4 w-4" /> Capture Photo</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
