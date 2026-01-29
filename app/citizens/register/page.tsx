'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { CitizenForm } from '@/components/admin/citizen-form';
import { useToast } from '@/components/ui/use-toast';

export default function RegisterCitizenPage() {
    const router = useRouter();
    const { toast } = useToast();

    return (
        <ProtectedRoute permissionCode="citizens.write">
            <DashboardLayout
                title="Register Senior Citizen"
                description="New Citizen Registration"
                currentPath="/citizens/register"
            >
                <CitizenForm
                    mode="create"
                    onSuccess={(citizenId) => {
                        toast({
                            title: "Success",
                            description: `Citizen registered successfully. ID: ${citizenId}`,
                        });
                        router.push('/citizens');
                    }}
                />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
