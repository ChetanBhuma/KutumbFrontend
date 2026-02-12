'use client';

import { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Loader2, Plus, Trash2, CheckCircle2, Eye, Upload, Camera, User, MapPin, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import { useMasterData } from '@/hooks/use-master-data';
import { useClientDate } from '@/hooks/use-client-date';
import { useToast } from '@/components/ui/use-toast';
import Webcam from 'react-webcam';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useSecureImage } from '@/hooks/use-secure-image';

const STEPS = [
    { id: 1, title: 'Personal Info', description: 'Basic details & Identity' },
    { id: 2, title: 'Contact & Address', description: 'Where can we find you?' },
    { id: 3, title: 'Family Details', description: 'Spouse & Family Members' },
    { id: 4, title: 'Household Staff', description: 'Domestic help, Driver, etc.' },
    { id: 5, title: 'Health', description: 'Medical information' },
    { id: 6, title: 'Review', description: 'Confirm details' },
    { id: 7, title: 'Declaration', description: 'Consent & Final Submit' }
];

interface CitizenFormProps {
    mode: 'create' | 'edit';
    citizenId?: string;
    onSuccess?: (citizenId: string) => void;
}

export function CitizenForm({ mode, citizenId, onSuccess }: CitizenFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState(1);

    // Camera & File Refs
    const webcamRef = useRef<Webcam>(null);
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addressProofInputRef = useRef<HTMLInputElement>(null);
    const staffFileInputRef = useRef<HTMLInputElement>(null);
    const [activeStaffIndex, setActiveStaffIndex] = useState<number | null>(null);

    // File States
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
    const [staffFiles, setStaffFiles] = useState<{ [key: number]: File }>({});

    // Master Data
    const {
        districts,
        policeStations,
        getPoliceStationsByDistrict,
        systemMasters,
        loading: masterDataLoading
    } = useMasterData();

    const currentDate = useClientDate('iso');

    // Form State
    const [formData, setFormData] = useState<any>({
        // Personal
        fullName: '',
        dateOfBirth: '', // mapped to dob in citizen form, backend expects dateOfBirth
        age: 0,
        gender: '',
        maritalStatus: '',
        religion: '',
        occupation: '',
        specialization: '',
        retiredFrom: '',
        yearOfRetirement: '',
        photoUrl: '',

        // Contact
        mobileNumber: '',
        alternateMobile: '',
        telephoneNumber: '',
        whatsappNumber: '',
        email: '',

        // Address
        addressLine1: '',
        addressLine2: '',
        city: 'New Delhi',
        state: 'Delhi',
        pinCode: '',
        districtId: '',
        policeStationId: '',
        permanentAddress: '', // Combined if needed, but we use lines
        presentAddress: '',
        addressProofUrl: '',
        residingWith: '',

        // Family
        spouseDetails: {
            fullName: '',
            mobileNumber: '',
            weddingDate: '',
            isLivingTogether: true,
            addressIfNotTogether: ''
        },
        numberOfChildren: 0,
        familyMembers: [], // { name, relation, mobileNumber, age }
        emergencyContacts: [], // { name, relation, mobileNumber }
        nearbyFamilyDetails: '',

        // Staff
        householdHelp: [], // mapped to staffDetails in citizen form

        // Health
        bloodGroup: '',
        mobilityStatus: 'Mobile',
        mobilityConstraints: '',
        physicalDisability: false,
        regularDoctor: '',
        doctorContact: '',
        medicalHistory: [], // { conditionName, sinceWhen, treatment }
        consentShareHealth: false,

        // Consents
        consentDataUse: false,
        consentDate: '',

        // Assessment (Admin Only)
        vulnerabilityScore: 0,
        lastAssessmentDate: '',
        visitRemarks: ''
    });


    // Secure Image Hook
    const { secureUrl: validPhotoUrl } = useSecureImage(formData.photoUrl);

    useEffect(() => {
        if (currentDate) {
            setFormData((prev: any) => ({ ...prev, consentDate: currentDate }));
        }
    }, [currentDate]);

    // Load citizen data for edit mode
    useEffect(() => {
        if (mode === 'edit' && citizenId) {
            const loadCitizenData = async () => {
                try {
                    setLoading(true);
                    const res = await apiClient.getCitizenById(citizenId);
                    const c = res.data.citizen;



                    setFormData({
                        // Personal
                        fullName: c.fullName || '',
                        dateOfBirth: c.dateOfBirth ? new Date(c.dateOfBirth).toISOString().split('T')[0] : '',
                        age: c.age || 0,
                        gender: c.gender || '',
                        maritalStatus: c.maritalStatus || '',
                        religion: c.religion || '',
                        occupation: c.occupation || '',
                        specialization: c.specialization || '',
                        retiredFrom: c.retiredFrom || '',
                        yearOfRetirement: c.yearOfRetirement ? String(c.yearOfRetirement) : '',
                        photoUrl: c.photoUrl || '',

                        // Contact
                        mobileNumber: c.mobileNumber || '',
                        alternateMobile: c.alternateMobile || '',
                        telephoneNumber: c.telephoneNumber || '',
                        whatsappNumber: c.whatsappNumber || '',
                        email: c.email || '',

                        // Address
                        addressLine1: c.addressLine1 || '',
                        addressLine2: c.addressLine2 || '',
                        city: c.city || 'New Delhi',
                        state: c.state || 'Delhi',
                        pinCode: c.pinCode || '',
                        districtId: c.districtId || '',
                        policeStationId: c.policeStationId || '',
                        permanentAddress: c.permanentAddress || '',
                        presentAddress: c.presentAddress || '',
                        addressProofUrl: c.addressProofUrl || '',
                        residingWith: c.residingWith || '',

                        // Family
                        spouseDetails: (() => {
                            const s = c.spouseDetails || c.SpouseDetails;
                            return s ? {
                                fullName: s.fullName || '',
                                mobileNumber: s.mobileNumber || '',
                                weddingDate: s.weddingDate ? new Date(s.weddingDate).toISOString().split('T')[0] : '',
                                isLivingTogether: s.isLivingTogether !== undefined ? s.isLivingTogether : true,
                                addressIfNotTogether: s.addressIfNotTogether || ''
                            } : {
                                fullName: '',
                                mobileNumber: '',
                                weddingDate: '',
                                isLivingTogether: true,
                                addressIfNotTogether: ''
                            };
                        })(),
                        numberOfChildren: c.numberOfChildren || 0,
                        familyMembers: (c.familyMembers?.length ? c.familyMembers : (c.FamilyMember?.length ? c.FamilyMember : (c.FamilyMembers?.length ? c.FamilyMembers : []))).map((i: any) => ({
                            name: i.name || i.Name || '',
                            relation: i.relation || i.Relation || '',
                            mobileNumber: i.mobileNumber || i.MobileNumber || i.contact || i.Contact || ''
                        })),
                        emergencyContacts: (c.emergencyContacts?.length ? c.emergencyContacts : (c.EmergencyContact?.length ? c.EmergencyContact : (c.EmergencyContacts?.length ? c.EmergencyContacts : []))).map((i: any) => ({
                            name: i.name || i.Name || '',
                            relation: i.relation || i.Relation || '',
                            mobileNumber: i.mobileNumber || i.MobileNumber || i.contact || i.Contact || '',
                            address: i.address || i.Address || ''
                        })),
                        nearbyFamilyDetails: c.nearbyFamilyDetails || '',

                        // Staff
                        householdHelp: (c.householdHelp?.length ? c.householdHelp : (c.HouseholdHelp?.length ? c.HouseholdHelp : [])).map((i: any) => ({
                            staffType: i.staffType || i.StaffType || i.category || i.Category || 'Domestic Help',
                            name: i.name || i.Name || '',
                            mobileNumber: i.mobileNumber || i.MobileNumber || '',
                            idProofUrl: i.idProofUrl || i.IdProofUrl || ''
                        })),

                        // Health
                        bloodGroup: c.bloodGroup || '',
                        mobilityStatus: c.mobilityStatus || 'Mobile',
                        mobilityConstraints: c.mobilityConstraints || '',
                        physicalDisability: c.physicalDisability || false,
                        regularDoctor: c.regularDoctor || '',
                        doctorContact: c.doctorContact || '',
                        medicalHistory: (c.medicalHistory?.length ? c.medicalHistory : (c.MedicalHistory?.length ? c.MedicalHistory : [])).map((i: any) => ({
                            conditionName: i.conditionName || i.ConditionName || '',
                            sinceWhen: i.sinceWhen || i.SinceWhen || '',
                        })),
                        consentShareHealth: c.consentShareHealth || false,

                        // Consents
                        consentDataUse: c.consentDataUse !== undefined ? c.consentDataUse : true,
                        consentDate: c.consentDate || currentDate,

                        // Assessment
                        vulnerabilityScore: c.vulnerabilityScore || 0,
                        lastAssessmentDate: c.lastAssessmentDate || '',
                        visitRemarks: c.visitRemarks || ''
                    });


                } catch (error) {
                    console.error('Failed to load citizen data:', error);
                    toast({
                        title: "Error",
                        description: "Failed to load citizen data",
                        variant: "destructive"
                    });


                } finally {
                    setLoading(false);
                }
            };

            loadCitizenData();
        }
    }, [mode, citizenId]);


    // Helpers
    const calculateAge = (dob: string) => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => {
            const newData = { ...prev, [field]: value };
            if (field === 'dateOfBirth') newData.age = calculateAge(value);
            if (field === 'districtId') newData.policeStationId = '';
            // Sync permanent/present logic if needed, simplify for now
            return newData;
        });


    };

    const updateNestedField = (parent: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    // Array Management
    const addItem = (key: string, item: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: [...prev[key], item] }));
    };

    const removeItem = (key: string, index: number) => {
        setFormData((prev: any) => ({ ...prev, [key]: prev[key].filter((_: any, i: number) => i !== index) }));
        if (key === 'householdHelp') {
            setStaffFiles(prev => {
                const newFiles: { [key: number]: File } = {};
                Object.keys(prev).forEach(k => {
                    const keyNum = parseInt(k);
                    if (keyNum < index) newFiles[keyNum] = prev[keyNum];
                    else if (keyNum > index) newFiles[keyNum - 1] = prev[keyNum];
                });


                return newFiles;
            });


        }
    };

    const updateItem = (key: string, index: number, field: string, value: any) => {
        setFormData((prev: any) => {
            const arr = [...prev[key]];
            arr[index] = { ...arr[index], [field]: value };
            return { ...prev, [key]: arr };
        });


    };

    // File Upload Handlers (Local State only, actual upload on submit)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            updateField('photoUrl', URL.createObjectURL(file));
        }
    };

    const capturePhoto = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            // Convert base64 to file
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "webcam_photo.jpg", { type: "image/jpeg" });
                    setPhotoFile(file);
                    updateField('photoUrl', imageSrc);
                    setShowCamera(false);
                });


        }
    };

    const handleAddressProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAddressProofFile(file);
            updateField('addressProofUrl', URL.createObjectURL(file));
        }
    };

    const handleStaffDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && activeStaffIndex !== null) {
            setStaffFiles(prev => ({ ...prev, [activeStaffIndex]: file }));
            updateItem('householdHelp', activeStaffIndex, 'idProofUrl', URL.createObjectURL(file));
            setActiveStaffIndex(null);
        }
    };

    const handleRemoveAddressProof = () => {
        setAddressProofFile(null);
        updateField('addressProofUrl', '');
        if (addressProofInputRef.current) addressProofInputRef.current.value = '';
    };

    const handleRemoveStaffDoc = (index: number) => {
        setStaffFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[index];
            return newFiles;
        });


        updateItem('householdHelp', index, 'idProofUrl', '');
        if (staffFileInputRef.current) staffFileInputRef.current.value = '';
    };



    const validateStep = (currentStep: number) => {
        // Basic validation
        if (currentStep === 1) {
            if (!formData.fullName) return "Full Name is required.";
            if (!formData.dateOfBirth) return "Date of Birth is required.";
            if (!formData.gender) return "Gender is required.";
        }
        if (currentStep === 2) {
            if (!formData.mobileNumber) return "Mobile Number is required";
            if (!formData.addressLine1) return "Address Line 1 is required";
            if (!formData.pinCode || formData.pinCode.length !== 6) return "Valid Pincode is required";
            if (!formData.districtId) return "District is required";
            if (!formData.policeStationId) return "Police Station is required";
        }

        if (currentStep === 3) {
            if (formData.maritalStatus === 'Married' && !formData.spouseDetails.fullName) {
                return "Spouse Name is required";
            }
            if (!formData.emergencyContacts || formData.emergencyContacts.length === 0) {
                return "At least one Emergency Contact is required";
            }
        }
        return null;
    };

    const handleNext = () => {
        const error = validateStep(step);
        if (error) {
            toast({ title: "Validation Error", description: error, variant: "destructive" });
            return;
        }
        if (step < STEPS.length) setStep(step + 1);
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            // Helper for date
            const formatDate = (d: string | null) => {
                if (!d) return null;
                const date = new Date(d);
                return isNaN(date.getTime()) ? null : date.toISOString();
            };

            // Helper for integers
            const parseIntSafe = (n: any) => {
                const parsed = parseInt(n);
                return isNaN(parsed) ? null : parsed;
            };

            // Clean Payload (Aligned with profile-completion-form.tsx)
            const payload = {
                // Personal
                fullName: formData.fullName,
                dateOfBirth: formatDate(formData.dateOfBirth) || new Date().toISOString(),
                age: formData.age, // Calculated field, kept as is
                gender: formData.gender,
                maritalStatus: formData.maritalStatus || null,
                religion: formData.religion || null,
                occupation: formData.occupation || null,
                specialization: formData.specialization || null,
                retiredFrom: formData.retiredFrom || null,
                yearOfRetirement: parseIntSafe(formData.yearOfRetirement),

                // Contact
                mobileNumber: formData.mobileNumber,
                alternateMobile: formData.alternateMobile || null,
                telephoneNumber: formData.telephoneNumber || null,
                whatsappNumber: formData.whatsappNumber || null,
                email: formData.email || null,
                residingWith: formData.residingWith,

                // Address - Composed exactly like profile-completion-form.tsx
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                pinCode: formData.pinCode,
                city: formData.city || 'New Delhi',
                state: formData.state || 'Delhi',
                permanentAddress: `${formData.addressLine1}, ${formData.addressLine2 || ''}, ${formData.city || 'New Delhi'}`,
                presentAddress: formData.presentAddress || `${formData.addressLine1}, ${formData.addressLine2 || ''}, ${formData.city || 'New Delhi'}`,
                districtId: formData.districtId || null,
                policeStationId: formData.policeStationId || null,

                // Family
                spouseDetails: formData.spouseDetails && formData.spouseDetails.fullName ? {
                    fullName: formData.spouseDetails.fullName,
                    mobileNumber: formData.spouseDetails.mobileNumber || null,
                    weddingDate: formatDate(formData.spouseDetails.weddingDate),
                    isLivingTogether: formData.spouseDetails.isLivingTogether,
                    addressIfNotTogether: formData.spouseDetails.addressIfNotTogether || null
                } : undefined,
                numberOfChildren: parseIntSafe(formData.numberOfChildren) || 0,
                familyMembers: formData.familyMembers.map((m: any) => ({
                    name: m.name,
                    relation: m.relation,
                    mobileNumber: m.mobileNumber || null
                })),

                // Emergency Contacts - Critical Fix from before
                emergencyContacts: formData.emergencyContacts
                    .filter((c: any) => c.name && c.mobileNumber)
                    .map((c: any) => ({
                        name: c.name,
                        relation: c.relation,
                        mobileNumber: c.mobileNumber,
                        address: c.address || null
                    })),

                nearbyFamilyDetails: formData.nearbyFamilyDetails || null,

                // Staff
                householdHelp: [], // Sent as empty, docs uploaded later

                // Health
                bloodGroup: formData.bloodGroup || null,
                mobilityStatus: formData.mobilityStatus,
                mobilityConstraints: formData.mobilityConstraints || null,
                physicalDisability: formData.physicalDisability,
                regularDoctor: formData.regularDoctor || null,
                doctorContact: formData.doctorContact || null,
                medicalHistory: formData.medicalHistory.map((m: any) => ({
                    conditionName: m.conditionName,
                    sinceWhen: m.sinceWhen,
                })),

                // Consents (Matched with profile-completion-form defaults)
                consentNotifications: true,
                consentServiceRequest: true,
                consentShareHealth: formData.consentShareHealth || false,
                consentToNotifyFamily: formData.consentToNotifyFamily || false,
                consentDataUse: formData.consentDataUse || false,
                consentDate: formatDate(formData.consentDate) || new Date().toISOString(),

                // Assessment
                vulnerabilityScore: parseIntSafe(formData.vulnerabilityScore) || 0,
                lastAssessmentDate: formData.lastAssessmentDate || null,
                visitRemarks: formData.visitRemarks || null,

                // Meta
                registeredOnApp: true,
            };

            // Remove keys with undefined values
            Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);




            let finalCitizenId = citizenId; // For edit mode

            if (mode === 'create') {
                // 1. Create Citizen

                const res = await apiClient.createCitizen(payload);
                finalCitizenId = res.data?.citizen?.id;

                if (!finalCitizenId) throw new Error("Failed to create citizen");
            } else {
                // 1. Update Citizen

                await apiClient.updateCitizen(citizenId!, payload);

            }

            // 2. Upload Files (for both create and edit)

            let newPhotoUrl = '';
            if (photoFile) {
                try {
                    const upRes = await apiClient.uploadCitizenDocument(finalCitizenId!, photoFile, 'ProfilePhoto');
                    if (upRes.success) newPhotoUrl = upRes.data.document.fileUrl;
                } catch (e) {
                    console.error("Photo upload failed", e);
                    toast({ title: "Upload Failed", description: "Failed to upload Profile Photo", variant: "destructive" });
                }
            }

            let newAddrUrl = '';
            if (addressProofFile) {
                try {
                    const upRes = await apiClient.uploadCitizenDocument(finalCitizenId!, addressProofFile, 'AddressProof');
                    if (upRes.success) newAddrUrl = upRes.data.document.fileUrl;
                } catch (e) {
                    console.error("Address proof upload failed", e);
                    toast({ title: "Upload Failed", description: "Failed to upload Address Proof", variant: "destructive" });
                }
            }

            // 3. Handle Staff Docs

            const finalStaff = [];
            for (let i = 0; i < formData.householdHelp.length; i++) {
                const staff = formData.householdHelp[i];
                const file = staffFiles[i];
                let idProofUrl = staff.idProofUrl;
                if (file) {
                    try {
                        const upRes = await apiClient.uploadCitizenDocument(finalCitizenId!, file, 'IdentityProof');
                        if (upRes.success) idProofUrl = upRes.data.document.fileUrl;
                    } catch (e) {
                        console.error("Staff doc upload failed", e);
                        toast({ title: "Upload Failed", description: `Failed to upload document for staff: ${staff.name}`, variant: "destructive" });
                    }
                }
                finalStaff.push({ ...staff, idProofUrl });
            }

            // 4. Update Citizen with URLs and Staff (if any files were uploaded)

            if (newPhotoUrl || newAddrUrl || finalStaff.length > 0) {
                await apiClient.updateCitizen(finalCitizenId!, {
                    photoUrl: newPhotoUrl || undefined,
                    addressProofUrl: newAddrUrl || undefined,
                    householdHelp: finalStaff
                });


            }



            toast({
                title: mode === 'create' ? "Citizen Registered Successfully" : "Profile Updated Successfully",
                description: mode === 'create' ? `Citizen ID: ${finalCitizenId}. Verification request sent to beat officer.` : "Citizen profile has been updated.",
            });



            // Call onSuccess callback instead of router.push
            onSuccess?.(finalCitizenId!);



        } catch (error: any) {
            console.error('Submission error:', error);
            if (error.response) {

                // Extract detailed error message
                const errorMessage = error.response.data?.message
                    || error.response.data?.error
                    || error.response.data?.errors?.[0]?.message
                    || JSON.stringify(error.response.data);

                toast({
                    title: "Registration Failed",
                    description: errorMessage,
                    variant: "destructive"
                });


            } else {
                toast({
                    title: "Error",
                    description: error.message || "Registration Failed",
                    variant: "destructive"
                });


            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* Progress Header */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-center mb-4">
                        <CardTitle>Step {step} of {STEPS.length}: {STEPS[step - 1].title}</CardTitle>
                        <span className="text-sm text-muted-foreground">{Math.round((step / STEPS.length) * 100)}%</span>
                    </div>

                    {/* Detailed Tab UI */}
                    <div className="flex gap-2 text-sm text-muted-foreground overflow-x-auto pb-2 scrollbar-hide">
                        {STEPS.map(s => (
                            <div
                                key={s.id}
                                onClick={() => { if (s.id < step) setStep(s.id); }}
                                className={`whitespace-nowrap px-3 py-1 rounded-full cursor-pointer transition-colors ${step === s.id
                                    ? 'bg-blue-600 text-white font-medium'
                                    : step > s.id
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                            >
                                {s.id}. {s.title}
                            </div>
                        ))}
                    </div>

                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(step / STEPS.length) * 100}%` }} />
                    </div>
                </CardHeader>
            </Card>

            <Card className="min-h-[500px] flex flex-col">
                <CardContent className="flex-1 p-6 space-y-6">

                    {/* STEP 1: PERSONAL */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center mb-4">
                                <div className="relative group w-32 h-32">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-slate-50 flex items-center justify-center">
                                        {validPhotoUrl ? <img src={validPhotoUrl} className="w-full h-full object-cover" /> : <User className="h-16 w-16 text-slate-300" />}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                                        <button type="button" onClick={() => setShowCamera(true)} className="p-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700"><Camera className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white text-gray-700 rounded-full shadow hover:bg-slate-50"><Upload className="h-4 w-4" /></button>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Full Name <span className="text-red-500">*</span></Label>
                                <Input value={formData.fullName} onChange={e => updateField('fullName', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Date of Birth <span className="text-red-500">*</span></Label>
                                <Input type="date" value={formData.dateOfBirth} onChange={e => updateField('dateOfBirth', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select value={formData.gender} onValueChange={v => updateField('gender', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {(systemMasters?.GENDER && systemMasters.GENDER.length > 0) ? (
                                            systemMasters.GENDER.map((m: any) => <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>)
                                        ) : (
                                            ['Male', 'Female', 'Other'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Marital Status</Label>
                                <Select value={formData.maritalStatus} onValueChange={v => updateField('maritalStatus', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {(systemMasters?.MARITAL_STATUS && systemMasters.MARITAL_STATUS.length > 0) ? (
                                            systemMasters.MARITAL_STATUS.map((m: any) => <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>)
                                        ) : (
                                            ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Religion</Label>
                                <Select value={formData.religion} onValueChange={v => updateField('religion', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {(systemMasters?.RELIGION && systemMasters.RELIGION.length > 0) ? (
                                            systemMasters.RELIGION.map((m: any) => <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>)
                                        ) : (
                                            ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Other'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Occupation</Label>
                                <Select value={formData.occupation} onValueChange={v => updateField('occupation', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {(systemMasters?.OCCUPATION && systemMasters.OCCUPATION.length > 0) ? (
                                            systemMasters.OCCUPATION.map((m: any) => <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>)
                                        ) : (
                                            ['Retired', 'Service', 'Business', 'Homemaker', 'Other'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Specialization / Skills</Label>
                                <Input value={formData.specialization} onChange={e => updateField('specialization', e.target.value)} placeholder="e.g. Teaching, Carpentry" />
                            </div>
                            {formData.occupation === 'Retired' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Retired From</Label>
                                        <Input value={formData.retiredFrom} onChange={e => updateField('retiredFrom', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Retirement Year</Label>
                                        <Input type="number" value={formData.yearOfRetirement} onChange={e => updateField('yearOfRetirement', e.target.value)} />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* STEP 2: CONTACT & ADDRESS */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Mobile Number <span className="text-red-500">*</span></Label>
                                    <Input value={formData.mobileNumber} onChange={e => updateField('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Alternate Mobile</Label>
                                    <Input value={formData.alternateMobile} onChange={e => updateField('alternateMobile', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Landline</Label>
                                    <Input value={formData.telephoneNumber} onChange={e => updateField('telephoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                                </div>
                                <div className="space-y-2">
                                    <Label>WhatsApp</Label>
                                    <Input value={formData.whatsappNumber} onChange={e => updateField('whatsappNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={formData.email} onChange={e => updateField('email', e.target.value)} />
                                </div>
                            </div>

                            <hr />

                            <div className="space-y-2">
                                <Label>Residing With</Label>
                                <RadioGroup value={formData.residingWith} onValueChange={v => updateField('residingWith', v)} className="flex gap-4">
                                    {['Alone', 'Spouse', 'Children', 'Relatives'].map(opt => (
                                        <div key={opt} className="flex items-center space-x-2">
                                            <RadioGroupItem value={opt} id={`res-${opt}`} />
                                            <Label htmlFor={`res-${opt}`}>{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Address Line 1 <span className="text-red-500">*</span></Label>
                                    <Textarea value={formData.addressLine1} onChange={e => updateField('addressLine1', e.target.value)} />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Address Line 2 (Area)</Label>
                                    <Input value={formData.addressLine2} onChange={e => updateField('addressLine2', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pincode <span className="text-red-500">*</span></Label>
                                    <Input value={formData.pinCode} onChange={e => updateField('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} />
                                </div>
                                <div className="space-y-2">
                                    <Label>District <span className="text-red-500">*</span></Label>
                                    <Select value={formData.districtId} onValueChange={v => updateField('districtId', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {districts.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Police Station <span className="text-red-500">*</span></Label>
                                    <Select value={formData.policeStationId} onValueChange={v => updateField('policeStationId', v)} disabled={!formData.districtId}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {getPoliceStationsByDistrict(formData.districtId).map((ps: any) => <SelectItem key={ps.id} value={ps.id}>{ps.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>



                            <div className="space-y-2">
                                <Label>Address Proof</Label>
                                <div className="flex items-center gap-4">
                                    <Input type="file" ref={addressProofInputRef} className="hidden" onChange={handleAddressProofUpload} />
                                    {formData.addressProofUrl ? (
                                        <div className="flex items-center gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => window.open(formData.addressProofUrl, '_blank')}>
                                                <Eye className="h-4 w-4 mr-2" /> View
                                            </Button>
                                            <Button type="button" variant="ghost" size="sm" onClick={handleRemoveAddressProof} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4 mr-2" /> Remove
                                            </Button>
                                            <span className="text-green-600 text-sm flex items-center ml-2"><CheckCircle2 className="h-4 w-4 mr-1" /> Uploaded</span>
                                        </div>
                                    ) : (
                                        <Button type="button" variant="outline" onClick={() => addressProofInputRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> Upload Proof</Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: FAMILY */}
                    {step === 3 && (
                        <div className="space-y-6">
                            {formData.maritalStatus === 'Married' && (
                                <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                                    <h3 className="font-semibold text-sm">Spouse Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input value={formData.spouseDetails.fullName} onChange={e => updateNestedField('spouseDetails', 'fullName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Wedding Date</Label>
                                            <Input type="date" value={formData.spouseDetails.weddingDate} onChange={e => updateNestedField('spouseDetails', 'weddingDate', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mobile</Label>
                                            <Input value={formData.spouseDetails.mobileNumber} onChange={e => updateNestedField('spouseDetails', 'mobileNumber', e.target.value)} maxLength={10} />
                                        </div>
                                        <div className="space-y-2 pt-6">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="lt" checked={formData.spouseDetails.isLivingTogether} onCheckedChange={c => updateNestedField('spouseDetails', 'isLivingTogether', c)} />
                                                <Label htmlFor="lt">Living Together?</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Number of Children</Label>
                                <Input type="number" className="max-w-[100px]" value={formData.numberOfChildren} onChange={e => updateField('numberOfChildren', e.target.value)} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>Family Members</Label>
                                    <Button size="sm" variant="outline" onClick={() => addItem('familyMembers', { name: '', relation: '', mobileNumber: '', age: '' })}>+ Add</Button>
                                </div>
                                {formData.familyMembers.map((m: any, i: number) => (
                                    <div key={i} className="grid grid-cols-12 gap-2 items-end border p-2 rounded">
                                        <div className="col-span-3"><Label className="text-xs">Name</Label><Input value={m.name} onChange={e => updateItem('familyMembers', i, 'name', e.target.value)} className="h-8" /></div>
                                        <div className="col-span-3">
                                            <Label className="text-xs">Relation</Label>
                                            <Select value={m.relation} onValueChange={v => updateItem('familyMembers', i, 'relation', v)}>
                                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {(systemMasters?.RELATION && systemMasters.RELATION.length > 0) ? (
                                                        systemMasters.RELATION.map((m: any) => <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>)
                                                    ) : (
                                                        ['Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Grandson', 'Granddaughter', 'Other'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-4"><Label className="text-xs">Mobile</Label><Input value={m.mobileNumber} onChange={e => updateItem('familyMembers', i, 'mobileNumber', e.target.value)} className="h-8" maxLength={10} /></div>
                                        <div className="col-span-1"><Button size="sm" variant="ghost" onClick={() => removeItem('familyMembers', i)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button></div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>Emergency Contacts <span className="text-red-500">*</span></Label>
                                    <Button size="sm" variant="outline" onClick={() => addItem('emergencyContacts', { name: '', relation: '', mobileNumber: '' })}>+ Add</Button>
                                </div>
                                {formData.emergencyContacts.map((m: any, i: number) => (
                                    <div key={i} className="grid grid-cols-12 gap-2 items-end border p-2 rounded bg-yellow-50/30">
                                        <div className="col-span-4"><Label className="text-xs">Name</Label><Input value={m.name} onChange={e => updateItem('emergencyContacts', i, 'name', e.target.value)} className="h-8" /></div>
                                        <div className="col-span-3"><Label className="text-xs">Relation</Label><Input value={m.relation} onChange={e => updateItem('emergencyContacts', i, 'relation', e.target.value)} className="h-8" /></div>
                                        <div className="col-span-4"><Label className="text-xs">Mobile</Label><Input value={m.mobileNumber} onChange={e => updateItem('emergencyContacts', i, 'mobileNumber', e.target.value)} className="h-8" maxLength={10} /></div>
                                        <div className="col-span-1"><Button size="sm" variant="ghost" onClick={() => removeItem('emergencyContacts', i)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: STAFF */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <Label>Household Staff</Label>
                                <Button size="sm" variant="outline" onClick={() => addItem('householdHelp', { name: '', staffType: 'Domestic Help', mobileNumber: '', idProofUrl: '' })}>+ Add Staff</Button>
                            </div>
                            {formData.householdHelp.map((s: any, i: number) => (
                                <div key={i} className="border p-4 rounded-lg bg-slate-50 relative space-y-3">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => removeItem('householdHelp', i)}><Trash2 className="h-4 w-4" /></Button>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1"><Label>Type</Label>
                                            <Select value={s.staffType} onValueChange={v => updateItem('householdHelp', i, 'staffType', v)}>
                                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                                <SelectContent>{['Domestic Help', 'Driver', 'Cook', 'Other'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1"><Label>Name</Label><Input value={s.name} onChange={e => updateItem('householdHelp', i, 'name', e.target.value)} className="h-9" /></div>
                                        <div className="space-y-1"><Label>Mobile</Label><Input value={s.mobileNumber} onChange={e => updateItem('householdHelp', i, 'mobileNumber', e.target.value)} className="h-9" maxLength={10} /></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {s.idProofUrl ? (
                                            <div className="flex items-center gap-2">
                                                <Button type="button" variant="outline" size="sm" onClick={() => window.open(s.idProofUrl, '_blank')}>
                                                    <Eye className="h-4 w-4 mr-2" /> View
                                                </Button>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveStaffDoc(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                                                </Button>
                                                <span className="text-xs text-green-600 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> ID Uploaded</span>
                                            </div>
                                        ) : (
                                            <Button variant="secondary" size="sm" className="h-8" onClick={() => { setActiveStaffIndex(i); staffFileInputRef.current?.click(); }}>
                                                <Upload className="h-3 w-3 mr-2" /> Upload ID
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <input type="file" ref={staffFileInputRef} className="hidden" onChange={handleStaffDocUpload} />
                        </div>
                    )}

                    {/* STEP 5: HEALTH */}
                    {step === 5 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Blood Group</Label>
                                    <Select value={formData.bloodGroup} onValueChange={v => updateField('bloodGroup', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label>Mobility</Label>
                                    <Select value={formData.mobilityStatus} onValueChange={v => updateField('mobilityStatus', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{['Mobile', 'Restricted', 'Bedridden'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label>Regular Doctor</Label><Input value={formData.regularDoctor} onChange={e => updateField('regularDoctor', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Doctor Contact</Label><Input value={formData.doctorContact} onChange={e => updateField('doctorContact', e.target.value)} maxLength={10} /></div>
                                <div className="flex items-center gap-2 mt-6">
                                    <Checkbox id="pd" checked={formData.physicalDisability} onCheckedChange={c => updateField('physicalDisability', c)} />
                                    <Label htmlFor="pd">Physical Disability?</Label>
                                </div>
                                {formData.mobilityStatus !== 'Mobile' && (
                                    <div className="col-span-2 space-y-2"><Label>Constraints</Label><Input value={formData.mobilityConstraints} onChange={e => updateField('mobilityConstraints', e.target.value)} /></div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between"><Label>Medical History</Label><Button size="sm" variant="outline" onClick={() => addItem('medicalHistory', { conditionName: '', sinceWhen: '' })}>+ Add</Button></div>
                                {formData.medicalHistory.map((m: any, i: number) => (
                                    <div key={i} className="flex gap-2 items-end">
                                        <Input value={m.conditionName} onChange={e => updateItem('medicalHistory', i, 'conditionName', e.target.value)} placeholder="Condition" />
                                        <Input value={m.sinceWhen} onChange={e => updateItem('medicalHistory', i, 'sinceWhen', e.target.value)} placeholder="Year" />
                                        <Button size="icon" variant="ghost" onClick={() => removeItem('medicalHistory', i)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 6: REVIEW */}
                    {step === 6 && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-lg space-y-4 text-sm">
                                <h3 className="font-bold border-b pb-2">Review Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><span className="text-gray-500 block text-xs">Full Name</span> <span className="font-medium">{formData.fullName}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Date of Birth</span> <span className="font-medium">{formData.dateOfBirth}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Gender</span> <span className="font-medium">{formData.gender}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Marital Status</span> <span className="font-medium">{formData.maritalStatus}</span></div>

                                    <div><span className="text-gray-500 block text-xs">Mobile Number</span> <span className="font-medium">{formData.mobileNumber}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Religion</span> <span className="font-medium">{formData.religion}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Occupation</span> <span className="font-medium">{formData.occupation}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Specialization</span> <span className="font-medium">{formData.specialization}</span></div>

                                    <div className="col-span-2 border-t pt-2 mt-2 font-semibold">Address Details</div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500 block text-xs">Address</span>
                                        <span className="font-medium">{formData.addressLine1} {formData.addressLine2}, {formData.city}, {formData.state} - {formData.pinCode}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Police Station</span>
                                        <span className="font-medium">{policeStations.find((p: any) => p.id === formData.policeStationId)?.name}</span>
                                    </div>

                                    {formData.maritalStatus === 'Married' && (
                                        <>
                                            <div className="col-span-2 border-t pt-2 mt-2 font-semibold">Spouse Details</div>
                                            <div><span className="text-gray-500 block text-xs">Spouse Name</span> <span className="font-medium">{formData.spouseDetails?.fullName}</span></div>
                                            <div><span className="text-gray-500 block text-xs">Spouse Mobile</span> <span className="font-medium">{formData.spouseDetails?.mobileNumber}</span></div>
                                        </>
                                    )}
                                </div>

                                {/* Review Lists */}
                                <div className="space-y-4 pt-4">
                                    {formData.familyMembers.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Family Members</h4>
                                            <div className="border rounded-md overflow-hidden">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-slate-100">
                                                        <tr>
                                                            <th className="p-2">Name</th>
                                                            <th className="p-2">Relation</th>
                                                            <th className="p-2">Mobile</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {formData.familyMembers.map((m: any, i: number) => (
                                                            <tr key={i} className="border-t">
                                                                <td className="p-2">{m.name}</td>
                                                                <td className="p-2">{m.relation}</td>
                                                                <td className="p-2">{m.mobileNumber}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {formData.emergencyContacts.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2 text-red-600">Emergency Contacts</h4>
                                            <div className="border rounded-md overflow-hidden">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-red-50">
                                                        <tr>
                                                            <th className="p-2">Name</th>
                                                            <th className="p-2">Relation</th>
                                                            <th className="p-2">Mobile</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {formData.emergencyContacts.map((m: any, i: number) => (
                                                            <tr key={i} className="border-t">
                                                                <td className="p-2">{m.name}</td>
                                                                <td className="p-2">{m.relation}</td>
                                                                <td className="p-2">{m.mobileNumber}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {formData.householdHelp && formData.householdHelp.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Household Staff</h4>
                                            <div className="border rounded-md overflow-hidden">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-slate-100">
                                                        <tr>
                                                            <th className="p-2">Name</th>
                                                            <th className="p-2">Role</th>
                                                            <th className="p-2">Mobile</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {formData.householdHelp.map((m: any, i: number) => (
                                                            <tr key={i} className="border-t">
                                                                <td className="p-2">{m.name}</td>
                                                                <td className="p-2">{m.staffType}</td>
                                                                <td className="p-2">{m.mobileNumber}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t pt-4 mt-4">
                                        <h4 className="text-sm font-semibold mb-2">Health Information</h4>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div><span className="text-gray-500">Blood Group:</span> {formData.bloodGroup}</div>
                                            <div><span className="text-gray-500">Regular Doctor:</span> {formData.regularDoctor}</div>
                                            <div><span className="text-gray-500">Doctor Contact:</span> {formData.doctorContact}</div>
                                            <div><span className="text-gray-500">Mobility:</span> {formData.mobilityStatus}</div>
                                            {formData.physicalDisability && <div className="col-span-2 text-amber-600 font-medium">Physical Disability: Yes</div>}
                                            {formData.mobilityConstraints && <div className="col-span-2"><span className="text-gray-500">Constraints:</span> {formData.mobilityConstraints}</div>}
                                        </div>
                                    </div>
                                </div>
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>Please verify all documents are uploaded before proceeding.</AlertDescription>
                                </Alert>
                            </div>
                        </div>
                    )}

                    {/* STEP 7: DECLARATION */}
                    {step === 7 && (
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-50 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Checkbox id="dec" checked={formData.consentDataUse} onCheckedChange={c => updateField('consentDataUse', c)} />
                                    <div>
                                        <Label htmlFor="dec" className="font-medium">Declaration</Label>
                                        <p className="text-sm text-gray-500 mt-1">I hereby declare that the information provided is true. I consent to Delhi Police using my data for safety programs.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}



                </CardContent>
                <CardFooter className="flex justify-between border-t p-6 bg-slate-50/50">
                    <Button variant="outline" onClick={handlePrev} disabled={step === 1}>Previous</Button>
                    {step < STEPS.length ? (
                        <Button onClick={handleNext}>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={saving || !formData.consentDataUse}>
                            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Final Submit
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Camera Dialog */}
            <Dialog open={showCamera} onOpenChange={setShowCamera}>
                <DialogContent>
                    <DialogTitle>Capture Photo</DialogTitle>
                    <div className="space-y-4">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            className="w-full rounded-lg"
                        />
                        <div className="flex justify-center"><Button onClick={capturePhoto}>Capture</Button></div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
