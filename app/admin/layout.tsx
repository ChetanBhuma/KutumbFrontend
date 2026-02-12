'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { usePathname } from 'next/navigation';

const getPageInfo = (pathname: string) => {
    // Exact matches
    if (pathname === '/admin/dashboard') {
        return { title: 'Dashboard Overview', description: 'Monitor key metrics and system status' };
    }

    // Pattern matches
    if (pathname.includes('/admin/masters/ranges')) return { title: 'Range Master', description: 'Manage police ranges' };
    if (pathname.includes('/admin/masters/districts')) return { title: 'District Master', description: 'Manage police districts' };
    if (pathname.includes('/admin/masters/sub-divisions')) return { title: 'Sub-Division Master', description: 'Manage police sub-divisions' };
    if (pathname.includes('/admin/masters/police-stations')) return { title: 'Police Station Master', description: 'Manage police stations' };
    if (pathname.includes('/admin/masters/beats')) return { title: 'Beat Master', description: 'Manage police beats' };
    if (pathname.includes('/admin/masters')) return { title: 'Master Data', description: 'Manage system master data' };

    if (pathname.includes('/admin/users')) return { title: 'User Management', description: 'Manage system users and roles' };
    if (pathname.includes('/admin/reports')) return { title: 'Reports & Analytics', description: 'View system reports' };
    if (pathname.includes('/admin/settings')) return { title: 'System Settings', description: 'Configure system parameters' };
    if (pathname.includes('/admin/audit-logs')) return { title: 'Audit Logs', description: 'View system activity logs' };

    return { title: 'Admin Portal', description: 'Kutumb Administration' };
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';
    const pageInfo = getPageInfo(pathname);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <ProtectedRoute permissionCode="dashboard.admin.view">
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-background flex flex-col">
                    <div className="sticky top-0 z-10">
                        <Header title={pageInfo.title} description={pageInfo.description} />
                    </div>
                    <div className="flex-1">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
