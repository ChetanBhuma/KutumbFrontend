'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import CitizenHeader from './components/CitizenHeader';
import { CitizenOnboarding } from './components/CitizenOnboarding';

export default function CitizenPortalLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // On standalone auth pages that manage their own AuthShell (e.g. login),
    // bypass the outer layout header/footer to prevent duplicate rendering.
    if (pathname === '/citizen-portal/login') {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-[#0F52BA] selection:text-white">
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <CitizenHeader />
            <main className="mx-auto w-full max-w-6xl px-4 py-8 flex-1">{children}</main>
            <footer className="border-t bg-white mt-auto">
                <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
                    <p>Delhi Police · Senior Citizen Cell · For emergencies dial 112</p>
                    <p className="mt-1 text-xs">© {new Date().getFullYear()} Delhi Police. All rights reserved.</p>
                </div>
            </footer>
            <CitizenOnboarding />
        </div>
    );
}
