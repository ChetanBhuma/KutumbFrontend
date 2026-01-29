'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, Phone, MapPin, Calendar, Clock, AlertTriangle, User, Home, HeartPulse, Users, FileText, Shield, Briefcase, GraduationCap, Heart, Stethoscope, Mail, Accessibility } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import MapComponent from '@/components/MapComponent';
import ProfileUpdateDialog from '@/components/officer-app/profile-update-dialog';

const InfoRow = ({ icon: Icon, label, value, sub }: any) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-2 border-b last:border-0 border-dashed">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-slate-900">{value}</p>
                {sub && <p className="text-xs text-slate-500">{sub}</p>}
            </div>
        </div>
    );
};

export default function CitizenDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [citizen, setCitizen] = useState<any>(null);

    useEffect(() => {
        const fetchCitizen = async () => {
            try {
                const result = await apiClient.getCitizenById(id);
                if (result.data?.citizen) {
                    setCitizen(result.data.citizen);
                }
            } catch (error) {
                toast({ title: "Error", description: "Failed to load citizen details", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        fetchCitizen();
    }, [id]);

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

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    if (!citizen) return <div className="text-center p-8">Citizen not found</div>;

    const getVulnerabilityColor = (level: string) => {
        switch (level) {
            case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-8">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b shadow-sm">
                <div className="flex items-center gap-2 p-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                    <h1 className="font-semibold text-lg text-slate-800">Citizen Profile</h1>
                </div>
            </header>

            <main className="p-4 space-y-4">
                {/* Profile Card */}
                <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                        <div className="absolute -bottom-10 left-4">
                            <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                                <AvatarImage src={citizen.photoUrl} />
                                <AvatarFallback className="text-xl font-bold bg-slate-200">{citizen.fullName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <div className="pt-12 px-4 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{citizen.fullName}</h2>
                                <p className="text-sm text-muted-foreground">{citizen.age} Years • {citizen.gender}</p>
                            </div>
                            <Badge variant="outline" className={`${getVulnerabilityColor(citizen.vulnerabilityLevel)}`}>
                                {citizen.vulnerabilityLevel}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <Button variant="outline" className="w-full text-xs" onClick={() => window.location.href = `tel:${citizen.mobileNumber}`}>
                                <Phone className="h-3.5 w-3.5 mr-2 text-green-600" /> Call
                            </Button>
                            <ProfileUpdateDialog citizen={citizen} onUpdate={() => { }} />
                        </div>
                    </div>
                </Card>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="visits">Visits</TabsTrigger>
                        <TabsTrigger value="map">Location</TabsTrigger>
                    </TabsList>

                    {/* Overview Content */}
                    <TabsContent value="overview" className="space-y-4 pt-4">

                        {/* 1. Basic & Personal */}
                        <Card>
                            <CardHeader className="pb-2 bg-slate-50/50"><CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2"><User className="h-4 w-4" /> Personal Details</CardTitle></CardHeader>
                            <CardContent className="pt-4 space-y-1">
                                <InfoRow icon={Briefcase} label="Occupation" value={citizen.occupation} sub={citizen.retiredFrom ? `Retired from ${citizen.retiredFrom}` : citizen.specialization} />
                                <InfoRow icon={GraduationCap} label="Education" value={citizen.education} />
                                <InfoRow icon={Heart} label="Marital Status" value={citizen.maritalStatus} />
                                <InfoRow icon={User} label="Religion" value={citizen.religion} />
                                <InfoRow icon={Clock} label="Free Time" value={citizen.freeTime} />
                            </CardContent>
                        </Card>

                        {/* 2. Contact & Address */}
                        <Card>
                            <CardHeader className="pb-2 bg-slate-50/50"><CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2"><MapPin className="h-4 w-4" /> Contact & Address</CardTitle></CardHeader>
                            <CardContent className="pt-4 space-y-1">
                                <InfoRow icon={Phone} label="Mobile" value={citizen.mobileNumber} sub="Primary" />
                                <InfoRow icon={Phone} label="Alternate" value={citizen.alternateMobile} />
                                <InfoRow icon={Phone} label="WhatsApp" value={citizen.whatsappNumber} />
                                <InfoRow icon={Mail} label="Email" value={citizen.email} />
                                <InfoRow icon={MapPin} label="Permanent Address" value={citizen.permanentAddress} sub={`${citizen.city || ''} ${citizen.pincode || ''}`} />
                                <InfoRow icon={MapPin} label="Present Address" value={citizen.presentAddress} />
                                <InfoRow icon={MapPin} label="Jurisdiction" value={citizen.PoliceStation?.name} sub={citizen.District?.name} />
                            </CardContent>
                        </Card>

                        {/* 3. Family & Spouse */}
                        <Card>
                            <CardHeader className="pb-2 bg-slate-50/50"><CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Users className="h-4 w-4" /> Family Details</CardTitle></CardHeader>
                            <CardContent className="pt-4 space-y-1">
                                <InfoRow icon={Home} label="Residing With" value={citizen.residingWith} />
                                <InfoRow icon={Users} label="Family Type" value={citizen.familyType} />
                                {citizen.SpouseDetails && (
                                    <>
                                        <div className="py-2"><p className="text-xs font-bold text-slate-900 uppercase">Spouse</p></div>
                                        <InfoRow icon={User} label="Name" value={citizen.SpouseDetails.fullName || citizen.spouseName} />
                                        <InfoRow icon={Phone} label="Mobile" value={citizen.SpouseDetails.mobileNumber || citizen.spouseMobile} />
                                        <InfoRow icon={Home} label="Living Together" value={citizen.SpouseDetails.isLivingTogether ? 'Yes' : 'No'} sub={citizen.SpouseDetails.addressIfNotTogether} />
                                    </>
                                )}
                                {citizen.FamilyMember?.length > 0 && (
                                    <div className="pt-4">
                                        <p className="text-xs font-bold text-slate-900 uppercase mb-2">Other Members</p>
                                        <div className="space-y-2">
                                            {citizen.FamilyMember.map((m: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                                                    <div>
                                                        <p className="font-medium text-sm">{m.name} <span className="text-xs text-muted-foreground">({m.relation})</span></p>
                                                        <p className="text-xs text-slate-500">{m.age} Yrs • {m.mobileNumber}</p>
                                                    </div>
                                                    {m.mobileNumber &&
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => window.location.href = `tel:${m.mobileNumber}`}><Phone className="h-3 w-3" /></Button>
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 4. Health */}
                        <Card>
                            <CardHeader className="pb-2 bg-slate-50/50"><CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Health Profile</CardTitle></CardHeader>
                            <CardContent className="pt-4 space-y-1">
                                <InfoRow icon={Heart} label="Blood Group" value={citizen.bloodGroup} />
                                <InfoRow icon={AlertTriangle} label="Conditions" value={citizen.healthConditions?.join(', ')} />
                                <InfoRow icon={Accessibility} label="Mobility" value={citizen.mobilityStatus} sub={citizen.mobilityConstraints} />
                                <InfoRow icon={Stethoscope} label="Regular Doctor" value={citizen.regularDoctor} sub={citizen.doctorContact} />
                                {citizen.MedicalHistory?.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-xs font-bold text-slate-900 uppercase mb-2">History</p>
                                        <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
                                            {citizen.MedicalHistory.map((h: any, i: number) => (
                                                <li key={i}>{h.condition} ({h.year}) - {h.treatment}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 5. Emergency Contacts */}
                        {citizen.EmergencyContact?.length > 0 && (
                            <Card>
                                <CardHeader className="pb-2 bg-slate-50/50"><CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Emergency Contacts</CardTitle></CardHeader>
                                <CardContent className="pt-4 space-y-2">
                                    {citizen.EmergencyContact.map((ec: any) => (
                                        <div key={ec.id} className="flex justify-between items-center border p-2 rounded bg-red-50/30 border-red-100">
                                            <div>
                                                <p className="font-medium text-sm text-slate-900">{ec.name} <span className="text-xs text-muted-foreground">({ec.relation})</span></p>
                                                <p className="text-xs text-slate-600">{ec.mobileNumber}</p>
                                            </div>
                                            <Button size="icon" variant="outline" className="h-8 w-8 bg-white text-red-600 border-red-200" onClick={() => window.location.href = `tel:${ec.mobileNumber}`}>
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* 6. Household Staff */}
                        {citizen.HouseholdHelp?.length > 0 && (
                            <Card>
                                <CardHeader className="pb-2 bg-slate-50/50"><CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Household Staff</CardTitle></CardHeader>
                                <CardContent className="pt-4 space-y-2">
                                    {citizen.HouseholdHelp.map((staff: any, i: number) => (
                                        <div key={i} className="border p-2 rounded flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-sm">{staff.name} <span className="text-xs text-slate-500">({staff.staffType})</span></p>
                                                <p className="text-xs">{staff.mobileNumber}</p>
                                            </div>
                                            {staff.idProofUrl && (
                                                <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-600" onClick={() => viewDocument(staff.idProofUrl)}>View ID</Button>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* 7. Documents */}
                        {(citizen.addressProofUrl || citizen.idProofUrl) && (
                            <Card>
                                <CardHeader className="pb-2 bg-slate-50/50"><CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2"><FileText className="h-4 w-4" /> Documents</CardTitle></CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    {citizen.addressProofUrl && (
                                        <div className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-green-600" />
                                                <div>
                                                    <p className="font-medium text-sm text-slate-900">Address Proof</p>
                                                    <p className="text-xs text-muted-foreground">Verified Document</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => viewDocument(citizen.addressProofUrl)}>
                                                Preview
                                            </Button>
                                        </div>
                                    )}
                                    {citizen.idProofUrl && (
                                        <div className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-sm text-slate-900">ID Proof</p>
                                                    <p className="text-xs text-muted-foreground">Identity Document</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => viewDocument(citizen.idProofUrl)}>
                                                Preview
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Visits Content */}
                    <TabsContent value="visits" className="space-y-4 pt-4">
                        {citizen.Visit?.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">No visit history found.</div>
                        ) : (
                            citizen.Visit?.map((visit: any) => (
                                <Card key={visit.id} className="border-l-4 border-l-primary">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between mb-2">
                                            <Badge variant="secondary">{visit.visitType}</Badge>
                                            <span className="text-xs text-muted-foreground">{format(new Date(visit.scheduledDate), 'dd MMM yyyy')}</span>
                                        </div>
                                        <p className="font-medium text-sm text-slate-900 mb-1">{visit.status}</p>
                                        {visit.officer && <p className="text-xs text-slate-500">Officer: {visit.officer.name}</p>}
                                        {visit.riskScore && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-500" style={{ width: `${visit.riskScore}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{visit.riskScore}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* Map Content */}
                    <TabsContent value="map" className="pt-4 h-[400px]">
                        <Card className="h-full overflow-hidden">
                            {citizen.gpsLatitude && citizen.gpsLongitude ? (
                                <MapComponent
                                    height="100%"
                                    center={{ lat: citizen.gpsLatitude, lng: citizen.gpsLongitude }}
                                    zoom={15}
                                    markers={[{
                                        position: { lat: citizen.gpsLatitude, lng: citizen.gpsLongitude },
                                        title: citizen.fullName,
                                        label: 'C'
                                    }]}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">GPS Location not available</div>
                            )}
                        </Card>
                        <div className="mt-4">
                            <Button className="w-full" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${citizen.gpsLatitude},${citizen.gpsLongitude}`)} disabled={!citizen.gpsLatitude}>
                                <MapPin className="mr-2 h-4 w-4" /> Get Directions
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
