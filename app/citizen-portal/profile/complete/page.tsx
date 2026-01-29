'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import ProfileCompletionForm from '@/components/citizen-portal/profile-completion-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, CheckCircle } from 'lucide-react';

export default function ProfileCompletionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verify user is logged in
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/citizen-portal/login');
            return;
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8 text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Complete Your Profile</h1>
                <p className="text-slate-500 max-w-lg mx-auto">
                    Please provide the following details to verify your identity and help us serve you better.
                    Your information is secure with Delhi Police.
                </p>
            </div>

            <ProfileCompletionForm />
        </div>
    );
}
