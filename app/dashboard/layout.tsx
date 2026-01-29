'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';

/**
 * Layout for the smart dashboard router
 * Minimal layout since this just redirects to the appropriate dashboard
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
}
