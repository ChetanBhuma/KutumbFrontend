'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AdminLoginPage() {
    return (
        <ErrorBoundary>
            <AdminLoginContent />
        </ErrorBoundary>
    );
}

function AdminLoginContent() {
    const router = useRouter();
    const { user, isAuthenticated, login } = useAuth(); // Destructure login
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

            // Small delay for smooth transition
            setTimeout(() => {
                // Check for saved redirect path
                const savedPath = sessionStorage.getItem('redirectAfterLogin');
                if (savedPath) {
                    sessionStorage.removeItem('redirectAfterLogin');
                    router.push(savedPath);
                    return;
                }

                // Redirect based on role
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
                        // Default fallback
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
            // Redirect is handled by useEffect
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
                // Set userType for logout redirection
                localStorage.setItem('userType', 'admin');

                // Store user data if returned (to help AuthContext on reload)
                if (result.data?.user) {
                    localStorage.setItem('kutumb-app-user', JSON.stringify(result.data.user));
                }

                // Force redirect as AuthContext might not update immediately
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
            const result = await apiClient.post<any>('/auth/forgot-password', { email: resetEmail });

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
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md shadow-lg border-slate-200">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-bold text-slate-900">Forgot Password</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    resetForm();
                                }}
                                className="text-slate-500 hover:text-slate-900"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </div>
                        <CardDescription>
                            Enter your email address and we'll send you a password reset link
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {resetSuccess ? (
                            <Alert className="bg-green-50 border-green-200 text-green-800">
                                <AlertCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription>
                                    Password reset link has been sent to your email. Please check your inbox.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="reset-email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="reset-email"
                                            type="email"
                                            placeholder="your.email@delhipolice.gov.in"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
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
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
            {/* Background Decorators */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-3xl animate-pulse-soft"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-red-500/10 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
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
                        <p className="text-slate-500 mt-2 font-medium">Delhi Police - Staff Access</p>
                    </div>
                </div>

                <Card className="shadow-2xl border-white/20 glass backdrop-blur-xl bg-white/80">
                    <CardContent className="pt-8">
                        <Tabs value={loginMethod} onValueChange={(v) => {
                            setLoginMethod(v as 'password' | 'otp');
                            resetForm();
                        }}>
                            <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-slate-100/50 rounded-lg">
                                <TabsTrigger value="password" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                                    <Lock className="h-4 w-4" />
                                    Password
                                </TabsTrigger>
                                <TabsTrigger value="otp" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                                    <Smartphone className="h-4 w-4" />
                                    OTP
                                </TabsTrigger>
                            </TabsList>

                            {error && (
                                <Alert variant="destructive" className="mb-6 animate-slide-up">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Password Login */}
                            <TabsContent value="password" className="animate-fade-in">
                                <form onSubmit={handlePasswordLogin} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="identifier" className="text-slate-700 font-medium">Email, Phone or PIS Number</Label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="identifier"
                                                type="text"
                                                placeholder="Enter your ID"
                                                value={identifier}
                                                onChange={(e) => setIdentifier(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="px-0 text-xs font-normal h-auto text-primary hover:text-primary/80"
                                                onClick={() => setShowForgotPassword(true)}
                                            >
                                                Forgot password?
                                            </Button>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="pl-10 pr-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                                                autoComplete="new-password"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent hover:text-slate-900 text-slate-400"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 pt-2">
                                        <Checkbox
                                            id="remember"
                                            checked={rememberMe}
                                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label htmlFor="remember" className="text-sm font-normal text-slate-600 cursor-pointer">
                                            Remember me for 30 days
                                        </Label>
                                    </div>

                                    <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-primary to-blue-700" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* OTP Login */}
                            <TabsContent value="otp" className="animate-fade-in">
                                {!otpSent ? (
                                    <form onSubmit={handleSendOTP} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="otp-identifier" className="text-slate-700 font-medium">Email, Phone or PIS Number</Label>
                                            <div className="relative group">
                                                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    id="otp-identifier"
                                                    type="text"
                                                    placeholder="Enter your ID"
                                                    value={identifier}
                                                    onChange={(e) => setIdentifier(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                    className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                We'll send a 6-digit code to your registered mobile number.
                                            </p>
                                        </div>

                                        <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-primary to-blue-700" disabled={isLoading}>
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
                                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="otp" className="text-center block text-slate-700 font-medium">Enter Verification Code</Label>
                                            <Input
                                                id="otp"
                                                type="text"
                                                placeholder="000000"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                required
                                                disabled={isLoading}
                                                maxLength={6}
                                                className="text-center text-3xl tracking-[0.5em] h-16 font-mono bg-slate-50 border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                            <p className="text-xs text-slate-500 text-center">
                                                Code sent to your registered mobile number
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 h-11"
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
                                                className="flex-1 h-11"
                                                onClick={handleSendOTP}
                                                disabled={isLoading}
                                            >
                                                Resend
                                            </Button>
                                        </div>

                                        <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-primary to-blue-700" disabled={isLoading}>
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
                    <CardFooter className="flex flex-col space-y-4 bg-slate-50/50 border-t border-slate-100 p-6 rounded-b-xl">
                        <div className="text-center text-sm text-slate-600">
                            Not a staff member?{' '}
                            <Button
                                variant="link"
                                className="px-0 font-semibold text-primary hover:text-primary/80"
                                onClick={() => {
                                    // Clear any existing session to prevent role conflicts
                                    localStorage.removeItem('accessToken');
                                    localStorage.removeItem('refreshToken');
                                    localStorage.removeItem('userType');
                                    localStorage.removeItem('kutumb-app-user');
                                    window.location.href = '/citizen-portal/login';
                                }}
                            >
                                Go to Citizen Portal
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                <div className="text-center text-xs text-slate-400 space-y-2">
                    <p>&copy; {new Date().getFullYear()} Delhi Police. All rights reserved.</p>
                    <div className="flex justify-center space-x-4">
                        <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-slate-600 transition-colors">Help Center</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
