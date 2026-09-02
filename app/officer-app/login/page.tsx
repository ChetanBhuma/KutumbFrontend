'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, ArrowRight, ArrowLeft, KeyRound, BadgeCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { AuthShell } from '@/components/auth/auth-shell';

export default function OfficerLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { loginAsOfficer } = useAuth();
    const [step, setStep] = useState<'BADGE' | 'OTP'>('BADGE');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [badgeNumber, setBadgeNumber] = useState('');
    const [otp, setOtp] = useState('');

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!badgeNumber.trim()) {
            setError('Please enter your valid PIS number');
            return;
        }

        try {
            setLoading(true);
            await loginAsOfficer({ badgeNumber: badgeNumber.trim() });
            toast({
                title: "OTP Sent",
                description: "Please check your registered mobile number",
            });
            setStep('OTP');
        } catch (err: any) {
            console.error(err);
            const msg = err.message || "Could not send OTP. Please check your PIS number.";
            setError(msg);
            toast({
                title: "Login Failed",
                description: msg,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!otp || otp.length < 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            await loginAsOfficer({ badgeNumber: badgeNumber.trim(), otp });
            toast({
                title: "Success",
                description: "Logged in successfully",
            });
            router.push('/officer-app/dashboard');
        } catch (err: any) {
            console.error(err);
            const msg = err.message || "Invalid OTP. Please try again.";
            setError(msg);
            toast({
                title: "Verification Failed",
                description: msg,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Senior Citizen Portal"
            subtitle="Delhi Police - Beat Officer Access"
            headerTitle="Senior Citizen Portal"
            headerAction={{
                label: "Citizen Login",
                href: "/citizen-portal/login",
                variant: "outline"
            }}
        >
            <Card className="shadow-2xl border-slate-700/80 bg-[#0c182b]/90 backdrop-blur-2xl text-slate-100 rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-6 md:pt-8">
                    {error && (
                        <Alert variant="destructive" className="mb-6 bg-rose-950/60 border-rose-800 text-rose-200 animate-slide-up">
                            <AlertCircle className="h-4 w-4 text-rose-400" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {step === 'BADGE' ? (
                        <form onSubmit={handleSendOTP} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="badge" className="text-slate-200 font-medium text-sm">Police Identification (PIS) Number</Label>
                                <div className="relative group">
                                    <BadgeCheck className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                    <Input
                                        id="badge"
                                        placeholder="Enter your PIS number"
                                        value={badgeNumber}
                                        onChange={(e) => setBadgeNumber(e.target.value.toUpperCase())}
                                        disabled={loading}
                                        required
                                        className="pl-10 h-11 bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 transition-all uppercase font-mono"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-slate-400">
                                    We will verify your officer record and send an authentication OTP to your registered phone.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-bold shadow-[0_0_20px_rgba(15,82,186,0.4)] hover:shadow-[0_0_25px_rgba(15,82,186,0.6)] hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white"
                                disabled={loading || !badgeNumber.trim()}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Verifying Officer ID...
                                    </>
                                ) : (
                                    <>
                                        Send OTP <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="otp" className="text-slate-200 font-medium text-sm">Enter 6-Digit OTP</Label>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-xs text-blue-300 hover:text-blue-200"
                                        onClick={() => {
                                            setStep('BADGE');
                                            setOtp('');
                                            setError('');
                                        }}
                                        type="button"
                                    >
                                        Change PIS
                                    </Button>
                                </div>
                                <div className="relative group">
                                    <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                    <Input
                                        id="otp"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        disabled={loading}
                                        required
                                        maxLength={6}
                                        className="pl-10 h-11 bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 transition-all tracking-widest font-mono text-lg"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-slate-400">
                                    OTP sent to registered mobile for PIS: <span className="font-semibold text-white font-mono">{badgeNumber}</span>
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full sm:flex-1 h-11 border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white"
                                    onClick={() => {
                                        setStep('BADGE');
                                        setOtp('');
                                        setError('');
                                    }}
                                    disabled={loading}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full sm:flex-[2] h-11 text-base font-bold shadow-[0_0_20px_rgba(15,82,186,0.4)] hover:shadow-[0_0_25px_rgba(15,82,186,0.6)] hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white"
                                    disabled={loading || otp.length < 6}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Login'
                                    )}
                                </Button>
                            </div>

                            <div className="text-center">
                                <p className="text-xs text-slate-400">
                                    Didn't receive code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        disabled={loading}
                                        className="text-blue-300 hover:text-blue-200 hover:underline font-medium"
                                    >
                                        Resend OTP
                                    </button>
                                </p>
                            </div>
                        </form>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 bg-slate-900/60 border-t border-slate-800/80 p-4 sm:p-6">
                    <div className="text-center text-sm text-slate-400">
                        Admin or Supervisory Officer?{' '}
                        <Link href="/admin/login" className="font-bold text-blue-300 hover:text-blue-200 hover:underline">
                            Staff / Admin Login
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </AuthShell>
    );
}
