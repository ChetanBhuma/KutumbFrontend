'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Smartphone, AlertCircle, FileText, ArrowRight, ArrowLeft, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { AuthShell } from '@/components/auth/auth-shell';

export default function CitizenLoginPage() {
    const router = useRouter();
    const { loginWithOTP } = useAuth();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<React.ReactNode>('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mobileNumber.length !== 10) {
                throw new Error('Please enter a valid 10-digit mobile number');
            }
            if (!password) {
                throw new Error('Please enter your password');
            }

            const result = await apiClient.loginCitizen({ mobileNumber, password });

            // Handle both nested tokens (standard) and flat tokens (legacy/fallback)
            const tokens = result.data?.tokens || (result.data?.accessToken ? result.data : null);

            if (result.success && tokens) {
                // Store tokens
                localStorage.setItem('accessToken', tokens.accessToken);
                localStorage.setItem('refreshToken', tokens.refreshToken);

                // Also update default tokens for apiClient to work for subsequent requests
                apiClient.setAccessToken(tokens.accessToken);
                apiClient.setRefreshToken(tokens.refreshToken);

                // Set user type for checks
                localStorage.setItem('userType', 'citizen');

                // Store user data if available to avoid immediate refetch
                if (result.data.citizen) {
                    const user = {
                        id: result.data.citizen.id,
                        name: result.data.citizen.fullName,
                        mobile: result.data.citizen.mobileNumber,
                        role: 'CITIZEN',
                        permissions: ['*']
                    };
                    localStorage.setItem('kutumb-app-user', JSON.stringify(user));
                }

                // Force a full page reload to ensure AuthContext picks up the new session
                window.location.href = '/citizen-portal/dashboard';
            } else {
                throw new Error(result.message || 'Login failed');
            }
        } catch (err: any) {
            console.error('Login failed', err);
            setError(err?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mobileNumber.length !== 10) {
                throw new Error('Please enter a valid 10-digit mobile number');
            }

            // First, check if the mobile number is registered
            try {
                const checkResponse = await apiClient.checkCitizenRegistration(mobileNumber);

                // If not registered, redirect to registration page
                if (!checkResponse.data?.isRegistered) {
                    router.push(`/citizen-portal/register?mobile=${mobileNumber}`);
                    return;
                }
            } catch (checkError: any) {
                console.warn('Registration check failed, proceeding with OTP:', checkError);
            }

            // Mobile number is registered, send OTP
            const response = await apiClient.sendCitizenOTP(mobileNumber);

            setStep('otp');
        } catch (err: any) {
            console.error('Failed to send OTP', err);
            const apiMessage = err.response?.data?.message;
            const msg = apiMessage || err?.message || 'Failed to send OTP. Please try again.';

            if (msg.toLowerCase().includes('not registered') || err.response?.status === 404) {
                router.push(`/citizen-portal/register?mobile=${mobileNumber}`);
                return;
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (otp.length !== 6) {
                throw new Error('Please enter a valid 6-digit OTP');
            }

            // Verify OTP using citizen-specific endpoint
            const result = await apiClient.verifyCitizenOTP(mobileNumber, otp);

            if (result.success && result.data?.tokens) {
                localStorage.setItem('accessToken', result.data.tokens.accessToken);
                localStorage.setItem('refreshToken', result.data.tokens.refreshToken);

                apiClient.setAccessToken(result.data.tokens.accessToken);
                apiClient.setRefreshToken(result.data.tokens.refreshToken);

                localStorage.setItem('userType', 'citizen');

                if (result.data.citizen) {
                    const user = {
                        id: result.data.citizen.id,
                        name: result.data.citizen.fullName,
                        mobile: result.data.citizen.mobileNumber,
                        role: 'CITIZEN',
                        permissions: ['*']
                    };
                    localStorage.setItem('kutumb-app-user', JSON.stringify(user));
                }

                window.location.href = '/citizen-portal/dashboard';
            } else {
                throw new Error(result.message || 'Verification failed');
            }
        } catch (err: any) {
            console.error('Login failed', err);
            setError(err?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Senior Citizen Portal"
            subtitle="Delhi Police - Citizen Access"
            headerTitle="Senior Citizen Portal"
            headerAction={{
                label: "Officer Portal",
                href: "/admin/login",
                variant: "default"
            }}
        >
            <Card className="shadow-2xl border-slate-700/80 bg-[#0c182b]/90 backdrop-blur-2xl text-slate-100 rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-6 md:pt-8">
                    {step === 'phone' && authMethod === 'otp' ? (
                        <form onSubmit={handleSendOTP} className="space-y-5">
                            {error && (
                                <Alert variant="destructive" className="mb-6 bg-rose-950/60 border-rose-800 text-rose-200 animate-slide-up">
                                    <AlertCircle className="h-4 w-4 text-rose-400" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="mobile" className="text-slate-200 font-medium text-sm">Mobile Number</Label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                    <Input
                                        id="mobile"
                                        placeholder="Enter 10-digit mobile number"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        required
                                        disabled={loading}
                                        className="pl-10 h-11 bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 transition-all font-mono"
                                        type="tel"
                                        maxLength={10}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-slate-400">
                                    We will send a 6-digit OTP to verify your registered phone number.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-bold shadow-[0_0_20px_rgba(15,82,186,0.4)] hover:shadow-[0_0_25px_rgba(15,82,186,0.6)] hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white"
                                disabled={loading || mobileNumber.length < 10}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Send OTP <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setAuthMethod('password')}
                                    className="text-sm text-blue-300 hover:text-blue-200 hover:underline font-medium"
                                >
                                    Login with Password instead
                                </button>
                            </div>
                        </form>
                    ) : authMethod === 'password' ? (
                        <form onSubmit={handlePasswordLogin} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            {error && (
                                <Alert variant="destructive" className="mb-6 bg-rose-950/60 border-rose-800 text-rose-200 animate-slide-up">
                                    <AlertCircle className="h-4 w-4 text-rose-400" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mobile-pwd" className="text-slate-200 font-medium text-sm">Mobile Number</Label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            id="mobile-pwd"
                                            placeholder="Enter 10-digit mobile number"
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            required
                                            disabled={loading}
                                            className="pl-10 h-11 bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 transition-all font-mono"
                                            type="tel"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="password" className="text-slate-200 font-medium text-sm">Password</Label>
                                        <Link href="/forgot-password" className="text-xs text-blue-300 hover:text-blue-200 hover:underline">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            id="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                            className="pl-10 pr-10 h-11 bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 transition-all"
                                            type={showPassword ? "text" : "password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-bold shadow-[0_0_20px_rgba(15,82,186,0.4)] hover:shadow-[0_0_25px_rgba(15,82,186,0.6)] hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white"
                                disabled={loading || mobileNumber.length < 10 || !password}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setAuthMethod('otp')}
                                    className="text-sm text-blue-300 hover:text-blue-200 hover:underline font-medium"
                                >
                                    Login with OTP instead
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            {error && (
                                <Alert variant="destructive" className="mb-6 bg-rose-950/60 border-rose-800 text-rose-200 animate-slide-up">
                                    <AlertCircle className="h-4 w-4 text-rose-400" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="otp" className="text-slate-200 font-medium text-sm">Enter 6-Digit OTP</Label>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-xs text-blue-300 hover:text-blue-200"
                                        onClick={() => setStep('phone')}
                                        type="button"
                                    >
                                        Change Number
                                    </Button>
                                </div>
                                <div className="relative group">
                                    <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                    <Input
                                        id="otp"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        disabled={loading}
                                        className="pl-10 h-11 bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 transition-all tracking-widest font-mono text-lg"
                                        type="text"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-slate-400">
                                    OTP sent to <span className="font-semibold text-white font-mono">+91 {mobileNumber}</span>
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                                 <Button
                                     type="button"
                                     variant="outline"
                                     className="w-full sm:flex-1 h-11 border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white"
                                     onClick={() => setStep('phone')}
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
                    <div className="w-full space-y-3">
                        <div className="text-center relative">
                            <span className="bg-[#0c182b] px-2 text-xs text-slate-400 uppercase tracking-wider font-semibold relative z-10">Or</span>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-800 -z-0"></div>
                        </div>

                        <Link href={`/citizen-portal/register${mobileNumber ? `?mobile=${mobileNumber}` : ''}`} className="w-full block">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-11 border-blue-500/40 bg-blue-950/30 text-blue-200 hover:bg-[#0F52BA] hover:text-white transition-all duration-300 font-medium"
                            >
                                <FileText className="mr-2 h-4 w-4 text-blue-400" />
                                New Senior Citizen Registration
                            </Button>
                        </Link>
                    </div>

                    <div className="text-center text-sm text-slate-400 mt-2">
                        Are you a staff member?{' '}
                        <button
                            onClick={() => {
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('refreshToken');
                                localStorage.removeItem('userType');
                                localStorage.removeItem('kutumb-app-user');
                                window.location.href = '/admin/login';
                            }}
                            className="font-bold text-blue-300 hover:text-blue-200 hover:underline bg-transparent border-none p-0 cursor-pointer"
                        >
                            Staff Login
                        </button>
                    </div>
                </CardFooter>
            </Card>
        </AuthShell>
    );
}
