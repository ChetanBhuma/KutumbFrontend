'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
    Phone, MapPin, Calendar, Shield, Heart,
    Edit, CreditCard, Home, User, Users,
    Clock, Activity, Stethoscope, Briefcase,
    AlertCircle, FileText, CheckCircle2, XCircle,
    Mail, Award, Building, Eye, FileCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { CitizenWorkflow } from '@/components/citizen/citizen-workflow';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DigitalIdCard } from "@/components/citizen/digital-id-card";

const getInitials = (name?: string) => {
    if (!name) return 'SC';
    return name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
};

const InfoItem = ({ icon: Icon, label, value, className }: { icon: any, label: string, value: string | number | null | undefined | boolean, className?: string }) => (
    <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${className}`}>
        <div className="p-2 rounded-full bg-primary/10 text-primary mt-0.5">
            <Icon className="h-4 w-4" />
        </div>
        <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="font-medium text-foreground mt-0.5 whitespace-pre-wrap">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || '—')}
            </p>
        </div>
    </div>
);

export default function CitizenProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [citizen, setCitizen] = useState<any>(null);
    const [visits, setVisits] = useState<any[]>([]);
    const [photoBlobUrl, setPhotoBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await apiClient.getMyProfile();
                if (res.success && res.data.citizen) {
                    setCitizen(res.data.citizen);

                    // Fetch secure photo if exists
                    if (res.data.citizen.photoUrl) {
                        try {
                            const token = localStorage.getItem('accessToken');
                            const url = res.data.citizen.photoUrl;
                            const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
                            const imgRes = await fetch(fullUrl, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (imgRes.ok) {
                                const blob = await imgRes.blob();
                                setPhotoBlobUrl(URL.createObjectURL(blob));
                            }
                        } catch (imgErr) {
                            console.error("Failed to load profile photo", imgErr);
                        }
                    }

                    try {
                        const visitsRes = await apiClient.getVisits({ citizenId: res.data.citizen.id });
                        setVisits(visitsRes.visits || []);
                    } catch (e) {

                    }
                }
            } catch (error) {
                console.error(error);
                toast({ variant: "destructive", title: "Error", description: "Failed to load profile." });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return null;
    if (!citizen) return null;

    const primaryContact = citizen.EmergencyContact?.find((c: any) => c.isPrimary) || citizen.EmergencyContact?.[0];

    return (
        <ProtectedRoute permissionCode="profile.update.own">
            <div className="space-y-8 animate-in fade-in duration-500 pb-10">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl shadow-sm border">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                        <p className="text-muted-foreground">Manage your personal information and view status</p>
                    </div>
                    <div className="flex gap-2">
                        {citizen.idVerificationStatus === 'Verified' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="default" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                                        <CreditCard className="h-4 w-4" /> View Digital ID
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Digital Identity Card</DialogTitle>
                                        <DialogDescription>Authenticated registration with Delhi Police.</DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-center py-4">
                                        <DigitalIdCard citizen={citizen} />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Button onClick={() => router.push('/citizen-portal/dashboard')} variant="outline" className="gap-2">
                            <Home className="h-4 w-4" /> Dashboard
                        </Button>
                        <Button onClick={() => router.push('/citizen-portal/profile/complete?edit=true')} className="gap-2 shadow-md hover:shadow-lg transition-all">
                            <Edit className="h-4 w-4" /> Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Status Bar */}
                <Card className="p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Application Status</h3>
                    <CitizenWorkflow
                        status={citizen.status}
                        verificationStatus={citizen.idVerificationStatus}
                        digitalCardIssued={citizen.digitalCardIssued}
                    />
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar: Profile Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="overflow-hidden border-none shadow-lg hover-lift bg-gradient-to-b from-card to-muted/20">
                            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                                    <Avatar className="h-32 w-32 border-4 border-card shadow-xl">
                                        <AvatarImage src={photoBlobUrl || citizen.photoUrl} className="object-cover" />
                                        <AvatarFallback className="text-3xl bg-blue-100 text-blue-600 font-bold">
                                            {getInitials(citizen.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                            <CardContent className="pt-20 pb-8 text-center px-6">
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">{citizen.fullName}</h2>
                                <p className="text-muted-foreground font-medium mt-1">
                                    {citizen.registrationNo || 'Reg: Pending'}
                                </p>

                                <div className="flex flex-wrap justify-center gap-2 my-6">
                                    <Badge variant={citizen.status === 'APPROVED' ? 'default' : 'secondary'} className="px-3 py-1 text-sm shadow-sm">
                                        {citizen.status}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={`px-3 py-1 text-sm shadow-sm border-2 ${citizen.idVerificationStatus === 'Verified'
                                            ? 'text-green-600 border-green-200 bg-green-50'
                                            : 'text-amber-600 border-amber-200 bg-amber-50'}`}
                                    >
                                        {citizen.idVerificationStatus || 'Pending'} Verification
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-left bg-card border rounded-xl p-4 shadow-sm">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">DOB</p>
                                        <p className="font-semibold">{citizen.dateOfBirth ? format(new Date(citizen.dateOfBirth), 'dd MMM yyyy') : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Gender</p>
                                        <p className="font-semibold capitalize">{citizen.gender || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2 text-left">
                                    <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{citizen.mobileNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span className="truncate">{citizen.permanentAddress || 'Address not listed'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {primaryContact && (
                            <Card className="shadow-md hover-lift border-l-4 border-l-red-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2 font-bold text-foreground">
                                        <Heart className="h-4 w-4 text-red-500 fill-red-500" /> Emergency Contact
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 p-2">
                                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg shadow-inner">
                                            {getInitials(primaryContact.name)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-lg">{primaryContact.name}</p>
                                            <p className="text-sm text-muted-foreground font-medium">{primaryContact.relation}</p>
                                            <p className="text-sm font-mono mt-1">{primaryContact.mobileNumber}</p>
                                        </div>
                                        <Button size="icon" variant="ghost" asChild className="h-10 w-10 rounded-full bg-green-50 text-green-600 shadow-sm">
                                            <a href={`tel:${primaryContact.mobileNumber}`}><Phone className="h-5 w-5" /></a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Content: Details Tabs */}
                    <div className="lg:col-span-8">
                        <Tabs defaultValue="overview" className="space-y-6">
                            <TabsList className="w-full justify-start h-auto p-1.5 bg-muted/50 border rounded-xl backdrop-blur-sm flex-wrap">
                                <TabsTrigger value="overview" className="flex-1 min-w-[100px] rounded-lg">Overview</TabsTrigger>
                                <TabsTrigger value="personal" className="flex-1 min-w-[100px] rounded-lg">Personal</TabsTrigger>
                                <TabsTrigger value="contact" className="flex-1 min-w-[100px] rounded-lg">Contact</TabsTrigger>
                                <TabsTrigger value="family" className="flex-1 min-w-[100px] rounded-lg">Family</TabsTrigger>
                                <TabsTrigger value="staff" className="flex-1 min-w-[100px] rounded-lg">Helpers</TabsTrigger>
                                <TabsTrigger value="health" className="flex-1 min-w-[100px] rounded-lg">Health</TabsTrigger>
                            </TabsList>

                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="hover-lift border-l-4 border-l-blue-500 shadow-sm">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                                <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">TOTAL</span>
                                            </div>
                                            <div className="text-3xl font-bold text-foreground">{visits.length}</div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">Police Visits</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="hover-lift border-l-4 border-l-amber-500 shadow-sm">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <span className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-full">SUBMITTED</span>
                                            </div>
                                            <div className="text-3xl font-bold text-foreground">{citizen.interestedServices?.length || 0}</div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">Service Interests</p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Welcome to Kutumb - Delhi Police Senior Citizen Portal</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-muted-foreground space-y-2">
                                        <p>This portal allows you to manage your profile, view your police visit history, and access senior citizen services.</p>
                                        <p>Your Beat Officer will visit you periodically based on your preferences.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* PERSONAL TAB */}
                            <TabsContent value="personal" className="space-y-6">
                                <Card className="shadow-md">
                                    <CardHeader className="border-b bg-muted/30">
                                        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
                                        <InfoItem icon={User} label="Full Name" value={citizen.fullName} />
                                        <InfoItem icon={Calendar} label="Date of Birth" value={citizen.dateOfBirth ? format(new Date(citizen.dateOfBirth), 'PPP') : null} />
                                        <InfoItem icon={Users} label="Religion" value={citizen.religion} />
                                        <InfoItem icon={Mail} label="Email" value={citizen.email} />
                                    </CardContent>
                                </Card>
                                <Card className="shadow-md">
                                    <CardHeader className="border-b bg-muted/30">
                                        <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Work & Occupation</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
                                        <InfoItem icon={Briefcase} label="Occupation" value={citizen.occupation} />
                                        <InfoItem icon={Award} label="Specialization" value={citizen.specialization} />
                                        <InfoItem icon={Building} label="Retired From" value={citizen.retiredFrom} />
                                        <InfoItem icon={Calendar} label="Year of Retirement" value={citizen.yearOfRetirement} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* CONTACT TAB */}
                            <TabsContent value="contact" className="space-y-6">
                                <Card className="shadow-md">
                                    <CardHeader className="border-b bg-muted/30">
                                        <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Address Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-1 gap-4 pt-6">
                                        <InfoItem icon={MapPin} label="Address Line 1" value={citizen.addressLine1} />
                                        <InfoItem icon={MapPin} label="Address Line 2" value={citizen.addressLine2} />
                                        <InfoItem icon={MapPin} label="Permanent Address" value={citizen.permanentAddress} />
                                        <InfoItem icon={MapPin} label="Present Address" value={citizen.presentAddress} />
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <InfoItem icon={MapPin} label="City" value={citizen.city} />
                                            <InfoItem icon={MapPin} label="District" value={citizen.District?.name || citizen.districtName || 'N/A'} />
                                            <InfoItem icon={Shield} label="Police Station" value={citizen.PoliceStation?.name || citizen.policeStationName || 'N/A'} />
                                            <InfoItem icon={MapPin} label="Pincode" value={citizen.pinCode} />
                                        </div>

                                        {/* Address Proof Document */}
                                        {citizen.addressProofUrl ? (
                                            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50/50 border-green-200 mt-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-full border border-green-100 shadow-sm">
                                                        <Shield className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-green-900">Address Proof Document</p>
                                                        <p className="text-xs text-green-700">Verified Document</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => apiClient.viewDocument(citizen.addressProofUrl)}
                                                    className="bg-white hover:bg-green-100 text-green-700 border border-green-200 shadow-sm"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" /> View
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 text-gray-500 mt-2">
                                                <AlertCircle className="h-5 w-5" />
                                                <span className="text-sm font-medium">No Address Proof Uploaded</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* FAMILY TAB */}
                            <TabsContent value="family" className="space-y-6">
                                {/* Living Status */}
                                <Card className="shadow-md">
                                    <CardHeader className="border-b bg-muted/30">
                                        <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5 text-primary" /> Living Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-4 pt-6">

                                        <InfoItem icon={Users} label="Residing With" value={citizen.residingWith} />

                                    </CardContent>
                                </Card>
                                {/* Spouse */}
                                {citizen.SpouseDetails && (
                                    <Card className="shadow-md">
                                        <CardHeader className="border-b bg-muted/30">
                                            <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" /> Spouse</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
                                            <InfoItem icon={User} label="Spouse Name" value={citizen.SpouseDetails.fullName} />
                                            <InfoItem icon={Phone} label="Mobile" value={citizen.SpouseDetails.mobileNumber} />
                                            <InfoItem icon={Calendar} label="Wedding Date" value={citizen.SpouseDetails.weddingDate ? format(new Date(citizen.SpouseDetails.weddingDate), 'PPP') : null} />
                                            <InfoItem icon={Home} label="Living Together?" value={citizen.SpouseDetails.isLivingTogether !== undefined ? (citizen.SpouseDetails.isLivingTogether ? 'Yes' : 'No') : 'Unknown'} />
                                            {!citizen.SpouseDetails.isLivingTogether && (
                                                <InfoItem icon={MapPin} label="Address if not together" value={citizen.SpouseDetails.addressIfNotTogether} className="md:col-span-2" />
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Emergency Contacts */}
                                <Card className="shadow-md">
                                    <CardHeader className="border-b bg-muted/30">
                                        <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-500" /> Emergency Contacts</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {citizen.EmergencyContact?.length > 0 ? (
                                            <div className="space-y-3">
                                                {citizen.EmergencyContact.map((ec: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg border">
                                                        <div>
                                                            <p className="font-semibold">{ec.name}</p>
                                                            <p className="text-sm text-muted-foreground">{ec.relation}</p>
                                                        </div>
                                                        <p className="text-sm font-mono">{ec.mobileNumber}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="text-muted-foreground italic">No emergency contacts listed.</p>}
                                    </CardContent>
                                </Card>

                                {/* Other Family Members */}
                                <Card className="shadow-md">
                                    <CardHeader className="border-b bg-muted/30">
                                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Family Members</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {citizen.FamilyMember?.length > 0 ? (
                                            <div className="space-y-3">
                                                {citizen.FamilyMember.map((m: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                                                        <div>
                                                            <p className="font-semibold">{m.name}</p>
                                                            <p className="text-sm text-muted-foreground">{m.relation} • Age: {m.age || 'N/A'}</p>
                                                        </div>
                                                        <p className="text-sm font-mono">{m.mobileNumber}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="text-muted-foreground italic">No other family members listed.</p>}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* HOUSEHOLD STAFF TAB */}
                            <TabsContent value="staff" className="space-y-6">
                                <Card className="shadow-md">
                                    <CardHeader className="border-b bg-muted/30">
                                        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Domestic Help / Staff</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {citizen.HouseholdHelp?.length > 0 ? (
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {citizen.HouseholdHelp.map((staff: any, idx: number) => (
                                                    <div key={idx} className="p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                                {getInitials(staff.name)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold">{staff.name}</p>
                                                                <Badge variant="outline">{staff.staffType}</Badge>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between"><span className="text-muted-foreground">Mobile:</span> <span className="font-mono">{staff.mobileNumber}</span></div>
                                                            <div className="flex justify-between"><span className="text-muted-foreground">Verification:</span> <span>{staff.verificationStatus || 'Pending'}</span></div>
                                                            {staff.address && <div className="mt-2 text-xs text-muted-foreground border-t pt-2">{staff.address}</div>}
                                                            {staff.idProofUrl && (
                                                                <div className="mt-2 pt-2 border-t flex justify-end">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={(e) => { e.preventDefault(); apiClient.viewDocument(staff.idProofUrl); }}
                                                                        className="h-8 gap-2 text-xs border-primary/20 text-primary hover:bg-primary/5"
                                                                    >
                                                                        <FileCheck className="h-3.5 w-3.5" />
                                                                        View ID {staff.idProofType ? `(${staff.idProofType})` : ''}
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <User className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                                                <p className="text-muted-foreground">No household staff registered.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* HEALTH TAB */}
                            <TabsContent value="health" className="space-y-6">
                                <Card className="shadow-md">
                                    <CardHeader className="border-b bg-muted/30">
                                        <CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary" /> Medical Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
                                        <InfoItem icon={Activity} label="Blood Group" value={citizen.bloodGroup} />
                                        <InfoItem icon={AlertCircle} label="Physical Disability" value={citizen.physicalDisability ? 'Yes' : 'No'} />
                                        <InfoItem icon={Activity} label="Mobility Status" value={citizen.mobilityStatus} />
                                        {/* Show constraint only if not 'Mobile' or if value exists */}
                                        {(citizen.mobilityStatus !== 'Mobile' || citizen.mobilityConstraints) && (
                                            <InfoItem icon={Activity} label="Mobility Constraints" value={citizen.mobilityConstraints} className="md:col-span-2 text-red-600 bg-red-50" />
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="shadow-md">
                                    <CardHeader className="border-b bg-muted/30">
                                        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Doctor Info</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
                                        <InfoItem icon={User} label="Regular Doctor" value={citizen.regularDoctor} />
                                    </CardContent>
                                </Card>

                                <div className="grid md:grid-cols-2 gap-6">


                                    <Card className="shadow-md">
                                        <CardHeader className="border-b bg-muted/30 pb-3">
                                            <CardTitle className="text-base">Medical History</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-3">
                                            {citizen.MedicalHistory?.length > 0 ? (
                                                citizen.MedicalHistory.map((h: any, i: number) => (
                                                    <div key={i} className="text-sm p-2 bg-muted/20 rounded">
                                                        <p className="font-semibold">{h.conditionName}</p>
                                                        <p className="text-xs text-muted-foreground">{h.treatment || 'No treatment details'}</p>
                                                    </div>
                                                ))
                                            ) : <span className="text-sm italic text-muted-foreground">No history recorded</span>}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                        </Tabs>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
