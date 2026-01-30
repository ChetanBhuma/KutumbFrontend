'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DigitalIdCard } from '@/components/citizen/digital-id-card';
import {
    Phone, MapPin, Calendar, Shield, Heart,
    Edit, CreditCard, ArrowLeft, Mail, User,
    FileText, AlertTriangle, Clock, Activity, Eye,
    Stethoscope, Users, Home, AlertCircle,
    Smartphone, Wifi, FileCheck, ClipboardCheck,
    UserPlus, UserCheck, Baby
} from 'lucide-react';
import { format } from 'date-fns';
import { CitizenWorkflow } from '@/components/citizen/citizen-workflow';
import { useSecureImage } from '@/hooks/use-secure-image';

const getInitials = (name?: string) => {
    if (!name) return 'SC';
    return name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
};

const InfoItem = ({ icon: Icon, label, value, className }: { icon: any, label: string, value: string | number | null | undefined, className?: string }) => (
    <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${className}`}>
        <div className="p-2 rounded-full bg-primary/10 text-primary mt-0.5">
            <Icon className="h-4 w-4" />
        </div>
        <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="font-medium text-foreground mt-0.5">{value || '—'}</p>
        </div>
    </div>
);

const AssessmentDataViewer = ({ data }: { data: any }) => {
    if (!data) return null;

    // Handle nested sections structure if present, otherwise treat as flat or simple object
    const content = data.sections || data;

    return (
        <div className="space-y-6">
            {Object.entries(content).map(([sectionKey, sectionValue]: [string, any]) => {
                if (!sectionValue || typeof sectionValue !== 'object') return null;

                return (
                    <Card key={sectionKey} className="overflow-hidden border shadow-sm">
                        <CardHeader className="py-3 bg-muted/40 border-b">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                {sectionKey.replace(/([A-Z])/g, ' $1').trim()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                {Object.entries(sectionValue).map(([fieldKey, fieldValue]: [string, any]) => {
                                    if (typeof fieldValue === 'object' && fieldValue !== null) return null; // Skip deep nesting for now

                                    return (
                                        <div key={fieldKey} className="group">
                                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1.5 group-hover:text-primary transition-colors">
                                                {fieldKey.replace(/([A-Z])/g, ' $1').trim()}
                                            </p>
                                            <p className="text-sm font-semibold text-foreground/90 break-words leading-relaxed">
                                                {String(fieldValue)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default function CitizenDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [showCard, setShowCard] = useState(false);



    const fetchCitizenData = useCallback(async () => {
        const [citizenRes, districtsRes, stationsRes] = await Promise.all([
            apiClient.getCitizenById(params.id as string),
            apiClient.get('/masters/districts') as Promise<any>, // Verify endpoint from Edit Page
            apiClient.get('/masters/police-stations') as Promise<any> // Verify endpoint
        ]);
        return {
            citizen: citizenRes.data?.citizen,
            districts: districtsRes.data || [],
            stations: stationsRes.data || []
        };
    }, [params.id]);

    const { data: citizenData, loading: citizenLoading, refetch: refetchCitizen } = useApiQuery(
        fetchCitizenData,
        { enabled: !!params.id, refetchOnMount: true }
    );

    const citizen = citizenData?.citizen;
    const { secureUrl: validPhotoUrl } = useSecureImage(citizen?.photoUrl);
    const districts = citizenData?.districts || [];
    const stations = citizenData?.stations || [];
    const loading = citizenLoading;

    const fetchVisitsData = useCallback(() => apiClient.getVisits({ citizenId: params.id as string, limit: 20 }), [params.id]);
    const { data: visitsResponse, loading: visitsLoading, refetch: refetchVisits } = useApiQuery(
        fetchVisitsData,
        { enabled: !!params.id, refetchOnMount: true }
    );

    const visits = visitsResponse?.visits || [];

    const handleIssueCard = async () => {
        try {
            const response = await apiClient.issueDigitalCard(params.id as string);
            if (response.success) {
                toast({ title: "Digital Card Issued", description: "The card has been generated successfully." });
                refetchCitizen();
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Failed", description: "Could not issue digital card." });
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (!citizen) return null;

    const familyMembers = (citizen.familyMembers?.length ? citizen.familyMembers : (citizen.FamilyMember?.length ? citizen.FamilyMember : (citizen.FamilyMembers || []))).map((i: any) => ({
        ...i,
        name: i.name || i.Name,
        relation: i.relation || i.Relation,
        mobileNumber: i.mobileNumber || i.MobileNumber || i.contact || i.Contact
    }));
    const emergencyContacts = (citizen.emergencyContacts?.length ? citizen.emergencyContacts : (citizen.EmergencyContact?.length ? citizen.EmergencyContact : (citizen.EmergencyContacts || []))).map((i: any) => ({
        ...i,
        name: i.name || i.Name,
        relation: i.relation || i.Relation,
        mobileNumber: i.mobileNumber || i.MobileNumber || i.contact || i.Contact,
        address: i.address || i.Address,
        isPrimary: i.isPrimary !== undefined ? i.isPrimary : i.IsPrimary
    }));
    const householdHelp = (citizen.householdHelp?.length ? citizen.householdHelp : (citizen.HouseholdHelp || [])).map((i: any) => ({
        ...i,
        name: i.name || i.Name,
        staffType: i.staffType || i.StaffType || i.category || i.Category,
        mobileNumber: i.mobileNumber || i.MobileNumber,
        address: i.address || i.Address,
        idProofUrl: i.idProofUrl || i.IdProofUrl,
        idProofType: i.idProofType || i.IdProofType
    }));
    const medicalHistory = (citizen.medicalHistory?.length ? citizen.medicalHistory : (citizen.MedicalHistory || [])).map((i: any) => ({
        ...i,
        conditionName: i.conditionName || i.ConditionName,
        sinceWhen: i.sinceWhen || i.SinceWhen,
        remarks: i.remarks || i.Remarks
    }));

    const primaryContact = emergencyContacts.find((c: any) => c.isPrimary) || emergencyContacts[0];
    const verificationVisit = citizen.Visit?.find((v: any) => v.visitType === 'Verification' || v.visitType === 'verification');

    return (
        <ProtectedRoute>
            <DashboardLayout
                title="Citizen Profile"
                description="Comprehensive view of citizen details, history, and status"
                currentPath="/citizens"
            >
                <div className="space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
                    {/* Top Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl shadow-sm border">
                        <Button variant="ghost" onClick={() => router.push('/citizens')} className="gap-2 hover:bg-muted">
                            <ArrowLeft className="h-4 w-4" /> Back to List
                        </Button>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => router.push(`/citizens/${citizen.id}/edit`)} className="hover:bg-primary/5 hover:text-primary transition-colors">
                                <Edit className="h-4 w-4 mr-2" /> Edit Profile
                            </Button>
                            {!citizen.digitalCardIssued ? (
                                <Button variant="outline" onClick={handleIssueCard} className="hover:bg-primary/5 hover:text-primary transition-colors">
                                    <CreditCard className="h-4 w-4 mr-2" /> Issue Card
                                </Button>
                            ) : (
                                <Button variant="outline" onClick={() => setShowCard(true)} className="hover:bg-primary/5 hover:text-primary transition-colors">
                                    <CreditCard className="h-4 w-4 mr-2" /> View Digital Card
                                </Button>
                            )}
                            <Button onClick={() => router.push(`/visits/schedule?citizenId=${citizen.id}`)} className="shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90">
                                <Calendar className="h-4 w-4 mr-2" /> Schedule Visit
                            </Button>
                        </div>
                    </div>

                    {/* Workflow Status */}
                    <Card className="p-6 shadow-md border-none bg-card">
                        <h3 className="text-lg font-semibold mb-4">Registration Status</h3>
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
                                <div className="h-32 bg-gradient-to-r from-primary/90 to-primary/70 relative">
                                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                                        <Avatar className="h-32 w-32 border-4 border-card shadow-xl">
                                            <AvatarImage src={validPhotoUrl || undefined} className="object-cover" />
                                            <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                                                {getInitials(citizen.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>
                                <CardContent className="pt-20 pb-8 text-center px-6">
                                    <h2 className="text-2xl font-bold text-foreground tracking-tight">{citizen.fullName}</h2>
                                    <p className="text-muted-foreground font-medium mt-1">
                                        {citizen.registrationNo || citizen.srCitizenUniqueId || `ID: ${citizen.id ? citizen.id.slice(-6).toUpperCase() : 'N/A'}`}
                                    </p>

                                    <div className="flex flex-wrap justify-center gap-2 my-6">
                                        {/* Only show 'Status' badge if it's NOT just repeating 'Verified' which is covered by the next badge */}
                                        {/* But to be safe, we keep it as it shows account status (Active/Suspended) vs ID Verification status */}
                                        <Badge variant={citizen.status === 'Active' ? 'default' : 'secondary'} className="px-3 py-1 text-sm shadow-sm">
                                            {citizen.status}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={`px-3 py-1 text-sm shadow-sm border-2 ${citizen.idVerificationStatus === 'Verified'
                                                ? 'text-green-600 border-green-200 bg-green-50'
                                                : citizen.idVerificationStatus === 'FieldVerified'
                                                    ? 'text-blue-600 border-blue-200 bg-blue-50'
                                                    : 'text-amber-600 border-amber-200 bg-amber-50'
                                                }`}
                                        >
                                            {citizen.idVerificationStatus === 'FieldVerified'
                                                ? '✓ Field Verified'
                                                : citizen.idVerificationStatus === 'Verified'
                                                    ? '✓ ID Verified'
                                                    : 'Verification Pending'}
                                        </Badge>
                                        <Badge variant="outline" className={`px-3 py-1 text-sm shadow-sm border-2 ${citizen.vulnerabilityLevel === 'High' ? 'text-red-600 border-red-200 bg-red-50' :
                                            citizen.vulnerabilityLevel === 'Medium' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                                                'text-green-600 border-green-200 bg-green-50'
                                            }`}>
                                            {citizen.vulnerabilityLevel}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-left bg-card border rounded-xl p-4 shadow-sm">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase">Age</p>
                                            <p className="font-semibold">{citizen.age} Years</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase">Gender</p>
                                            <p className="font-semibold">{citizen.gender}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-muted-foreground uppercase">Occupation</p>
                                            <p className="font-semibold">{citizen.occupation || 'Retired'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-2">
                                        <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <Phone className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{citizen.mobileNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span className="truncate">{citizen.permanentAddress}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <Shield className="h-4 w-4 text-primary" />
                                            <span>{citizen.policeStationName || 'Station Not Assigned'}</span>
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
                                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 shadow-sm">
                                                <Phone className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Content: Tabs */}
                        <div className="lg:col-span-8">
                            <Tabs defaultValue="overview" className="space-y-6">
                                <TabsList className="w-full justify-start h-auto p-1.5 bg-muted/50 border rounded-xl backdrop-blur-sm flex-wrap gap-2">
                                    <TabsTrigger value="overview" className="flex-1 min-w-0 sm:min-w-[90px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all text-xs sm:text-sm px-2 sm:px-4">Overview</TabsTrigger>
                                    <TabsTrigger value="personal" className="flex-1 min-w-0 sm:min-w-[90px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all text-xs sm:text-sm px-2 sm:px-4">Personal</TabsTrigger>
                                    <TabsTrigger value="family" className="flex-1 min-w-0 sm:min-w-[90px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all text-xs sm:text-sm px-2 sm:px-4">Family</TabsTrigger>
                                    <TabsTrigger value="health" className="flex-1 min-w-0 sm:min-w-[90px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all text-xs sm:text-sm px-2 sm:px-4">Health</TabsTrigger>

                                    <TabsTrigger value="official" className="flex-1 min-w-0 sm:min-w-[90px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all text-xs sm:text-sm px-2 sm:px-4">Official</TabsTrigger>
                                    <TabsTrigger value="assessment" className="flex-1 min-w-0 sm:min-w-[90px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all text-xs sm:text-sm px-2 sm:px-4">Assessment</TabsTrigger>
                                    <TabsTrigger value="history" className="flex-1 min-w-0 sm:min-w-[90px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all text-xs sm:text-sm px-2 sm:px-4">History</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card className="hover-lift border-l-4 border-l-blue-500 shadow-sm">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                        <Calendar className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">LIFETIME</span>
                                                </div>
                                                <div className="text-3xl font-bold text-foreground">{visits.length || (citizen.Visit ? citizen.Visit.length : 0)}</div>

                                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">Total Visits</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="hover-lift border-l-4 border-l-red-500 shadow-sm">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                                        <AlertCircle className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xs font-bold px-2 py-1 bg-red-50 text-red-700 rounded-full">URGENT</span>
                                                </div>
                                                <div className="text-3xl font-bold text-foreground">{citizen.sosAlerts?.length || 0}</div>
                                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">SOS Alerts</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="hover-lift border-l-4 border-l-amber-500 shadow-sm">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-full">ACTIVE</span>
                                                </div>
                                                <div className="text-3xl font-bold text-foreground">{citizen.serviceRequests?.length || 0}</div>
                                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">Service Requests</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Compact Assessment & Official Status */}
                                    <Card className="shadow-md border-l-4 border-l-primary">
                                        <CardHeader className="py-4 border-b bg-muted/30">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-primary" /> Assessment & Official Status
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4 pb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Verification Status */}
                                                <div className="space-y-2">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification Status</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={`text-xs px-2 py-0.5 ${citizen.idVerificationStatus === 'Verified' ? 'bg-green-500' :
                                                            citizen.idVerificationStatus === 'Rejected' ? 'bg-red-500' :
                                                                citizen.idVerificationStatus === 'FieldVerified' ? 'bg-blue-500' : 'bg-amber-500'
                                                            }`}>
                                                            {citizen.idVerificationStatus === 'FieldVerified' ? 'Field Verified' :
                                                                citizen.idVerificationStatus || 'Verification Pending'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground space-y-0.5">
                                                        <p>Last: {citizen.lastAssessmentDate ? format(new Date(citizen.lastAssessmentDate), 'PPP') : 'Not yet verified'}</p>
                                                        <p>By: {verificationVisit?.officer?.name || 'Pending assignment'}</p>
                                                    </div>
                                                </div>

                                                {/* Risk Assessment */}
                                                <div className="space-y-2">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Risk Assessment</p>
                                                    <div className={`text-lg font-bold ${citizen.vulnerabilityLevel === 'High' ? 'text-red-600' :
                                                        citizen.vulnerabilityLevel === 'Medium' ? 'text-amber-600' :
                                                            'text-green-600'
                                                        }`}>
                                                        {citizen.vulnerabilityLevel || 'Not Assessed'}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        Based on health, living conditions, and social support.
                                                    </p>
                                                </div>

                                                {/* Official Notes */}
                                                <div className="space-y-2">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Notes</p>
                                                    <div className="bg-muted/30 p-2 rounded border text-xs italic text-muted-foreground min-h-[60px]">
                                                        {citizen.officialRemarks || verificationVisit?.notes || 'No official notes recorded.'}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="shadow-md">
                                        <CardHeader className="border-b bg-muted/30">
                                            <CardTitle className="flex items-center gap-2">
                                                <Activity className="h-5 w-5 text-primary" /> Recent Activity
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            {(visits.length > 0 || (citizen.Visit && citizen.Visit.length > 0)) ? (
                                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                                    {(visits.length > 0 ? visits : (citizen.Visit || [])).slice(0, 3).map((visit: any, i: number) => (
                                                        <div key={visit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-card bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                                <div className={`w-3 h-3 rounded-full ${visit.status === 'Completed' ? 'bg-green-500' :
                                                                    visit.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'
                                                                    }`} />
                                                            </div>
                                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                                    <div className="font-bold text-foreground">{visit.visitType} Visit</div>
                                                                    <time className="font-mono text-xs text-muted-foreground">{format(new Date(visit.scheduledDate), 'MMM d, yyyy')}</time>
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Officer: <span className="font-medium text-foreground">{visit.officer?.name || 'Unassigned'}</span>
                                                                </div>
                                                                <Badge variant="outline" className="mt-2 text-[10px] uppercase tracking-wider">{visit.status}</Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                                    <div className="p-4 bg-muted rounded-full mb-3">
                                                        <Clock className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-muted-foreground font-medium">No recent activity recorded.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="personal" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    {/* Step 1: Personal Details */}
                                    <Card className="shadow-md">
                                        <CardHeader className="border-b bg-muted/30">
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="h-5 w-5 text-primary" /> Step 1: Personal Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
                                            <InfoItem icon={User} label="Full Name" value={citizen.fullName} />
                                            <InfoItem icon={Calendar} label="Date of Birth" value={citizen.dateOfBirth ? format(new Date(citizen.dateOfBirth), 'PPP') : null} />
                                            <InfoItem icon={Users} label="Religion" value={citizen.religion} />
                                            <InfoItem icon={Home} label="Retired From" value={citizen.retiredFrom} />
                                            <InfoItem icon={Calendar} label="Retirement Year" value={citizen.yearOfRetirement} />
                                            <InfoItem icon={UserCheck} label="Specialization" value={citizen.specialization} />
                                            <InfoItem icon={Smartphone} label="WhatsApp Number" value={citizen.whatsappNumber} />
                                            <InfoItem icon={MapPin} label="Address Line 1" value={citizen.addressLine1} className="md:col-span-2" />
                                            <InfoItem icon={MapPin} label="Address Line 2" value={citizen.addressLine2} className="md:col-span-2" />
                                            <InfoItem icon={MapPin} label="Permanent Address" value={citizen.permanentAddress} className="md:col-span-2" />
                                            <InfoItem icon={MapPin} label="Present Address" value={citizen.presentAddress} className="md:col-span-2" />
                                            <InfoItem icon={MapPin} label="City" value={citizen.city} />
                                            <InfoItem icon={MapPin} label="District" value={citizen.District?.name || citizen.district?.name || citizen.districtName || districts.find((d: any) => d.id === citizen.districtId)?.name} />
                                            <InfoItem icon={Shield} label="Police Station" value={citizen.PoliceStation?.name || citizen.policeStation?.name || citizen.policeStationName || stations.find((s: any) => s.id === citizen.policeStationId)?.name} />
                                            <InfoItem icon={MapPin} label="State" value={citizen.state} />
                                            <InfoItem icon={MapPin} label="PIN Code" value={citizen.pinCode} />
                                            <InfoItem icon={Phone} label="Telephone/Landline" value={citizen.telephoneNumber} />

                                            {/* Address Proof Document */}
                                            {citizen.addressProofUrl ? (
                                                <div className="md:col-span-2 flex items-center justify-between p-3 border rounded-lg bg-green-50/50 border-green-200 mt-2">
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
                                                <div className="md:col-span-2 flex items-center gap-3 p-3 border rounded-lg bg-gray-50 text-gray-500 mt-2">
                                                    <AlertCircle className="h-5 w-5" />
                                                    <span className="text-sm font-medium">No Address Proof Uploaded</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Step 2: Spouse Details */}
                                    <Card className="shadow-md">
                                        <CardHeader className="border-b bg-muted/30">
                                            <CardTitle className="flex items-center gap-2">
                                                <UserCheck className="h-5 w-5 text-primary" /> Step 2: Spouse Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
                                            <InfoItem icon={User} label="Spouse Name" value={citizen.SpouseDetails?.fullName || citizen.spouseName} />
                                            <InfoItem icon={Users} label="Marital Status" value={citizen.maritalStatus} />
                                            <InfoItem icon={Phone} label="Spouse Contact" value={citizen.SpouseDetails?.mobileNumber || citizen.spouseContactNumber} />
                                            <InfoItem icon={Calendar} label="Wedding Date" value={citizen.SpouseDetails?.weddingDate ? format(new Date(citizen.SpouseDetails.weddingDate), 'PPP') : null} />
                                            <InfoItem icon={Home} label="Living Together" value={citizen.SpouseDetails?.isLivingTogether !== undefined ? (citizen.SpouseDetails.isLivingTogether ? 'Yes' : 'No') : 'Unknown'} />
                                            {!citizen.SpouseDetails?.isLivingTogether && (
                                                <InfoItem icon={MapPin} label="Spouse Address" value={citizen.SpouseDetails?.addressIfNotTogether} className="md:col-span-2" />
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="family" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    {/* Step 4: Family Details */}
                                    <Card className="shadow-md">
                                        <CardHeader className="border-b bg-muted/30">
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-primary" /> Step 4: Family Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid md:grid-cols-2 gap-4 pt-6">

                                            <InfoItem icon={Users} label="Residing With" value={citizen.residingWith} />
                                            <InfoItem icon={Baby} label="Number of Children" value={citizen.numberOfChildren} />
                                            <div className="md:col-span-2">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Family Members</p>
                                                {familyMembers && familyMembers.length > 0 ? (
                                                    <div className="grid gap-3">
                                                        {familyMembers.map((member: any, idx: number) => (
                                                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                                        {getInitials(member.name)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-sm">{member.name}</p>
                                                                        <p className="text-xs text-muted-foreground">{member.relation}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right flex items-center gap-2">
                                                                    <p className="text-xs font-mono">{member.mobileNumber || member.contact || 'No Contact'}</p>
                                                                    {(member.mobileNumber || member.contact) && (
                                                                        <a href={`tel:${member.mobileNumber || member.contact}`}>
                                                                            <Button variant="outline" size="icon" className="h-7 w-7 bg-green-500 text-white">
                                                                                <Phone className="h-3 w-3 " />
                                                                            </Button>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">No family members listed.</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Step 5: Emergency Contacts */}
                                    <Card className="shadow-md">
                                        <CardHeader className="border-b bg-muted/30">
                                            <CardTitle className="flex items-center gap-2">
                                                <AlertCircle className="h-5 w-5 text-primary" /> Step 5: Emergency Contacts
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            {emergencyContacts && emergencyContacts.length > 0 ? (
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {emergencyContacts.map((contact: any, idx: number) => (
                                                        <div key={idx} className={`p-4 rounded-xl border ${contact.isPrimary ? 'border-primary/50 bg-primary/5' : 'bg-card'}`}>
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                                                                        {getInitials(contact.name)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold">{contact.name}</p>
                                                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{contact.relation}</p>
                                                                    </div>
                                                                </div>
                                                                {contact.isPrimary && <Badge>Primary</Badge>}
                                                            </div>
                                                            <div className="mt-4 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                                                        <span className="font-mono">{contact.mobileNumber}</span>
                                                                    </div>
                                                                    {contact.mobileNumber && (
                                                                        <a href={`tel:${contact.mobileNumber}`}>
                                                                            <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs bg-green-500 text-white">
                                                                                <Phone className="h-3 w-3" /> Call
                                                                            </Button>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">No emergency contacts listed.</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Step 6: Household Help */}
                                    <Card className="shadow-md">
                                        <CardHeader className="border-b bg-muted/30">
                                            <CardTitle className="flex items-center gap-2">
                                                <UserPlus className="h-5 w-5 text-primary" /> Step 6: Household Help
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            {householdHelp && householdHelp.length > 0 ? (
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {householdHelp.map((help: any, idx: number) => (
                                                        <div key={idx} className="p-4 rounded-xl border bg-card">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                                    {getInitials(help.name)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold">{help.name}</p>
                                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{help.staffType || 'Staff'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1 text-sm">
                                                                <p><span className="text-muted-foreground">Mobile:</span> {help.mobileNumber}</p>
                                                                {/* <p><span className="text-muted-foreground">Address:</span> {help.address}</p> */}
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    {help.idProofUrl ? (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={(e) => { e.preventDefault(); apiClient.viewDocument(help.idProofUrl); }}
                                                                            className="h-8 gap-2 text-xs border-primary/20 text-primary hover:bg-primary/5"
                                                                        >
                                                                            <FileCheck className="h-3.5 w-3.5" />
                                                                            View ID {help.idProofType ? `(${help.idProofType})` : ''}
                                                                        </Button>
                                                                    ) : (
                                                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-muted-foreground border border-transparent">
                                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                                            <span className="text-xs font-medium">No ID Proof</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 bg-muted/10 rounded-lg border-dashed border">
                                                    <p className="text-sm text-muted-foreground">No household help registered.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="health" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    {/* Step 3: Medical & Health */}
                                    <Card className="shadow-md">
                                        <CardHeader className="border-b bg-muted/30">
                                            <CardTitle className="flex items-center gap-2">
                                                <Stethoscope className="h-5 w-5 text-primary" /> Step 3: Medical & Health
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
                                            <InfoItem icon={Activity} label="Blood Group" value={citizen.bloodGroup} />
                                            <InfoItem icon={Activity} label="Mobility" value={citizen.mobilityStatus} />
                                            <InfoItem icon={AlertTriangle} label="Disability" value={citizen.physicalDisability ? 'Yes' : 'No'} />
                                            <InfoItem icon={User} label="Regular Doctor" value={citizen.regularDoctor} />
                                            <InfoItem icon={Phone} label="Doctor Contact" value={citizen.doctorContact} />
                                            <div className="md:col-span-2"></div>

                                            <div className="md:col-span-2 space-y-2 mt-2">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Medical History</p>
                                                {medicalHistory && medicalHistory.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {medicalHistory.map((h: any, idx: number) => (
                                                            <div key={idx} className="p-3 bg-muted/30 border rounded-lg">
                                                                <p className="font-semibold">{h.conditionName} <span className="text-muted-foreground font-normal text-sm">({h.sinceWhen})</span></p>
                                                                {h.remarks && <p className="text-sm text-muted-foreground mt-1">Note: {h.remarks}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">No medical history recorded.</p>
                                                )}
                                            </div>


                                        </CardContent>
                                    </Card>
                                </TabsContent>



                                <TabsContent value="official" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    {/* Step 9: Declaration */}
                                    <Card className="shadow-md">
                                        <CardHeader className="border-b bg-muted/30">
                                            <CardTitle className="flex items-center gap-2">
                                                <FileCheck className="h-5 w-5 text-primary" /> Step 9: Declaration
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                                                <div className={`p-2 rounded-full ${citizen.consentGiven ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {citizen.consentGiven ? <ClipboardCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium">Consent Status</p>
                                                    <p className="text-sm text-muted-foreground">{citizen.consentGiven ? 'Consent form signed and submitted' : 'Consent pending'}</p>
                                                </div>
                                            </div>
                                            <InfoItem icon={Calendar} label="Submission Date" value={citizen.createdAt ? format(new Date(citizen.createdAt), 'PPP') : 'N/A'} />
                                            <InfoItem icon={User} label="Registered By" value={citizen.registeredBy || 'Self/Officer'} />
                                        </CardContent>
                                    </Card>

                                    {/* Step 10 moved to Overview tab */}
                                </TabsContent>

                                <TabsContent value="assessment" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    <Card className="shadow-md">
                                        <CardHeader className="border-b bg-muted/30">
                                            <CardTitle className="flex items-center gap-2">
                                                <ClipboardCheck className="h-5 w-5 text-primary" /> Latest Assessment Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            {(() => {
                                                // Combine sources or use fallback like other tabs
                                                const sourceVisits = visits.length > 0 ? visits : (citizen.Visit || []);

                                                const assessmentVisit = sourceVisits
                                                    .filter((v: any) => v.assessmentData && Object.keys(v.assessmentData).length > 0)
                                                    .sort((a: any, b: any) => new Date(b.completedDate || b.scheduledDate).getTime() - new Date(a.completedDate || a.scheduledDate).getTime())[0];

                                                if (!assessmentVisit) {
                                                    return (
                                                        <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/10 rounded-xl border-dashed border-2">
                                                            <ClipboardCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                                            <h3 className="text-lg font-medium">No assessment data</h3>
                                                            <p className="text-muted-foreground">No assessment forms have been filled for this citizen yet.</p>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                                                            <div>
                                                                <p className="text-sm font-medium text-muted-foreground">Assessment Date</p>
                                                                <p className="font-bold text-lg">{format(new Date(assessmentVisit.completedDate || assessmentVisit.scheduledDate), 'PPP')}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium text-muted-foreground">Officer</p>
                                                                <p className="font-bold">{assessmentVisit.officer?.name || 'Unknown'}</p>
                                                            </div>
                                                        </div>

                                                        <AssessmentDataViewer data={assessmentVisit.assessmentData} />
                                                    </div>
                                                );
                                            })()}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="history" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    <Card className="shadow-md">
                                        <CardHeader className="border-b bg-muted/30">
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-primary" /> Visit History
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            {(visits.length > 0 || (citizen.Visit && citizen.Visit.length > 0)) ? (
                                                <div className="space-y-4">
                                                    {(visits.length > 0 ? visits : (citizen.Visit || [])).map((visit: any) => (
                                                        <div key={visit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors hover-lift bg-card shadow-sm">
                                                            <div className="flex items-start gap-4">
                                                                <div className={`p-3 rounded-full ${visit.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                                                    visit.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                                                        'bg-blue-100 text-blue-600'
                                                                    }`}>
                                                                    <Calendar className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-lg">{format(new Date(visit.scheduledDate), 'PPP')}</p>
                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                                        <Badge variant="outline" className="text-xs">{visit.visitType}</Badge>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {visit.officer?.name || 'Unassigned'}</span>
                                                                    </div>
                                                                    {visit.notes && (
                                                                        <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded-lg italic">
                                                                            "{visit.notes}"
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="mt-4 sm:mt-0 flex items-center gap-3">
                                                                <Badge className={`px-3 py-1 ${visit.status === 'Completed' ? 'bg-green-500 hover:bg-green-600' :
                                                                    visit.status === 'Cancelled' ? 'bg-red-500 hover:bg-red-600' :
                                                                        'bg-blue-500 hover:bg-blue-600'
                                                                    }`}>
                                                                    {visit.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/10 rounded-xl border-dashed border-2">
                                                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                                    <h3 className="text-lg font-medium">No visit history</h3>
                                                    <p className="text-muted-foreground">No visits have been recorded for this citizen yet.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
            <Dialog open={showCard} onOpenChange={setShowCard}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Digital Identity Card</DialogTitle>
                    </DialogHeader>
                    {citizen && <DigitalIdCard citizen={citizen} />}
                </DialogContent>
            </Dialog>
        </ProtectedRoute >
    );
}
