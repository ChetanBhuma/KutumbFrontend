'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Shield, Phone, Mail, MapPin, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

interface OfficerProfile {
    id: string;
    name: string;
    rank: string;
    badgeNumber: string;
    mobileNumber: string;
    email: string | null;
    policeStation: { name: string };
    beat: { name: string } | null;
}

export default function OfficerProfileView() {
    const router = useRouter();
    const { logout } = useAuth();
    const [profile, setProfile] = useState<OfficerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await apiClient.getOfficerProfile();
                if (res.success) {
                    setProfile(res.data.officer);
                }
            } catch (error) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
        toast.success('Logged out successfully');
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (!profile) return <div className="p-4">Profile not found</div>;

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

            <Card className="border-t-4 border-t-primary">
                <CardContent className="pt-6 text-center">
                    <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
                        <User className="w-12 h-12 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                    <p className="text-slate-500 font-medium">{profile.rank}</p>
                    <div className="flex justify-center mt-2">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-mono">
                            {profile.badgeNumber}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Official Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                        <Shield className="w-5 h-5 text-primary mr-3" />
                        <div>
                            <p className="text-xs text-slate-500">Police Station</p>
                            <p className="font-medium">{profile.policeStation.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-primary mr-3" />
                        <div>
                            <p className="text-xs text-slate-500">Assigned Beat</p>
                            <p className="font-medium">{profile.beat?.name || 'Unassigned'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Mobile Number</Label>
                        <div className="flex items-center">
                            <Phone className="w-4 h-4 text-slate-400 mr-2" />
                            <Input value={profile.mobileNumber} readOnly className="bg-slate-50" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="flex items-center">
                            <Mail className="w-4 h-4 text-slate-400 mr-2" />
                            <Input value={profile.email || 'Not registered'} readOnly className="bg-slate-50" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        To update these details, please contact the administrator.
                    </p>
                </CardContent>
            </Card>

            <Button
                variant="destructive"
                className="w-full h-12 text-lg"
                onClick={handleLogout}
            >
                <LogOut className="w-5 h-5 mr-2" /> Logout
            </Button>
        </div>
    );
}
