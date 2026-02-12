'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Loader2, AlertTriangle, Calendar, FileText, User, Bell,
    Shield, Phone, MapPin, ChevronRight, Activity, Clock,
    Stethoscope, FileQuestion, Car, UserX, Search, Smartphone,
    FileCheck, Users, FileEdit, Download, MessageSquare, CheckCircle2
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useToast } from '@/components/ui/use-toast';
import { calculateProfileCompleteness } from '@/lib/utils';
import { StatusTracker } from '../components/status-tracker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

export default function CitizenDashboard() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [visits, setVisits] = useState<any[]>([]);
    const [sosActive, setSosActive] = useState(false);
    const [error, setError] = useState('');
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionPercentage, setCompletionPercentage] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!isMounted) return;
            setError('');

            try {
                // Fetch profile first, as it's critical
                const profileRes = await apiClient.getMyProfile().catch(err => ({ success: false, error: err }));

                if (!isMounted) return;

                if (profileRes.success) {
                    const citizen = profileRes.data.citizen;
                    setProfile(citizen);

                    // Calculate Profile Completeness Score using shared utility
                    const percent = calculateProfileCompleteness(citizen);

                    setCompletionPercentage(percent);

                    // Show modal if not fully complete (less than 100%)
                    if (percent < 100) {
                        setShowCompletionModal(true);
                    }

                    // Fetch other data in parallel only if profile exists
                    const [visitsRes, sosRes] = await Promise.all([
                        apiClient.getMyVisits().catch(() => ({ success: false, data: { visits: [] } })),
                        apiClient.getMySOS().catch(() => ({ success: false, data: { alerts: [] } }))
                    ]);

                    if (!isMounted) return;

                    if (visitsRes.success) {
                        const items = visitsRes.data.items || visitsRes.data.visits || [];
                        setVisits(items);
                    }

                    const alerts = sosRes.data?.items || sosRes.data?.alerts || [];
                    if (sosRes.success && alerts.some((a: any) => a.status === 'Active')) {
                        setSosActive(true);
                    }

                } else {
                    // Start registration/profile completion if not found
                    if (profileRes.error?.response?.status === 404) {
                        router.push('/citizen-portal/profile/complete');
                        return;
                    } else if (profileRes.error?.response?.status === 401) {
                        router.push('/citizen-portal/login');
                        return;
                    } else {
                        throw profileRes.error;
                    }
                }
            } catch (err: any) {
                console.error('Failed to load dashboard', err);
                if (!isMounted) return;
                setError('Failed to load dashboard data. Please try refreshing.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [router]);

    if (loading) {
        return <DashboardLoadingSkeleton />;
    }

    // Determine greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <ProtectedRoute permissionCode="dashboard.citizen.view">
            <div className="space-y-8 animate-in fade-in duration-500 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {greeting}, <span className="text-blue-400">{profile?.fullName?.split(' ')[0] || 'Citizen'}</span>
                        </h1>
                        <p className="text-slate-300 mt-1 font-medium flex items-center gap-2">
                            Welcome to Delhi Police Citizen Services
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex gap-3 w-full md:w-auto relative z-10">
                        {/* SOS Button - Highly Visible */}
                        <Link href="/citizen-portal/sos">
                            <Button variant="destructive" size="lg" className={`rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-red-900/20 hover:scale-105 transition-all ${sosActive ? 'animate-pulse bg-red-600' : 'bg-red-500 hover:bg-red-600'}`}>
                                <AlertTriangle className="mr-2 h-6 w-6" />
                                {sosActive ? 'SOS ACTIVE' : 'SOS / EMERGENCY'}
                            </Button>
                        </Link>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="animate-slide-up">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Attention</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* CITIZEN SERVICES GRID */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                        <h2 className="text-xl font-bold text-slate-800">Citizen Services</h2>
                    </div>

                    <Card className="border-none shadow-sm bg-slate-50/50">
                        <CardContent className="p-6 md:p-8">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-8">
                                <ServiceButton href="/citizen-portal/visits/request" icon={<Stethoscope />} label="Recall Beat Officer" color="blue" />
                                <ServiceButton href="/citizen-portal/visits" icon={<Calendar />} label="My Visits" color="indigo" />
                                <ServiceButton href="https://lostfound.delhipolice.gov.in/" target="_blank" icon={<FileQuestion />} label="Lost Report" color="orange" />
                                <ServiceButton href="https://mvt.delhipolice.gov.in/Home.aspx?aspxerrorpath=/welcome.aspx" target="_blank" icon={<Car />} label="MV Theft E-FIR" color="red" />
                                <ServiceButton href="https://cctns.delhipolice.gov.in/citizenservices/missingpersonregistration.htm" target="_blank" icon={<UserX />} label="Missing Person" color="rose" />
                                <ServiceButton href="https://missionvatsalya.wcd.gov.in/" target="_blank" icon={<Search />} label="Track Child" color="amber" />
                                <ServiceButton href="https://zipnet.delhipolice.gov.in/vehiclesmobiles/missingmobiles/" target="_blank" icon={<Smartphone />} label="Stolen Mobile" color="purple" />
                                <ServiceButton href="https://delhipolice.gov.in/viewfir" target="_blank" icon={<FileText />} label="View FIR" color="cyan" />
                                <ServiceButton href="https://pcc.delhipolice.gov.in/" target="_blank" icon={<FileCheck />} label="Police Clearance" color="emerald" />
                                <ServiceButton href="https://cvr.delhipolice.gov.in/" target="_blank" icon={<User />} label="Character Verif." color="teal" />
                                <ServiceButton href="https://cctns.delhipolice.gov.in/citizenservices/login.htm" target="_blank" icon={<Users />} label="Tenant Reg." color="lime" />
                                {/* <ServiceButton href="#" icon={<Shield />} label="Senior Citizen" color="sky" /> */}
                                <ServiceButton href="https://cctns.delhipolice.gov.in/citizenicms/" target="_blank" icon={<FileEdit />} label="Complaint" color="pink" />
                                <ServiceButton href="https://delhipolice.gov.in/downloadforms" target="_blank" icon={<Download />} label="Download Forms" color="gray" />
                                {/* <ServiceButton href="#" icon={<MessageSquare />} label="Feedback" color="fuchsia" /> */}
                                <ServiceButton href="/citizen-portal/profile" icon={<User />} label="My Profile" color="violet" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left: Recent Activity */}
                    <div className="md:col-span-8 space-y-6">
                        <div className="flex items-center gap-2 px-1">
                            <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                            <h2 className="text-lg font-bold text-slate-800">Your Activity</h2>
                        </div>
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-0">
                                {visits.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {visits.slice(0, 3).map((visit: any) => (
                                            <div key={visit.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-full ${getStatusColor(visit.status)}`}>
                                                        <Calendar className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{visit.visitType || 'Routine Visit'}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {new Date(visit.scheduledDate || visit.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`px-3 py-1 ${getStatusColor(visit.status)} border-transparent`}>
                                                    {visit.status}
                                                </Badge>
                                            </div>
                                        ))}
                                        <div className="p-3 bg-slate-50 text-center">
                                            <Link href="/citizen-portal/visits" className="text-sm font-medium text-blue-600 hover:underline">View All Activities</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-slate-500">No recent activity.</p>
                                        <Button variant="link" asChild className="mt-2 text-blue-600">
                                            <Link href="/citizen-portal/visits/request">Schedule a Visit</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Beat Officer & Helplines */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="flex items-center gap-2 px-1">
                            <div className="h-6 w-1 bg-green-500 rounded-full"></div>
                            <h2 className="text-lg font-bold text-slate-800">Assigned Officer</h2>
                        </div>
                        {/* Calculate assigned officer from visits first */}
                        {(() => {
                            // Find active visit with officer (Case insensitive check)
                            const activeVisit = visits.find((v: any) => {
                                const status = v.status?.toLowerCase();
                                return (status === 'scheduled' || status === 'in progress' || status === 'pending') && v.officer;
                            });

                            const assignedVisitOfficer = activeVisit?.officer;

                            // Determine display values
                            const isVisitOfficer = !!assignedVisitOfficer;
                            const title = isVisitOfficer ? "Assigned Officer (Visit)" : "Beat Officer";
                            const name = assignedVisitOfficer?.name || profile?.beat?.beatOfficers?.[0]?.officer?.name || "Unassigned";
                            const contact = assignedVisitOfficer?.mobileNumber || profile?.beat?.beatOfficers?.[0]?.officer?.mobileNumber || "Contact Station";

                            return (
                                <StatusCard
                                    icon={<Shield className="h-6 w-6 text-white" />}
                                    title={title}
                                    value={name}
                                    subtext={contact}
                                    color={isVisitOfficer ? "green" : "blue"}
                                />
                            );
                        })()}

                        <div className="flex items-center gap-2 px-1 mt-6">
                            <h2 className="text-lg font-bold text-slate-800">Emergency Helplines</h2>
                        </div>
                        <Card className="bg-slate-900 text-white border-none shadow-xl">
                            <CardContent className="p-6 space-y-5">
                                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                    <span className="text-slate-300">Police Control Room</span>
                                    <span className="font-bold text-xl text-red-400">112</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                    <span className="text-slate-300">Senior Citizen Helpline</span>
                                    <span className="font-bold text-xl text-yellow-400">1291</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300">Cyber Crime</span>
                                    <span className="font-bold text-xl text-blue-400">1930</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>


            {/* Profile Completion Action Modal */}
            <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Complete Your Profile
                        </DialogTitle>
                        <DialogDescription>
                            Your profile is {completionPercentage}% complete. Completing your profile helps us serve you better and ensures quicker response during emergencies.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Profile Strength</span>
                                <span>{completionPercentage}%</span>
                            </div>
                            <Progress value={completionPercentage} className="h-2" />
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-800 border border-amber-200">
                            <strong>Pending Actions:</strong> Please provide your full address, family details, and emergency contacts to verify your account.
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between gap-2">
                        <Button type="button" variant="ghost" onClick={() => setShowCompletionModal(false)}>
                            Remind Me Later
                        </Button>
                        <Button type="button" onClick={() => router.push('/citizen-portal/profile/complete')}>
                            Complete Profile <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </ProtectedRoute >
    );
}

// Circular Service Button Component
function ServiceButton({ href, icon, label, color, target }: any) {
    const colorClasses: any = {
        blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
        indigo: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
        red: 'bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white',
        orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
        emerald: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
        rose: 'bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
        amber: 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
        purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
        cyan: 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white',
        teal: 'bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white',
        lime: 'bg-lime-100 text-lime-600 group-hover:bg-lime-600 group-hover:text-white',
        pink: 'bg-pink-100 text-pink-600 group-hover:bg-pink-600 group-hover:text-white',
        fuchsia: 'bg-fuchsia-100 text-fuchsia-600 group-hover:bg-fuchsia-600 group-hover:text-white',
        sky: 'bg-sky-100 text-sky-600 group-hover:bg-sky-600 group-hover:text-white',
        violet: 'bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white',
        gray: 'bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white',
    };

    return (
        <Link href={href} target={target} className="group flex flex-col items-center gap-3">
            <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-110 group-hover:shadow-lg ${colorClasses[color] || colorClasses.blue}`}>
                <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-700 text-center leading-tight max-w-[90px] group-hover:text-blue-700 transition-colors">
                {label}
            </span>
        </Link>
    );
}

function StatusCard({ icon, title, value, subtext, color, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={`p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg overflow-hidden relative ${onClick ? 'cursor-pointer hover:shadow-xl transition-all' : ''}`}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="relative z-10 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md">
                    {icon}
                </div>
                <div>
                    <h3 className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1 opacity-80">{title}</h3>
                    <p className="text-xl font-bold tracking-tight">{value}</p>
                    <p className="text-sm text-blue-100 mt-1">{subtext}</p>
                </div>
            </div>
        </div>
    );
}



function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case 'completed': return 'bg-green-100 text-green-700';
        case 'pending': return 'bg-amber-100 text-amber-700';
        case 'cancelled': return 'bg-red-100 text-red-700';
        case 'scheduled': return 'bg-blue-100 text-blue-700';
        default: return 'bg-slate-100 text-slate-700';
    }
}

function DashboardLoadingSkeleton() {
    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border p-6 rounded-2xl">
                <div className="space-y-2 w-full">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-12 w-32 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-32 rounded-xl" />
                        <Skeleton className="h-32 rounded-xl" />
                        <Skeleton className="h-32 rounded-xl" />
                    </div>
                    <Skeleton className="h-64 rounded-xl" />
                </div>
                <div className="md:col-span-4 space-y-6">
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-40 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
