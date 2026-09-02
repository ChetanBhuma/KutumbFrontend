'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';

export default function NotFound() {
    return (
        <AuthShell
            title="Page Not Found"
            subtitle="The requested resource or page could not be located"
            badgeIcon={<AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-rose-500" />}
            headerTitle="Senior Citizen Portal"
            headerAction={{
                label: "Return Home",
                href: "/",
                variant: "outline"
            }}
        >
            <Card className="shadow-2xl border-slate-700/80 bg-[#0c182b]/90 backdrop-blur-2xl text-slate-100 rounded-2xl overflow-hidden text-center">
                <CardContent className="pt-8 pb-6 space-y-4">
                    <h3 className="text-5xl font-black text-white tracking-tight font-mono">404</h3>
                    <p className="text-slate-300 text-sm max-w-sm mx-auto">
                        The portal page you are looking for might have been moved, renamed, or is temporarily unavailable.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                        <Link href="/" className="w-full sm:w-auto">
                            <Button className="w-full h-11 bg-gradient-to-r from-[#0F52BA] to-[#720924] hover:from-[#0F52BA]/90 hover:to-[#720924]/90 text-white font-bold shadow-[0_0_20px_rgba(15,82,186,0.4)]">
                                <Home className="mr-2 h-4 w-4" /> Go to Home
                            </Button>
                        </Link>
                        <Link href="/citizen-portal/login" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full h-11 border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Citizen Login
                            </Button>
                        </Link>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-900/60 border-t border-slate-800/80 p-4 text-center justify-center">
                    <p className="text-xs text-slate-400">
                        Senior Citizen Safety & Welfare Initiative · Delhi Police
                    </p>
                </CardFooter>
            </Card>
        </AuthShell>
    );
}
