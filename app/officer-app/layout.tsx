import type { Metadata } from 'next';
import OfficerLayoutShell from '@/components/officer-app/officer-layout-shell';

export const metadata: Metadata = {
    title: 'Officer App | Delhi Police',
    description: 'Senior Citizen Safety Initiative Officer Portal',
};

export default function OfficerAppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <OfficerLayoutShell>
            {children}
        </OfficerLayoutShell>
    );
}
