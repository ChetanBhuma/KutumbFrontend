import type { ReactNode } from 'react';
import CitizenHeader from './components/CitizenHeader';
import { Toaster } from '@/components/ui/toaster';
import { CitizenOnboarding } from './components/CitizenOnboarding';

export default function CitizenPortalLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <CitizenHeader />
            <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
            <footer className="border-t bg-white mt-auto">
                <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
                    <p>Delhi Police · Senior Citizen Cell · For emergencies dial 112</p>
                    <p className="mt-1 text-xs">© {new Date().getFullYear()} Delhi Police. All rights reserved.</p>
                </div>
            </footer>
            <Toaster />
            <CitizenOnboarding />
        </div>
    );
}
