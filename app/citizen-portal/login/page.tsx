'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Smartphone, AlertCircle, UserPlus, FileText, ArrowRight, ArrowLeft, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

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
                // If check endpoint doesn't exist or fails, continue with OTP send
                console.warn('Registration check failed, proceeding with OTP:', checkError);
            }

            // Mobile number is registered, send OTP
            const response = await apiClient.sendCitizenOTP(mobileNumber);



            // Log OTP in browser console for development testing
            if (response?.data?.devOtp) {

            }

            setStep('otp');
        } catch (err: any) {
            console.error('Failed to send OTP', err);
            // Fix: Check API response message first, then fallback to generic error
            const apiMessage = err.response?.data?.message;
            const msg = apiMessage || err?.message || 'Failed to send OTP. Please try again.';

            if (msg.toLowerCase().includes('not registered') || err.response?.status === 404) {
                // User requested auto-redirect
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
                // Store tokens
                localStorage.setItem('accessToken', result.data.tokens.accessToken);
                localStorage.setItem('refreshToken', result.data.tokens.refreshToken);

                // Also update default tokens for apiClient to work for subsequent requests
                apiClient.setAccessToken(result.data.tokens.accessToken);
                apiClient.setRefreshToken(result.data.tokens.refreshToken);

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
            {/* Background Decorators */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-3xl animate-pulse-soft"></div>
                <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
                {/* Header Logo Section */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-white p-4 rounded-full shadow-lg border border-slate-100 animate-float">
                        <Shield className="h-12 w-12 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            <span className="text-gradient">Senior Citizen Portal</span>
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Delhi Police - Citizen Access</p>
                    </div>
                </div>

                <Card className="shadow-2xl border-white/20 glass backdrop-blur-xl bg-white/80">
                    <CardContent className="pt-8">
                        {step === 'phone' && authMethod === 'otp' ? (
                            <form onSubmit={handleSendOTP} className="space-y-5">
                                {error && (
                                    <Alert variant="destructive" className="mb-6 animate-slide-up">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="mobile" className="text-slate-700 font-medium">Mobile Number</Label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="mobile"
                                            placeholder="Enter 10-digit mobile number"
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            required
                                            disabled={loading}
                                            className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                                            type="tel"
                                            maxLength={10}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        We'll send you a 6-digit OTP to verify your identity.
                                    </p>
                                </div>

                                <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-primary to-blue-700" disabled={loading || mobileNumber.length < 10}>
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
                                        className="text-sm text-primary hover:underline font-medium"
                                    >
                                        Login with Password instead
                                    </button>
                                </div>
                            </form>
                        ) : authMethod === 'password' ? (
                            <form onSubmit={handlePasswordLogin} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                {error && (
                                    <Alert variant="destructive" className="mb-6 animate-slide-up">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile-pwd" className="text-slate-700 font-medium">Mobile Number</Label>
                                        <div className="relative group">
                                            <Smartphone className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="mobile-pwd"
                                                placeholder="Enter 10-digit mobile number"
                                                value={mobileNumber}
                                                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                required
                                                disabled={loading}
                                                className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                                                type="tel"
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                                            <Link href="/citizen-portal/forgot-password" className="text-xs text-primary hover:underline">
                                                Forgot Password?
                                            </Link>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="password"
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={loading}
                                                className="pl-10 pr-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                                                type={showPassword ? "text" : "password"}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-primary to-blue-700" disabled={loading || mobileNumber.length < 10 || !password}>
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
                                        className="text-sm text-primary hover:underline font-medium"
                                    >
                                        Login with OTP instead
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                {error && (
                                    <Alert variant="destructive" className="mb-6 animate-slide-up">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="otp" className="text-slate-700 font-medium">Enter OTP</Label>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-auto p-0 text-xs text-primary"
                                            onClick={() => setStep('phone')}
                                            type="button"
                                        >
                                            Change Number
                                        </Button>
                                    </div>
                                    <div className="relative group">
                                        <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="otp"
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            required
                                            disabled={loading}
                                            className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all tracking-widest font-mono text-lg"
                                            type="text"
                                            maxLength={6}
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        OTP sent to <span className="font-semibold text-slate-700">+91 {mobileNumber}</span>
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-11"
                                        onClick={() => setStep('phone')}
                                        disabled={loading}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button type="submit" className="flex-[2] h-11 text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-primary to-blue-700" disabled={loading || otp.length < 6}>
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
                                    <p className="text-xs text-slate-500">
                                        Didn't receive code? <button type="button" onClick={handleSendOTP} className="text-primary hover:underline font-medium">Resend OTP</button>
                                    </p>
                                </div>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 bg-slate-50/50 border-t border-slate-100 p-6 rounded-b-xl">
                        <div className="w-full space-y-3">
                            <div className="text-center relative">
                                <span className="bg-slate-50 px-2 text-xs text-slate-500 uppercase tracking-wider font-medium relative z-10">Or</span>
                                <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-0"></div>
                            </div>

                            <Link href={`/citizen-portal/register${mobileNumber ? `?mobile=${mobileNumber}` : ''}`} className="w-full block">
                                <Button type="button" variant="secondary" className="w-full h-11 bg-slate-200 text-slate-800 hover:bg-slate-300 transition-all">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Register Senior Citizen (Wizard)
                                </Button>
                            </Link>
                        </div>

                        <div className="text-center text-sm text-slate-600 mt-4">
                            Are you a staff member?{' '}
                            <button
                                onClick={() => {
                                    // Clear any existing session to prevent role conflicts
                                    localStorage.removeItem('accessToken');
                                    localStorage.removeItem('refreshToken');
                                    localStorage.removeItem('userType');
                                    localStorage.removeItem('kutumb-app-user');
                                    window.location.href = '/admin/login';
                                }}
                                className="font-semibold text-primary hover:text-primary/80 hover:underline bg-transparent border-none p-0 cursor-pointer"
                            >
                                Staff Login
                            </button>
                        </div>
                    </CardFooter>
                </Card>

                <div className="text-center text-xs text-slate-400 space-y-2">
                    <p>&copy; {new Date().getFullYear()} Delhi Police. All rights reserved.</p>
                    {/* Foot links */}
                    <div className="flex justify-center space-x-4">
                        <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
                        <Link href="/help" className="hover:text-slate-600 transition-colors">Help Center</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
