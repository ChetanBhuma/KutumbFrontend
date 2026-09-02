'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Lock, Smartphone, AlertCircle, ArrowLeft, Eye, EyeOff, User, Loader2, Mail } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ErrorBoundary } from '@/components/error-boundary';
import { useAuth } from '@/contexts/auth-context';
import { AuthShell } from '@/components/auth/auth-shell';

export default function AdminLoginPage() {
    return (
        <ErrorBoundary>
            <AdminLoginContent />
        </ErrorBoundary>
    );
}

function AdminLoginContent() {
    const router = useRouter();
    const { user, isAuthenticated, login } = useAuth();
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

    // Form states
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // UI states
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Redirect authenticated users to appropriate dashboard
    useEffect(() => {
        if (isAuthenticated && user) {
            setIsRedirecting(true);

            setTimeout(() => {
                const savedPath = sessionStorage.getItem('redirectAfterLogin');
                if (savedPath) {
                    sessionStorage.removeItem('redirectAfterLogin');
                    router.push(savedPath);
                    return;
                }

                const role = user.role?.toUpperCase();
                switch (role) {
                    case 'CITIZEN':
                        router.push('/citizen-portal/dashboard');
                        break;
                    case 'SUPER_ADMIN':
                    case 'ADMIN':
                    case 'SUPERVISOR':
                    case 'OFFICER':
                        router.push('/admin/dashboard');
                        break;
                    default:
                        router.push('/admin/dashboard');
                }
            }, 500);
        }
    }, [isAuthenticated, user, router]);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login({ identifier, password });
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await apiClient.sendOTP(identifier);

            if (result.success) {
                setOtpSent(true);
                setError('');
            } else {
                setError(result.error?.message || 'Failed to send OTP');
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await apiClient.verifyOTP(identifier, otp);

            if (result.success) {
                localStorage.setItem('userType', 'admin');

                if (result.data?.user) {
                    localStorage.setItem('kutumb-app-user', JSON.stringify(result.data.user));
                }

                window.location.href = '/admin/dashboard';
            } else {
                setError(result.error?.message || 'Invalid OTP');
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await apiClient.forgotPassword(resetEmail);

            if (result.success) {
                setResetSuccess(true);
                setError('');
            } else {
                setError(result.error?.message || 'Failed to send reset link');
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setIdentifier('');
        setPassword('');
        setOtp('');
        setError('');
        setOtpSent(false);
        setShowForgotPassword(false);
        setResetEmail('');
        setResetSuccess(false);
    };

    if (showForgotPassword) {
        return (
            <AuthShell
                title="Forgot Password"
                subtitle="Reset access credentials for staff account"
                headerTitle="Senior Citizen Portal"
                headerAction={{
                    label: "Staff Login",
                    href: "/admin/login"
                }}
            >
                <Card className="shadow-2xl border-slate-700/80 bg-[#0c182b]/90 backdrop-blur-2xl text-slate-100 rounded-2xl overflow-hidden">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold text-white">Reset Password</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    resetForm();
                                }}
                                className="text-slate-400 hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </div>
                        <CardDescription className="text-slate-400">
                            Enter your email address and we'll send you a password reset link
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {resetSuccess ? (
                            <Alert className="bg-emerald-950/60 border-emerald-800 text-emerald-200 animate-slide-up">
                                <AlertCircle className="h-4 w-4 text-emerald-400" />
                                <AlertDescription>
                                    Password reset link has been sent to your email. Please check your inbox.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive" className="bg-rose-950/60 border-rose-800 text-rose-200 animate-slide-up">
                                        <AlertCircle className="h-4 w-4 text-rose-400" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="reset-email" className="text-slate-200 font-medium text-sm">Official Email Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            id="reset-email"
                                            type="email"
                                            placeholder="your.email@delhipolice.gov.in"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="pl-10 h-11 bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 transition-all"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-bold shadow-[0_0_20px_rgba(15,82,186,0.4)] hover:shadow-[0_0_25px_rgba(15,82,186,0.6)] hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title="Senior Citizen Portal"
            subtitle="Delhi Police - Staff & Department Access"
            headerTitle="Senior Citizen Portal"
            headerAction={{
                label: "Citizen Login",
                href: "/citizen-portal/login",
                variant: "outline"
            }}
        >
            <Card className="shadow-2xl border-slate-700/80 bg-[#0c182b]/90 backdrop-blur-2xl text-slate-100 rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-6 md:pt-8">
                    <Tabs value={loginMethod} onValueChange={(v) => {
                        setLoginMethod(v as 'password' | 'otp');
                        resetForm();
                    }}>
                        <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
                            <TabsTrigger
                                value="password"
                                className="flex items-center gap-2 text-slate-400 data-[state=active]:bg-[#0F52BA] data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(15,82,186,0.4)] rounded-lg transition-all font-semibold"
                            >
                                <Lock className="h-4 w-4" />
                                Password
                            </TabsTrigger>
                            <TabsTrigger
                                value="otp"
                                className="flex items-center gap-2 text-slate-400 data-[state=active]:bg-[#0F52BA] data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(15,82,186,0.4)] rounded-lg transition-all font-semibold"
                            >
                                <Smartphone className="h-4 w-4" />
                                OTP
                            </TabsTrigger>
                        </TabsList>

                        {error && (
                            <Alert variant="destructive" className="mb-6 bg-rose-950/60 border-rose-800 text-rose-200 animate-slide-up">
                                <AlertCircle className="h-4 w-4 text-rose-400" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Password Login */}
                        <TabsContent value="password" className="animate-fade-in">
                            <form onSubmit={handlePasswordLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="identifier" className="text-slate-200 font-medium text-sm">Email, Phone or PIS Number</Label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            id="identifier"
                                            type="text"
                                            placeholder="Enter your registered ID"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="pl-10 h-11 bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 transition-all font-mono"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-slate-200 font-medium text-sm">Password</Label>
                                        <button
                                            type="button"
                                            className="text-xs text-blue-300 hover:text-blue-200 hover:underline"
                                            onClick={() => setShowForgotPassword(true)}
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="pl-10 pr-10 h-11 bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 transition-all"
                                            autoComplete="current-password"
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

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            checked={rememberMe}
                                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                            className="border-slate-600 data-[state=checked]:bg-[#0F52BA] data-[state=checked]:border-[#0F52BA]"
                                        />
                                        <label
                                            htmlFor="remember"
                                            className="text-xs text-slate-400 cursor-pointer select-none"
                                        >
                                            Remember this terminal
                                        </label>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-bold shadow-[0_0_20px_rgba(15,82,186,0.4)] hover:shadow-[0_0_25px_rgba(15,82,186,0.6)] hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white"
                                    disabled={isLoading || !identifier || !password}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        'Login to Staff Dashboard'
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* OTP Login */}
                        <TabsContent value="otp" className="animate-fade-in">
                            {!otpSent ? (
                                <form onSubmit={handleSendOTP} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="otp-identifier" className="text-slate-200 font-medium text-sm">PIS Number or Mobile</Label>
                                        <div className="relative group">
                                            <Smartphone className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                            <Input
                                                id="otp-identifier"
                                                type="text"
                                                placeholder="Enter PIS number or registered mobile"
                                                value={identifier}
                                                onChange={(e) => setIdentifier(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="pl-10 h-11 bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 transition-all font-mono"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            We will send a one-time passcode to your official mobile.
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-base font-bold shadow-[0_0_20px_rgba(15,82,186,0.4)] hover:shadow-[0_0_25px_rgba(15,82,186,0.6)] hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white"
                                        disabled={isLoading || !identifier}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Sending OTP...
                                            </>
                                        ) : (
                                            'Send OTP'
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <Label htmlFor="otp-code" className="text-slate-200 font-medium text-sm text-center block">Enter 6-Digit OTP</Label>
                                        <Input
                                            id="otp-code"
                                            type="text"
                                            placeholder="------"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            required
                                            disabled={isLoading}
                                            maxLength={6}
                                            className="text-center text-3xl tracking-[0.4em] h-14 font-mono bg-slate-900/90 border-slate-700 text-white focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 transition-all"
                                            autoFocus
                                        />
                                        <p className="text-xs text-slate-400 text-center">
                                            Code sent to registered mobile for ID: <span className="text-white font-semibold">{identifier}</span>
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 h-11 border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white"
                                            onClick={() => {
                                                setOtpSent(false);
                                                setOtp('');
                                                setError('');
                                            }}
                                            disabled={isLoading}
                                        >
                                            Change ID
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 h-11 border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white"
                                            onClick={handleSendOTP}
                                            disabled={isLoading}
                                        >
                                            Resend
                                        </Button>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-base font-bold shadow-[0_0_20px_rgba(15,82,186,0.4)] hover:shadow-[0_0_25px_rgba(15,82,186,0.6)] hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white"
                                        disabled={isLoading || otp.length < 6}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify & Login'
                                        )}
                                    </Button>
                                </form>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 bg-slate-900/60 border-t border-slate-800/80 p-4 sm:p-6">
                    <div className="text-center text-sm text-slate-400">
                        Not a staff member?{' '}
                        <button
                            type="button"
                            onClick={() => {
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('refreshToken');
                                localStorage.removeItem('userType');
                                localStorage.removeItem('kutumb-app-user');
                                window.location.href = '/citizen-portal/login';
                            }}
                            className="font-bold text-blue-300 hover:text-blue-200 hover:underline bg-transparent border-none p-0 cursor-pointer"
                        >
                            Go to Citizen Portal
                        </button>
                    </div>
                </CardFooter>
            </Card>
        </AuthShell>
    );
}
