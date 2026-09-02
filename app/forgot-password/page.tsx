'use client';

import { useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiClient.forgotPassword(email);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <AuthShell
                title="Password Reset"
                subtitle="Delhi Police - Account Recovery"
                badgeIcon={<CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-400" />}
                headerTitle="Senior Citizen Portal"
                headerAction={{
                    label: "Back to Login",
                    href: "/citizen-portal/login",
                    variant: "outline"
                }}
            >
                <Card className="shadow-2xl border-slate-700/80 bg-[#0c182b]/90 backdrop-blur-2xl text-slate-100 rounded-2xl overflow-hidden">
                    <CardHeader className="text-center space-y-2 pt-8">
                        <CardTitle className="text-2xl font-bold text-white">Check Your Email</CardTitle>
                        <CardDescription className="text-sm text-slate-400">
                            We have sent a secure password reset link to <strong className="text-white">{email}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 pb-6">
                        <p className="text-center text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                            Didn't receive the email? Check your spam folder or verify your registered email address.
                        </p>
                        <Link href="/citizen-portal/login" className="block">
                            <Button className="w-full h-11 text-base font-bold shadow-[0_0_20px_rgba(15,82,186,0.4)] hover:shadow-[0_0_25px_rgba(15,82,186,0.6)] hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title="Reset Password"
            subtitle="Delhi Police - Account Recovery"
            badgeIcon={<KeyRound className="h-10 w-10 sm:h-12 sm:w-12 text-[#0F52BA]" />}
            headerTitle="Senior Citizen Portal"
            headerAction={{
                label: "Citizen Login",
                href: "/citizen-portal/login",
                variant: "outline"
            }}
        >
            <Card className="shadow-2xl border-slate-700/80 bg-[#0c182b]/90 backdrop-blur-2xl text-slate-100 rounded-2xl overflow-hidden">
                <CardHeader className="space-y-1 pt-8 pb-4">
                    <CardTitle className="text-xl font-bold text-white text-center">Account Recovery</CardTitle>
                    <CardDescription className="text-center text-sm text-slate-400">
                        Enter your registered email address to receive password reset instructions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <Alert variant="destructive" className="bg-rose-950/60 border-rose-800 text-rose-200 animate-slide-up">
                                <AlertCircle className="h-4 w-4 text-rose-400" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200 font-medium text-sm">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="pl-10 h-11 bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/30 transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-bold shadow-[0_0_20px_rgba(15,82,186,0.4)] hover:shadow-[0_0_25px_rgba(15,82,186,0.6)] hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Sending Link...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 bg-slate-900/60 border-t border-slate-800/80 p-6">
                    <div className="text-center text-sm text-slate-400">
                        Remember your credentials?{' '}
                        <Link href="/citizen-portal/login" className="font-bold text-blue-300 hover:text-blue-200 hover:underline">
                            Back to Sign In
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </AuthShell>
    );
}
