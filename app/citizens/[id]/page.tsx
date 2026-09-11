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
    UserPlus, UserCheck, Baby, CheckCircle2, XCircle,
    Copy, Check
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
    const [copiedId, setCopiedId] = useState(false);

    const handleCopyId = () => {
        const idToCopy = citizen?.registrationNo || citizen?.srCitizenUniqueId || citizen?.id;
        if (idToCopy) {
            navigator.clipboard.writeText(idToCopy);
            setCopiedId(true);
            toast({ title: "ID Copied", description: `${idToCopy} copied to clipboard.` });
            setTimeout(() => setCopiedId(false), 2000);
        }
    };



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
                        {/* Left Sidebar: Immersive Profile Card */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="overflow-hidden rounded-2xl border border-blue-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 transition-all">
                                {/* Signature Police Theme Gradient Hero Banner */}
                                <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        {/* Avatar with Status Ring */}
                                        <div className="relative mb-3">
                                            <Avatar className="h-24 w-24 border-3 border-white/40 shadow-xl ring-4 ring-indigo-500/20">
                                                <AvatarImage src={validPhotoUrl || undefined} className="object-cover" />
                                                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black">
                                                    {getInitials(citizen.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <Badge
                                                variant={citizen.status === 'Active' ? 'default' : 'secondary'}
                                                className={cn(
                                                    "absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-[10px] font-bold shadow-md uppercase tracking-wider",
                                                    citizen.status === 'Active'
                                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white border border-white/30'
                                                        : 'bg-slate-600 text-white'
                                                )}
                                            >
                                                {citizen.status || 'Active'}
                                            </Badge>
                                        </div>

                                        {/* Full Name */}
                                        <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">{citizen.fullName}</h2>

                                        {/* Copyable ID Badge */}
                                        <button
                                            onClick={handleCopyId}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 mt-1.5 rounded-full bg-white/10 hover:bg-white/20 text-blue-100 text-xs font-mono font-medium backdrop-blur-xs transition-all border border-white/10 group cursor-pointer"
                                            title="Click to copy ID"
                                        >
                                            <span>{citizen.registrationNo || citizen.srCitizenUniqueId || `ID: ${citizen.id ? citizen.id.slice(-6).toUpperCase() : 'N/A'}`}</span>
                                            {copiedId ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />}
                                        </button>

                                        {/* Verification & Risk Badges */}
                                        <div className="flex flex-wrap justify-center gap-2 mt-3.5 w-full">
                                            <span className={cn(
                                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-xs border shadow-xs",
                                                citizen.idVerificationStatus === 'Verified'
                                                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                                                    : citizen.idVerificationStatus === 'FieldVerified'
                                                        ? 'bg-blue-500/20 text-blue-200 border-blue-400/30'
                                                        : citizen.idVerificationStatus === 'Rejected'
                                                            ? 'bg-rose-500/20 text-rose-200 border-rose-400/30'
                                                            : 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                                            )}>
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                {citizen.idVerificationStatus === 'FieldVerified'
                                                    ? 'Field Verified'
                                                    : citizen.idVerificationStatus === 'Verified'
                                                        ? 'ID Verified'
                                                        : citizen.idVerificationStatus === 'Rejected'
                                                            ? 'Rejected'
                                                            : 'Verification Pending'}
                                            </span>

                                            <span className={cn(
                                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-xs border shadow-xs",
                                                citizen.vulnerabilityLevel === 'High'
                                                    ? 'bg-rose-500/20 text-rose-200 border-rose-400/30'
                                                    : citizen.vulnerabilityLevel === 'Medium'
                                                        ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                                                        : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                                            )}>
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                {citizen.vulnerabilityLevel ? `${citizen.vulnerabilityLevel} Risk` : 'Standard Risk'}
                                            </span>
                                        </div>

                                        {/* 2-Stat Demographics Micro-Grid */}
                                        <div className="grid grid-cols-2 gap-2 w-full mt-4 p-2.5 rounded-xl bg-black/25 backdrop-blur-sm border border-white/10 text-center">
                                            <div className="px-2">
                                                <p className="text-[10px] text-blue-200/75 uppercase tracking-wider font-semibold">Age</p>
                                                <p className="font-bold text-sm text-white">{citizen.age ? `${citizen.age} Yrs` : '--'}</p>
                                            </div>
                                            <div className="px-2 border-l border-white/10">
                                                <p className="text-[10px] text-blue-200/75 uppercase tracking-wider font-semibold">Gender</p>
                                                <p className="font-bold text-sm text-white capitalize">{citizen.gender || '--'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body Details & Actions */}
                                <div className="p-5 space-y-4">
                                    {/* Direct Phone Dial Pod */}
                                    {citizen.mobileNumber && (
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 shadow-xs">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Primary Mobile</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono truncate">{citizen.mobileNumber}</p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                asChild
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-8 px-3 rounded-lg text-xs shrink-0 shadow-xs"
                                            >
                                                <a href={`tel:${citizen.mobileNumber}`}>
                                                    Call
                                                </a>
                                            </Button>
                                        </div>
                                    )}

                                    {/* Location & Jurisdiction Stack */}
                                    <div className="space-y-2.5 pt-0.5">
                                        {/* Address */}
                                        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shrink-0">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Permanent Address</p>
                                                <p className="text-xs font-semibold text-foreground leading-relaxed">
                                                    {citizen.permanentAddress || citizen.presentAddress || 'Address not registered'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Police Station & District */}
                                        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0">
                                                <Shield className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Police Station & District</p>
                                                <p className="text-xs font-bold text-foreground truncate">
                                                    {citizen.policeStationName || citizen.PoliceStation?.name || 'Station Not Assigned'}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    District: <span className="font-semibold text-foreground">{citizen.districtName || citizen.District?.name || 'Not Assigned'}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Primary Emergency Contact Card */}
                            {primaryContact && (
                                <Card className="overflow-hidden shadow-sm border border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/70 via-white to-red-50/40 dark:from-rose-950/20 dark:via-slate-900 dark:to-red-950/10 rounded-2xl">
                                    <CardHeader className="py-3 px-4 border-b border-rose-100 dark:border-rose-900/40 bg-rose-100/40 dark:bg-rose-950/40">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xs font-extrabold text-rose-900 dark:text-rose-200 flex items-center gap-2 uppercase tracking-wider">
                                                <Heart className="h-3.5 w-3.5 text-rose-600 fill-rose-600" /> Emergency Contact
                                            </CardTitle>
                                            <Badge variant="outline" className="text-[10px] font-bold bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border-rose-300">
                                                PRIMARY
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-700 dark:text-rose-300 font-extrabold text-sm shrink-0 uppercase border border-rose-200">
                                                    {getInitials(primaryContact.name)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{primaryContact.name}</p>
                                                    <p className="text-xs font-medium text-rose-700 dark:text-rose-400 capitalize">{primaryContact.relation || 'Contact'}</p>
                                                    <p className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 mt-0.5">{primaryContact.mobileNumber}</p>
                                                </div>
                                            </div>
                                            {primaryContact.mobileNumber && (
                                                <Button
                                                    size="sm"
                                                    asChild
                                                    className="bg-rose-600 hover:bg-rose-700 text-white font-semibold h-8 px-3 rounded-lg text-xs shrink-0 shadow-xs"
                                                >
                                                    <a href={`tel:${primaryContact.mobileNumber}`}>
                                                        <Phone className="h-3 w-3 mr-1.5" /> Call
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Content: Tabs */}
                        <div className="lg:col-span-8">
                            <Tabs defaultValue="overview" className="space-y-6">
                                <div className="pb-1">
                                    <TabsList className="bg-slate-100/95 border border-slate-200 h-auto p-1.5 w-full justify-start gap-1.5 overflow-x-auto no-scrollbar rounded-xl shadow-2xs">
                                        {[
                                            { value: "overview", label: "Overview", icon: Activity },
                                            { value: "personal", label: "Personal", icon: User },
                                            { value: "family", label: "Family", icon: Users },
                                            { value: "health", label: "Health", icon: Heart },
                                            { value: "official", label: "Official", icon: Shield },
                                            { value: "assessment", label: "Assessment", icon: ClipboardCheck },
                                            { value: "history", label: "History", icon: Clock },
                                        ].map(tab => {
                                            const Icon = tab.icon;
                                            return (
                                                <TabsTrigger
                                                    key={tab.value}
                                                    value={tab.value}
                                                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:text-indigo-900 hover:bg-slate-200/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:[&_svg]:text-white transition-all border-0 shrink-0"
                                                >
                                                    <Icon className="h-4 w-4 text-indigo-600 shrink-0 transition-colors" />
                                                    <span>{tab.label}</span>
                                                </TabsTrigger>
                                            );
                                        })}
                                    </TabsList>
                                </div>

                                <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {/* Total Visit KPI Card */}
                                        <Card className="group relative shadow-2xs hover:shadow-md transition-all duration-200 border border-slate-200/80 dark:border-slate-800 border-l-[3.5px] border-l-blue-600 bg-gradient-to-br from-blue-50/60 via-white to-slate-50/40 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-950/40 rounded-xl overflow-hidden hover:-translate-y-0.5">
                                            <CardContent className="py-2.5 px-3.5">
                                                <div className="flex items-center justify-between gap-2.5">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0 transition-transform group-hover:scale-105 shadow-2xs">
                                                            <Calendar className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight truncate leading-tight">
                                                                Total Visit
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                                                                Duty visits conducted
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 rounded-lg text-lg font-black shrink-0 tracking-tight shadow-2xs">
                                                        {visits.length || (citizen.Visit ? citizen.Visit.length : 0)}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* SOS Alert KPI Card */}
                                        <Card className="group relative shadow-2xs hover:shadow-md transition-all duration-200 border border-slate-200/80 dark:border-slate-800 border-l-[3.5px] border-l-rose-500 bg-gradient-to-br from-rose-50/60 via-white to-slate-50/40 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-950/40 rounded-xl overflow-hidden hover:-translate-y-0.5">
                                            <CardContent className="py-2.5 px-3.5">
                                                <div className="flex items-center justify-between gap-2.5">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 shrink-0 transition-transform group-hover:scale-105 shadow-2xs">
                                                            <AlertTriangle className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight truncate leading-tight">
                                                                SOS Alert
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                                                                Emergency incidents
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/60 rounded-lg text-lg font-black shrink-0 tracking-tight shadow-2xs">
                                                        {citizen.sosAlerts?.length || 0}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Visit Request KPI Card */}
                                        <Card className="group relative shadow-2xs hover:shadow-md transition-all duration-200 border border-slate-200/80 dark:border-slate-800 border-l-[3.5px] border-l-amber-500 bg-gradient-to-br from-amber-50/60 via-white to-slate-50/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-950/40 rounded-xl overflow-hidden hover:-translate-y-0.5">
                                            <CardContent className="py-2.5 px-3.5">
                                                <div className="flex items-center justify-between gap-2.5">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shrink-0 transition-transform group-hover:scale-105 shadow-2xs">
                                                            <ClipboardCheck className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight truncate leading-tight">
                                                                Visit Request
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                                                                Citizen requests
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 rounded-lg text-lg font-black shrink-0 tracking-tight shadow-2xs">
                                                        {citizen.serviceRequests?.length || (citizen.VisitRequest ? citizen.VisitRequest.length : 0)}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Assessment & Official Status */}
                                        <Card className="shadow-sm border border-slate-200/80 dark:border-slate-800 bg-card rounded-2xl h-full overflow-hidden">
                                            <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                                    <ClipboardCheck className="h-4 w-4 text-indigo-600" />
                                                    Assessment & Official Status
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-5 space-y-4">
                                                {/* Verification Status */}
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Verification Status</p>
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className={`text-sm font-bold px-3 py-1 rounded-lg border ${citizen.idVerificationStatus === 'Verified' ? 'text-green-700 border-green-300 bg-green-50/80 dark:bg-green-950/40 dark:text-green-300' :
                                                            citizen.idVerificationStatus === 'Rejected' ? 'text-red-700 border-red-300 bg-red-50/80 dark:bg-red-950/40 dark:text-red-300' :
                                                                citizen.idVerificationStatus === 'FieldVerified' ? 'text-blue-700 border-blue-300 bg-blue-50/80 dark:bg-blue-950/40 dark:text-blue-300' : 'text-amber-700 border-amber-300 bg-amber-50/80 dark:bg-amber-950/40 dark:text-amber-300'
                                                            }`}>
                                                            <div className={`w-2 h-2 rounded-full mr-2 ${citizen.idVerificationStatus === 'Verified' ? 'bg-green-500' :
                                                                citizen.idVerificationStatus === 'Rejected' ? 'bg-red-500' :
                                                                    citizen.idVerificationStatus === 'FieldVerified' ? 'bg-blue-500' : 'bg-amber-500'
                                                                }`} />
                                                            {citizen.idVerificationStatus === 'FieldVerified' ? 'Field Verified' :
                                                                citizen.idVerificationStatus || 'Verification Pending'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-2 flex justify-between font-medium">
                                                        <span>Last: {citizen.lastAssessmentDate ? format(new Date(citizen.lastAssessmentDate), 'MMM d, yyyy') : 'Not yet verified'}</span>
                                                        <span>By: {verificationVisit?.officer?.name || 'Pending assignment'}</span>
                                                    </div>
                                                </div>

                                                <div className="border-t border-dashed my-2" />

                                                {/* Risk Assessment */}
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Risk Assessment</p>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-base font-black ${citizen.vulnerabilityLevel === 'High' ? 'text-red-600' :
                                                            citizen.vulnerabilityLevel === 'Medium' ? 'text-amber-600' :
                                                                'text-green-600'
                                                            }`}>
                                                            {citizen.vulnerabilityLevel ? `${citizen.vulnerabilityLevel} Risk Level` : 'Not Assessed'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        Based on health condition, living conditions, and social support.
                                                    </p>
                                                </div>

                                                <div className="border-t border-dashed my-2" />

                                                {/* Official Notes */}
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Official Notes</p>
                                                    <div className="bg-muted/30 p-3 rounded-xl border text-sm text-slate-700 dark:text-slate-300 min-h-[55px] leading-relaxed italic">
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
                                            <InfoItem
                                                icon={Home}
                                                label="Saved Address As"
                                                value={citizen.addressType === 'HOME' ? '🏠 HOME' : citizen.addressType === 'WORK' ? '💼 WORK' : citizen.addressType === 'HOTEL' ? '🏨 HOTEL' : (citizen.addressType ? `📍 ${citizen.addressType}` : '🏠 HOME')}
                                            />
                                            <InfoItem icon={MapPin} label="Address Line 1" value={citizen.addressLine1} />
                                            <InfoItem icon={MapPin} label="Address Line 2" value={citizen.addressLine2} />
                                            <InfoItem icon={MapPin} label="City" value={citizen.city || 'Delhi'} />
                                            <InfoItem icon={MapPin} label="District" value={citizen.District?.name || citizen.district?.name || citizen.districtName || districts.find((d: any) => d.id === citizen.districtId)?.name} />
                                            <InfoItem icon={Shield} label="Police Station" value={citizen.PoliceStation?.name || citizen.policeStation?.name || citizen.policeStationName || stations.find((s: any) => s.id === citizen.policeStationId)?.name} />
                                            <InfoItem icon={MapPin} label="State" value={citizen.state || 'Delhi'} />
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
                                    <Card className="shadow-sm border border-slate-200/80 dark:border-slate-800 bg-card rounded-2xl overflow-hidden">
                                        <CardHeader className="py-3 px-4 border-b bg-muted/10 flex flex-row items-center justify-between gap-3">
                                            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                                <ClipboardCheck className="h-4 w-4 text-indigo-600" /> Latest Assessment Details
                                            </CardTitle>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider hidden sm:inline-block">Risk Level:</span>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs font-bold px-2.5 py-1 rounded-lg border shadow-2xs flex items-center gap-1.5",
                                                        citizen.vulnerabilityLevel === 'High'
                                                            ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                                                            : citizen.vulnerabilityLevel === 'Medium'
                                                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                                    )}
                                                >
                                                    {citizen.vulnerabilityLevel === 'High' ? (
                                                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                                                    ) : citizen.vulnerabilityLevel === 'Medium' ? (
                                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                                    ) : (
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                    )}
                                                    <span>{citizen.vulnerabilityLevel ? `${citizen.vulnerabilityLevel} Risk` : 'Standard Risk'}</span>
                                                </Badge>
                                            </div>
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
