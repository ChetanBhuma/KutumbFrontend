'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Download,
    Printer,
    ArrowLeft,
    CreditCard,
    Shield,
    Phone,
    MapPin,
    Calendar,
    User,
    Loader2
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';

interface Citizen {
    id: string;
    fullName: string;
    dateOfBirth: string;
    age: number;
    gender: string;
    mobileNumber: string;
    permanentAddress: string;
    photoUrl?: string;
    bloodGroup?: string;
    srCitizenUniqueId?: string;
    digitalCardNumber?: string;
    digitalCardIssueDate?: string;
    policeStation?: { name: string; code: string };
    beat?: { name: string };
    emergencyContacts?: Array<{ name: string; mobileNumber: string; relation: string }>;
}

export default function CitizenCardPage() {
    const params = useParams();
    const router = useRouter();
    const cardRef = useRef<HTMLDivElement>(null);

    const [citizen, setCitizen] = useState<Citizen | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchCitizen(params.id as string);
        }
    }, [params.id]);

    const fetchCitizen = async (id: string) => {
        try {
            setLoading(true);
            const response = await apiClient.getCitizenById(id);
            if (response.success) {
                setCitizen(response.data.citizen);
            }
        } catch (error) {
            console.error('Failed to fetch citizen:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;

        try {
            setDownloading(true);
            const canvas = await html2canvas(cardRef.current, {
                scale: 3, // High quality for printing
                backgroundColor: '#ffffff',
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `senior-citizen-card-${citizen?.srCitizenUniqueId || citizen?.id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to download card:', error);
        } finally {
            setDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <ProtectedRoute permissionCode="citizens.read">
                <DashboardLayout title="Senior Citizen Card" description="Digital ID Card" currentPath="/approvals">
                    <div className="flex items-center justify-center h-96">
                        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!citizen) {
        return (
            <ProtectedRoute permissionCode="citizens.read">
                <DashboardLayout title="Senior Citizen Card" description="Digital ID Card" currentPath="/approvals">
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-muted-foreground">Citizen not found</p>
                            <Button onClick={() => router.back()} className="mt-4">
                                Go Back
                            </Button>
                        </CardContent>
                    </Card>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const primaryEmergencyContact = citizen.emergencyContacts?.find(c => c.relation === 'Son' || c.relation === 'Daughter') || citizen.emergencyContacts?.[0];

    return (
        <ProtectedRoute permissionCode="citizens.read">
            <DashboardLayout
                title="Senior Citizen Card"
                description="Digital ID Card Preview & Download"
                currentPath="/approvals"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <CreditCard className="h-8 w-8" />
                            Senior Citizen ID Card
                        </h1>
                        <p className="text-muted-foreground">Preview and download the digital ID card</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button onClick={handleDownload} disabled={downloading}>
                            {downloading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 mr-2" />
                            )}
                            Download Card
                        </Button>
                    </div>
                </div>

                {/* Card Info */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Card Dimensions:</strong> 85.6mm × 53.98mm (Standard PVC Card Size - CR80)
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                        <strong>Print Settings:</strong> Use high-quality PVC card printer at 300 DPI for best results
                    </p>
                </div>

                {/* Card Preview Container */}
                <div className="flex justify-center">
                    <div className="print:p-0">
                        {/* Front Side */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4 print:hidden">Card Front</h2>
                            <div
                                ref={cardRef}
                                className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-lg shadow-2xl overflow-hidden"
                                style={{
                                    width: '856px', // 85.6mm at 10px/mm
                                    height: '540px', // 53.98mm at 10px/mm
                                }}
                            >
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
                                </div>

                                {/* Header */}
                                <div className="relative px-8 py-6 bg-white/10 backdrop-blur-sm border-b border-white/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Shield className="h-12 w-12 text-white" />
                                            <div>
                                                <h3 className="text-white font-bold text-xl">DELHI POLICE</h3>
                                                <p className="text-white/90 text-sm">Senior Citizen ID Card</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white/90 text-xs">Card No.</p>
                                            <p className="text-white font-mono text-sm font-semibold">
                                                {citizen.digitalCardNumber || citizen.srCitizenUniqueId || 'PENDING'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="relative px-8 py-6">
                                    <div className="flex gap-6">
                                        {/* Photo */}
                                        <div className="flex-shrink-0">
                                            <div className="w-32 h-40 bg-white rounded-lg overflow-hidden border-4 border-white/30 shadow-lg">
                                                {citizen.photoUrl ? (
                                                    <img
                                                        src={citizen.photoUrl}
                                                        alt={citizen.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                        <User className="h-16 w-16 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <p className="text-white/70 text-xs uppercase tracking-wide">Full Name</p>
                                                <p className="text-white font-bold text-2xl">{citizen.fullName}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-white/70 text-xs uppercase tracking-wide">Date of Birth</p>
                                                    <p className="text-white font-semibold">
                                                        {format(new Date(citizen.dateOfBirth), 'dd MMM yyyy')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-white/70 text-xs uppercase tracking-wide">Age / Gender</p>
                                                    <p className="text-white font-semibold">{citizen.age} yrs / {citizen.gender}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/70 text-xs uppercase tracking-wide">Blood Group</p>
                                                    <p className="text-white font-semibold">{citizen.bloodGroup || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/70 text-xs uppercase tracking-wide">Mobile</p>
                                                    <p className="text-white font-semibold">{citizen.mobileNumber}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-white/70 text-xs uppercase tracking-wide">Address</p>
                                                <p className="text-white font-medium text-sm line-clamp-2">{citizen.permanentAddress}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-white/70 text-xs uppercase tracking-wide">Police Station</p>
                                                    <p className="text-white font-semibold text-sm">{citizen.policeStation?.name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/70 text-xs uppercase tracking-wide">Beat</p>
                                                    <p className="text-white font-semibold text-sm">{citizen.beat?.name || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-0 left-0 right-0 px-8 py-4 bg-white/10 backdrop-blur-sm border-t border-white/20">
                                    <div className="flex justify-between items-center text-white/90 text-xs">
                                        <div>
                                            <p>Issue Date: {citizen.digitalCardIssueDate ? format(new Date(citizen.digitalCardIssueDate), 'dd MMM yyyy') : 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">Delhi Police - Senior Citizens Division</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Back Side */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4 print:hidden">Card Back</h2>
                            <div
                                className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-2xl overflow-hidden"
                                style={{
                                    width: '856px',
                                    height: '540px',
                                }}
                            >
                                {/* Emergency Contact */}
                                <div className="px-8 py-6">
                                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
                                        <h3 className="text-red-700 font-bold text-xl mb-4 flex items-center gap-2">
                                            <Phone className="h-6 w-6" />
                                            Emergency Contact
                                        </h3>
                                        {primaryEmergencyContact ? (
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-red-600 text-sm font-semibold">Name</p>
                                                    <p className="text-gray-900 font-bold text-lg">{primaryEmergencyContact.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-red-600 text-sm font-semibold">Relation</p>
                                                    <p className="text-gray-900 font-semibold">{primaryEmergencyContact.relation}</p>
                                                </div>
                                                <div>
                                                    <p className="text-red-600 text-sm font-semibold">Mobile Number</p>
                                                    <p className="text-gray-900 font-bold text-xl">{primaryEmergencyContact.mobileNumber}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-600">No emergency contact available</p>
                                        )}
                                    </div>

                                    {/* Important Numbers */}
                                    <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 mb-6">
                                        <h3 className="text-blue-700 font-bold text-lg mb-3">Important Numbers</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-blue-600 font-semibold">Police Emergency</p>
                                                <p className="text-gray-900 font-bold text-lg">100</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-600 font-semibold">Ambulance</p>
                                                <p className="text-gray-900 font-bold text-lg">102</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-600 font-semibold">Senior Citizen Helpline</p>
                                                <p className="text-gray-900 font-bold text-lg">1091</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-600 font-semibold">Women Helpline</p>
                                                <p className="text-gray-900 font-bold text-lg">1090</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4">
                                        <p className="text-yellow-800 text-xs font-semibold mb-2">Important Instructions:</p>
                                        <ul className="text-yellow-900 text-xs space-y-1 list-disc list-inside">
                                            <li>This card is the property of Delhi Police</li>
                                            <li>Carry this card at all times for identification</li>
                                            <li>Report immediately if lost or stolen</li>
                                            <li>Not transferable to any other person</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-0 left-0 right-0 px-8 py-4 bg-gray-800 text-white">
                                    <div className="flex justify-between items-center text-xs">
                                        <div>
                                            <p>ID: {citizen.srCitizenUniqueId || citizen.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">For assistance, contact your local police station</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Styles */}
                <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #card-container, #card-container * {
              visibility: visible;
            }
            #card-container {
              position: absolute;
              left: 0;
              top: 0;
            }
            @page {
              size: 85.6mm 53.98mm;
              margin: 0;
            }
          }
        `}</style>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
