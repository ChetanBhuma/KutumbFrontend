'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';

export default function OfficerLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { loginAsOfficer } = useAuth();
    const [step, setStep] = useState<'BADGE' | 'OTP'>('BADGE');
    const [loading, setLoading] = useState(false);
    const [badgeNumber, setBadgeNumber] = useState('');
    const [otp, setOtp] = useState('');

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!badgeNumber) {
            toast({
                title: "Error",
                description: "Please enter your PIS number",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            await loginAsOfficer({ badgeNumber });
            toast({
                title: "OTP Sent",
                description: "Please check your registered mobile number",
            });
            setStep('OTP');
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Login Failed",
                description: error.message || "Could not send OTP. Please check PIS number.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            toast({
                title: "Error",
                description: "Please enter valid 6-digit OTP",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            await loginAsOfficer({ badgeNumber, otp });
            toast({
                title: "Success",
                description: "Logged in successfully",
            });
            router.push('/officer-app/dashboard');
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid OTP",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-slate-900">Officer Portal</CardTitle>
                        <CardDescription>Delhi Police Senior Citizen Safety Initiative</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {step === 'BADGE' ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="badge">PIS Number</Label>
                                <Input
                                    id="badge"
                                    placeholder="Enter your PIS number"
                                    value={badgeNumber}
                                    onChange={(e) => setBadgeNumber(e.target.value)}
                                    disabled={loading}
                                    className="h-12"
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Send OTP
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Enter OTP</Label>
                                <Input
                                    id="otp"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    disabled={loading}
                                    className="h-12 text-center text-lg tracking-widest"
                                    autoFocus
                                />
                                <p className="text-sm text-muted-foreground text-center">
                                    OTP sent to registered mobile for PIS number {badgeNumber}
                                </p>
                            </div>
                            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                                Verify & Login
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => setStep('BADGE')}
                                disabled={loading}
                            >
                                Back to PIS Number
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
