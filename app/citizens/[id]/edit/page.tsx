'use client';

import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { CitizenForm } from '@/components/admin/citizen-form';
import { useToast } from '@/components/ui/use-toast';

export default function EditCitizenPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    return (
        <ProtectedRoute permissionCode="citizens.write">
            <DashboardLayout
                title="Update Citizen Profile"
                description="Edit citizen information"
                currentPath={`/citizens/${params.id}/edit`}
            >
                <CitizenForm
                    mode="edit"
                    citizenId={params.id as string}
                    onSuccess={(citizenId) => {
                        toast({
                            title: "Success",
                            description: "Citizen profile updated successfully",
                        });
                        router.push(`/citizens/${citizenId}`);
                    }}
                />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
