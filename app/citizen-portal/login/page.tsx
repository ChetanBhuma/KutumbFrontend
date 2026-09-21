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
            badgeIcon={
                <img
                    src="/DP%20logo.png"
                    alt="Delhi Police Logo"
                    className="h-10 w-10 sm:h-14 sm:w-14 object-contain drop-shadow-md"
                />
            }
        >
            <Card className="shadow-2xl border border-slate-200 bg-white text-slate-900 rounded-2xl overflow-hidden">
                <CardContent className="p-5 sm:p-7 md:p-8">
                    {step === 'phone' && authMethod === 'otp' ? (
                        <form onSubmit={handleSendOTP} className="space-y-5">
                            {error && (
                                <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-900 animate-slide-up">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                    <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="mobile" className="text-slate-800 font-semibold text-sm sm:text-base">Mobile Number</Label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-blue-600 transition-colors" />
                                    <Input
                                        id="mobile"
                                        placeholder="Enter 10-digit mobile number"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        required
                                        disabled={loading}
                                        className="pl-11 h-12 bg-slate-50/70 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-mono text-base font-semibold shadow-2xs"
                                        type="tel"
                                        maxLength={10}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                                    We will send a 6-digit OTP to verify your registered phone number.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl"
                                disabled={loading || mobileNumber.length < 10}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Send OTP <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>

                            <div className="text-center pt-1">
                                <button
                                    type="button"
                                    onClick={() => setAuthMethod('password')}
                                    className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                                >
                                    Login with Password instead
                                </button>
                            </div>
                        </form>
                    ) : authMethod === 'password' ? (
                        <form onSubmit={handlePasswordLogin} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            {error && (
                                <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-900 animate-slide-up">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                    <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mobile-pwd" className="text-slate-800 font-semibold text-sm sm:text-base">Mobile Number</Label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-blue-600 transition-colors" />
                                        <Input
                                            id="mobile-pwd"
                                            placeholder="Enter 10-digit mobile number"
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            required
                                            disabled={loading}
                                            className="pl-11 h-12 bg-slate-50/70 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-mono text-base font-semibold shadow-2xs"
                                            type="tel"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="password" className="text-slate-800 font-semibold text-sm sm:text-base">Password</Label>
                                        <Link href="/forgot-password" className="text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-blue-600 transition-colors" />
                                        <Input
                                            id="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                            className="pl-11 pr-11 h-12 bg-slate-50/70 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all text-base shadow-2xs"
                                            type={showPassword ? "text" : "password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-800 focus:outline-none"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl"
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

                            <div className="text-center pt-1">
                                <button
                                    type="button"
                                    onClick={() => setAuthMethod('otp')}
                                    className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                                >
                                    Login with OTP instead
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            {error && (
                                <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-900 animate-slide-up">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                    <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="otp" className="text-slate-800 font-semibold text-sm sm:text-base">Enter 6-Digit OTP</Label>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900"
                                        onClick={() => setStep('phone')}
                                        type="button"
                                    >
                                        Change Number
                                    </Button>
                                </div>
                                <div className="relative group">
                                    <KeyRound className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-blue-600 transition-colors" />
                                    <Input
                                        id="otp"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        disabled={loading}
                                        className="pl-11 h-12 bg-slate-50/70 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all tracking-widest font-mono text-xl font-bold shadow-2xs"
                                        type="text"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                                    OTP sent to <span className="font-bold text-slate-900 font-mono">+91 {mobileNumber}</span>
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full sm:flex-1 h-12 border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 hover:text-slate-900 font-semibold rounded-xl"
                                    onClick={() => setStep('phone')}
                                    disabled={loading}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full sm:flex-[2] h-12 text-base font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl"
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

                            <div className="text-center pt-1">
                                <p className="text-xs sm:text-sm text-slate-600">
                                    Didn't receive code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        className="text-blue-700 hover:text-blue-900 hover:underline font-bold"
                                    >
                                        Resend OTP
                                    </button>
                                </p>
                            </div>
                        </form>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 bg-slate-50/90 border-t border-slate-200 p-5 sm:p-7">
                    <div className="w-full space-y-3">
                        <div className="text-center relative">
                            <span className="bg-slate-50 px-3 text-xs text-slate-500 uppercase tracking-wider font-bold relative z-10">Or</span>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-0"></div>
                        </div>

                        <Link href={`/citizen-portal/register${mobileNumber ? `?mobile=${mobileNumber}` : ''}`} className="w-full block">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 border-blue-300 bg-blue-50/80 text-blue-800 hover:bg-blue-100 hover:text-blue-900 hover:border-blue-400 transition-all duration-300 font-bold text-sm sm:text-base rounded-xl shadow-2xs"
                            >
                                <FileText className="mr-2 h-5 w-5 text-blue-700" />
                                New Senior Citizen Registration
                            </Button>
                        </Link>
                    </div>

                    <div className="text-center text-xs sm:text-sm text-slate-600 mt-2">
                        Are you a staff member?{' '}
                        <button
                            onClick={() => {
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('refreshToken');
                                localStorage.removeItem('userType');
                                localStorage.removeItem('kutumb-app-user');
                                window.location.href = '/admin/login';
                            }}
                            className="font-bold text-blue-700 hover:text-blue-900 hover:underline bg-transparent border-none p-0 cursor-pointer"
                        >
                            Staff Login
                        </button>
                    </div>
                </CardFooter>
            </Card>
        </AuthShell>
    );
}
