'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Shield, Phone, Mail, Map, Smartphone } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/protected-route';

function OfficerProfileContent() {
    const [loading, setLoading] = useState(true);
    const [officer, setOfficer] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await apiClient.getOfficerProfile();
                if (res.success) {
                    setOfficer(res.data.officer);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!officer) return <div className="p-4 text-center">Profile not found</div>;

    return (
        <div className="p-4 space-y-4 pb-20 bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

            <Card>
                <CardHeader className="flex flex-col items-center pb-2">
                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                        <User className="h-12 w-12 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl text-center">{officer.name}</CardTitle>
                    <Badge className="mt-2 bg-blue-600 hover:bg-blue-700">{officer.rank}</Badge>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <Shield className="h-5 w-5 text-slate-500" />
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">PIS Number</p>
                                <p className="font-medium">{officer.badgeNumber}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <Smartphone className="h-5 w-5 text-slate-500" />
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Mobile Number</p>
                                <p className="font-medium">{officer.mobileNumber}</p>
                            </div>
                        </div>

                        {officer.email && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <Mail className="h-5 w-5 text-slate-500" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                                    <p className="font-medium truncate">{officer.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <Map className="h-5 w-5 text-slate-500" />
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Assigned Beat</p>
                                <p className="font-medium">
                                    {officer.Beat?.name || 'Unassigned'}
                                    <span className="text-muted-foreground mx-1">•</span>
                                    {officer.PoliceStation?.name}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center text-xs text-muted-foreground pt-8">
                App Version 1.0.0
            </div>
        </div>
    );
}

export default function OfficerProfilePage() {
    return (
        <ProtectedRoute permissionCode="profile.read.own">
            <OfficerProfileContent />
        </ProtectedRoute>
    );
}
