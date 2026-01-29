'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Edit, Plus, Trash2, Upload, Phone, User, Home, HeartPulse, Briefcase, AlertTriangle, Eye, X, MapPin, Camera } from 'lucide-react';
import Webcam from 'react-webcam';
import apiClient from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

import { useMasterData } from '@/hooks/use-master-data';

interface ProfileUpdateDialogProps {
    citizen: any;
    onUpdate: () => void;
}

export default function ProfileUpdateDialog({ citizen, onUpdate }: ProfileUpdateDialogProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { districts, getPoliceStationsByDistrict } = useMasterData();
    const [availableStations, setAvailableStations] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({});

    // Camera and file upload refs
    const [showCamera, setShowCamera] = useState(false);
    const webcamRef = useRef<Webcam>(null);
    const photoFileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (open && citizen) {
            setFormData({
                ...citizen,
                // Normalize Pincode
                pincode: citizen.pincode || citizen.pinCode || '',
                // Normalize District/PS
                districtId: citizen.districtId || '',
                policeStationId: citizen.policeStationId || '',
                // Ensure nested objects are initialized or mapped correctly
                spouseDetails: citizen.SpouseDetails || {
                    fullName: '',
                    mobileNumber: '',
                    weddingDate: '',
                    isLivingTogether: true,
                    addressIfNotTogether: ''
                },
                familyMembers: citizen.FamilyMember || [],
                emergencyContacts: citizen.EmergencyContact || [],
                householdHelp: citizen.HouseholdHelp || [],
                medicalHistory: citizen.MedicalHistory || [],
                healthConditions: citizen.healthConditions || [],
                interestedServices: citizen.interestedServices || [],
                // GPS Coordinates
                gpsLatitude: citizen.gpsLatitude || null,
                gpsLongitude: citizen.gpsLongitude || null,
                gpsAccuracy: citizen.gpsAccuracy || null,
                gpsCapturedAt: citizen.gpsCapturedAt || null,
                // Default specific fields
                physicalDisability: citizen.physicalDisability || false,
                mobilityConstraints: citizen.mobilityConstraints || '',
                numberOfChildren: citizen.numberOfChildren || 0
            });
        }
    }, [open, citizen]);

    // Update stations when district changes
    useEffect(() => {
        if (formData.districtId) {
            const stations = getPoliceStationsByDistrict(formData.districtId);
            setAvailableStations(stations);
        } else {
            setAvailableStations([]);
        }
    }, [formData.districtId, getPoliceStationsByDistrict]);

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const updateNestedField = (parent: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    // --- Array Management Helpers ---
    const addArrayItem = (key: string, template: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [key]: [...(prev[key] || []), template]
        }));
    };

    const removeArrayItem = (key: string, index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            [key]: prev[key].filter((_: any, i: number) => i !== index)
        }));
    };

    const updateArrayItem = (key: string, index: number, field: string, value: any) => {
        setFormData((prev: any) => {
            const arr = [...(prev[key] || [])];
            arr[index] = { ...arr[index], [field]: value };
            return { ...prev, [key]: arr };
        });
    };

    // --- Photo Upload and Capture Handlers ---
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);
            const res = await apiClient.uploadCitizenDocument(citizen.id, file, 'ProfilePhoto');
            if (res.success) {
                updateField('photoUrl', res.data.document.fileUrl);
                toast({ title: "Success", description: "Photo uploaded successfully" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to upload photo", variant: "destructive" });
        } finally {
            setLoading(false);
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
                updateField('photoUrl', imageSrc);
                setShowCamera(false);

                try {
                    const uploadRes = await apiClient.uploadCitizenDocument(citizen.id, file, 'ProfilePhoto');
                    if (uploadRes.success) {
                        updateField('photoUrl', uploadRes.data.document.fileUrl);
                        toast({ title: "Success", description: "Photo captured and uploaded" });
                    }
                } catch (error) {
                    console.error('Photo upload failed', error);
                    toast({ title: "Warning", description: "Photo captured but upload failed. Please try again.", variant: "destructive" });
                }
            }
        }
    };

    // --- File Upload Helpers ---
    const handleAddressProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);
            const res = await apiClient.uploadCitizenDocument(citizen.id, file, 'AddressProof');
            if (res.success) {
                updateField('addressProofUrl', res.data.document.fileUrl);
                toast({ title: "Success", description: "Address Proof uploaded." });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Upload failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleStaffProofUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);
            const res = await apiClient.uploadCitizenDocument(citizen.id, file, 'IdentityProof');
            if (res.success) {
                updateArrayItem('householdHelp', index, 'idProofUrl', res.data.document.fileUrl);
                toast({ title: "Success", description: "Staff ID uploaded." });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Upload failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // --- GPS Capture Handler ---
    const handleCaptureGPS = () => {
        if (!navigator.geolocation) {
            toast({
                title: "GPS Not Supported",
                description: "Your browser does not support GPS location.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;

                updateField('gpsLatitude', latitude);
                updateField('gpsLongitude', longitude);
                updateField('gpsAccuracy', accuracy);
                updateField('gpsCapturedAt', new Date().toISOString());

                toast({
                    title: "Location Captured",
                    description: `GPS coordinates captured with ${accuracy.toFixed(0)}m accuracy.`
                });

                setLoading(false);
            },
            (error) => {
                console.error('GPS Error:', error);
                let msg = error.message;
                if (error.code === 1) msg = "Permission Denied. Please allow location access.";
                else if (error.code === 2) msg = "Position Unavailable. Check your signal.";
                else if (error.code === 3) msg = "Location Timeout. Try again.";

                toast({
                    title: "Location Failed",
                    description: msg,
                    variant: "destructive"
                });
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
    };

    // Helper function to view documents with authentication
    const viewDocument = async (url: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000${url}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch document');
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');

            // Clean up blob URL after a delay
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } catch (error) {
            console.error('Error viewing document:', error);
            toast({
                title: "Error",
                description: "Failed to open document",
                variant: "destructive"
            });
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // Clean up payload
            const payload = { ...formData };
            delete payload.id;
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.status;
            // Map pincode back to pinCode if needed by backend, or send both
            payload.pinCode = payload.pincode;

            // Remove relations keys that shouldn't be sent as direct properties if they are redundant
            delete payload.SpouseDetails;
            delete payload.FamilyMember;
            delete payload.EmergencyContact;
            delete payload.HouseholdHelp;
            delete payload.MedicalHistory;
            delete payload.Beats; // if exists
            delete payload.PoliceStation; // if exists

            const res = await apiClient.updateCitizen(citizen.id, payload);

            if (res.success || res.data) {
                toast({ title: "Updated Successfully", description: "Citizen profile updated." });
                setOpen(false);
                onUpdate();
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/20 text-primary hover:bg-primary/5">
                    <Edit className="h-3.5 w-3.5" />
                    Update Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle>Update Citizen Profile</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-6 mb-6">
                            <TabsTrigger value="personal">Personal</TabsTrigger>
                            <TabsTrigger value="contact">Contact</TabsTrigger>
                            <TabsTrigger value="family">Family</TabsTrigger>
                            <TabsTrigger value="emergency">Emergency</TabsTrigger>
                            <TabsTrigger value="health">Health</TabsTrigger>
                            <TabsTrigger value="staff">Staff</TabsTrigger>
                        </TabsList>

                        {/* --- PERSONAL --- */}
                        <TabsContent value="personal" className="space-y-4">
                            {/* Photo Upload Section */}
                            <div className="space-y-2 border-b pb-4">
                                <Label>Citizen Photo</Label>
                                <div className="flex items-center gap-4">
                                    {formData.photoUrl && (
                                        <div className="relative">
                                            <img
                                                src={formData.photoUrl}
                                                alt="Citizen"
                                                className="h-24 w-24 rounded-full object-cover border-2 border-primary"
                                            />
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                onClick={() => updateField('photoUrl', '')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowCamera(true)}
                                            disabled={loading}
                                        >
                                            <Camera className="mr-2 h-4 w-4" />
                                            Capture Photo
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => photoFileInputRef.current?.click()}
                                            disabled={loading}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Photo
                                        </Button>
                                        <input
                                            ref={photoFileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoUpload}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Camera Overlay - Conditional Rendering */}
                            {showCamera && (
                                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">Capture Photo</h3>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowCamera(false)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Webcam
                                            ref={webcamRef}
                                            audio={false}
                                            screenshotFormat="image/jpeg"
                                            className="w-full rounded-lg"
                                            videoConstraints={{
                                                width: 1280,
                                                height: 720,
                                                facingMode: "user"
                                            }}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowCamera(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="button" onClick={capturePhoto}>
                                                <Camera className="mr-2 h-4 w-4" />
                                                Capture
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={formData.fullName || ''} onChange={e => updateField('fullName', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <Input type="date" value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''} onChange={e => updateField('dateOfBirth', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select value={formData.gender || ''} onValueChange={v => updateField('gender', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Religion</Label>
                                    <Select value={formData.religion || ''} onValueChange={v => updateField('religion', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Marital Status</Label>
                                    <Select value={formData.maritalStatus || ''} onValueChange={v => updateField('maritalStatus', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Married">Married</SelectItem>
                                            <SelectItem value="Single">Single</SelectItem>
                                            <SelectItem value="Widowed">Widowed</SelectItem>
                                            <SelectItem value="Divorced">Divorced</SelectItem>
                                            <SelectItem value="Separated">Separated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Specialization / Skills</Label>
                                    <Input value={formData.specialization || ''} onChange={e => updateField('specialization', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Occupation (Past/Present)</Label>
                                    <Select value={formData.occupation || ''} onValueChange={v => updateField('occupation', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {['Retired', 'Homemaker', 'Business', 'Service', 'Other'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {formData.occupation === 'Retired' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Retired From (Organization)</Label>
                                            <Input value={formData.retiredFrom || ''} onChange={e => updateField('retiredFrom', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Year of Retirement</Label>
                                            <Input type="number" value={formData.yearOfRetirement || ''} onChange={e => updateField('yearOfRetirement', e.target.value)} />
                                        </div>
                                    </>
                                )}


                            </div>
                        </TabsContent>

                        {/* --- CONTACT --- */}
                        <TabsContent value="contact" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Mobile Number</Label>
                                    <Input value={formData.mobileNumber || ''} onChange={e => updateField('mobileNumber', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Alternate Mobile</Label>
                                    <Input value={formData.alternateMobile || ''} onChange={e => updateField('alternateMobile', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Landline / Telephone</Label>
                                    <Input value={formData.telephoneNumber || ''} onChange={e => updateField('telephoneNumber', e.target.value)} maxLength={10} />
                                </div>
                                <div className="space-y-2">
                                    <Label>WhatsApp</Label>
                                    <Input value={formData.whatsappNumber || ''} onChange={e => updateField('whatsappNumber', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={formData.email || ''} onChange={e => updateField('email', e.target.value)} />
                                </div>
                            </div>

                            <hr />

                            <div className="space-y-2">
                                <Label>Residing With</Label>
                                <RadioGroup value={formData.residingWith || ''} onValueChange={v => updateField('residingWith', v)} className="flex flex-wrap gap-4 mt-2">
                                    {['Alone', 'Spouse', 'Children', 'Relatives'].map(opt => (
                                        <div key={opt} className="flex items-center space-x-2">
                                            <RadioGroupItem value={opt} id={`res-${opt}`} />
                                            <Label htmlFor={`res-${opt}`}>{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div className="space-y-2 border-t pt-4">
                                <Label>Address Line 1 (House No, Building)</Label>
                                <Textarea value={formData.addressLine1 || formData.permanentAddress || ''} onChange={e => updateField('permanentAddress', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Address Line 2 (Area, Street)</Label>
                                <Input value={formData.addressLine2 || formData.presentAddress || ''} onChange={e => updateField('addressLine2', e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>District</Label>
                                    <Select value={formData.districtId || ''} onValueChange={v => { updateField('districtId', v); updateField('policeStationId', ''); }}>
                                        <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                                        <SelectContent>
                                            {districts.map((d: any) => (
                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Police Station</Label>
                                    <Select value={formData.policeStationId || ''} onValueChange={v => updateField('policeStationId', v)} disabled={!formData.districtId}>
                                        <SelectTrigger><SelectValue placeholder="Select Station" /></SelectTrigger>
                                        <SelectContent>
                                            {availableStations.map((ps: any) => (
                                                <SelectItem key={ps.id} value={ps.id}>{ps.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* GPS Coordinates Section */}
                            <div className="space-y-2 border-t pt-4">
                                <Label>GPS Coordinates</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={formData.gpsLatitude && formData.gpsLongitude
                                            ? `${formData.gpsLatitude.toFixed(6)}, ${formData.gpsLongitude.toFixed(6)}`
                                            : 'Not captured'}
                                        disabled
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleCaptureGPS}
                                        disabled={loading}
                                        size="sm"
                                        className="shrink-0"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Capturing...
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="mr-2 h-4 w-4" />
                                                Capture GPS
                                            </>
                                        )}
                                    </Button>
                                </div>
                                {formData.gpsAccuracy && (
                                    <p className="text-xs text-muted-foreground">
                                        Accuracy: {formData.gpsAccuracy.toFixed(0)}m
                                        {formData.gpsCapturedAt && (
                                            <> | Captured: {new Date(formData.gpsCapturedAt).toLocaleString()}</>
                                        )}
                                    </p>
                                )}
                            </div>

                            {/* Address Proof Section */}
                            <div className="space-y-2 border-t pt-4">
                                <Label>Address Proof</Label>
                                <div className="flex items-center gap-4 border p-3 rounded-md bg-slate-50">
                                    {formData.addressProofUrl ? (
                                        <div className="flex-1 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-green-700">
                                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                                    <Briefcase className="h-4 w-4" />
                                                </div>
                                                <span className="font-medium">Document Uploaded</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button type="button" size="sm" variant="outline" onClick={() => viewDocument(formData.addressProofUrl)}>
                                                    <Eye className="h-3.5 w-3.5 mr-2" /> View
                                                </Button>
                                                <Button type="button" size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateField('addressProofUrl', '')}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1">
                                            <Input type="file" id="addr-proof" className="hidden" onChange={handleAddressProofUpload} accept="image/*,.pdf" />
                                            <Label htmlFor="addr-proof" className="flex items-center justify-center w-full h-10 border-2 border-dashed rounded-md cursor-pointer hover:bg-slate-100">
                                                <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">Upload Document</span>
                                            </Label>
                                        </div>
                                    )}
                                </div>
                            </div>


                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Pincode</Label>
                                    <Input value={formData.pincode || ''} onChange={e => updateField('pincode', e.target.value)} maxLength={6} />
                                </div>
                            </div>

                        </TabsContent>

                        {/* --- FAMILY --- */}
                        <TabsContent value="family" className="space-y-6">
                            {/* Spouse */}
                            {formData.maritalStatus === 'Married' && (
                                <div className="space-y-4 border p-4 rounded bg-slate-50">
                                    <h3 className="font-semibold text-sm">Spouse Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Spouse Name</Label>
                                            <Input value={formData.spouseDetails?.fullName || ''} onChange={e => updateNestedField('spouseDetails', 'fullName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Wedding Date</Label>
                                            <Input type="date" value={formData.spouseDetails?.weddingDate ? new Date(formData.spouseDetails.weddingDate).toISOString().split('T')[0] : ''} onChange={e => updateNestedField('spouseDetails', 'weddingDate', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Spouse Mobile</Label>
                                            <Input value={formData.spouseDetails?.mobileNumber || ''} onChange={e => updateNestedField('spouseDetails', 'mobileNumber', e.target.value)} maxLength={10} />
                                        </div>
                                        <div className="space-y-2 pt-6 flex items-center gap-2">
                                            <Checkbox
                                                id="livingTogether"
                                                checked={formData.spouseDetails?.isLivingTogether}
                                                onCheckedChange={v => updateNestedField('spouseDetails', 'isLivingTogether', v)}
                                            />
                                            <Label htmlFor="livingTogether">Living Together?</Label>
                                        </div>
                                        {!formData.spouseDetails?.isLivingTogether && (
                                            <div className="space-y-2 col-span-2">
                                                <Label>Address if not living together</Label>
                                                <Input value={formData.spouseDetails?.addressIfNotTogether || ''} onChange={e => updateNestedField('spouseDetails', 'addressIfNotTogether', e.target.value)} />
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
                                        onChange={e => updateField('numberOfChildren', e.target.value)}
                                        placeholder="Enter number of children"
                                    />
                                    <p className="text-xs text-muted-foreground">Total number of children (sons and daughters)</p>
                                </div>
                            </div>


                            {/* Family Members */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base">Family Members</Label>
                                    <Button size="sm" type="button" variant="outline" onClick={() => addArrayItem('familyMembers', { name: '', relation: '', age: 0, mobileNumber: '' })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Member
                                    </Button>
                                </div>
                                {formData.familyMembers?.map((member: any, index: number) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-end border p-3 rounded bg-slate-50">
                                        <div className="col-span-3 space-y-1">
                                            <Label className="text-xs">Name</Label>
                                            <Input value={member.name} onChange={e => updateArrayItem('familyMembers', index, 'name', e.target.value)} className="h-8" />
                                        </div>
                                        <div className="col-span-3 space-y-1">
                                            <Label className="text-xs">Relation</Label>
                                            <Select value={member.relation} onValueChange={v => updateArrayItem('familyMembers', index, 'relation', v)}>
                                                <SelectTrigger className="h-8"><SelectValue placeholder="Rel" /></SelectTrigger>
                                                <SelectContent>
                                                    {['Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Grandson', 'Granddaughter', 'Other'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-3 space-y-1">
                                            <Label className="text-xs">Mobile</Label>
                                            <Input value={member.mobileNumber} onChange={e => updateArrayItem('familyMembers', index, 'mobileNumber', e.target.value)} className="h-8" />
                                        </div>
                                        <div className="col-span-1">
                                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => removeArrayItem('familyMembers', index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* --- EMERGENCY --- */}
                        <TabsContent value="emergency" className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base text-yellow-700 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Friends / Relatives (Emergency)</Label>
                                    <Button size="sm" type="button" variant="outline" onClick={() => addArrayItem('emergencyContacts', { name: '', relation: '', mobileNumber: '' })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Contact
                                    </Button>
                                </div>
                                {formData.emergencyContacts?.map((contact: any, index: number) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-end border p-3 rounded bg-yellow-50/20 border-yellow-100">
                                        <div className="col-span-4 space-y-1">
                                            <Label className="text-xs">Name</Label>
                                            <Input value={contact.name} onChange={e => updateArrayItem('emergencyContacts', index, 'name', e.target.value)} className="h-8" />
                                        </div>
                                        <div className="col-span-3 space-y-1">
                                            <Label className="text-xs">Relation</Label>
                                            <Input value={contact.relation} onChange={e => updateArrayItem('emergencyContacts', index, 'relation', e.target.value)} className="h-8" />
                                        </div>
                                        <div className="col-span-4 space-y-1">
                                            <Label className="text-xs">Mobile</Label>
                                            <Input value={contact.mobileNumber} onChange={e => updateArrayItem('emergencyContacts', index, 'mobileNumber', e.target.value)} className="h-8" />
                                        </div>
                                        <div className="col-span-1">
                                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => removeArrayItem('emergencyContacts', index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* --- HEALTH --- */}
                        <TabsContent value="health" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Blood Group</Label>
                                    <Select value={formData.bloodGroup || ''} onValueChange={v => updateField('bloodGroup', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Mobility Status</Label>
                                    <Select value={formData.mobilityStatus || 'Mobile'} onValueChange={v => updateField('mobilityStatus', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mobile">Mobile</SelectItem>
                                            <SelectItem value="Restricted">Restricted</SelectItem>
                                            <SelectItem value="Bedridden">Bedridden</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Regular Doctor</Label>
                                    <Input value={formData.regularDoctor || ''} onChange={e => updateField('regularDoctor', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Doctor's Contact Number</Label>
                                    <Input value={formData.doctorContact || ''} onChange={e => updateField('doctorContact', e.target.value)} maxLength={10} />
                                </div>
                                <div className="space-y-2 flex items-center gap-2 mt-8">
                                    <Checkbox
                                        id="pd_check"
                                        checked={formData.physicalDisability}
                                        onCheckedChange={v => updateField('physicalDisability', v)}
                                    />
                                    <Label htmlFor="pd_check">Physical Disability?</Label>
                                </div>
                                {formData.mobilityStatus !== 'Mobile' && (
                                    <div className="col-span-2 space-y-2">
                                        <Label>Mobility Constraints (Description)</Label>
                                        <Input value={formData.mobilityConstraints || ''} onChange={e => updateField('mobilityConstraints', e.target.value)} placeholder="e.g. Uses Walker" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base">Medical History</Label>
                                    <Button size="sm" type="button" variant="outline" onClick={() => addArrayItem('medicalHistory', { conditionName: '', sinceWhen: '' })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add History
                                    </Button>
                                </div>
                                {formData.medicalHistory?.map((item: any, index: number) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-end border p-3 rounded bg-slate-50">
                                        <div className="col-span-5 space-y-1">
                                            <Label className="text-xs">Condition / Surgery</Label>
                                            <Input value={item.conditionName || item.condition} onChange={e => updateArrayItem('medicalHistory', index, 'conditionName', e.target.value)} className="h-8" />
                                        </div>
                                        <div className="col-span-3 space-y-1">
                                            <Label className="text-xs">Since (Year)</Label>
                                            <Input value={item.sinceWhen || item.year} onChange={e => updateArrayItem('medicalHistory', index, 'sinceWhen', e.target.value)} className="h-8" />
                                        </div>

                                        <div className="col-span-1">
                                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => removeArrayItem('medicalHistory', index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* --- STAFF --- */}
                        <TabsContent value="staff" className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base">Household Staff</Label>
                                    <Button size="sm" type="button" variant="outline" onClick={() => addArrayItem('householdHelp', { name: '', staffType: 'Domestic Help', mobileNumber: '' })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Staff
                                    </Button>
                                </div>
                                {formData.householdHelp?.map((staff: any, index: number) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-end border p-3 rounded bg-slate-50">
                                        <div className="col-span-3 space-y-1">
                                            <Label className="text-xs">Role</Label>
                                            <Select value={staff.staffType || 'Domestic Help'} onValueChange={v => updateArrayItem('householdHelp', index, 'staffType', v)}>
                                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Domestic Help">Domestic Help</SelectItem>
                                                    <SelectItem value="Driver">Driver</SelectItem>
                                                    <SelectItem value="Cook">Cook</SelectItem>
                                                    <SelectItem value="Caretaker">Caretaker</SelectItem>
                                                    <SelectItem value="Watchman">Watchman</SelectItem>
                                                    <SelectItem value="Tenant">Tenant</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-4 space-y-1">
                                            <Label className="text-xs">Name</Label>
                                            <Input value={staff.name} onChange={e => updateArrayItem('householdHelp', index, 'name', e.target.value)} className="h-8" />
                                        </div>
                                        <div className="col-span-4 space-y-1">
                                            <Label className="text-xs">Mobile</Label>
                                            <Input value={staff.mobileNumber} onChange={e => updateArrayItem('householdHelp', index, 'mobileNumber', e.target.value)} className="h-8" />
                                        </div>
                                        <div className="col-span-12 pt-2 flex items-center gap-2">
                                            {staff.idProofUrl ? (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Briefcase className="h-3 w-3" /> ID Uploaded</span>
                                                    <Button type="button" size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => window.open(staff.idProofUrl, '_blank')}>View</Button>
                                                    <Button type="button" size="sm" variant="ghost" className="h-6 w-6 text-red-500 p-0" onClick={() => updateArrayItem('householdHelp', index, 'idProofUrl', '')}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex-1">
                                                    <Input type="file" id={`staff-proof-${index}`} className="hidden" onChange={(e) => handleStaffProofUpload(index, e)} accept="image/*,.pdf" />
                                                    <Label htmlFor={`staff-proof-${index}`} className="text-xs flex items-center gap-1 cursor-pointer text-blue-600 hover:underline">
                                                        <Upload className="h-3 w-3" /> Upload ID Proof
                                                    </Label>
                                                </div>
                                            )}
                                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-500 shrink-0 ml-auto" onClick={() => removeArrayItem('householdHelp', index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="p-4 border-t bg-slate-50">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
