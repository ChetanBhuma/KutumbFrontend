'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Role } from '@/types/auth';
import { Loader2 } from 'lucide-react';

/**
 * Smart Dashboard Router
 * Redirects users to the appropriate dashboard based on their role
 */
export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && user) {
            // Redirect based on user role
            if (user.role === Role.OFFICER) {
                // Officers have their own specialized dashboard
                router.replace('/officer/dashboard');
            } else if (user.role === Role.CITIZEN) {
                // Citizens go to citizen portal
                router.replace('/citizen-portal/dashboard');
            } else {
                // ADMIN, SUPER_ADMIN, SUPERVISOR go to admin dashboard
                router.replace('/admin/dashboard');
            }
        }
    }, [user, isLoading, router]);

    // Show loading state while redirecting
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
