'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function OfficerAppIndexPage() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (token) {
            router.replace('/officer-app/dashboard');
        } else {
            router.replace('/officer-app/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-slate-600">Loading Kutumb Officer App...</p>
        </div>
    );
}
