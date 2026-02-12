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
    UserPlus, UserCheck, Baby, CheckCircle2, XCircle
} from 'lucide-react';
import { format } from 'date-fns';

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
    <div className={`flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border/50 ${className}`}>
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-foreground break-words">{value || '—'}</p>
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
                    <Card key={sectionKey} className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm rounded-xl">
                        <CardHeader className="py-2.5 px-4 bg-muted/20 border-b border-border/50">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                {sectionKey.replace(/([A-Z])/g, ' $1').trim()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(sectionValue).map(([fieldKey, fieldValue]: [string, any]) => {
                                    if (typeof fieldValue === 'object' && fieldValue !== null) return null; // Skip deep nesting for now

                                    // Attempt to guess icon based on field name or use generic
                                    let FieldIcon = FileText;
                                    const keyLower = fieldKey.toLowerCase();
                                    if (keyLower.includes('date')) FieldIcon = Calendar;
                                    else if (keyLower.includes('status')) FieldIcon = Activity;
                                    else if (keyLower.includes('score') || keyLower.includes('rating')) FieldIcon = ClipboardCheck;
                                    else if (keyLower.includes('remark') || keyLower.includes('note')) FieldIcon = FileText;

                                    return (
                                        <div key={fieldKey} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border/50">
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                                <FieldIcon className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight mb-0.5">
                                                    {fieldKey.replace(/([A-Z])/g, ' $1').trim()}
                                                </p>
                                                <p className="text-sm font-semibold text-foreground break-words">
                                                    {String(fieldValue)}
                                                </p>
                                            </div>
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <Button variant="ghost" onClick={() => router.push('/citizens')} className="gap-2 hover:bg-muted text-muted-foreground hover:text-foreground">
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



                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Sidebar: Profile Card */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-card rounded-xl">
                                <CardContent className="pt-6 pb-6 px-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative mb-4">
                                            <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-md">
                                                <AvatarImage src={validPhotoUrl || undefined} className="object-cover" />
                                                <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                                                    {getInitials(citizen.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <Badge variant={citizen.status === 'Active' ? 'default' : 'secondary'} className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs shadow-sm uppercase tracking-wider">
                                                {citizen.status}
                                            </Badge>
                                        </div>

                                        <h2 className="text-xl font-bold text-foreground tracking-tight">{citizen.fullName}</h2>
                                        <p className="text-sm text-muted-foreground font-mono mt-1">
                                            {citizen.registrationNo || citizen.srCitizenUniqueId || `ID: ${citizen.id ? citizen.id.slice(-6).toUpperCase() : 'N/A'}`}
                                        </p>

                                        <div className="flex flex-wrap justify-center gap-2 mt-4 mb-6">
                                            <Badge
                                                variant="outline"
                                                className={`px-2 py-0.5 text-xs font-medium border ${citizen.idVerificationStatus === 'Verified'
                                                    ? 'text-green-600 border-green-200 bg-green-50/50'
                                                    : citizen.idVerificationStatus === 'FieldVerified'
                                                        ? 'text-blue-600 border-blue-200 bg-blue-50/50'
                                                        : 'text-amber-600 border-amber-200 bg-amber-50/50'
                                                    }`}
                                            >
                                                {citizen.idVerificationStatus === 'FieldVerified'
                                                    ? 'Field Verified'
                                                    : citizen.idVerificationStatus === 'Verified'
                                                        ? 'ID Verified'
                                                        : 'Verification Pending'}
                                            </Badge>
                                            <Badge variant="outline" className={`px-2 py-0.5 text-xs font-medium border ${citizen.vulnerabilityLevel === 'High' ? 'text-red-600 border-red-200 bg-red-50/50' :
                                                citizen.vulnerabilityLevel === 'Medium' ? 'text-amber-600 border-amber-200 bg-amber-50/50' :
                                                    'text-green-600 border-green-200 bg-green-50/50'
                                                }`}>
                                                {citizen.vulnerabilityLevel || 'Risk: N/A'}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-3 gap-0 w-full divide-x border-y py-3 bg-muted/20">
                                            <div className="px-2">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Age</p>
                                                <p className="font-semibold text-sm">{citizen.age || '--'} <span className="text-[10px] text-muted-foreground">Years</span></p>
                                            </div>
                                            <div className="px-2">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Gender</p>
                                                <p className="font-semibold text-sm">{citizen.gender || '--'}</p>
                                            </div>
                                            <div className="px-2">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Occupation</p>
                                                <p className="font-semibold text-sm truncate">{citizen.occupation || 'Retired'}</p>
                                            </div>
                                        </div>

                                        <div className="w-full mt-6 space-y-3 text-left">
                                            <div className="flex items-center gap-3 text-sm group">
                                                <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                                    <Phone className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="font-medium truncate">{citizen.mobileNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm group">
                                                <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="truncate text-muted-foreground">{citizen.permanentAddress}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm group">
                                                <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                                    <Shield className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="truncate text-muted-foreground">{citizen.policeStationName || 'Station Not Assigned'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {primaryContact && (
                                <Card className="shadow-sm border border-red-100 bg-red-50/30">
                                    <CardHeader className="py-3 px-4 border-b border-red-100">
                                        <CardTitle className="text-sm font-bold text-red-900 flex items-center gap-2">
                                            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> Emergency Contact
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm shrink-0 uppercase">
                                                {getInitials(primaryContact.name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{primaryContact.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{primaryContact.relation}</p>
                                                <p className="text-xs font-mono font-medium mt-0.5">{primaryContact.mobileNumber}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Content: Tabs */}
                        <div className="lg:col-span-8">
                            <Tabs defaultValue="overview" className="space-y-6">
                                <div className="border-b">
                                    <TabsList className="bg-muted/30 h-auto p-1 w-full justify-start gap-2 overflow-x-auto no-scrollbar rounded-xl">
                                        {[
                                            { value: "overview", label: "Overview" },
                                            { value: "personal", label: "Personal" },
                                            { value: "family", label: "Family" },
                                            { value: "health", label: "Health" },
                                            { value: "official", label: "Official" },
                                            { value: "assessment", label: "Assessment" },
                                            { value: "history", label: "History" },
                                        ].map(tab => (
                                            <TabsTrigger
                                                key={tab.value}
                                                value={tab.value}
                                                className="px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground font-medium transition-all hover:text-foreground border-0"
                                            >
                                                {tab.label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-3 gap-4">
                                        <Card className="hover:shadow-md transition-all shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl">
                                            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">LIFETIME</span>
                                                <div className="text-2xl font-bold tracking-tight">{visits.length || (citizen.Visit ? citizen.Visit.length : 0)}</div>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase">Total Visits</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="hover:shadow-md transition-all shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl">
                                            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                                                <span className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">URGENT</span>
                                                <div className="text-2xl font-bold tracking-tight">{citizen.sosAlerts?.length || 0}</div>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase">SOS Alerts</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="hover:shadow-md transition-all shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl">
                                            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                                                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">ACTIVE</span>
                                                <div className="text-2xl font-bold tracking-tight">{citizen.serviceRequests?.length || 0}</div>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase">Service Requests</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Assessment & Official Status */}
                                        <Card className="shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl h-full">
                                            <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    Assessment & Official Status
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 space-y-4">
                                                {/* Verification Status */}
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Verification Status</p>
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className={`text-xs px-2 py-0.5 border ${citizen.idVerificationStatus === 'Verified' ? 'text-green-600 border-green-200 bg-green-50' :
                                                            citizen.idVerificationStatus === 'Rejected' ? 'text-red-600 border-red-200 bg-red-50' :
                                                                citizen.idVerificationStatus === 'FieldVerified' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-amber-600 border-amber-200 bg-amber-50'
                                                            }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${citizen.idVerificationStatus === 'Verified' ? 'bg-green-500' :
                                                                citizen.idVerificationStatus === 'Rejected' ? 'bg-red-500' :
                                                                    citizen.idVerificationStatus === 'FieldVerified' ? 'bg-blue-500' : 'bg-amber-500'
                                                                }`} />
                                                            {citizen.idVerificationStatus === 'FieldVerified' ? 'Field Verified' :
                                                                citizen.idVerificationStatus || 'Verification Pending'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground mt-1 flex justify-between">
                                                        <span>Last: {citizen.lastAssessmentDate ? format(new Date(citizen.lastAssessmentDate), 'MMM d, yyyy') : 'Not yet verified'}</span>
                                                        <span>By: {verificationVisit?.officer?.name || 'Pending assignment'}</span>
                                                    </div>
                                                </div>

                                                <div className="border-t border-dashed my-2" />

                                                {/* Risk Assessment */}
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Risk Assessment</p>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-sm font-bold ${citizen.vulnerabilityLevel === 'High' ? 'text-red-600' :
                                                            citizen.vulnerabilityLevel === 'Medium' ? 'text-amber-600' :
                                                                'text-green-600'
                                                            }`}>
                                                            {citizen.vulnerabilityLevel || 'Not Assessed'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                                                        Based on health, living conditions, and social support.
                                                    </p>
                                                </div>

                                                <div className="border-t border-dashed my-2" />

                                                {/* Official Notes */}
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Official Notes</p>
                                                    <div className="bg-muted/30 p-2.5 rounded border text-xs text-muted-foreground min-h-[50px] italic">
                                                        {citizen.officialRemarks || verificationVisit?.notes || 'No official notes recorded.'}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl h-full flex flex-col">
                                            <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                                <CardTitle className="text-sm font-bold flex items-center justify-between">
                                                    <span>Recent Activity</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0 flex-1">
                                                {(visits.length > 0 || (citizen.Visit && citizen.Visit.length > 0)) ? (
                                                    <div className="divide-y">
                                                        {(visits.length > 0 ? visits : (citizen.Visit || [])).slice(0, 3).map((visit: any, i: number) => (
                                                            <div key={visit.id} className="p-3 hover:bg-muted/10 transition-colors flex gap-3">
                                                                <div className="flex flex-col items-center gap-1 min-w-[3rem] pt-1">
                                                                    <div className="text-[10px] font-bold uppercase text-muted-foreground">{format(new Date(visit.scheduledDate), 'MMM')}</div>
                                                                    <div className="text-xl font-bold leading-none">{format(new Date(visit.scheduledDate), 'd')}</div>
                                                                    <div className="text-[10px] text-muted-foreground">{format(new Date(visit.scheduledDate), 'yyyy')}</div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex justify-between items-start mb-0.5">
                                                                        <h4 className="font-semibold text-sm truncate pr-2">{visit.visitType} Visit</h4>
                                                                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 border ${visit.status === 'Completed' ? 'text-green-600 border-green-200 bg-green-50' :
                                                                            visit.status === 'Cancelled' ? 'text-red-600 border-red-200 bg-red-50' : 'text-blue-600 border-blue-200 bg-blue-50'
                                                                            }`}>
                                                                            {visit.status}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground truncate">
                                                                        Officer: <span className="font-medium text-foreground">{visit.officer?.name || 'Unassigned'}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-10 text-center h-full">
                                                        <div className="p-2 bg-muted/50 rounded-full mb-2">
                                                            <Clock className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground font-medium">No recent activity.</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="personal" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    {/* Step 1: Personal Details */}
                                    <Card className="shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl">
                                        <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                <User className="h-4 w-4 text-primary" /> Personal Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 pb-6">
                                            <InfoItem icon={User} label="Full Name" value={citizen.fullName} />
                                            <InfoItem icon={Calendar} label="Date of Birth" value={citizen.dateOfBirth ? format(new Date(citizen.dateOfBirth), 'PPP') : null} />
                                            <InfoItem icon={Users} label="Religion" value={citizen.religion} />
                                            <InfoItem icon={Home} label="Retired From" value={citizen.retiredFrom} />
                                            <InfoItem icon={Calendar} label="Retirement Year" value={citizen.yearOfRetirement} />
                                            <InfoItem icon={UserCheck} label="Specialization" value={citizen.specialization} />
                                            <InfoItem icon={Smartphone} label="WhatsApp Number" value={citizen.whatsappNumber} />
                                            <div className="sm:col-span-2 lg:col-span-3 border-t border-dashed my-2" />
                                            <InfoItem icon={MapPin} label="Address Line 1" value={citizen.addressLine1} />
                                            <InfoItem icon={MapPin} label="Address Line 2" value={citizen.addressLine2} />
                                            <InfoItem icon={MapPin} label="City" value={citizen.city} />
                                            <InfoItem icon={MapPin} label="District" value={citizen.District?.name || citizen.district?.name || citizen.districtName || districts.find((d: any) => d.id === citizen.districtId)?.name} />
                                            <InfoItem icon={Shield} label="Police Station" value={citizen.PoliceStation?.name || citizen.policeStation?.name || citizen.policeStationName || stations.find((s: any) => s.id === citizen.policeStationId)?.name} />
                                            <InfoItem icon={MapPin} label="State" value={citizen.state} />
                                            <InfoItem icon={MapPin} label="PIN Code" value={citizen.pinCode} />
                                            <InfoItem icon={Phone} label="Telephone/Landline" value={citizen.telephoneNumber} />
                                            <div className="sm:col-span-2 lg:col-span-3 border-t border-dashed my-2" />
                                            <InfoItem icon={MapPin} label="Permanent Address" value={citizen.permanentAddress} className="sm:col-span-2 lg:col-span-3 bg-muted/20 border-border/50" />
                                            <InfoItem icon={MapPin} label="Present Address" value={citizen.presentAddress} className="sm:col-span-2 lg:col-span-3 bg-muted/20 border-border/50" />

                                            {/* Address Proof Document */}
                                            {citizen.addressProofUrl ? (
                                                <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between p-3 border rounded-xl bg-green-50/30 border-green-100 mt-2 hover:shadow-sm transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-full border border-green-100 shadow-sm text-green-600">
                                                            <FileCheck className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-foreground">Address Proof Document</p>
                                                            <p className="text-xs text-green-700 font-medium">Verified Document</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => apiClient.viewDocument(citizen.addressProofUrl)}
                                                        className="h-8 bg-white hover:bg-green-50 text-green-700 border-green-200"
                                                    >
                                                        <Eye className="h-3.5 w-3.5 mr-2" /> View
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3 p-3 border border-dashed rounded-xl bg-muted/20 text-muted-foreground mt-2 justify-center">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-sm">No Address Proof Uploaded</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Step 2: Spouse Details */}
                                    <Card className="shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl">
                                        <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                <UserCheck className="h-4 w-4 text-primary" /> Spouse Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 pb-6">
                                            <InfoItem icon={User} label="Spouse Name" value={citizen.SpouseDetails?.fullName || citizen.spouseName} />
                                            <InfoItem icon={Users} label="Marital Status" value={citizen.maritalStatus} />
                                            <InfoItem icon={Phone} label="Spouse Contact" value={citizen.SpouseDetails?.mobileNumber || citizen.spouseContactNumber} />
                                            <InfoItem icon={Calendar} label="Wedding Date" value={citizen.SpouseDetails?.weddingDate ? format(new Date(citizen.SpouseDetails.weddingDate), 'PPP') : null} />
                                            <InfoItem icon={Home} label="Living Together" value={citizen.SpouseDetails?.isLivingTogether !== undefined ? (citizen.SpouseDetails.isLivingTogether ? 'Yes' : 'No') : 'Unknown'} />
                                            {!citizen.SpouseDetails?.isLivingTogether && (
                                                <InfoItem icon={MapPin} label="Spouse Address" value={citizen.SpouseDetails?.addressIfNotTogether} className="sm:col-span-2 lg:col-span-3" />
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="family" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Step 4: Family Details */}
                                        <Card className="shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl h-full">
                                            <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-primary" /> Family Members
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-4">
                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
                                                    <InfoItem icon={Home} label="Residing With" value={citizen.residingWith} />
                                                    <InfoItem icon={Baby} label="Children" value={citizen.numberOfChildren} />
                                                </div>

                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Members List</p>
                                                    {familyMembers && familyMembers.length > 0 ? (
                                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                                            {familyMembers.map((member: any, idx: number) => (
                                                                <div key={idx} className="flex items-center justify-between p-2.5 bg-card border rounded-lg hover:shadow-sm transition-shadow">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                                            {getInitials(member.name)}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="font-medium text-sm truncate">{member.name}</p>
                                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{member.relation}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right flex items-center gap-2">
                                                                        {(member.mobileNumber || member.contact) && (
                                                                            <a href={`tel:${member.mobileNumber || member.contact}`}>
                                                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-green-600 hover:bg-green-50 hover:text-green-700">
                                                                                    <Phone className="h-3.5 w-3.5" />
                                                                                </Button>
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-6 bg-muted/20 rounded-lg border-dashed border">
                                                            <p className="text-xs text-muted-foreground italic">No family members listed.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Step 5: Emergency Contacts */}
                                        <div className="space-y-6">
                                            <Card className="shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl">
                                                <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4 text-primary" /> Emergency Contacts
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-4 pb-4">
                                                    {emergencyContacts && emergencyContacts.length > 0 ? (
                                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                                            {emergencyContacts.map((contact: any, idx: number) => (
                                                                <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${contact.isPrimary ? 'border-red-200 bg-red-50/30' : 'bg-card'}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm ${contact.isPrimary ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'}`}>
                                                                            {getInitials(contact.name)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold text-sm">{contact.name}</p>
                                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{contact.relation}</p>
                                                                        </div>
                                                                    </div>
                                                                    {contact.mobileNumber && (
                                                                        <a href={`tel:${contact.mobileNumber}`}>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-green-600 hover:bg-green-50">
                                                                                <Phone className="h-4 w-4" />
                                                                            </Button>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-6 bg-muted/20 rounded-lg border-dashed border">
                                                            <p className="text-xs text-muted-foreground italic">No emergency contacts listed.</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Step 6: Household Help */}
                                            <Card className="shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl">
                                                <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <UserPlus className="h-4 w-4 text-primary" /> Household Help
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-4 pb-4">
                                                    {householdHelp && householdHelp.length > 0 ? (
                                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                                            {householdHelp.map((help: any, idx: number) => (
                                                                <div key={idx} className="p-3 rounded-xl border bg-card group hover:shadow-sm transition-all">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                                                {getInitials(help.name)}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-semibold text-sm">{help.name}</p>
                                                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{help.staffType || 'Staff'}</p>
                                                                            </div>
                                                                        </div>
                                                                        {help.idProofUrl && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={(e) => { e.preventDefault(); apiClient.viewDocument(help.idProofUrl); }}
                                                                                className="h-8 w-8 text-primary hover:bg-primary/5"
                                                                                title="View ID Proof"
                                                                            >
                                                                                <FileCheck className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                    <div className="mt-2 pl-12 text-xs text-muted-foreground flex items-center gap-2">
                                                                        <Phone className="h-3 w-3" />
                                                                        <span className="font-mono">{help.mobileNumber}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-6 bg-muted/20 rounded-lg border-dashed border">
                                                            <p className="text-xs text-muted-foreground italic">No household help registered.</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="health" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    {/* Step 3: Medical & Health */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card className="md:col-span-2 shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl">
                                            <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4 text-primary" /> Medical Profile
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 pb-6">
                                                <InfoItem icon={Activity} label="Blood Group" value={citizen.bloodGroup} />
                                                <InfoItem icon={Activity} label="Mobility" value={citizen.mobilityStatus} />
                                                <InfoItem icon={AlertTriangle} label="Disability" value={citizen.physicalDisability ? 'Yes' : 'No'} />

                                                <div className="sm:col-span-2 lg:col-span-3 border-t border-dashed my-2" />

                                            </CardContent>
                                            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-2">
                                                <InfoItem icon={User} label="Regular Doctor" value={citizen.regularDoctor} />
                                                <InfoItem icon={Phone} label="Doctor Contact" value={citizen.doctorContact} />
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl h-full">
                                            <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-primary" /> Medical History
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-4">
                                                {medicalHistory && medicalHistory.length > 0 ? (
                                                    <div className="grid sm:grid-cols-1 gap-3">
                                                        {medicalHistory.map((h: any, idx: number) => (
                                                            <div key={idx} className="p-3 bg-card border rounded-lg hover:shadow-sm transition-shadow">
                                                                <p className="font-semibold text-sm flex justify-between items-center">
                                                                    {h.conditionName}
                                                                    <Badge variant="outline" className="text-[10px] font-normal">{h.sinceWhen}</Badge>
                                                                </p>
                                                                {h.remarks && <p className="text-xs text-muted-foreground mt-2 italic border-t pt-2">"{h.remarks}"</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 bg-muted/20 rounded-lg border-dashed border">
                                                        <p className="text-xs text-muted-foreground italic">No medical history recorded.</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="official" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    {/* Step 9: Declaration */}
                                    <Card className="shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl max-w-2xl">
                                        <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                <FileCheck className="h-4 w-4 text-primary" /> Declaration & Consent
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4 pb-4 space-y-4">
                                            <div className={`flex items-center gap-3 p-3 rounded-xl border ${citizen.consentGiven ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                                                <div className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${citizen.consentGiven ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {citizen.consentGiven ? <ClipboardCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm mb-0.5">Consent Status</p>
                                                    <p className="text-xs text-muted-foreground">{citizen.consentGiven ? 'Consent form has been signed and submitted.' : 'Consent is pending.'}</p>
                                                </div>
                                                {citizen.consentGiven && (
                                                    <div className="ml-auto">
                                                        <Badge variant="outline" className="bg-white text-green-700 border-green-200">Verified</Badge>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/20 rounded-xl border border-dashed border-border/50">
                                                <InfoItem icon={Calendar} label="Submission Date" value={citizen.createdAt ? format(new Date(citizen.createdAt), 'PPP') : 'N/A'} />
                                                <InfoItem icon={User} label="Registered By" value={citizen.registeredBy || 'Self/Officer'} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="assessment" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    <Card className="shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl">
                                        <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                <ClipboardCheck className="h-4 w-4 text-primary" /> Latest Assessment Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4 pb-4">
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
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-white rounded-md border text-primary">
                                                                    <Calendar className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assessment Date</p>
                                                                    <p className="font-bold">{format(new Date(assessmentVisit.completedDate || assessmentVisit.scheduledDate), 'PPP')}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Officer</p>
                                                                <p className="font-bold">{assessmentVisit.officer?.name || 'Unknown'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="">
                                                            <AssessmentDataViewer data={assessmentVisit.assessmentData} />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="history" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                        <div className="lg:col-span-8">
                                            <Card className="shadow-sm border border-slate-100 dark:border-slate-800 bg-card rounded-xl">
                                                <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-primary" /> Visit Timeline
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-6 pb-6">
                                                    {(visits.length > 0 || (citizen.Visit && citizen.Visit.length > 0)) ? (
                                                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent">
                                                            {(visits.length > 0 ? visits : (citizen.Visit || [])).map((visit: any) => (
                                                                <div key={visit.id} className="relative flex items-center gap-4 group">
                                                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-background shadow-sm shrink-0 z-10 ${visit.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                                                        visit.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                                                            'bg-blue-100 text-blue-600'
                                                                        }`}>
                                                                        {visit.status === 'Completed' ? <CheckCircle2 className="h-5 w-5" /> :
                                                                            visit.status === 'Cancelled' ? <XCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                                                    </div>
                                                                    <div className="flex-1 bg-card p-4 rounded-xl border hover:shadow-md transition-shadow">
                                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                                                            <div>
                                                                                <p className="font-bold text-base">{visit.visitType} Visit</p>
                                                                                <p className="text-xs text-muted-foreground">{format(new Date(visit.scheduledDate), 'PPPP p')}</p>
                                                                            </div>
                                                                            <Badge variant="outline" className={`w-fit ${visit.status === 'Completed' ? 'text-green-700 bg-green-50 border-green-200' :
                                                                                visit.status === 'Cancelled' ? 'text-red-700 bg-red-50 border-red-200' : 'text-blue-700 bg-blue-50 border-blue-200'
                                                                                }`}>
                                                                                {visit.status}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-3 border-t border-dashed">
                                                                            <div>
                                                                                <span className="font-medium text-foreground">Officer:</span> {visit.officer?.name || 'Unassigned'}
                                                                            </div>
                                                                            {visit.notes && (
                                                                                <div className="md:col-span-2 italic">
                                                                                    "{visit.notes}"
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/10 rounded-xl border-dashed border-2">
                                                            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                                            <p className="text-muted-foreground font-medium">No visits recorded.</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <div className="lg:col-span-4">
                                            <Card className="shadow-sm border border-primary/10 bg-primary/5 rounded-xl">
                                                <CardContent className="p-6 text-center">
                                                    <h3 className="text-lg font-bold text-primary mb-2">Summary</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 mt-4">
                                                        <div className="p-3 bg-background rounded-lg shadow-sm border text-center">
                                                            <div className="text-2xl font-bold">{visits.length || (citizen.Visit ? citizen.Visit.length : 0)}</div>
                                                            <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Total Visits</div>
                                                        </div>
                                                        <div className="p-3 bg-background rounded-lg shadow-sm border text-center">
                                                            <div className="text-2xl font-bold text-green-600">
                                                                {(visits || citizen.Visit || []).filter((v: any) => v.status === 'Completed').length}
                                                            </div>
                                                            <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Completed</div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </DashboardLayout >
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
