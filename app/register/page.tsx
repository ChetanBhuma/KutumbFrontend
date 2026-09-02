'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';

export default function RegisterPage() {
    return (
        <AuthShell
            title="Senior Citizen Registration"
            subtitle="Delhi Police - Shanti Sewa Nyaya"
            headerTitle="Senior Citizen Portal"
            headerAction={{
                label: "Citizen Login",
                href: "/citizen-portal/login",
                variant: "outline"
            }}
            badgeIcon={<UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-[#0F52BA]" />}
        >
            <Card className="shadow-2xl border-slate-700/80 bg-[#0c182b]/90 backdrop-blur-2xl text-slate-100 rounded-2xl overflow-hidden">
                <CardContent className="pt-8 space-y-6">
                    <div className="text-center space-y-1">
                        <h3 className="text-xl font-bold text-white">Create an Account</h3>
                        <p className="text-sm text-slate-400">Choose how you would like to proceed</p>
                    </div>

                    <div className="space-y-4">
                        {/* Senior Citizen Registration Option */}
                        <Link href="/citizen-portal/register" className="block group">
                            <div className="p-5 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-900 hover:border-[#0F52BA] hover:shadow-[0_0_20px_rgba(15,82,186,0.3)] transition-all duration-300 flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-blue-950/80 text-blue-300 group-hover:bg-[#0F52BA] group-hover:text-white transition-colors shrink-0">
                                    <HeartHandshake className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-base font-semibold text-white group-hover:text-blue-200 transition-colors">
                                            Senior Citizen (Self or Family)
                                        </h4>
                                        <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-blue-300 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                        Register yourself or a senior family member for beat officer visits, safety support, and welfare schemes.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Department / Officer Notice */}
                        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-slate-800/80 text-slate-400 shrink-0">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-base font-semibold text-slate-200">
                                    Police Officers & Department Staff
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                    Officer accounts are provisioned and authorized by the Delhi Police Headquarters.
                                </p>
                                <div className="mt-3">
                                    <Link href="/officer-app/login">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-8 border-slate-700 bg-slate-900/80 text-blue-200 hover:bg-slate-800 hover:text-white"
                                        >
                                            Officer Login (PIS Number)
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 bg-slate-900/60 border-t border-slate-800/80 p-6">
                    <div className="text-center text-sm text-slate-400">
                        Already have a registered account?{' '}
                        <Link href="/citizen-portal/login" className="font-bold text-blue-300 hover:text-blue-200 hover:underline">
                            Citizen Sign In
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </AuthShell>
    );
}
